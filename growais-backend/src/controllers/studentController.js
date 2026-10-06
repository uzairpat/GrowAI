const pool = require('../db/pool');

// `student_progress` is a denormalized summary used by teacher views. Keep it
// synchronized from the source-of-truth attempt/progress tables whenever a
// student completes learning content.
const refreshStudentProgress = async (client, studentId) => {
  const result = await client.query(
    `
      WITH totals AS (
        SELECT
          (SELECT COUNT(*)::int FROM lessons WHERE is_published = TRUE) AS lesson_total,
          (SELECT COUNT(*)::int FROM quizzes WHERE is_published = TRUE) AS quiz_total,
          (SELECT COUNT(*)::int FROM scenarios WHERE is_published = TRUE) AS scenario_total
      ),
      completed AS (
        SELECT
          (SELECT COUNT(*)::int
             FROM lesson_progress
            WHERE student_id = $1 AND status = 'completed') AS lessons_completed,
          (SELECT COUNT(DISTINCT qa.quiz_id)::int
             FROM quiz_attempts qa
             JOIN quizzes q ON q.id = qa.quiz_id AND q.is_published = TRUE
            WHERE qa.student_id = $1 AND qa.completed_at IS NOT NULL) AS quizzes_completed,
          (SELECT COUNT(DISTINCT sa.scenario_id)::int
             FROM scenario_attempts sa
             JOIN scenarios s ON s.id = sa.scenario_id AND s.is_published = TRUE
            WHERE sa.student_id = $1 AND sa.completed = TRUE) AS scenarios_completed,
          (SELECT COALESCE(ROUND(AVG(
              CASE
                WHEN qa.total_points > 0
                  THEN (qa.earned_points::numeric / qa.total_points::numeric) * 100
                ELSE 0
              END
            ), 2), 0)
             FROM quiz_attempts qa
            WHERE qa.student_id = $1 AND qa.completed_at IS NOT NULL) AS average_quiz_score,
          (SELECT COALESCE(SUM(COALESCE(qa.earned_points, 0)), 0)
             FROM quiz_attempts qa
            WHERE qa.student_id = $1 AND qa.completed_at IS NOT NULL)
          +
          (SELECT COALESCE(SUM(GREATEST(COALESCE(sa.score, 0), 0)), 0)
             FROM scenario_attempts sa
            WHERE sa.student_id = $1 AND sa.completed = TRUE) AS total_points
      )
      SELECT
        completed.*,
        CASE
          WHEN totals.lesson_total + totals.quiz_total + totals.scenario_total = 0 THEN 0
          ELSE ROUND((
            LEAST(completed.lessons_completed, totals.lesson_total)::numeric
            + LEAST(completed.quizzes_completed, totals.quiz_total)::numeric
            + LEAST(completed.scenarios_completed, totals.scenario_total)::numeric
          ) / (totals.lesson_total + totals.quiz_total + totals.scenario_total) * 100, 2)
        END AS overall_progress
      FROM totals, completed
    `,
    [studentId]
  );

  const summary = result.rows[0];

  await client.query(
    `
      INSERT INTO student_progress (
        student_id,
        lessons_completed,
        quizzes_completed,
        scenarios_completed,
        total_points,
        average_quiz_score,
        overall_progress,
        updated_at
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())
      ON CONFLICT (student_id)
      DO UPDATE SET
        lessons_completed = EXCLUDED.lessons_completed,
        quizzes_completed = EXCLUDED.quizzes_completed,
        scenarios_completed = EXCLUDED.scenarios_completed,
        total_points = EXCLUDED.total_points,
        average_quiz_score = EXCLUDED.average_quiz_score,
        overall_progress = EXCLUDED.overall_progress,
        updated_at = EXCLUDED.updated_at
    `,
    [
      studentId,
      Number(summary.lessons_completed || 0),
      Number(summary.quizzes_completed || 0),
      Number(summary.scenarios_completed || 0),
      Number(summary.total_points || 0),
      Number(summary.average_quiz_score || 0),
      Number(summary.overall_progress || 0)
    ]
  );
};

