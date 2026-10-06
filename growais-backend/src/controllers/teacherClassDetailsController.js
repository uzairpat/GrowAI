const pool = require('../db/pool');

const CLASS_IMAGE_BY_NAME = {
  'Class 1A': '/assets/teachers/class-1a-books.png',
  'Class 2B': '/assets/teachers/class-2b-globe.png',
  'Class 3A': '/assets/teachers/class-3a-calculator.png',
  'Class 4B': '/assets/teachers/class-4b-lightbulb.png'
};

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
  if (!value) return 'Joined recently';

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'Joined recently';

  const hours = Math.floor(
    (Date.now() - date.getTime()) / (1000 * 60 * 60)
  );

  if (hours < 1) return 'Just now';
  if (hours < 24) return `${hours} hour${hours === 1 ? '' : 's'} ago`;

  const days = Math.floor(hours / 24);

  if (days === 1) return 'Yesterday';
  if (days < 7) return `${days} days ago`;

  return date.toLocaleDateString();
}

const getTeacherClassDetails = async (req, res) => {
  try {
    const teacherId = Number(req.user.id);
    const classId = String(req.params.classId || '');

    if (!Number.isInteger(teacherId) || teacherId <= 0) {
      return res.status(401).json({
        message: 'Invalid teacher session.'
      });
    }

    if (!classId) {
      return res.status(400).json({
        message: 'Class ID is required.'
      });
    }

    // Confirmed live schema:
    // classes(id, school_id, name, description, academic_year,
    //         is_active, created_at, updated_at)
    // class_memberships(id, class_id, user_id, membership_role, joined_at)
    // school_memberships(id, school_id, user_id, membership_role, joined_at)
    // users(id, role, username, email, full_name, is_active, ...)
    // student_profiles(id, user_id, grade_level, avatar_url, total_points, ...)

    // First try direct teacher -> class membership.
    let classResult = await pool.query(
      `
        SELECT
          c.id,
          c.name,
          c.school_id,
          c.description,
          c.academic_year,
          c.is_active,
          c.created_at,
          c.updated_at
        FROM classes c
        INNER JOIN class_memberships teacher_membership
          ON teacher_membership.class_id = c.id
         AND teacher_membership.user_id = $1
        WHERE c.id::text = $2
        LIMIT 1
      `,
      [teacherId, classId]
    );

    // Fallback to school membership.
    if (classResult.rows.length === 0) {
      classResult = await pool.query(
        `
          SELECT
            c.id,
            c.name,
            c.school_id,
            c.description,
            c.academic_year,
            c.is_active,
            c.created_at,
            c.updated_at
          FROM classes c
          INNER JOIN school_memberships sm
            ON sm.school_id = c.school_id
           AND sm.user_id = $1
          WHERE c.id::text = $2
          LIMIT 1
        `,
        [teacherId, classId]
      );
    }

    if (classResult.rows.length === 0) {
      return res.status(404).json({
        message: 'Class not found or you do not have access to this class.'
      });
    }

    const classRow = classResult.rows[0];

    const studentsResult = await pool.query(
      `
        SELECT
          u.id,
          u.full_name,
          u.username,
          u.email,
          u.is_active,
          cm.joined_at,
          sp.grade_level,
          sp.avatar_url,
          sp.total_points
        FROM class_memberships cm
        INNER JOIN users u
          ON u.id = cm.user_id
        LEFT JOIN student_profiles sp
          ON sp.user_id = u.id
        WHERE cm.class_id = $1
          AND cm.user_id <> $2
          AND cm.membership_role = 'student'
        ORDER BY
          u.full_name ASC NULLS LAST,
          u.username ASC NULLS LAST
      `,
      [classRow.id, teacherId]
    );

    const students = studentsResult.rows.map((row, index) => ({
      id: Number(row.id),
      initials: initialsFor(row.full_name || row.username || row.email),
      name:
        row.full_name ||
        row.username ||
        row.email ||
        `Student ${index + 1}`,

      // No progress source exists in the confirmed live schema.
      progress: 0,

      activity: activityText(row.joined_at),

      tone: ['green', 'blue', 'purple', 'orange'][index % 4],

      status: row.is_active === false ? 'Inactive' : 'Active'
    }));

    return res.json({
      class: {
        id: classRow.id,
        name: classRow.name,
        students: students.length,
        academicYear: classRow.academic_year || '—',
        progress: 0,
        lessonCompletion: 0,
        quizAverage: 0,
        scenarioCompletion: 0,
        description:
          classRow.description ||
          'This class is learning real-life financial skills together.',
        createdOn: classRow.created_at
          ? new Date(classRow.created_at).toLocaleDateString(undefined, {
              day: '2-digit',
              month: 'short',
              year: 'numeric'
            })
          : '—',
        status: classRow.is_active === false ? 'Archived' : 'Active',
        image:
          CLASS_IMAGE_BY_NAME[classRow.name] ||
          '/assets/teachers/class-1a-books.png'
      },
      students
    });
  } catch (error) {
    console.error('Teacher class details error:', error);

    return res.status(500).json({
      message: 'Unable to load class details.',
      detail:
        process.env.NODE_ENV !== 'production'
          ? error.message
          : undefined
    });
  }
};

module.exports = {
  getTeacherClassDetails
};
