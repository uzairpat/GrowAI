const pool = require('../db/pool');

const getTeacherClasses = async (req, res) => {
  try {
    const teacherId = Number(req.user.id);

    if (!Number.isInteger(teacherId) || teacherId <= 0) {
      return res.status(401).json({
        message: 'Invalid teacher session.'
      });
    }

    /*
      EXACT LIVE DATABASE SCHEMA CONFIRMED FROM:
      GET /api/teacher/classes

      classes:
        id, school_id, name, class_code, description,
        academic_year, is_active, created_at, updated_at

      school_memberships:
        id, school_id, user_id, membership_role, joined_at

      class_memberships:
        id, class_id, user_id, membership_role, joined_at

      student_profiles:
        id, user_id, date_of_birth, grade_level, avatar_url,
        total_points, created_at, updated_at

      There is NO progress table in the live schema, so this controller
      intentionally does not query progress.
    */

    // First: classes where the logged-in teacher is a class member.
    // We use the membership row itself as the teacher -> class link.
    const directResult = await pool.query(
      `
        SELECT
          c.id,
          c.name,
          c.school_id,
          c.is_active,
          c.created_at,
          c.updated_at,

          (
            SELECT COUNT(DISTINCT cm_student.user_id)::int
            FROM class_memberships cm_student
            WHERE cm_student.class_id = c.id
              AND cm_student.user_id <> $1
          ) AS students

        FROM class_memberships cm_teacher

        INNER JOIN classes c
          ON c.id = cm_teacher.class_id

        WHERE cm_teacher.user_id = $1

        GROUP BY
          c.id,
          c.name,
          c.school_id,
          c.is_active,
          c.created_at,
          c.updated_at

        ORDER BY
          COALESCE(c.updated_at, c.created_at) DESC NULLS LAST,
          c.name ASC
      `,
      [teacherId]
    );

    if (directResult.rows.length > 0) {
      return res.json({
        relationship: 'class_memberships',
        classes: directResult.rows.map((row) => ({
          id: row.id,
          name: row.name,
          students: Number(row.students || 0),

          // The live schema has no progress table/field.
          // Return 0 rather than querying a table that does not exist.
          progress: 0,

          status: row.is_active === false ? 'Archived' : 'Active',

          lastActivity:
            row.updated_at || row.created_at
              ? new Date(row.updated_at || row.created_at).toLocaleString()
              : 'No activity yet'
        }))
      });
    }

    // Fallback: teacher belongs to a school, so expose the school's classes.
    const schoolResult = await pool.query(
      `
        SELECT
          sm.school_id
        FROM school_memberships sm
        WHERE sm.user_id = $1
        ORDER BY sm.joined_at DESC NULLS LAST
        LIMIT 1
      `,
      [teacherId]
    );

    const schoolId = schoolResult.rows[0]?.school_id;

    if (schoolId == null) {
      return res.json({
        relationship: 'none',
        classes: []
      });
    }

    const schoolClasses = await pool.query(
      `
        SELECT
          c.id,
          c.name,
          c.school_id,
          c.is_active,
          c.created_at,
          c.updated_at,

          (
            SELECT COUNT(DISTINCT cm_student.user_id)::int
            FROM class_memberships cm_student
            WHERE cm_student.class_id = c.id
          ) AS students

        FROM classes c

        WHERE c.school_id = $1

        ORDER BY
          COALESCE(c.updated_at, c.created_at) DESC NULLS LAST,
          c.name ASC
      `,
      [schoolId]
    );

    return res.json({
      relationship: 'school_memberships + classes.school_id',
      classes: schoolClasses.rows.map((row) => ({
        id: row.id,
        name: row.name,
        students: Number(row.students || 0),
        progress: 0,
        status: row.is_active === false ? 'Archived' : 'Active',
        lastActivity:
          row.updated_at || row.created_at
            ? new Date(row.updated_at || row.created_at).toLocaleString()
            : 'No activity yet'
      }))
    });
  } catch (error) {
    console.error('Teacher classes live-schema error:', error);

    return res.status(500).json({
      message: 'Unable to load teacher classes.',
      detail: error.message
    });
  }
};

module.exports = {
  getTeacherClasses
};