// Get the logged-in student's progress for one lesson
const getLessonProgress = async (req, res) => {
  try {
    const studentId = req.user.id;
    const lessonId = Number(req.params.lessonId);

    if (!Number.isInteger(lessonId) || lessonId <= 0) {
      return res.status(400).json({
        message: 'Invalid lesson ID.'
      });
    }

    const lessonResult = await pool.query(
      `SELECT id FROM lessons WHERE id = $1 AND is_published = TRUE LIMIT 1`,
      [lessonId]
    );

    if (!lessonResult.rowCount) {
      return res.status(404).json({ message: 'Lesson not found.' });
    }

    const result = await pool.query(
      `SELECT
         id,
         lesson_id,
         status,
         progress_percentage,
         started_at,
         completed_at,
         last_accessed_at
       FROM lesson_progress
       WHERE student_id = $1
         AND lesson_id = $2
       LIMIT 1`,
      [studentId, lessonId]
    );

    res.json({
      progress: result.rows[0] || {
        lesson_id: lessonId,
        status: 'not_started',
        progress_percentage: 0,
        completed_at: null
      }
    });
  } catch (error) {
    console.error('Get lesson progress error:', error);

    res.status(500).json({
      message: 'Unable to get lesson progress.'
    });
  }
};


// Save the logged-in student's progress for one lesson
const saveLessonProgress = async (req, res) => {
  const studentId = req.user.id;
  const lessonId = Number(req.params.lessonId);

  const { status, progress_percentage } = req.body;

  const allowedStatuses = [
    'not_started',
    'in_progress',
    'completed'
  ];

  const percentage = Number(progress_percentage);

  if (!Number.isInteger(lessonId) || lessonId <= 0) {
    return res.status(400).json({
      message: 'Invalid lesson ID.'
    });
  }

  if (!allowedStatuses.includes(status)) {
    return res.status(400).json({
      message: 'Invalid lesson status.'
    });
  }

  if (
    !Number.isFinite(percentage) ||
    percentage < 0 ||
    percentage > 100
  ) {
    return res.status(400).json({
      message: 'Progress must be between 0 and 100.'
    });
  }

  if (status === 'completed' && percentage !== 100) {
    return res.status(400).json({
      message: 'A completed lesson must have 100% progress.'
    });
  }

  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    const lessonResult = await client.query(
      `SELECT id FROM lessons WHERE id = $1 AND is_published = TRUE LIMIT 1`,
      [lessonId]
    );

    if (!lessonResult.rowCount) {
      await client.query('ROLLBACK');
      return res.status(404).json({ message: 'Lesson not found.' });
    }

    const existing = await client.query(
      `SELECT id
       FROM lesson_progress
       WHERE student_id = $1
         AND lesson_id = $2
       LIMIT 1`,
      [studentId, lessonId]
    );

    let result;

    if (existing.rows.length > 0) {
      result = await client.query(
        `UPDATE lesson_progress
         SET status = $1::varchar,
             progress_percentage = $2,
             started_at = CASE
               WHEN $1::varchar IN ('in_progress', 'completed')
                 THEN COALESCE(started_at, NOW())
               ELSE started_at
             END,
             completed_at = CASE
               WHEN $1::varchar = 'completed'
                 THEN COALESCE(completed_at, NOW())
               ELSE NULL
             END,
             last_accessed_at = NOW()
         WHERE id = $3
         RETURNING
           id,
           lesson_id,
           status,
           progress_percentage,
           started_at,
           completed_at,
           last_accessed_at`,
        [status, percentage, existing.rows[0].id]
      );
    } else {
      result = await client.query(
        `INSERT INTO lesson_progress (
           student_id,
           lesson_id,
           status,
           progress_percentage,
           started_at,
           completed_at,
           last_accessed_at
         )
         VALUES (
           $1,
           $2,
           $3::varchar,
           $4,
           CASE
             WHEN $3::varchar IN ('in_progress', 'completed')
               THEN NOW()
             ELSE NULL
           END,
           CASE
             WHEN $3::varchar = 'completed'
               THEN NOW()
             ELSE NULL
           END,
           NOW()
         )
         RETURNING
           id,
           lesson_id,
           status,
           progress_percentage,
           started_at,
           completed_at,
           last_accessed_at`,
        [studentId, lessonId, status, percentage]
      );
    }

    await refreshStudentProgress(client, studentId);

    await client.query('COMMIT');

    return res.json({
      message: 'Lesson progress saved successfully.',
      progress: result.rows[0]
    });
  } catch (error) {
    await client.query('ROLLBACK');

    console.error('Save lesson progress error:', error);

    return res.status(500).json({
      message: 'Unable to save lesson progress.'
    });
  } finally {
    client.release();
  }
};

