const pool = require('../db/pool');

function initialsFor(name) {
  return String(name || '')
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0].toUpperCase())
    .join('') || '?';
}

function activityText(value) {
  if (!value) return 'No activity yet';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'No activity yet';
  const hours = Math.floor((Date.now() - date.getTime()) / (1000 * 60 * 60));
  if (hours < 1) return 'Just now';
  if (hours < 24) return `${hours} hour${hours === 1 ? '' : 's'} ago`;
  const days = Math.floor(hours / 24);
  if (days === 1) return 'Yesterday';
  if (days < 7) return `${days} days ago`;
  return date.toLocaleDateString();
}

function round(value) {
  const n = Number(value);
  return Number.isFinite(n) ? Math.round(n) : 0;
}

function clamp(value, min = 0, max = 100) {
  return Math.max(min, Math.min(max, Number(value) || 0));
}

function average(values) {
  const nums = values.filter((value) => Number.isFinite(value));
  if (!nums.length) return 0;
  return nums.reduce((sum, value) => sum + value, 0) / nums.length;
}

function metricValueMap() {
  return {
    All: ['lessons', 'quizzes', 'scenarios', 'goals'],
    Lessons: ['lessons'],
    Quizzes: ['quizzes'],
    Scenarios: ['scenarios'],
    Goals: ['goals']
  };
}

function periodConfig(period) {
  const now = new Date();
  let start;
  let previousStart;

  if (period === 'Last 7 Days') {
    start = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    previousStart = new Date(start.getTime() - 7 * 24 * 60 * 60 * 1000);
  } else if (period === 'Last 90 Days') {
    start = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
    previousStart = new Date(start.getTime() - 90 * 24 * 60 * 60 * 1000);
  } else if (period === 'This Year') {
    start = new Date(now.getFullYear(), 0, 1);
    previousStart = new Date(now.getFullYear() - 1, 0, 1);
  } else {
    start = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    previousStart = new Date(start.getTime() - 30 * 24 * 60 * 60 * 1000);
  }

  return { now, start, previousStart };
}

function contentFlags(contentType) {
  const values = metricValueMap();
  const selected = values[contentType] || values.All;
  return {
    lessons: selected.includes('lessons'),
    quizzes: selected.includes('quizzes'),
    scenarios: selected.includes('scenarios'),
    goals: selected.includes('goals')
  };
}

function categoryOverall(student, flags) {
  const values = [];
  if (flags.lessons) values.push(student.lessons);
  if (flags.quizzes) values.push(student.quizzes);
  if (flags.scenarios) values.push(student.scenarios);
  if (flags.goals) values.push(student.goals);
  return round(average(values));
}

