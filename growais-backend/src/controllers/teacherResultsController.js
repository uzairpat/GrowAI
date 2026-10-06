const pool = require('../db/pool');

async function hasTable(tableName) {
  const result = await pool.query(
    `SELECT to_regclass($1) IS NOT NULL AS exists`,
    [`public.${tableName}`]
  );
  return Boolean(result.rows[0]?.exists);
}

async function getColumns(tableName) {
  const result = await pool.query(
    `
      SELECT column_name
      FROM information_schema.columns
      WHERE table_schema = 'public'
        AND table_name = $1
    `,
    [tableName]
  );
  return result.rows.map((row) => row.column_name);
}

function pickColumn(columns, candidates) {
  return candidates.find((candidate) => columns.includes(candidate)) || null;
}

async function getTeacherClasses(teacherId) {
  const result = await pool.query(
    `
      SELECT DISTINCT c.id, c.name, c.is_active
      FROM classes c
      INNER JOIN class_memberships teacher_membership
        ON teacher_membership.class_id = c.id
       AND teacher_membership.user_id = $1
       AND teacher_membership.membership_role = 'teacher'
      ORDER BY c.id
    `,
    [teacherId]
  );

  return result.rows.map((row) => ({
    id: Number(row.id),
    name: row.name,
    status: row.is_active === false ? 'Archived' : 'Active'
  }));
}

function initialsFor(name) {
  return String(name || '')
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0].toUpperCase())
    .join('') || '?';
}

function formatDuration(seconds) {
  if (!Number.isFinite(seconds) || seconds < 0) return '—';
  const minutes = Math.max(1, Math.round(seconds / 60));
  return `${minutes} min`;
}

function clampPercent(value) {
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) return 0;
  return Math.max(0, Math.min(100, numeric));
}

function periodDays(period) {
  if (period === 'Last 7 Days') return 7;
  if (period === 'Last 90 Days') return 90;
  return 30;
}

function toneFor(index) {
  return ['green', 'blue', 'purple', 'orange'][index % 4];
}

async function getContentNameColumn(tableName) {
  const columns = await getColumns(tableName);
  return pickColumn(columns, ['name', 'title', 'quiz_name', 'scenario_name']);
}

function contentNameSelect(alias, columnName, fallbackPrefix) {
  if (columnName) {
    return `${alias}."${columnName}"`;
  }

  return `CONCAT('${fallbackPrefix} ', ${alias}.id)`;
}