// Get one quiz with its questions and options
// Get one quiz with its questions and options
const getQuiz = async (req, res) => {
  try {
    const quizId = Number(req.params.quizId);

    if (!Number.isInteger(quizId) || quizId <= 0) {
      return res.status(400).json({
        message: 'Invalid quiz ID.'
      });
    }

    const quizResult = await pool.query(
      `SELECT
         id,
         lesson_id,
         title,
         description,
         passing_score,
         is_published
       FROM quizzes
       WHERE id = $1
         AND is_published = TRUE
       LIMIT 1`,
      [quizId]
    );

    if (quizResult.rows.length === 0) {
      return res.status(404).json({
        message: 'Quiz not found.'
      });
    }

    const questionsResult = await pool.query(
      `SELECT
         id,
         quiz_id,
         question_order,
         question_text,
         question_type,
         points
       FROM quiz_questions
       WHERE quiz_id = $1
       ORDER BY question_order ASC, id ASC`,
      [quizId]
    );

    const questionIds = questionsResult.rows.map(
      (question) => question.id
    );

    let optionsResult = { rows: [] };

    if (questionIds.length > 0) {
      optionsResult = await pool.query(
        `SELECT
           id,
           question_id,
           option_order,
           option_text
         FROM quiz_options
         WHERE question_id = ANY($1::bigint[])
         ORDER BY question_id ASC, option_order ASC, id ASC`,
        [questionIds]
      );
    }

    const questions = questionsResult.rows.map((question) => ({
      id: question.id,
      question_text: question.question_text,
      question_type: question.question_type,
      points: Number(question.points || 0),
      question_order: question.question_order,
      options: optionsResult.rows
        .filter(
          (option) => Number(option.question_id) === Number(question.id)
        )
        .map((option) => ({
          id: option.id,
          option_text: option.option_text,
          option_order: option.option_order
        }))
    }));

    return res.json({
      quiz: {
        ...quizResult.rows[0],
        passing_score: Number(quizResult.rows[0].passing_score || 0),
        questions
      }
    });
  } catch (error) {
    console.error('Get quiz error:', error);

    return res.status(500).json({
      message: 'Unable to get quiz.'
    });
  }
};


