const pool = require('../db/pool');

const clampPercent = (value) => {
  const numeric = Number(value);
  return Number.isFinite(numeric)
    ? Math.max(0, Math.min(100, Math.round(numeric)))
    : 0;
};

const activityTime = (value) => {
  if (!value) return 'Recently';

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'Recently';

  const elapsedMinutes = Math.floor((Date.now() - date.getTime()) / 60000);
  if (elapsedMinutes < 1) return 'Just now';
  if (elapsedMinutes < 60) return `${elapsedMinutes} min ago`;

  const hours = Math.floor(elapsedMinutes / 60);
  if (hours < 24) return `${hours} hour${hours === 1 ? '' : 's'} ago`;

  const days = Math.floor(hours / 24);
  if (days < 7) return `${days} day${days === 1 ? '' : 's'} ago`;
  return date.toLocaleDateString();
};

const getTeacherDashboard = async (req, res) => {
  try {
    const teacherId = Number(req.user.id);

    if (!Number.isInteger(teacherId) || teacherId <= 0) {
      return res.status(401).json({ message: 'Invalid teacher session.' });
    }

    const userResult = await pool.query(
      `
        SELECT id, role, full_name, username, email
        FROM users
        WHERE id = $1
        LIMIT 1
      `,
      [teacherId]
    );
    const user = userResult.rows[0];

    if (!user) {
      return res.status(404).json({ message: 'Teacher account not found.' });
    }

    // School membership does not grant access to every school class. Teachers
    // may see only classes where they have an explicit teacher membership.
    const classResult = await pool.query(
      `
        WITH teacher_classes AS (
          SELECT DISTINCT class_id
          FROM class_memberships
          WHERE user_id = $1
            AND membership_role = 'teacher'
        )
        SELECT
          c.id,
          c.name,
          c.is_active,
          COUNT(DISTINCT student_membership.user_id)::int AS students,
          COALESCE(ROUND(AVG(student_progress.overall_progress), 0), 0)::int AS progress
        FROM teacher_classes tc
        JOIN classes c ON c.id = tc.class_id
        LEFT JOIN class_memberships student_membership
          ON student_membership.class_id = c.id
         AND student_membership.membership_role = 'student'
        LEFT JOIN student_progress
          ON student_progress.student_id = student_membership.user_id
        GROUP BY c.id, c.name, c.is_active
        ORDER BY c.name ASC
      `,
      [teacherId]
    );

    const classes = classResult.rows.map((row) => ({
      id: Number(row.id),
      name: row.name,
      students: Number(row.students || 0),
      progress: clampPercent(row.progress),
      status: row.is_active === false ? 'Archived' : 'Active'
    }));
    const classIds = classes.map((item) => item.id);

    if (!classIds.length) {
      return res.json({
        user: {
          id: Number(user.id), role: user.role, fullName: user.full_name,
          username: user.username, email: user.email
        },
        stats: { classes: 0, totalStudents: 0, assignedContent: 0, averageCompletion: 0 },
        classes: [],
        progress: { lessons: 0, quizzes: 0, scenarios: 0, goals: 0 },
        recentActivity: []
      });
    }

    const [summaryResult, assignmentResult, activityResult] = await Promise.all([
      pool.query(
        `
          WITH students AS (
            SELECT DISTINCT user_id AS student_id
            FROM class_memberships
            WHERE class_id = ANY($1::bigint[])
              AND membership_role = 'student'
          ),
          totals AS (
            SELECT
              (SELECT COUNT(*)::numeric FROM lessons WHERE is_published = TRUE) AS lessons,
              (SELECT COUNT(*)::numeric FROM quizzes WHERE is_published = TRUE) AS quizzes,
              (SELECT COUNT(*)::numeric FROM scenarios WHERE is_published = TRUE) AS scenarios
          ),
          per_student AS (
            SELECT
              students.student_id,
              CASE WHEN totals.lessons = 0 THEN 0 ELSE (
                SELECT COUNT(*)::numeric
                FROM lesson_progress lp
                JOIN lessons l ON l.id = lp.lesson_id AND l.is_published = TRUE
                WHERE lp.student_id = students.student_id AND lp.status = 'completed'
              ) / totals.lessons * 100 END AS lesson_progress,
              CASE WHEN totals.quizzes = 0 THEN 0 ELSE (
                SELECT COUNT(DISTINCT qa.quiz_id)::numeric
                FROM quiz_attempts qa
                JOIN quizzes q ON q.id = qa.quiz_id AND q.is_published = TRUE
                WHERE qa.student_id = students.student_id AND qa.completed_at IS NOT NULL
              ) / totals.quizzes * 100 END AS quiz_progress,
              CASE WHEN totals.scenarios = 0 THEN 0 ELSE (
                SELECT COUNT(DISTINCT sa.scenario_id)::numeric
                FROM scenario_attempts sa
                JOIN scenarios s ON s.id = sa.scenario_id AND s.is_published = TRUE
                WHERE sa.student_id = students.student_id AND sa.completed = TRUE
              ) / totals.scenarios * 100 END AS scenario_progress,
              COALESCE((
                SELECT AVG(CASE WHEN g.target_amount > 0
                  THEN LEAST((g.current_amount / g.target_amount) * 100, 100)
                  ELSE 0 END)
                FROM goals g
                WHERE g.student_id = students.student_id AND g.status = 'active'
              ), 0) AS goal_progress
            FROM students
            CROSS JOIN totals
          )
          SELECT
            COUNT(*)::int AS total_students,
            COALESCE(ROUND(AVG(lesson_progress), 0), 0)::int AS lessons,
            COALESCE(ROUND(AVG(quiz_progress), 0), 0)::int AS quizzes,
            COALESCE(ROUND(AVG(scenario_progress), 0), 0)::int AS scenarios,
            COALESCE(ROUND(AVG(goal_progress), 0), 0)::int AS goals,
            COALESCE(ROUND(AVG((lesson_progress + quiz_progress + scenario_progress) / 3), 0), 0)::int AS average_completion
          FROM per_student
        `,
        [classIds]
      ),
      pool.query(
        `
          SELECT COUNT(DISTINCT CONCAT_WS(':', lesson_id, quiz_id, scenario_id))::int AS count
          FROM teacher_assignments
          WHERE teacher_id = $1 AND class_id = ANY($2::bigint[])
        `,
        [teacherId, classIds]
      ),
      pool.query(
        `
          WITH students AS (
            SELECT DISTINCT user_id
            FROM class_memberships
            WHERE class_id = ANY($1::bigint[]) AND membership_role = 'student'
          ), activity AS (
            SELECT 'lesson' AS type, lp.completed_at AS occurred_at, u.full_name, l.title AS content_title, NULL::text AS class_name
            FROM lesson_progress lp
            JOIN students st ON st.user_id = lp.student_id
            JOIN users u ON u.id = lp.student_id
            JOIN lessons l ON l.id = lp.lesson_id
            WHERE lp.status = 'completed' AND lp.completed_at IS NOT NULL
            UNION ALL
            SELECT 'quiz', qa.completed_at, u.full_name, q.title, NULL::text
            FROM quiz_attempts qa
            JOIN students st ON st.user_id = qa.student_id
            JOIN users u ON u.id = qa.student_id
            JOIN quizzes q ON q.id = qa.quiz_id
            WHERE qa.completed_at IS NOT NULL
            UNION ALL
            SELECT 'scenario', sa.completed_at, u.full_name, s.title, NULL::text
            FROM scenario_attempts sa
            JOIN students st ON st.user_id = sa.student_id
            JOIN users u ON u.id = sa.student_id
            JOIN scenarios s ON s.id = sa.scenario_id
            WHERE sa.completed = TRUE AND sa.completed_at IS NOT NULL
            UNION ALL
            SELECT 'assignment', ta.assigned_at, NULL::text, COALESCE(l.title, q.title, s.title, 'content'), c.name
            FROM teacher_assignments ta
            JOIN classes c ON c.id = ta.class_id
            LEFT JOIN lessons l ON l.id = ta.lesson_id
            LEFT JOIN quizzes q ON q.id = ta.quiz_id
            LEFT JOIN scenarios s ON s.id = ta.scenario_id
            WHERE ta.teacher_id = $2 AND ta.class_id = ANY($1::bigint[])
          )
          SELECT type, occurred_at, full_name, content_title, class_name
          FROM activity
          ORDER BY occurred_at DESC
          LIMIT 4
        `,
        [classIds, teacherId]
      )
    ]);

    const summary = summaryResult.rows[0] || {};
    const progress = {
      lessons: clampPercent(summary.lessons),
      quizzes: clampPercent(summary.quizzes),
      scenarios: clampPercent(summary.scenarios),
      goals: clampPercent(summary.goals)
    };

    const recentActivity = activityResult.rows.map((row) => {
      const student = row.full_name || 'A student';
      const title = row.content_title || 'learning content';
      const text = row.type === 'assignment'
        ? `You assigned "${title}" to ${row.class_name || 'a class'}`
        : `${student} completed ${row.type === 'lesson' ? 'the lesson' : `the ${row.type}`} "${title}"`;

      return { type: row.type, text, time: activityTime(row.occurred_at) };
    });

    return res.json({
      user: {
        id: Number(user.id), role: user.role, fullName: user.full_name,
        username: user.username, email: user.email
      },
      stats: {
        classes: classes.length,
        totalStudents: Number(summary.total_students || 0),
        assignedContent: Number(assignmentResult.rows[0]?.count || 0),
        averageCompletion: clampPercent(summary.average_completion)
      },
      classes,
      progress,
      recentActivity
    });
  } catch (error) {
    console.error('Teacher dashboard error:', error);
    return res.status(500).json({ message: 'Unable to load teacher dashboard.' });
  }
};

module.exports = { getTeacherDashboard };