async function buildQuizResults({
  classId,
  quizId,
  days,
  previous = false
}) {
  const quizNameColumn = await getContentNameColumn('quizzes');
  const quizNameSelect = contentNameSelect('q', quizNameColumn, 'Quiz');
  const completedColumn = 'completed_at';

  const timePredicate = previous
    ? `COALESCE(qa.${completedColumn}, qa.started_at) >= NOW() - ($2::int * INTERVAL '1 day')
       AND COALESCE(qa.${completedColumn}, qa.started_at) < NOW() - ($2::int * INTERVAL '1 day') * 2`
    : `COALESCE(qa.${completedColumn}, qa.started_at) >= NOW() - ($2::int * INTERVAL '1 day')`;

  const quizFilter = quizId
    ? `AND qa.quiz_id = $3`
    : '';

  const params = quizId
    ? [classId, days, quizId]
    : [classId, days];

  const query = `
    WITH filtered_attempts AS (
      SELECT
        qa.*,
        ROW_NUMBER() OVER (
          PARTITION BY qa.student_id, qa.quiz_id
          ORDER BY COALESCE(qa.completed_at, qa.started_at) DESC, qa.id DESC
        ) AS latest_rank,
        COUNT(*) OVER (
          PARTITION BY qa.student_id, qa.quiz_id
        ) AS attempt_count
      FROM quiz_attempts qa
      INNER JOIN class_memberships cm
        ON cm.user_id = qa.student_id
       AND cm.class_id = $1
       AND cm.membership_role = 'student'
      WHERE ${timePredicate}
        ${quizFilter}
    )
    SELECT
      fa.id,
      fa.student_id,
      u.full_name,
      u.username,
      u.email,
      fa.quiz_id,
      ${quizNameSelect} AS quiz_name,
      COALESCE(
        fa.score,
        CASE
          WHEN COALESCE(fa.total_points, 0) > 0
            THEN (COALESCE(fa.earned_points, 0)::numeric / fa.total_points::numeric) * 100
          ELSE 0
        END
      ) AS score,
      fa.attempt_count,
      fa.passed,
      fa.started_at,
      fa.completed_at
    FROM filtered_attempts fa
    INNER JOIN users u
      ON u.id = fa.student_id
    LEFT JOIN quizzes q
      ON q.id = fa.quiz_id
    WHERE fa.latest_rank = 1
    ORDER BY COALESCE(fa.completed_at, fa.started_at) DESC, u.full_name ASC
  `;

  const result = await pool.query(query, params);

  return result.rows.map((row, index) => {
    const score = clampPercent(row.score);
    const durationSeconds =
      row.completed_at && row.started_at
        ? (new Date(row.completed_at).getTime() - new Date(row.started_at).getTime()) / 1000
        : NaN;

    return {
      id: Number(row.id),
      studentId: Number(row.student_id),
      initials: initialsFor(row.full_name || row.username || row.email),
      name: row.full_name || row.username || row.email || `Student ${index + 1}`,
      contentId: Number(row.quiz_id),
      content: row.quiz_name || `Quiz ${row.quiz_id}`,
      score: Math.round(score),
      attempts: Number(row.attempt_count || 1),
      time: formatDuration(durationSeconds),
      status:
        row.passed === true || (row.passed == null && score >= 60)
          ? 'Passed'
          : 'Needs Review',
      tone: toneFor(index),
      completedAt: row.completed_at || row.started_at
    };
  });
}

async function buildScenarioResults({
  classId,
  scenarioId,
  days,
  previous = false
}) {
  const timePredicate = previous
    ? `sa.started_at >= NOW() - ($2::int * INTERVAL '1 day')
       AND sa.started_at < NOW() - ($2::int * INTERVAL '1 day') * 2`
    : `sa.started_at >= NOW() - ($2::int * INTERVAL '1 day')`;

  const scenarioFilter = scenarioId
    ? `AND sa.scenario_id = $3`
    : '';

  const params = scenarioId
    ? [classId, days, scenarioId]
    : [classId, days];

  const query = `
    WITH filtered_attempts AS (
      SELECT
        sa.*,
        ROW_NUMBER() OVER (
          PARTITION BY sa.student_id, sa.scenario_id
          ORDER BY sa.started_at DESC, sa.id DESC
        ) AS latest_rank,
        COUNT(*) OVER (
          PARTITION BY sa.student_id, sa.scenario_id
        ) AS attempt_count
      FROM scenario_attempts sa
      INNER JOIN class_memberships cm
        ON cm.user_id = sa.student_id
       AND cm.class_id = $1
       AND cm.membership_role = 'student'
      WHERE ${timePredicate}
        ${scenarioFilter}
    )
    SELECT
      fa.id,
      fa.student_id,
      u.full_name,
      u.username,
      u.email,
      fa.scenario_id,
      COALESCE(s.title, CONCAT('Scenario ', fa.scenario_id)) AS scenario_name,
      fa.score,
      fa.completed,
      fa.attempt_count,
      fa.started_at
    FROM filtered_attempts fa
    INNER JOIN users u
      ON u.id = fa.student_id
    LEFT JOIN scenarios s
      ON s.id = fa.scenario_id
    WHERE fa.latest_rank = 1
    ORDER BY fa.started_at DESC, u.full_name ASC
  `;

  const result = await pool.query(query, params);

  return result.rows.map((row, index) => {
    const score = clampPercent(row.score);

    return {
      id: Number(row.id),
      studentId: Number(row.student_id),
      initials: initialsFor(row.full_name || row.username || row.email),
      name: row.full_name || row.username || row.email || `Student ${index + 1}`,
      contentId: Number(row.scenario_id),
      content: row.scenario_name || `Scenario ${row.scenario_id}`,
      score: Math.round(score),
      attempts: Number(row.attempt_count || 1),
      time: '—',
      status: row.completed === true ? 'Passed' : 'Needs Review',
      tone: toneFor(index),
      completedAt: row.started_at
    };
  });
}

