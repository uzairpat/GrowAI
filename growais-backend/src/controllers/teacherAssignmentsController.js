const pool = require('../db/pool');

const createTeacherAssignment = async (req, res) => {
  try {
    const teacherId = Number(req.user.id);

    const {
      classId,
      lessonId,
      quizId,
      scenarioId,
      dueDate,
    } = req.body || {};

    const parsedClassId = Number(classId);
    const contentIds = [
      lessonId ? Number(lessonId) : null,
      quizId ? Number(quizId) : null,
      scenarioId ? Number(scenarioId) : null,
    ].filter((value) => Number.isInteger(value) && value > 0);

    if (!Number.isInteger(parsedClassId) || parsedClassId <= 0) {
      return res.status(400).json({
        message: 'A valid class is required.',
      });
    }

    if (contentIds.length !== 1) {
      return res.status(400).json({
        message: 'Select exactly one lesson, quiz, or scenario.',
      });
    }

    const teacherClassCheck = await pool.query(
      `
        SELECT 1
        FROM class_memberships
        WHERE class_id = $1
          AND user_id = $2
          AND membership_role = 'teacher'
        LIMIT 1
      `,
      [parsedClassId, teacherId]
    );

    if (teacherClassCheck.rowCount === 0) {
      return res.status(403).json({
        message: 'You are not authorized to assign content to this class.',
      });
    }

    const contentId = contentIds[0];

    let column = null;
    let table = null;

    if (lessonId) {
      column = 'lesson_id';
      table = 'lessons';
    } else if (quizId) {
      column = 'quiz_id';
      table = 'quizzes';
    } else {
      column = 'scenario_id';
      table = 'scenarios';
    }

    const contentCheck = await pool.query(
      `SELECT id FROM ${table} WHERE id = $1 LIMIT 1`,
      [contentId]
    );

    if (contentCheck.rowCount === 0) {
      return res.status(404).json({
        message: 'Selected content was not found.',
      });
    }

    const duplicateCheck = await pool.query(
      `
        SELECT id
        FROM teacher_assignments
        WHERE teacher_id = $1
          AND class_id = $2
          AND ${column} = $3
        LIMIT 1
      `,
      [teacherId, parsedClassId, contentId]
    );

    if (duplicateCheck.rowCount > 0) {
      return res.status(409).json({
        message: 'This content is already assigned to this class.',
      });
    }

    const result = await pool.query(
      `
        INSERT INTO teacher_assignments (
          teacher_id,
          class_id,
          lesson_id,
          quiz_id,
          scenario_id,
          due_date
        )
        VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING *
      `,
      [
        teacherId,
        parsedClassId,
        lessonId ? Number(lessonId) : null,
        quizId ? Number(quizId) : null,
        scenarioId ? Number(scenarioId) : null,
        dueDate || null,
      ]
    );

    return res.status(201).json({
      message: 'Content assigned successfully.',
      assignment: result.rows[0],
    });
  } catch (error) {
    console.error('Teacher assign content error:', error);

    return res.status(500).json({
      message: 'Unable to assign content.',
      detail:
        process.env.NODE_ENV !== 'production'
          ? error.message
          : undefined,
    });
  }
};

module.exports = {
  createTeacherAssignment,
};