// Save a completed quiz attempt for the logged-in student
const saveQuizAttempt = async (req, res) => {
  const studentId = req.user.id;
  const quizId = Number(req.params.quizId);

  const { answers } = req.body;

  if (!Number.isInteger(quizId) || quizId <= 0) {
    return res.status(400).json({
      message: 'Invalid quiz ID.'
    });
  }

  if (!Array.isArray(answers)) {
    return res.status(400).json({
      message: 'Answers must be an array.'
    });
  }

  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    // Get quiz information
    const quizResult = await client.query(
      `SELECT
         id,
         passing_score
       FROM quizzes
       WHERE id = $1
         AND is_published = TRUE
       LIMIT 1`,
      [quizId]
    );

    if (quizResult.rows.length === 0) {
      await client.query('ROLLBACK');

      return res.status(404).json({
        message: 'Quiz not found.'
      });
    }

    const passingScore = Number(
      quizResult.rows[0].passing_score || 0
    );

    // Get questions and their correct answers
    const questionsResult = await client.query(
      `SELECT
         q.id AS question_id,
         q.points,
         o.id AS correct_option_id
       FROM quiz_questions q
       LEFT JOIN quiz_options o
         ON o.question_id = q.id
        AND o.is_correct = TRUE
       WHERE q.quiz_id = $1
       ORDER BY q.question_order ASC, q.id ASC`,
      [quizId]
    );

    if (questionsResult.rows.length === 0) {
      await client.query('ROLLBACK');

      return res.status(400).json({
        message: 'This quiz has no questions.'
      });
    }

    if (answers.length !== questionsResult.rows.length) {
      await client.query('ROLLBACK');

      return res.status(400).json({
        message: 'Please answer all questions before submitting the quiz.'
      });
    }

    const answerMap = new Map();
    const validQuestionIds = new Set(
      questionsResult.rows.map((question) => Number(question.question_id))
    );
    const optionIdsByQuestion = new Map();

    const optionsResult = await client.query(
      `
        SELECT question_id, id
        FROM quiz_options
        WHERE question_id = ANY($1::bigint[])
      `,
      [Array.from(validQuestionIds)]
    );

    for (const option of optionsResult.rows) {
      const questionId = Number(option.question_id);
      const options = optionIdsByQuestion.get(questionId) || new Set();
      options.add(Number(option.id));
      optionIdsByQuestion.set(questionId, options);
    }

    for (const answer of answers) {
      const questionId = Number(answer.question_id);
      const optionId = Number(answer.option_id);

      if (
        !Number.isInteger(questionId) ||
        !Number.isInteger(optionId) ||
        !validQuestionIds.has(questionId) ||
        !optionIdsByQuestion.get(questionId)?.has(optionId) ||
        answerMap.has(questionId)
      ) {
        await client.query('ROLLBACK');

        return res.status(400).json({
          message: 'Answers must include each quiz question once with one of its options.'
        });
      }

      answerMap.set(questionId, optionId);
    }

    let correctAnswers = 0;
    let totalPoints = 0;
    let earnedPoints = 0;

    const processedAnswers = questionsResult.rows.map((question) => {
      const selectedOptionId = answerMap.get(
        Number(question.question_id)
      );

      if (!selectedOptionId) {
        const error = new Error('Missing answer for a quiz question.');
        error.statusCode = 400;
        throw error;
      }

      const questionPoints = Number(
        question.points || 0
      );

      totalPoints += questionPoints;

      const isCorrect =
        Number(selectedOptionId) ===
        Number(question.correct_option_id);

      if (isCorrect) {
        correctAnswers += 1;
        earnedPoints += questionPoints;
      }

      return {
        questionId: question.question_id,
        optionId: selectedOptionId,
        isCorrect,
        pointsEarned: isCorrect ? questionPoints : 0
      };
    });

    // Score is the number of correct answers.
    // Example: 3 correct out of 5 = score 3.
    const score = correctAnswers;

    // Percentage used only for determining pass/fail.
    const percentage =
      totalPoints > 0
        ? (earnedPoints / totalPoints) * 100
        : 0;

    const passed = percentage >= passingScore;

    // Create the student's quiz attempt
    const attemptResult = await client.query(
      `INSERT INTO quiz_attempts (
         quiz_id,
         student_id,
         score,
         total_points,
         earned_points,
         passed,
         started_at,
         completed_at
       )
       VALUES (
         $1,
         $2,
         $3,
         $4,
         $5,
         $6,
         NOW(),
         NOW()
       )
       RETURNING
         id,
         quiz_id,
         student_id,
         score,
         total_points,
         earned_points,
         passed,
         started_at,
         completed_at`,
      [
        quizId,
        studentId,
        score,
        totalPoints,
        earnedPoints,
        passed
      ]
    );

    const attempt = attemptResult.rows[0];

    // Save each answer
    for (const answer of processedAnswers) {
      await client.query(
        `INSERT INTO quiz_attempt_answers (
           attempt_id,
           question_id,
           selected_option_id,
           answer_text,
           is_correct,
           points_earned
         )
         VALUES (
           $1,
           $2,
           $3,
           NULL,
           $4,
           $5
         )`,
        [
          attempt.id,
          answer.questionId,
          answer.optionId,
          answer.isCorrect,
          answer.pointsEarned
        ]
      );
    }

    await refreshStudentProgress(client, studentId);

    await client.query('COMMIT');

    return res.status(201).json({
      message: 'Quiz attempt saved successfully.',
      attempt: {
        id: attempt.id,
        quiz_id: attempt.quiz_id,
        student_id: attempt.student_id,
        score: Number(attempt.score),
        total_points: Number(attempt.total_points),
        earned_points: Number(attempt.earned_points),
        passed: attempt.passed,
        started_at: attempt.started_at,
        completed_at: attempt.completed_at
      }
    });
  } catch (error) {
    await client.query('ROLLBACK');

    console.error('Save quiz attempt error:', error);

    return res.status(500).json({
      message: 'Unable to save quiz attempt.'
    });
  } finally {
    client.release();
  }
};


