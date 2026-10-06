const pool = require('../db/pool');

async function hasTable(tableName) {
  const result = await pool.query(
    `
      SELECT to_regclass($1) IS NOT NULL AS exists
    `,
    [`public.${tableName}`]
  );

  return Boolean(result.rows[0]?.exists);
}

async function hasColumn(tableName, columnName) {
  const result = await pool.query(
    `
      SELECT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_schema = 'public'
          AND table_name = $1
          AND column_name = $2
      ) AS exists
    `,
    [tableName, columnName]
  );

  return Boolean(result.rows[0]?.exists);
}

async function getTeacherClassQuery(teacherId, { includeMembers, includeProgress }) {
  const hasClassesTeacherId = await hasColumn('classes', 'teacher_id');
  const hasClassTeachers = await hasTable('class_teachers');
  const hasUsersSchoolId = await hasColumn('users', 'school_id');
  const hasClassesSchoolId = await hasColumn('classes', 'school_id');
  const hasClassMembers = await hasTable('class_members');
  const hasProgress = await hasTable('progress');

  if (
    !hasClassesTeacherId &&
    !hasClassTeachers &&
    !(hasUsersSchoolId && hasClassesSchoolId)
  ) {
    return {
      available: false,
      query: null,
      params: []
    };
  }

  const studentJoin = includeMembers && hasClassMembers
    ? `LEFT JOIN class_members cm ON cm.class_id = c.id`
    : '';

  const progressJoin =
    includeProgress && hasClassMembers && hasProgress
      ? `LEFT JOIN progress p ON p.user_id = cm.user_id`
      : '';

  const studentsSelect =
    includeMembers && hasClassMembers
      ? `COUNT(DISTINCT cm.user_id)::int AS students`
      : `0::int AS students`;

  const progressSelect =
    includeProgress && hasClassMembers && hasProgress
      ? `COALESCE(ROUND(AVG(p.completion_percent)::numeric, 0), 0)::int AS progress`
      : `0::int AS progress`;

  if (hasClassesTeacherId) {
    return {
      available: true,
      query: `
        SELECT
          c.id,
          c.name,
          ${studentsSelect},
          ${progressSelect}
        FROM classes c
        ${studentJoin}
        ${progressJoin}
        WHERE c.teacher_id = $1
        GROUP BY c.id, c.name
        ORDER BY c.id
        LIMIT 50
      `,
      params: [teacherId]
    };
  }

  if (hasClassTeachers) {
    return {
      available: true,
      query: `
        SELECT
          c.id,
          c.name,
          ${studentsSelect},
          ${progressSelect}
        FROM classes c
        INNER JOIN class_teachers ct ON ct.class_id = c.id
        ${studentJoin}
        ${progressJoin}
        WHERE ct.teacher_id = $1
        GROUP BY c.id, c.name
        ORDER BY c.id
        LIMIT 50
      `,
      params: [teacherId]
    };
  }

  // Current database fallback: teacher and classes share school_id.
  return {
    available: true,
    query: `
      SELECT
        c.id,
        c.name,
        ${studentsSelect},
        ${progressSelect}
      FROM classes c
      INNER JOIN users teacher_user
        ON teacher_user.id = $1
      ${studentJoin}
      ${progressJoin}
      WHERE c.school_id = teacher_user.school_id
      GROUP BY c.id, c.name
      ORDER BY c.id
      LIMIT 50
    `,
    params: [teacherId]
  };
}

async function getTeacherClassBaseCTE(teacherId) {
  const hasClassesTeacherId = await hasColumn('classes', 'teacher_id');
  const hasClassTeachers = await hasTable('class_teachers');
  const hasUsersSchoolId = await hasColumn('users', 'school_id');
  const hasClassesSchoolId = await hasColumn('classes', 'school_id');

  if (hasClassesTeacherId) {
    return {
      available: true,
      cte: `
        WITH teacher_classes AS (
          SELECT c.id, c.name
          FROM classes c
          WHERE c.teacher_id = $1
        )
      `,
      params: [teacherId]
    };
  }

  if (hasClassTeachers) {
    return {
      available: true,
      cte: `
        WITH teacher_classes AS (
          SELECT DISTINCT c.id, c.name
          FROM classes c
          INNER JOIN class_teachers ct ON ct.class_id = c.id
          WHERE ct.teacher_id = $1
        )
      `,
      params: [teacherId]
    };
  }

  if (hasUsersSchoolId && hasClassesSchoolId) {
    return {
      available: true,
      cte: `
        WITH teacher_classes AS (
          SELECT DISTINCT c.id, c.name
          FROM classes c
          INNER JOIN users teacher_user
            ON teacher_user.id = $1
          WHERE c.school_id = teacher_user.school_id
        )
      `,
      params: [teacherId]
    };
  }

  return {
    available: false,
    cte: '',
    params: []
  };
}