async function getTeacherResults(req, res) {
  try {
    const teacherId = Number(req.user.id);
    const requestedClassId = req.query.classId ? Number(req.query.classId) : null;
    const tab = req.query.tab === 'scenario' ? 'scenario' : 'quiz';
    const selectedContentId = req.query.contentId
      ? Number(req.query.contentId)
      : null;
    const days = periodDays(String(req.query.period || 'Last 30 Days'));

    if (!Number.isInteger(teacherId) || teacherId <= 0) {
      return res.status(401).json({
        message: 'Invalid teacher session.'
      });
    }

    const classes = await getTeacherClasses(teacherId);

    if (classes.length === 0) {
      return res.json({
        classes: [],
        selectedClassId: null,
        selectedClassName: '',
        tab,
        options: [],
        rows: [],
        metrics: { averageScore: 0, completionRate: 0, passRate: 0, totalAttempts: 0 },
        changes: { averageScore: 0, completionRate: 0, passRate: 0, totalAttempts: 0 },
        chart: [],
        insights: [{
          tone: 'orange',
          title: 'No classes assigned',
          text: 'Assign this teacher to a class before viewing results.'
        }],
        studentCount: 0
      });
    }

    const classId = Number.isInteger(requestedClassId)
      ? requestedClassId
      : classes[0].id;

    const allowedClass = classes.some((item) => item.id === classId);

    if (!allowedClass) {
      return res.status(403).json({
        message: 'You do not have access to this class.'
      });
    }

    const quizTableExists = await hasTable('quizzes');
    const scenarioTableExists = await hasTable('scenarios');

    const studentsCountResult = await pool.query(
      `
        SELECT COUNT(*)::int AS count
        FROM class_memberships
        WHERE class_id = $1
          AND membership_role = 'student'
      `,
      [classId]
    );

    const studentCount = Number(studentsCountResult.rows[0]?.count || 0);

    let rows = [];
    let previousRows = [];
    let options = [];

    if (tab === 'quiz' && quizTableExists) {
      const quizNameColumn = await getContentNameColumn('quizzes');
      const quizOptionName = contentNameSelect('q', quizNameColumn, 'Quiz');
      const optionResult = await pool.query(
        `
          SELECT q.id, ${quizOptionName} AS name
          FROM quizzes q
          WHERE EXISTS (
            SELECT 1
            FROM quiz_attempts qa
            INNER JOIN class_memberships cm
              ON cm.user_id = qa.student_id
             AND cm.class_id = $1
             AND cm.membership_role = 'student'
            WHERE qa.quiz_id = q.id
          )
          ORDER BY q.id
        `,
        [classId]
      );
      options = optionResult.rows.map((row) => ({
        id: Number(row.id),
        name: row.name || `Quiz ${row.id}`
      }));

      rows = await buildQuizResults({
        classId,
        quizId: selectedContentId,
        days,
        previous: false
      });

      previousRows = await buildQuizResults({
        classId,
        quizId: selectedContentId,
        days,
        previous: true
      });
    }

    if (tab === 'scenario' && scenarioTableExists) {
      const optionResult = await pool.query(
        `
          SELECT
            s.id,
            COALESCE(s.title, CONCAT('Scenario ', s.id)) AS name
          FROM scenarios s
          WHERE EXISTS (
            SELECT 1
            FROM scenario_attempts sa
            INNER JOIN class_memberships cm
              ON cm.user_id = sa.student_id
             AND cm.class_id = $1
             AND cm.membership_role = 'student'
            WHERE sa.scenario_id = s.id
          )
          ORDER BY s.id
        `,
        [classId]
      );
      options = optionResult.rows.map((row) => ({
        id: Number(row.id),
        name: row.name || `Scenario ${row.id}`
      }));

      rows = await buildScenarioResults({
        classId,
        scenarioId: selectedContentId,
        days,
        previous: false
      });

      previousRows = await buildScenarioResults({
        classId,
        scenarioId: selectedContentId,
        days,
        previous: true
      });
    }

    const averageScore = rows.length
      ? Math.round(rows.reduce((sum, row) => sum + row.score, 0) / rows.length)
      : 0;

    const totalAttempts = rows.reduce((sum, row) => sum + row.attempts, 0);

    const studentsWithResults = new Set(rows.map((row) => row.studentId)).size;
    const completionRate = studentCount
      ? Math.round((studentsWithResults / studentCount) * 100)
      : 0;

    const passed = rows.filter((row) => row.status === 'Passed').length;
    const passRate = rows.length ? Math.round((passed / rows.length) * 100) : 0;

    const previousAverage = previousRows.length
      ? Math.round(
          previousRows.reduce((sum, row) => sum + row.score, 0) / previousRows.length
        )
      : 0;

    const previousStudents = new Set(previousRows.map((row) => row.studentId)).size;
    const previousCompletionRate = studentCount
      ? Math.round((previousStudents / studentCount) * 100)
      : 0;

    const previousPassed = previousRows.filter((row) => row.status === 'Passed').length;
    const previousPassRate = previousRows.length
      ? Math.round((previousPassed / previousRows.length) * 100)
      : 0;

    const previousAttempts = previousRows.reduce((sum, row) => sum + row.attempts, 0);

    const grouped = new Map();
    rows.forEach((row) => {
      const existing = grouped.get(row.content) || [];
      existing.push(row.score);
      grouped.set(row.content, existing);
    });

    const chart = Array.from(grouped.entries())
      .slice(0, 6)
      .map(([label, scores], index) => ({
        label,
        value: Math.round(
          scores.reduce((sum, score) => sum + score, 0) / scores.length
        ),
        tone: toneFor(index)
      }));

    const supportCount = rows.filter((row) => row.score < 60).length;
    const best = chart.slice().sort((a, b) => b.value - a.value)[0];

    return res.json({
      classes,
      selectedClassId: classId,
      selectedClassName: classes.find((item) => item.id === classId)?.name || '',
      tab,
      options,
      rows,
      metrics: {
        averageScore,
        completionRate,
        passRate,
        totalAttempts
      },
      changes: {
        averageScore: averageScore - previousAverage,
        completionRate: completionRate - previousCompletionRate,
        passRate: passRate - previousPassRate,
        totalAttempts: totalAttempts - previousAttempts
      },
      chart,
      insights: [
        {
          tone: 'green',
          title: `${averageScore}% average score`,
          text: best
            ? `${best.label} has the highest performance.`
            : 'No scored attempts are available in this period.'
        },
        {
          tone: 'purple',
          title: `${supportCount} results need support`,
          text: 'Scores below 60% in the selected period.'
        },
        {
          tone: 'orange',
          title: rows.length ? 'Recent results connected' : 'No recent results',
          text: rows.length
            ? `${rows.length} latest student result records are available.`
            : 'Students have not submitted results in this period.'
        }
      ],
      studentCount
    });
  } catch (error) {
    console.error('Teacher results error:', error);
    return res.status(500).json({
      message: 'Unable to load teacher results.',
      detail: process.env.NODE_ENV !== 'production' ? error.message : undefined
    });
  }
}

module.exports = {
  getTeacherResults
};