// Get the logged-in student's latest quiz attempt
const getLatestQuizAttempt = async (req, res) => {
  try {
    const studentId = req.user.id;
    const quizId = Number(req.params.quizId);

    if (!Number.isInteger(quizId) || quizId <= 0) {
      return res.status(400).json({
        message: 'Invalid quiz ID.'
      });
    }

    const attemptResult = await pool.query(
      `SELECT
         id,
         quiz_id,
         student_id,
         score,
         total_points,
         earned_points,
         passed,
         started_at,
         completed_at
       FROM quiz_attempts
       WHERE quiz_id = $1
         AND student_id = $2
       ORDER BY completed_at DESC NULLS LAST, id DESC
       LIMIT 1`,
      [quizId, studentId]
    );

    if (attemptResult.rows.length === 0) {
      return res.json({
        attempt: null,
        answers: []
      });
    }

    const attempt = attemptResult.rows[0];

    const answersResult = await pool.query(
      `SELECT
         id,
         question_id,
         selected_option_id,
         answer_text,
         is_correct,
         points_earned
       FROM quiz_attempt_answers
       WHERE attempt_id = $1
       ORDER BY id ASC`,
      [attempt.id]
    );

    return res.json({
      attempt: {
        ...attempt,
        score: Number(attempt.score),
        total_points: Number(attempt.total_points),
        earned_points: Number(attempt.earned_points)
      },
      answers: answersResult.rows
    });
  } catch (error) {
    console.error(
      'Get latest quiz attempt error:',
      error
    );

    return res.status(500).json({
      message: 'Unable to get quiz attempt.'
    });
  }
};

// ============================================================
// SCENARIO FUNCTIONS
// ============================================================

// Get one scenario with its choices
const getScenario = async (req, res) => {
  try {
    const scenarioId = Number(req.params.scenarioId);

    if (!Number.isInteger(scenarioId) || scenarioId <= 0) {
      return res.status(400).json({
        message: "Invalid scenario ID."
      });
    }

    const scenarioResult = await pool.query(
      `SELECT
         id,
         category_id,
         title,
         description,
         introduction,
         difficulty,
         is_published
       FROM scenarios
       WHERE id = $1
         AND is_published = TRUE
       LIMIT 1`,
      [scenarioId]
    );

    if (scenarioResult.rows.length === 0) {
      return res.status(404).json({
        message: "Scenario not found."
      });
    }

    const choicesResult = await pool.query(
      `SELECT
         id,
         scenario_id,
         choice_order,
         choice_text,
         consequence,
         score_change,
         next_step
       FROM scenario_choices
       WHERE scenario_id = $1
       ORDER BY choice_order ASC, id ASC`,
      [scenarioId]
    );

    // Your current UI has 2 questions:
    // choices 1-3 belong to Question 1
    // choices 4-6 belong to Question 2
    const questions = [
      {
        number: 1,
        question: "What would you do?",
        description:
          "Choose the option that you think is the best decision.",
        choices: choicesResult.rows
          .filter((choice) => Number(choice.choice_order) <= 3)
          .map((choice) => ({
            id: Number(choice.id),
            option: String.fromCharCode(
              64 + Number(choice.choice_order)
            ),
            choice_order: choice.choice_order,
            choice_text: choice.choice_text,
            consequence: choice.consequence,
            score_change: Number(choice.score_change || 0),
            next_step: choice.next_step
          }))
      },
      {
        number: 2,
        question:
          "Your friends suggest an expensive dinner. What would you do?",
        description:
          "Choose the option that best fits your budget and goals.",
        choices: choicesResult.rows
          .filter(
            (choice) =>
              Number(choice.choice_order) >= 4 &&
              Number(choice.choice_order) <= 6
          )
          .map((choice) => ({
            id: Number(choice.id),
            option: String.fromCharCode(
              64 + (Number(choice.choice_order) - 3)
            ),
            choice_order: choice.choice_order,
            choice_text: choice.choice_text,
            consequence: choice.consequence,
            score_change: Number(choice.score_change || 0),
            next_step: choice.next_step
          }))
      }
    ];

    return res.json({
      scenario: {
        id: Number(scenarioResult.rows[0].id),
        category_id: scenarioResult.rows[0].category_id,
        title: scenarioResult.rows[0].title,
        description: scenarioResult.rows[0].description,
        introduction: scenarioResult.rows[0].introduction,
        difficulty: scenarioResult.rows[0].difficulty,
        questions
      }
    });
  } catch (error) {
    console.error("Get scenario error:", error);

    return res.status(500).json({
      message: "Unable to get scenario."
    });
  }
};