function numberOrZero(value) {
  const numeric = Number(value);
  return Number.isFinite(numeric) ? numeric : 0;
}

function activityLabel(activityType, studentName, className) {
  const type = String(activityType || '').toLowerCase();

  if (type.includes('lesson') || type.includes('complete')) {
    return `${studentName || 'A student'} completed a learning activity${className ? ` in ${className}` : ''}`;
  }

  if (type.includes('quiz')) {
    return `${studentName || 'A student'} completed a quiz${className ? ` in ${className}` : ''}`;
  }

  if (type.includes('scenario')) {
    return `${studentName || 'A student'} completed a scenario${className ? ` in ${className}` : ''}`;
  }

  return `${studentName || 'A student'} had recent learning activity${className ? ` in ${className}` : ''}`;
}

const getTeacherDashboard = async (req, res) => {
  try {
    const teacherId = Number(req.user.id);

    const userResult = await pool.query(
      `
        SELECT
          id,
          role,
          full_name,
          username,
          email
        FROM users
        WHERE id = $1
        LIMIT 1
      `,
      [teacherId]
    );

    const user = userResult.rows[0];

    if (!user) {
      return res.status(404).json({
        message: 'Teacher account not found.'
      });
    }

    const classesMeta = await getTeacherClassQuery(teacherId, {
      includeMembers: true,
      includeProgress: true
    });

    let classes = [];
    let classIds = [];

    if (classesMeta.available) {
      const result = await pool.query(classesMeta.query, classesMeta.params);

      classes = result.rows.map((row) => ({
        id: Number(row.id),
        name: row.name,
        students: Number(row.students || 0),
        progress: numberOrZero(row.progress)
      }));

      classIds = classes.map((item) => item.id);
    }

    const classMembersExists = await hasTable('class_members');
    const progressExists = await hasTable('progress');

    let totalStudents = 0;
    let averageCompletion = 0;
    let breakdown = {
      lessons: 0,
      quizzes: 0,
      scenarios: 0,
      goals: 0
    };

    if (classesMeta.available && classMembersExists) {
      const base = await getTeacherClassBaseCTE(teacherId);

      if (base.available) {
        const totalStudentsResult = await pool.query(
          `
            ${base.cte}
            SELECT COUNT(DISTINCT cm.user_id)::int AS total_students
            FROM class_members cm
            INNER JOIN teacher_classes tc ON tc.id = cm.class_id
          `,
          base.params
        );

        totalStudents = Number(totalStudentsResult.rows[0]?.total_students || 0);

        if (progressExists) {
          const progressResult = await pool.query(
            `
              ${base.cte}
              SELECT
                COALESCE(ROUND(AVG(p.completion_percent)::numeric, 0), 0)::int AS average_completion
              FROM progress p
              INNER JOIN class_members cm ON cm.user_id = p.user_id
              INNER JOIN teacher_classes tc ON tc.id = cm.class_id
            `,
            base.params
          );

          averageCompletion = Number(
            progressResult.rows[0]?.average_completion || 0
          );
        }
      }
    }

    const contentItemsExists = await hasTable('content_items');

    if (classesMeta.available && classMembersExists && progressExists && contentItemsExists) {
      const base = await getTeacherClassBaseCTE(teacherId);

      if (base.available) {
        const breakdownResult = await pool.query(
          `
            ${base.cte}
            SELECT
              LOWER(COALESCE(ci.content_type, '')) AS content_type,
              COALESCE(ROUND(AVG(p.completion_percent)::numeric, 0), 0)::int AS average_progress
            FROM progress p
            INNER JOIN class_members cm ON cm.user_id = p.user_id
            INNER JOIN teacher_classes tc ON tc.id = cm.class_id
            INNER JOIN content_items ci ON ci.id = p.content_item_id
            GROUP BY LOWER(COALESCE(ci.content_type, ''))
          `,
          base.params
        );

        for (const row of breakdownResult.rows) {
          const type = String(row.content_type || '').toLowerCase();
          const value = Number(row.average_progress || 0);

          if (type.includes('lesson')) breakdown.lessons = value;
          else if (type.includes('quiz')) breakdown.quizzes = value;
          else if (type.includes('scenario')) breakdown.scenarios = value;
        }
      }
    }

    const goalsExists = await hasTable('goals');

    if (goalsExists && classesMeta.available && classMembersExists) {
      const base = await getTeacherClassBaseCTE(teacherId);

      if (base.available) {
        const goalsResult = await pool.query(
          `
            ${base.cte}
            SELECT
              COALESCE(
                ROUND(
                  AVG(
                    CASE
                      WHEN COALESCE(g.target_value, 0) > 0
                        THEN LEAST((COALESCE(g.current_value, 0) / g.target_value) * 100, 100)
                      ELSE 0
                    END
                  )::numeric,
                  0
                ),
                0
              )::int AS goal_progress
            FROM goals g
            INNER JOIN class_members cm ON cm.user_id = g.user_id
            INNER JOIN teacher_classes tc ON tc.id = cm.class_id
          `,
          base.params
        );

        breakdown.goals = Number(goalsResult.rows[0]?.goal_progress || 0);
      }
    }

    const assignmentsExists = await hasTable('assignments');
    const assignmentItemsExists = await hasTable('assignment_items');
    let assignedContent = 0;

    if (assignmentsExists) {
      if (assignmentItemsExists) {
        const assignedResult = await pool.query(
          `
            SELECT COUNT(DISTINCT ai.content_item_id)::int AS assigned_content
            FROM assignment_items ai
            INNER JOIN assignments a ON a.id = ai.assignment_id
            WHERE a.teacher_id = $1
          `,
          [teacherId]
        );

        assignedContent = Number(
          assignedResult.rows[0]?.assigned_content || 0
        );
      } else {
        const assignedResult = await pool.query(
          `
            SELECT COUNT(*)::int AS assigned_content
            FROM assignments
            WHERE teacher_id = $1
          `,
          [teacherId]
        );

        assignedContent = Number(
          assignedResult.rows[0]?.assigned_content || 0
        );
      }
    }

    let recentActivity = [];

    const studentActivityExists = await hasTable('student_activity');
    const usersExists = await hasTable('users');

    if (
      studentActivityExists &&
      classMembersExists &&
      usersExists &&
      classesMeta.available
    ) {
      const base = await getTeacherClassBaseCTE(teacherId);

      if (base.available) {
        const activityResult = await pool.query(
          `
            ${base.cte}
            SELECT
              sa.activity_type,
              sa.created_at,
              u.full_name,
              tc.name AS class_name
            FROM student_activity sa
            INNER JOIN class_members cm ON cm.user_id = sa.user_id
            INNER JOIN teacher_classes tc ON tc.id = cm.class_id
            INNER JOIN users u ON u.id = sa.user_id
            ORDER BY sa.created_at DESC
            LIMIT 4
          `,
          base.params
        );

        recentActivity = activityResult.rows.map((row) => ({
          type: String(row.activity_type || 'activity'),
          text: activityLabel(row.activity_type, row.full_name, row.class_name),
          time: row.created_at
            ? new Date(row.created_at).toLocaleString()
            : ''
        }));
      }
    }

    if (recentActivity.length === 0 && assignmentsExists) {
      const assignmentsResult = await pool.query(
        `
          SELECT
            a.title,
            a.created_at,
            c.name AS class_name
          FROM assignments a
          INNER JOIN classes c ON c.id = a.class_id
          WHERE a.teacher_id = $1
          ORDER BY a.created_at DESC
          LIMIT 4
        `,
        [teacherId]
      );

      recentActivity = assignmentsResult.rows.map((row) => ({
        type: 'assignment',
        text: `You assigned "${row.title}"${row.class_name ? ` to ${row.class_name}` : ''}`,
        time: row.created_at
          ? new Date(row.created_at).toLocaleString()
          : ''
      }));
    }

    return res.json({
      user: {
        id: Number(user.id),
        role: user.role,
        fullName: user.full_name,
        username: user.username,
        email: user.email
      },
      stats: {
        classes: classes.length,
        totalStudents,
        assignedContent,
        averageCompletion
      },
      classes,
      progress: breakdown,
      recentActivity,
      classIds
    });
  } catch (error) {
    console.error('Teacher dashboard error:', error);

    return res.status(500).json({
      message: 'Unable to load teacher dashboard.'
    });
  }
};

module.exports = {
  getTeacherDashboard
};
