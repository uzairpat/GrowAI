'use client';

import Link from 'next/link';
import { useState } from 'react';
import { apiFetch } from '../../lib/api';

export default function Page() {
  const [role, setRole] = useState<'student' | 'teacher'>('student');

  const [schoolCode, setSchoolCode] = useState('');
  const [fullName, setFullName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const [acceptedTerms, setAcceptedTerms] = useState(false);

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();

    setError('');

    if (!acceptedTerms) {
      setError('Please agree to the Terms of Use and Privacy Policy.');
      return;
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }

    setLoading(true);

    try {
      const data = await apiFetch('/api/auth/register', {
        method: 'POST',
        body: JSON.stringify({
          role,
          fullName,
          username,
          email: email || null,
          password,
        }),
      });

      const registeredRole = data?.user?.role || role;

      // Return to login with the same role selected.
      // The login page will still verify the real role returned by the backend.
      window.location.href = `/login?role=${encodeURIComponent(registeredRole)}`;
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : 'Registration failed'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="signup-page">

      <div className="signup-hero">
        <div className="container signup-copy">
          <p className="eyebrow">JOIN GROWAIS</p>

          <h1>
            {role === 'teacher' ? (
              <>
                Support Better
                <br />
                <span>Financial Learning!</span>
              </>
            ) : (
              <>
                Start Your
                <br />
                <span>Financial Learning Journey!</span>
              </>
            )}
          </h1>

          <p className="lead">
            {role === 'teacher'
              ? 'Create a teacher account to support and track student learning with GrowAIs.'
              : 'Create a student account to join your school and start learning with GrowAIs.'}
          </p>
        </div>
      </div>

      <section className="auth-card signup-card">

        <h2>Create Your Account</h2>

        <p className="section-lead">
          Tell us a bit about yourself to get started.
        </p>

        {/* Role Selection */}
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

        <form onSubmit={handleSignup}>

          {/* School / Class Code */}
          <label>
            {role === 'teacher' ? 'School Code' : 'School / Class Code'}

            <input
              type="text"
              placeholder={
                role === 'teacher'
                  ? 'Enter your school code'
                  : 'Enter your school or class code'
              }
              value={schoolCode}
              onChange={(e) => setSchoolCode(e.target.value)}
            />
          </label>

          {/* Full Name */}
          <label>
            Full Name

            <input
              type="text"
              placeholder="Enter your full name"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
            />
          </label>

          {/* Username */}
          <label>
            Username

            <input
              type="text"
              placeholder="Choose a username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </label>

          {/* Email */}
          <label>
            Email <small>(Optional)</small>

            <input
              type="email"
              placeholder="Enter your email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </label>

          {/* Password */}
          <label>
            Password

            <input
              type="password"
              placeholder="Create a password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </label>

          <small>
            Use at least 8 characters with a mix of letters, numbers and symbols.
          </small>

          {/* Terms */}
          <label className="terms">

            <input
              type="checkbox"
              checked={acceptedTerms}
              onChange={(e) => setAcceptedTerms(e.target.checked)}
            />

            I agree to the{' '}
            <a href="#">
              Terms of Use
            </a>{' '}
            and{' '}
            <a href="#">
              Privacy Policy
            </a>
            .

          </label>

          {/* Error Message */}
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

          {/* Submit */}
          <button
            type="submit"
            className="btn btn-primary full"
            disabled={loading}
          >
            {loading ? 'Creating Account...' : 'Create Account →'}
          </button>

        </form>

        <div className="or">
          or
        </div>

        <Link
          className="join-box"
          href="/login"
        >
          I already have an account <b>Log In →</b>
        </Link>

      </section>

    </main>
  );
}