// Save a completed scenario attempt
const saveScenarioAttempt = async (req, res) => {
  const studentId = req.user.id;
  const scenarioId = Number(req.params.scenarioId);
  const { answers } = req.body;

  if (!Number.isInteger(scenarioId) || scenarioId <= 0) {
    return res.status(400).json({
      message: "Invalid scenario ID."
    });
  }

  if (!Array.isArray(answers)) {
    return res.status(400).json({
      message: "Answers must be an array."
    });
  }

  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    // Check scenario
    const scenarioResult = await client.query(
      `SELECT id
       FROM scenarios
       WHERE id = $1
         AND is_published = TRUE
       LIMIT 1`,
      [scenarioId]
    );

    if (scenarioResult.rows.length === 0) {
      await client.query("ROLLBACK");

      return res.status(404).json({
        message: "Scenario not found."
      });
    }

    // This scenario has exactly 2 decisions.
    if (answers.length !== 2) {
      await client.query("ROLLBACK");

      return res.status(400).json({
        message: "Please answer all scenario questions."
      });
    }

    const choiceIds = answers.map((answer) =>
      Number(answer.choice_id)
    );

    if (
      choiceIds.some(
        (choiceId) =>
          !Number.isInteger(choiceId) || choiceId <= 0
      )
    ) {
      await client.query("ROLLBACK");

      return res.status(400).json({
        message: "Invalid scenario choice."
      });
    }

    // Make sure all submitted choices belong to this scenario.
    const choicesResult = await client.query(
      `SELECT
         id,
         choice_order,
         choice_text,
         score_change,
         consequence,
         next_step
       FROM scenario_choices
       WHERE scenario_id = $1
         AND id = ANY($2::bigint[])
       ORDER BY choice_order ASC`,
      [scenarioId, choiceIds]
    );

    if (choicesResult.rows.length !== choiceIds.length) {
      await client.query("ROLLBACK");

      return res.status(400).json({
        message: "One or more scenario choices are invalid."
      });
    }

    // Prevent duplicate choice submissions.
    if (new Set(choiceIds).size !== choiceIds.length) {
      await client.query("ROLLBACK");

      return res.status(400).json({
        message: "Duplicate scenario choices are not allowed."
      });
    }

    // Calculate total score from database.
    const score = choicesResult.rows.reduce(
      (total, choice) =>
        total + Number(choice.score_change || 0),
      0
    );

    // Create attempt
    const attemptResult = await client.query(
      `INSERT INTO scenario_attempts (
         scenario_id,
         student_id,
         score,
         completed,
         started_at,
         completed_at
       )
       VALUES (
         $1,
         $2,
         $3,
         TRUE,
         NOW(),
         NOW()
       )
       RETURNING
         id,
         scenario_id,
         student_id,
         score,
         completed,
         started_at,
         completed_at`,
      [
        scenarioId,
        studentId,
        score
      ]
    );

    const attempt = attemptResult.rows[0];

    // Save each selected response
    for (const answer of answers) {
      const choiceId = Number(answer.choice_id);

      await client.query(
        `INSERT INTO scenario_responses (
           attempt_id,
           choice_id,
           response_data
         )
         VALUES (
           $1,
           $2,
           $3::jsonb
         )`,
        [
          attempt.id,
          choiceId,
          JSON.stringify({
            question_number: Number(answer.question_number),
            selected_option: answer.selected_option || null
          })
        ]
      );
    }

    await refreshStudentProgress(client, studentId);

    await client.query("COMMIT");

    return res.status(201).json({
      message: "Scenario attempt saved successfully.",
      attempt: {
        id: Number(attempt.id),
        scenario_id: Number(attempt.scenario_id),
        student_id: Number(attempt.student_id),
        score: Number(attempt.score),
        completed: attempt.completed,
        started_at: attempt.started_at,
        completed_at: attempt.completed_at
      }
    });
  } catch (error) {
    await client.query("ROLLBACK");

    console.error("Save scenario attempt error:", error);

    return res.status(500).json({
      message: "Unable to save scenario attempt."
    });
  } finally {
    client.release();
  }
};


