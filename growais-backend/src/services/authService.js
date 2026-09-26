const bcrypt = require('bcrypt');
const crypto = require('crypto');
const pool = require('../db/pool');

const hashSessionToken = (token) => {
  return crypto
    .createHash('sha256')
    .update(token)
    .digest('hex');
};

const registerUser = async ({
  role,
  username,
  email,
  password,
  fullName
}) => {
  if (!role || !username || !password || !fullName) {
    const error = new Error(
      'Role, username, password, and full name are required'
    );
    error.statusCode = 400;
    throw error;
  }

  if (!['student', 'teacher'].includes(role)) {
    const error = new Error('Invalid registration role');
    error.statusCode = 400;
    throw error;
  }

  const existingUser = await pool.query(
    `
    SELECT id
    FROM users
    WHERE username = $1
       OR ($2::text IS NOT NULL AND email = $2)
    `,
    [username, email || null]
  );

  if (existingUser.rows.length > 0) {
    const error = new Error('Username or email already exists');
    error.statusCode = 409;
    throw error;
  }

  const passwordHash = await bcrypt.hash(password, 12);

  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    const result = await client.query(
      `
      INSERT INTO users (
        role,
        username,
        email,
        password_hash,
        full_name
      )
      VALUES ($1, $2, $3, $4, $5)
      RETURNING
        id,
        role,
        username,
        email,
        full_name,
        is_active,
        is_email_verified,
        created_at
      `,
      [
        role,
        username,
        email || null,
        passwordHash,
        fullName
      ]
    );

    const user = result.rows[0];

    if (role === 'student') {
      await client.query(
        `
        INSERT INTO student_profiles (user_id)
        VALUES ($1)
        `,
        [user.id]
      );

      await client.query(
        `
        INSERT INTO student_progress (student_id)
        VALUES ($1)
        `,
        [user.id]
      );
    }

    if (role === 'teacher') {
      await client.query(
        `
        INSERT INTO teacher_profiles (user_id)
        VALUES ($1)
        `,
        [user.id]
      );
    }

    await client.query('COMMIT');

    return user;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
};


const loginUser = async ({ login, password }) => {
  if (!login || !password) {
    const error = new Error('Username/email and password are required');
    error.statusCode = 400;
    throw error;
  }

  const result = await pool.query(
    `
    SELECT
      id,
      role,
      username,
      email,
      full_name,
      password_hash,
      is_active,
      is_email_verified
    FROM users
    WHERE username = $1
       OR email = $1
    LIMIT 1
    `,
    [login]
  );

  if (result.rows.length === 0) {
    const error = new Error('Invalid username/email or password');
    error.statusCode = 401;
    throw error;
  }

  const user = result.rows[0];

  if (!user.is_active) {
    const error = new Error('This account is inactive');
    error.statusCode = 403;
    throw error;
  }

  const passwordMatches = await bcrypt.compare(
    password,
    user.password_hash
  );

  if (!passwordMatches) {
    const error = new Error('Invalid username/email or password');
    error.statusCode = 401;
    throw error;
  }

  const sessionToken = crypto.randomBytes(32).toString('hex');
  const tokenHash = hashSessionToken(sessionToken);

  await pool.query(
    `
    INSERT INTO sessions (
      user_id,
      token_hash,
      expires_at
    )
    VALUES (
      $1,
      $2,
      NOW() + INTERVAL '7 days'
    )
    `,
    [user.id, tokenHash]
  );

  await pool.query(
    `
    UPDATE users
    SET last_login_at = NOW(),
        updated_at = NOW()
    WHERE id = $1
    `,
    [user.id]
  );

  delete user.password_hash;

  return {
    user,
    sessionToken
  };
};


const getUserFromSession = async (sessionToken) => {
  if (!sessionToken) {
    return null;
  }

  const tokenHash = hashSessionToken(sessionToken);

  const result = await pool.query(
    `
    SELECT
      u.id,
      u.role,
      u.username,
      u.email,
      u.full_name,
      u.is_active,
      u.is_email_verified
    FROM sessions s
    JOIN users u ON u.id = s.user_id
    WHERE s.token_hash = $1
      AND s.expires_at > NOW()
    LIMIT 1
    `,
    [tokenHash]
  );

  return result.rows[0] || null;
};


const logoutUser = async (sessionToken) => {
  if (!sessionToken) {
    return;
  }

  const tokenHash = hashSessionToken(sessionToken);

  await pool.query(
    `
    DELETE FROM sessions
    WHERE token_hash = $1
    `,
    [tokenHash]
  );
};


module.exports = {
  registerUser,
  loginUser,
  getUserFromSession,
  logoutUser
};