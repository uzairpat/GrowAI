const pool = require('../db/pool');

const CLASS_IMAGES = [
  '/assets/teachers/class-1a-books.png',
  '/assets/teachers/class-2b-globe.png',
  '/assets/teachers/class-3a-calculator.png',
  '/assets/teachers/class-4b-lightbulb.png'
];

const CONTENT_IMAGES = {
  lessons: [
    '/assets/teachers/assign-content-coins.png',
    '/assets/teachers/assign-content-piggy-bank.png',
    '/assets/teachers/assign-content-credit-card.png',
    '/assets/teachers/assign-content-safety-shield.png',
    '/assets/teachers/assign-content-investment-chart.png',
    '/assets/teachers/assign-content-money-house.png'
  ],
  quizzes: [
    '/assets/teachers/assign-content-coins.png',
    '/assets/teachers/assign-content-piggy-bank.png',
    '/assets/teachers/assign-content-credit-card.png',
    '/assets/teachers/assign-content-safety-shield.png',
    '/assets/teachers/assign-content-investment-chart.png',
    '/assets/teachers/assign-content-money-house.png'
  ],
  scenarios: [
    '/assets/teachers/assign-content-coins.png',
    '/assets/teachers/assign-content-piggy-bank.png',
    '/assets/teachers/assign-content-credit-card.png',
    '/assets/teachers/assign-content-safety-shield.png',
    '/assets/teachers/assign-content-investment-chart.png',
    '/assets/teachers/assign-content-money-house.png'
  ]
};

function contentImage(type, index) {
  return CONTENT_IMAGES[type][index % CONTENT_IMAGES[type].length];
}

function contentModule(index) {
  return `Module ${index + 1}`;
}

async function getTeacherAssignContent(req, res) {
  try {
    const teacherId = Number(req.user.id);

    const classResult = await pool.query(
      `
        SELECT DISTINCT
          c.id,
          c.name,
          COUNT(DISTINCT student_cm.user_id)::int AS students
        FROM class_memberships teacher_cm
        INNER JOIN classes c
          ON c.id = teacher_cm.class_id
        LEFT JOIN class_memberships student_cm
          ON student_cm.class_id = c.id
         AND student_cm.membership_role = 'student'
        WHERE teacher_cm.user_id = $1
          AND teacher_cm.membership_role = 'teacher'
        GROUP BY c.id, c.name
        ORDER BY c.id
      `,
      [teacherId]
    );

    const lessonResult = await pool.query(
      `
        SELECT id, title, description
        FROM lessons
        ORDER BY id
      `
    );

    const quizResult = await pool.query(
      `
        SELECT id, title, description
        FROM quizzes
        ORDER BY id
      `
    );

    const scenarioResult = await pool.query(
      `
        SELECT id, title, description
        FROM scenarios
        ORDER BY id
      `
    );

    const classes = classResult.rows.map((row, index) => ({
      id: String(row.id),
      name: row.name,
      students: Number(row.students || 0),
      image: CLASS_IMAGES[index % CLASS_IMAGES.length]
    }));

    const mapContent = (rows, type) =>
      rows.map((row, index) => ({
        id: String(row.id),
        title: row.title,
        description: row.description || '',
        module: contentModule(index),
        image: contentImage(type, index)
      }));

    return res.json({
      classes,
      lessons: mapContent(lessonResult.rows, 'lessons'),
      quizzes: mapContent(quizResult.rows, 'quizzes'),
      scenarios: mapContent(scenarioResult.rows, 'scenarios')
    });
  } catch (error) {
    console.error('Teacher assign content load error:', error);
    return res.status(500).json({
      message: 'Unable to load classes and learning content.',
      detail: process.env.NODE_ENV !== 'production' ? error.message : undefined
    });
  }
}