// Get the logged-in student's latest scenario attempt
const getLatestScenarioAttempt = async (req, res) => {
  try {
    const studentId = req.user.id;
    const scenarioId = Number(req.params.scenarioId);

    if (!Number.isInteger(scenarioId) || scenarioId <= 0) {
      return res.status(400).json({
        message: "Invalid scenario ID."
      });
    }

    const attemptResult = await pool.query(
      `SELECT
         id,
         scenario_id,
         student_id,
         score,
         completed,
         started_at,
         completed_at
       FROM scenario_attempts
       WHERE scenario_id = $1
         AND student_id = $2
       ORDER BY completed_at DESC NULLS LAST, id DESC
       LIMIT 1`,
      [
        scenarioId,
        studentId
      ]
    );

    if (attemptResult.rows.length === 0) {
      return res.json({
        attempt: null,
        responses: []
      });
    }

    const attempt = attemptResult.rows[0];

    const responsesResult = await pool.query(
      `SELECT
         sr.id,
         sr.attempt_id,
         sr.choice_id,
         sr.response_data,
         sr.created_at,
         sc.choice_order,
         sc.choice_text,
         sc.score_change,
         sc.consequence,
         sc.next_step
       FROM scenario_responses sr
       JOIN scenario_choices sc
         ON sc.id = sr.choice_id
       WHERE sr.attempt_id = $1
       ORDER BY sc.choice_order ASC`,
      [attempt.id]
    );

    return res.json({
      attempt: {
        id: Number(attempt.id),
        scenario_id: Number(attempt.scenario_id),
        student_id: Number(attempt.student_id),
        score: Number(attempt.score),
        completed: attempt.completed,
        started_at: attempt.started_at,
        completed_at: attempt.completed_at
      },

      responses: responsesResult.rows.map((response) => ({
        id: Number(response.id),
        attempt_id: Number(response.attempt_id),
        choice_id: Number(response.choice_id),
        response_data: response.response_data,
        created_at: response.created_at,
        choice_order: response.choice_order,
        choice_text: response.choice_text,
        score_change: Number(response.score_change || 0),
        consequence: response.consequence,
        next_step: response.next_step
      }))
    });
  } catch (error) {
    console.error(
      "Get latest scenario attempt error:",
      error
    );

    return res.status(500).json({
      message: "Unable to get scenario attempt."
    });
  }
};

const goalFromRow = (row) => ({
  id: Number(row.id),
  title: row.title,
  description: row.description || '',
  target_amount: Number(row.target_amount || 0),
  current_amount: Number(row.current_amount || 0),
  target_date: row.target_date,
  status: row.status,
  created_at: row.created_at,
  updated_at: row.updated_at
});

const validateGoal = (input, { partial = false } = {}) => {
  const updates = {};

  if (!partial || Object.prototype.hasOwnProperty.call(input, 'title')) {
    const title = String(input.title || '').trim();
    if (!title || title.length > 200) {
      return { error: 'Goal title is required and must be 200 characters or fewer.' };
    }
    updates.title = title;
  }

  if (Object.prototype.hasOwnProperty.call(input, 'description')) {
    const description = String(input.description || '').trim();
    if (description.length > 5000) {
      return { error: 'Goal description must be 5,000 characters or fewer.' };
    }
    updates.description = description || null;
  }

  for (const [inputKey, column] of [
    ['targetAmount', 'target_amount'],
    ['currentAmount', 'current_amount']
  ]) {
    if (!partial || Object.prototype.hasOwnProperty.call(input, inputKey)) {
      const value = inputKey === 'currentAmount' && !Object.prototype.hasOwnProperty.call(input, inputKey)
        ? 0
        : Number(input[inputKey]);
      if (!Number.isFinite(value) || value < 0 || (inputKey === 'targetAmount' && value <= 0)) {
        return { error: inputKey === 'targetAmount' ? 'Target amount must be greater than zero.' : 'Current amount cannot be negative.' };
      }
      updates[column] = value;
    }
  }

  if (Object.prototype.hasOwnProperty.call(input, 'targetDate')) {
    if (!input.targetDate) {
      updates.target_date = null;
    } else if (Number.isNaN(new Date(input.targetDate).getTime())) {
      return { error: 'Target date is invalid.' };
    } else {
      updates.target_date = input.targetDate;
    }
  }

  if (Object.prototype.hasOwnProperty.call(input, 'status')) {
    if (!['active', 'completed', 'cancelled'].includes(input.status)) {
      return { error: 'Goal status is invalid.' };
    }
    updates.status = input.status;
  }

  return { updates };
};

