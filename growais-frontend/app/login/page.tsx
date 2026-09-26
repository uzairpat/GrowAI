'use client';

import Link from 'next/link';
import { useState } from 'react';
import { apiFetch } from '../../lib/api';

export default function Page() {
  const [role, setRole] = useState('student');

  const [schoolCode, setSchoolCode] = useState('');
  const [login, setLogin] = useState('');
  const [password, setPassword] = useState('');

  const [rememberMe, setRememberMe] = useState(false);

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    setError('');

    if (!login || !password) {
      setError('Please enter your username/email and password.');
      return;
    }

    setLoading(true);

    try {
      const data = await apiFetch('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({
          login,
          password
        })
      });

      // Redirect based on the role returned by the backend.
      // The frontend does NOT decide the user's actual role.
      if (data.user.role === 'student') {
        window.location.href = '/student/dashboard';
      } else if (data.user.role === 'teacher') {
        window.location.href = '/teacher/dashboard';
      } else if (data.user.role === 'school_admin') {
        window.location.href = '/admin/dashboard';
      } else if (data.user.role === 'platform_admin') {
        window.location.href = '/admin/dashboard';
      } else {
        setError('Your account role is not supported.');
      }
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : 'Login failed. Please check your details.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="auth-page">

      <div className="auth-grid">

        {/* LEFT SIDE */}
        <section className="auth-copy">

          <p className="eyebrow">
            WELCOME TO GROWAIS
          </p>

          <h1>
            Learn Money Skills.
            <br />
            <span>Build a Brighter Future.</span>
          </h1>

          <p className="lead">
            An interactive financial learning platform for secondary school
            students, with tools for teachers to support and track progress.
          </p>

          <div className="mini-grid">

            <div>
              📖
              <b>Learn</b>
              <small>
                Understand key money concepts
              </small>
            </div>

            <div>
              📊
              <b>Practise</b>
              <small>
                Apply knowledge in real-life scenarios
              </small>
            </div>

            <div>
              🏆
              <b>Improve</b>
              <small>
                Build better financial habits
              </small>
            </div>

          </div>

        </section>


        {/* LOGIN CARD */}
        <section className="auth-card">

          <p className="eyebrow center">
            WELCOME BACK!
          </p>

          <h2>
            Sign in to continue your learning journey.
          </h2>


          {/* ROLE SELECTION */}
          <div className="role-tabs">

            <button
              type="button"
              className={role === 'student' ? 'active' : ''}
              onClick={() => setRole('student')}
            >
              🎓 Student
            </button>

            <button
              type="button"
              className={role === 'teacher' ? 'active' : ''}
              onClick={() => setRole('teacher')}
            >
              👤 Teacher / School Admin
            </button>

          </div>


          {/* LOGIN FORM */}
          <form onSubmit={handleLogin}>

            {/* SCHOOL / CLASS CODE */}
            <label>
              School / Class Code

              <input
                value={schoolCode}
                onChange={(e) => setSchoolCode(e.target.value)}
                placeholder="Enter your school or class code"
              />
            </label>


            {/* USERNAME / EMAIL */}
            <label>
              Username or Email

              <input
                type="text"
                value={login}
                onChange={(e) => setLogin(e.target.value)}
                placeholder="Enter your username or email"
                required
              />
            </label>


            {/* PASSWORD */}
            <label>
              Password

              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                required
              />
            </label>


            {/* REMEMBER / FORGOT */}
            <div className="auth-row">

              <label className="remember">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                />

                Remember me
              </label>

              <Link href="/forgot-password">
                Forgot password?
              </Link>

            </div>


            {/* ERROR MESSAGE */}
            {error && (
              <p
                style={{
                  color: '#dc2626',
                  fontSize: '14px',
                  marginTop: '10px',
                  marginBottom: '10px'
                }}
              >
                {error}
              </p>
            )}


            {/* LOGIN BUTTON */}
            <button
              type="submit"
              className="btn btn-primary full"
              disabled={loading}
            >
              {loading ? 'Logging in...' : 'Log In →'}
            </button>

          </form>


          {/* DIVIDER */}
          <div className="or">
            or
          </div>


          {/* SIGNUP */}
          <Link
            className="join-box"
            href="/signup"
          >
            Don't have an account?
            <b>Join your school →</b>
          </Link>

        </section>

      </div>

    </main>
  );
}