async function postTeacherAssignContent(req, res) {
  const client = await pool.connect();

  try {
    const teacherId = Number(req.user.id);
    const classId = Number(req.body.classId);
    const contentType = String(req.body.contentType || '');
    const contentIds = Array.isArray(req.body.contentIds)
      ? [...new Set(req.body.contentIds.map(Number).filter((id) => Number.isInteger(id) && id > 0))]
      : [];
    const dueDate = req.body.dueDate || null;
    const sendNotification = Boolean(req.body.sendNotification);

    if (!Number.isInteger(classId) || classId <= 0) {
      return res.status(400).json({ message: 'A valid class is required.' });
    }

    if (!['lessons', 'quizzes', 'scenarios'].includes(contentType)) {
      return res.status(400).json({ message: 'Invalid content type.' });
    }

    if (!contentIds.length) {
      return res.status(400).json({ message: 'Select at least one content item.' });
    }

    if (dueDate && Number.isNaN(new Date(dueDate).getTime())) {
      return res.status(400).json({ message: 'Enter a valid due date.' });
    }

    const teacherClass = await client.query(
      `
        SELECT c.id, c.name
        FROM class_memberships cm
        INNER JOIN classes c ON c.id = cm.class_id
        WHERE cm.class_id = $1
          AND cm.user_id = $2
          AND cm.membership_role = 'teacher'
        LIMIT 1
      `,
      [classId, teacherId]
    );

    if (!teacherClass.rowCount) {
      return res.status(403).json({
        message: 'You are not assigned to this class.'
      });
    }

    const column =
      contentType === 'lessons'
        ? 'lesson_id'
        : contentType === 'quizzes'
          ? 'quiz_id'
          : 'scenario_id';

    const sourceTable =
      contentType === 'lessons'
        ? 'lessons'
        : contentType === 'quizzes'
          ? 'quizzes'
          : 'scenarios';

    await client.query('BEGIN');

    const contentCheck = await client.query(
      `SELECT id FROM ${sourceTable} WHERE id = ANY($1::bigint[])`,
      [contentIds]
    );

    const validIds = contentCheck.rows.map((row) => Number(row.id));

    if (validIds.length !== contentIds.length) {
      await client.query('ROLLBACK');
      return res.status(400).json({
        message: 'One or more selected content items no longer exist.'
      });
    }

    const duplicateResult = await client.query(
      `
        SELECT ${column} AS content_id
        FROM teacher_assignments
        WHERE teacher_id = $1
          AND class_id = $2
          AND ${column} = ANY($3::bigint[])
      `,
      [teacherId, classId, contentIds]
    );

    if (duplicateResult.rowCount) {
      await client.query('ROLLBACK');
      return res.status(409).json({
        message: 'One or more selected items are already assigned to this class.'
      });
    }

    const inserted = [];

    for (const contentId of contentIds) {
      const result = await client.query(
        `
          INSERT INTO teacher_assignments (
            teacher_id,
            class_id,
            ${column},
            due_date
          )
          VALUES ($1, $2, $3, $4)
          RETURNING id, teacher_id, class_id, ${column}, due_date, assigned_at
        `,
        [teacherId, classId, contentId, dueDate]
      );

      inserted.push(result.rows[0]);
    }

    let notificationCount = 0;

    if (sendNotification) {
      const tableCheck = await client.query(
        `SELECT to_regclass('public.notifications') AS table_name`
      );

      if (tableCheck.rows[0]?.table_name) {
        const students = await client.query(
          `
            SELECT DISTINCT user_id
            FROM class_memberships
            WHERE class_id = $1
              AND membership_role = 'student'
          `,
          [classId]
        );

        for (const student of students.rows) {
          await client.query(
            `
              INSERT INTO notifications (
                user_id,
                notification_type,
                title,
                message
              )
              VALUES ($1, $2, $3, $4)
            `,
            [
              student.user_id,
              'assignment',
              'New content assigned',
              `New ${contentType} content has been assigned to your class.`
            ]
          );
          notificationCount += 1;
        }
      }
    }

    await client.query('COMMIT');

    return res.status(201).json({
      message: 'Content assigned successfully.',
      class: {
        id: classId,
        name: teacherClass.rows[0].name
      },
      contentType,
      assignedCount: inserted.length,
      notificationCount,
      limitations: {
        instructionsStored: false,
        makeVisibleStored: false
      }
    });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Teacher assign content error:', error);

    return res.status(500).json({
      message: 'Unable to assign content.',
      detail: process.env.NODE_ENV !== 'production' ? error.message : undefined
    });
  } finally {
    client.release();
  }
}

module.exports = {
  getTeacherAssignContent,
  postTeacherAssignContent
};