const getStudentGoals = async (req, res) => {
  try {
    const result = await pool.query(
      `
        SELECT id, title, description, target_amount, current_amount,
               target_date, status, created_at, updated_at
        FROM goals
        WHERE student_id = $1
        ORDER BY CASE WHEN status = 'active' THEN 0 ELSE 1 END,
                 updated_at DESC, id DESC
      `,
      [req.user.id]
    );

    return res.json({ goals: result.rows.map(goalFromRow) });
  } catch (error) {
    console.error('Get student goals error:', error);
    return res.status(500).json({ message: 'Unable to load goals.' });
  }
};

const createStudentGoal = async (req, res) => {
  const { updates, error } = validateGoal(req.body || {});
  if (error) return res.status(400).json({ message: error });

  try {
    const result = await pool.query(
      `
        INSERT INTO goals (
          student_id, title, description, target_amount, current_amount,
          target_date, status
        )
        VALUES ($1, $2, $3, $4, $5, $6, 'active')
        RETURNING id, title, description, target_amount, current_amount,
                  target_date, status, created_at, updated_at
      `,
      [
        req.user.id,
        updates.title,
        updates.description || null,
        updates.target_amount,
        updates.current_amount || 0,
        updates.target_date || null
      ]
    );

    return res.status(201).json({ goal: goalFromRow(result.rows[0]) });
  } catch (caughtError) {
    console.error('Create student goal error:', caughtError);
    return res.status(500).json({ message: 'Unable to create goal.' });
  }
};

const updateStudentGoal = async (req, res) => {
  const goalId = Number(req.params.goalId);
  if (!Number.isInteger(goalId) || goalId <= 0) {
    return res.status(400).json({ message: 'Invalid goal ID.' });
  }

  const { updates, error } = validateGoal(req.body || {}, { partial: true });
  if (error) return res.status(400).json({ message: error });
  if (!Object.keys(updates).length) {
    return res.status(400).json({ message: 'No goal changes were provided.' });
  }

  try {
    const existingResult = await pool.query(
      `SELECT target_amount, current_amount FROM goals WHERE id = $1 AND student_id = $2 LIMIT 1`,
      [goalId, req.user.id]
    );

    if (!existingResult.rowCount) {
      return res.status(404).json({ message: 'Goal not found.' });
    }

    const targetAmount = updates.target_amount ?? Number(existingResult.rows[0].target_amount);
    const currentAmount = updates.current_amount ?? Number(existingResult.rows[0].current_amount);
    if (currentAmount > targetAmount) {
      return res.status(400).json({ message: 'Current amount cannot exceed the target amount.' });
    }

    const columns = Object.keys(updates);
    const values = columns.map((column) => updates[column]);
    const assignments = columns.map((column, index) => `${column} = $${index + 1}`);
    values.push(goalId, req.user.id);

    const result = await pool.query(
      `
        UPDATE goals
        SET ${assignments.join(', ')},
            status = CASE
              WHEN current_amount >= target_amount THEN 'completed'
              WHEN status = 'completed' THEN 'active'
              ELSE status
            END,
            updated_at = NOW()
        WHERE id = $${values.length - 1}
          AND student_id = $${values.length}
        RETURNING id, title, description, target_amount, current_amount,
                  target_date, status, created_at, updated_at
      `,
      values
    );

    return res.json({ goal: goalFromRow(result.rows[0]) });
  } catch (caughtError) {
    console.error('Update student goal error:', caughtError);
    return res.status(500).json({ message: 'Unable to update goal.' });
  }
};

module.exports = {
  getLessonProgress,
  saveLessonProgress,

  getQuiz,
  saveQuizAttempt,
  getLatestQuizAttempt,

  getScenario,
  saveScenarioAttempt,
  getLatestScenarioAttempt,

  getStudentGoals,
  createStudentGoal,
  updateStudentGoal
  
};