function buildTrend(events, start, now, steps = 5) {
  const totalMs = Math.max(1, now.getTime() - start.getTime());
  const labels = [];
  const values = [];

  for (let i = 0; i < steps; i += 1) {
    const pointDate = new Date(start.getTime() + (totalMs * i) / (steps - 1));
    labels.push(pointDate.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' }));

    const visible = events
      .filter((event) => new Date(event.at).getTime() <= pointDate.getTime())
      .map((event) => event.value);

    values.push(round(average(visible)));
  }

  return { labels, values };
}

async function getTeacherProgress(req, res) {
  try {
    const teacherId = Number(req.user.id);
    const requestedClassId = String(req.query.classId || '');
    const contentType = String(req.query.contentType || 'All Content');
    const period = String(req.query.period || 'Last 30 Days');

    if (!Number.isInteger(teacherId) || teacherId <= 0) {
      return res.status(401).json({ message: 'Invalid teacher session.' });
    }

    const classesResult = await pool.query(
      `
        SELECT DISTINCT c.id, c.name, c.is_active
        FROM class_memberships teacher_membership
        INNER JOIN classes c
          ON c.id = teacher_membership.class_id
        WHERE teacher_membership.user_id = $1
          AND teacher_membership.membership_role = 'teacher'
        ORDER BY c.id ASC
      `,
      [teacherId]
    );

    const classes = classesResult.rows.map((row) => ({
      id: Number(row.id),
      name: row.name,
      status: row.is_active === false ? 'Archived' : 'Active'
    }));

    if (!classes.length) {
      return res.json({
        progressAvailable: false,
        classes: [],
        selectedClassId: null,
        students: [],
        summary: { overall: 0, lessons: 0, quizzes: 0, scenarios: 0, goals: 0 },
        changes: { overall: 0, lessons: 0, quizzes: 0, scenarios: 0, goals: 0 },
        chart: {
          labels: ['—', '—', '—', '—', '—'],
          lessons: [0, 0, 0, 0, 0],
          quizzes: [0, 0, 0, 0, 0],
          scenarios: [0, 0, 0, 0, 0],
          goals: [0, 0, 0, 0, 0]
        },
        insights: [{ tone: 'green', title: 'No classes assigned', text: 'Assign a class to this teacher to begin tracking progress.' }]
      });
    }

    const selectedClass = classes.find((item) => String(item.id) === requestedClassId) || classes[0];
    const flags = contentFlags(contentType.replace('All Content', 'All'));
    const { now, start, previousStart } = periodConfig(period);

    const studentsResult = await pool.query(
      `
        SELECT u.id, u.full_name, u.username, u.email, u.is_active, cm.joined_at
        FROM class_memberships cm
        INNER JOIN users u ON u.id = cm.user_id
        WHERE cm.class_id = $1
          AND cm.membership_role = 'student'
        ORDER BY u.full_name ASC NULLS LAST, u.username ASC NULLS LAST
      `,
      [selectedClass.id]
    );

    const studentsRows = studentsResult.rows;
    const studentIds = studentsRows.map((row) => Number(row.id));

    if (!studentIds.length) {
      return res.json({
        progressAvailable: false,
        classes,
        selectedClassId: Number(selectedClass.id),
        selectedClassName: selectedClass.name,
        students: [],
        summary: { overall: 0, lessons: 0, quizzes: 0, scenarios: 0, goals: 0 },
        changes: { overall: 0, lessons: 0, quizzes: 0, scenarios: 0, goals: 0 },
        chart: {
          labels: ['—', '—', '—', '—', '—'],
          lessons: [0, 0, 0, 0, 0],
          quizzes: [0, 0, 0, 0, 0],
          scenarios: [0, 0, 0, 0, 0],
          goals: [0, 0, 0, 0, 0]
        },
        insights: [{ tone: 'green', title: 'No students assigned', text: `${selectedClass.name} has no student memberships yet.` }]
      });
    }

    const studentArray = studentIds;
    const currentStart = start.toISOString();
    const previousStartIso = previousStart.toISOString();
    const nowIso = now.toISOString();

    const [lessonResult, quizResult, scenarioResult, goalResult] = await Promise.all([
      pool.query(
        `
          SELECT student_id, progress_percentage, last_accessed_at AS occurred_at
          FROM lesson_progress
          WHERE student_id = ANY($1::bigint[])
            AND last_accessed_at >= $2
            AND last_accessed_at <= $3
        `,
        [studentArray, previousStartIso, nowIso]
      ),
      pool.query(
        `
          SELECT
            student_id,
            CASE
              WHEN total_points IS NOT NULL AND total_points > 0 AND earned_points IS NOT NULL
                THEN LEAST(100, GREATEST(0, (earned_points::numeric / total_points::numeric) * 100))
              WHEN score IS NOT NULL AND score <= 1
                THEN LEAST(100, GREATEST(0, score::numeric * 100))
              ELSE LEAST(100, GREATEST(0, COALESCE(score, 0)::numeric))
            END AS value,
            COALESCE(completed_at, started_at) AS occurred_at
          FROM quiz_attempts
          WHERE student_id = ANY($1::bigint[])
            AND COALESCE(completed_at, started_at) >= $2
            AND COALESCE(completed_at, started_at) <= $3
        `,
        [studentArray, previousStartIso, nowIso]
      ),
      pool.query(
        `
          SELECT
            student_id,
            CASE WHEN completed = TRUE THEN 100 ELSE 0 END AS value,
            COALESCE(completed_at, started_at) AS occurred_at
          FROM scenario_attempts
          WHERE student_id = ANY($1::bigint[])
            AND COALESCE(completed_at, started_at) >= $2
            AND COALESCE(completed_at, started_at) <= $3
        `,
        [studentArray, previousStartIso, nowIso]
      ),
      pool.query(
        `
          SELECT
            student_id,
            CASE
              WHEN target_amount IS NULL OR target_amount <= 0 THEN 0
              ELSE LEAST(100, GREATEST(0, (current_amount::numeric / target_amount::numeric) * 100))
            END AS value,
            updated_at AS occurred_at
          FROM goals
          WHERE student_id = ANY($1::bigint[])
            AND updated_at >= $2
            AND updated_at <= $3
        `,
        [studentArray, previousStartIso, nowIso]
      )
    ]);

    const events = {
      lessons: lessonResult.rows.map((row) => ({ studentId: Number(row.student_id), value: clamp(row.progress_percentage), at: row.occurred_at })),
      quizzes: quizResult.rows.map((row) => ({ studentId: Number(row.student_id), value: clamp(row.value), at: row.occurred_at })),
      scenarios: scenarioResult.rows.map((row) => ({ studentId: Number(row.student_id), value: clamp(row.value), at: row.occurred_at })),
      goals: goalResult.rows.map((row) => ({ studentId: Number(row.student_id), value: clamp(row.value), at: row.occurred_at }))
    };

    const currentEvents = (key) => events[key].filter((event) => new Date(event.at).getTime() >= start.getTime());
    const previousEvents = (key) => events[key].filter((event) => new Date(event.at).getTime() >= previousStart.getTime() && new Date(event.at).getTime() < start.getTime());

    const selectedKeys = Object.keys(flags).filter((key) => flags[key]);

    const students = studentsRows.map((row, index) => {
      const values = {};
      const previousValues = {};
      let lastActivity = row.joined_at;

      for (const key of ['lessons', 'quizzes', 'scenarios', 'goals']) {
        const current = currentEvents(key).filter((event) => event.studentId === Number(row.id)).map((event) => event.value);
        const previous = previousEvents(key).filter((event) => event.studentId === Number(row.id)).map((event) => event.value);
        values[key] = flags[key] ? round(average(current)) : 0;
        previousValues[key] = flags[key] ? round(average(previous)) : 0;

        const latest = currentEvents(key)
          .filter((event) => event.studentId === Number(row.id))
          .sort((a, b) => new Date(b.at).getTime() - new Date(a.at).getTime())[0];
        if (latest && (!lastActivity || new Date(latest.at).getTime() > new Date(lastActivity).getTime())) {
          lastActivity = latest.at;
        }
      }

      values.overall = round(average(selectedKeys.map((key) => values[key])));
      previousValues.overall = round(average(selectedKeys.map((key) => previousValues[key])));

      return {
        id: Number(row.id),
        initials: initialsFor(row.full_name || row.username || row.email),
        name: row.full_name || row.username || row.email || `Student ${index + 1}`,
        lessons: values.lessons,
        quizzes: values.quizzes,
        scenarios: values.scenarios,
        goals: values.goals,
        overall: values.overall,
        previousOverall: previousValues.overall,
        activity: activityText(lastActivity),
        tone: ['green', 'blue', 'purple', 'orange'][index % 4],
        status: row.is_active === false ? 'Inactive' : 'Active'
      };
    });

    const summary = {
      lessons: round(average(students.map((student) => student.lessons))),
      quizzes: round(average(students.map((student) => student.quizzes))),
      scenarios: round(average(students.map((student) => student.scenarios))),
      goals: round(average(students.map((student) => student.goals)))
    };
    summary.overall = round(average(students.map((student) => student.overall)));

    const previousSummary = {
      lessons: round(average(students.map((student) => flags.lessons ? average(previousEvents('lessons').filter((event) => event.studentId === student.id).map((event) => event.value)) : 0))),
      quizzes: round(average(students.map((student) => flags.quizzes ? average(previousEvents('quizzes').filter((event) => event.studentId === student.id).map((event) => event.value)) : 0))),
      scenarios: round(average(students.map((student) => flags.scenarios ? average(previousEvents('scenarios').filter((event) => event.studentId === student.id).map((event) => event.value)) : 0))),
      goals: round(average(students.map((student) => flags.goals ? average(previousEvents('goals').filter((event) => event.studentId === student.id).map((event) => event.value)) : 0)))
    };
    previousSummary.overall = round(average(students.map((student) => selectedKeys.length ? average(selectedKeys.map((key) => {
      const vals = previousEvents(key).filter((event) => event.studentId === student.id).map((event) => event.value);
      return average(vals);
    })) : 0)));

    const changes = {
      lessons: summary.lessons - previousSummary.lessons,
      quizzes: summary.quizzes - previousSummary.quizzes,
      scenarios: summary.scenarios - previousSummary.scenarios,
      goals: summary.goals - previousSummary.goals,
      overall: summary.overall - previousSummary.overall
    };

    const chartLabels = buildTrend([], start, now).labels;
    const chart = { labels: chartLabels, lessons: [], quizzes: [], scenarios: [], goals: [] };

    for (const key of ['lessons', 'quizzes', 'scenarios', 'goals']) {
      const trend = buildTrend(flags[key] ? currentEvents(key) : [], start, now);
      chart[key] = trend.values;
    }

    const totalEvents = selectedKeys.reduce((sum, key) => sum + currentEvents(key).length, 0);
    const onTrack = students.filter((student) => student.overall >= 70).length;
    const needSupport = students.filter((student) => student.overall < 50).length;
    const strongest = selectedKeys
      .map((key) => ({ key, value: summary[key] }))
      .sort((a, b) => b.value - a.value)[0];

    const labelMap = {
      lessons: 'Lessons',
      quizzes: 'Quizzes',
      scenarios: 'Scenarios',
      goals: 'Goals'
    };

    return res.json({
      progressAvailable: totalEvents > 0,
      classes,
      selectedClassId: Number(selectedClass.id),
      selectedClassName: selectedClass.name,
      students,
      summary,
      changes,
      chart,
      insights: [
        {
          tone: 'green',
          title: `${onTrack} student${onTrack === 1 ? '' : 's'} on track`,
          text: `${onTrack} of ${students.length} students are at 70% overall or above.`
        },
        {
          tone: 'orange',
          title: `${needSupport} student${needSupport === 1 ? '' : 's'} need support`,
          text: `${needSupport} student${needSupport === 1 ? '' : 's'} are below 50% overall.`
        },
        {
          tone: 'purple',
          title: strongest ? `${labelMap[strongest.key]} is strongest` : 'No progress data yet',
          text: strongest ? `${labelMap[strongest.key]} averages ${strongest.value}%.` : 'Complete learning activities to start tracking progress.'
        }
      ]
    });
  } catch (error) {
    console.error('Teacher progress error:', error);
    return res.status(500).json({
      message: 'Unable to load teacher progress.',
      detail: process.env.NODE_ENV !== 'production' ? error.message : undefined
    });
  }
}

module.exports = { getTeacherProgress };
