'use client';

import { useEffect, useState } from 'react';
import { apiFetch } from '../../../lib/api';

type User = {
  id: number;
  role: string;
  username: string;
  email: string | null;
  full_name: string;
};

type Lesson = {
  id: number;
  title: string;
  description: string;
  image: string;
  lessons: number;
  quizzes: number;
  progress: number;
  status: 'In Progress' | 'Not Started' | 'Completed' | 'Locked';
  locked?: boolean;
};

const lessons: Lesson[] = [
  {
    id: 1,
    title: 'Budgeting Basics',
    description:
      'Learn how to plan and manage your money for everyday life.',
    image: '/assets/budgeting.png',
    lessons: 1,
    quizzes: 1,
    progress: 0,
    status: 'Not Started',
  },
];

export default function LessonsPage() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('All Lessons');
  const [lessonCompleted, setLessonCompleted] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  useEffect(() => {
    const loadUser = async () => {
      try {
        const data = await apiFetch("/api/auth/me");
  
        if (data.user.role !== "student") {
          window.location.href = "/login";
          return;
        }
  
        setUser(data.user);
      } catch {
        window.location.href = "/login";
      }
    };
  
    loadUser();
  }, []);
  
  const studentName = user?.full_name || "Student";
  useEffect(() => {
    const savedCompletion =
      window.localStorage.getItem('growais_lesson_1_completed') === 'true';

    setLessonCompleted(savedCompletion);

    const loadUser = async () => {
      try {
        const data = await apiFetch('/api/auth/me');

        if (data.user.role !== 'student') {
          window.location.href = '/login';
          return;
        }

        setUser(data.user);
      } catch {
        window.location.href = '/login';
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, []);

  if (loading) {
    return (
      <div className="loading-screen">
        Loading your lessons...
      </div>
    );
  }

  const firstName =
    user?.full_name?.split(' ')[0] || 'Student';

  const currentLessons = lessons.map((lesson) => {
    if (lesson.id !== 1) return lesson;

    return {
      ...lesson,
      progress: lessonCompleted ? 100 : 0,
      status: lessonCompleted ? 'Completed' : 'Not Started',
    };
  });

  const completedLessons = currentLessons.filter(
    (lesson) => lesson.status === 'Completed'
  ).length;

  const overallProgress =
    currentLessons.length > 0
      ? Math.round((completedLessons / currentLessons.length) * 100)
      : 0;

  const filteredLessons = currentLessons.filter((lesson) => {
    if (filter === 'All Lessons') return true;
    return lesson.status === filter;
  });

  return (
    <div className="lessons-page">

      {/* ================= SIDEBAR ================= */}
      <aside className="sidebar">

        <div className="logo-area">
          <img
            src="/assets/growais-logo.png"
            alt="GrowAIs"
            className="logo"
          />
        </div>

        <nav className="main-nav">

          <a href="/student/dashboard" className="nav-item">
            <span className="nav-icon">⌂</span>
            <span>Home</span>
          </a>

          <a href="/student/lessons" className="nav-item active">
            <span className="nav-icon">▣</span>
            <span>My Learning</span>
          </a>

          <a href="/student/quiz" className="nav-item">
            <span className="nav-icon">▤</span>
            <span>Quizzes</span>
          </a>

          <a href="/student/scenarios" className="nav-item">
            <span className="nav-icon">🎮</span>
            <span>Scenarios</span>
          </a>

          <a href="/student/goals" className="nav-item">
            <span className="nav-icon">◎</span>
            <span>My Goals</span>
          </a>

          <a href="/student/progress" className="nav-item">
            <span className="nav-icon">▥</span>
            <span>My Progress</span>
          </a>

          <a href="/student/ai-assistant" className="nav-item">
            <span className="nav-icon">🤖</span>
            <span>AI Assistant</span>
          </a>

        </nav>

        <div className="sidebar-divider" />

        <nav className="secondary-nav">

          <a href="#" className="nav-item">
            <span className="nav-icon">🔔</span>
            <span>Notifications</span>
          </a>

          <a href="#" className="nav-item">
            <span className="nav-icon">♙</span>
            <span>Profile</span>
          </a>

          <a href="#" className="nav-item">
            <span className="nav-icon">⚙</span>
            <span>Settings</span>
          </a>

          <a href="#" className="nav-item">
            <span className="nav-icon">?</span>
            <span>Help</span>
          </a>

          <button
            className="nav-item logout-button"
            onClick={async () => {
              try {
                await apiFetch('/api/auth/logout', {
                  method: 'POST'
                });
              } finally {
                window.location.href = '/login';
              }
            }}
          >
            <span className="nav-icon">↪</span>
            <span>Log Out</span>
          </button>

        </nav>

        <div className="sidebar-message">

          <img
            src="/assets/dashboard-plant.png"
            alt=""
          />

          <p>
            Small steps
            <br />
            today, big dreams
            <br />
            tomorrow.
          </p>

        </div>

      </aside>


      {/* ================= MAIN ================= */}

      <div className="main">

        {/* TOP BAR */}

        <header className="topbar">

          <div className="search">
            <span>⌕</span>

            <input
              placeholder="Search lessons, quizzes, or topics..."
            />
          </div>

          <div className="profile-area">

            <button className="notification" aria-label="Notifications" type="button">
              🔔
              <span />
            </button>

            <div className="top-divider" />

            <button
              className="profile profile-toggle"
              type="button"
              aria-expanded={profileMenuOpen}
              aria-label="Open profile menu"
              onClick={() => setProfileMenuOpen((open) => !open)}
            >

              <div className="avatar">
                {firstName.charAt(0).toUpperCase()}
              </div>

              <div className="profile-text">

                <strong>
                  Hi, {firstName}
                </strong>

                <small>
                  Student
                </small>

              </div>

              <span className="arrow">
                ⌄
              </span>

            </button>

            {profileMenuOpen && (
              <div className="profile-dropdown">
                <a href="/student/profile" className="profile-menu-item">Profile</a>
                <a href="/student/settings" className="profile-menu-item">Settings</a>
                <a href="/student/help" className="profile-menu-item">Help</a>
                <button
                  type="button"
                  className="profile-menu-item profile-menu-logout"
                  onClick={async () => {
                    try {
                      await apiFetch('/api/auth/logout', { method: 'POST' });
                    } finally {
                      window.location.href = '/login';
                    }
                  }}
                >
                  Log Out
                </button>
              </div>
            )}

          </div>

        </header>


        {/* CONTENT */}

        <main className="content">

          {/* ================= HERO ================= */}

          <section className="hero">

            <div className="hero-text">

              <span className="eyebrow">
                MY LESSONS
              </span>

              <h1>
                Learn.
                <span> Practise. </span>
                <strong>Grow.</strong>
              </h1>

              <p>
                Explore interactive lessons on real-life money topics
                <br />
                and build the skills for a brighter tomorrow.
              </p>

            </div>

            <div className="hero-image">

              <img
                src="/assets/student-dashboard-hero.png"
                alt="Student learning"
              />

            </div>

          </section>


          {/* ================= PROGRESS ================= */}

          <section className="progress-section">

            <div className="overall-progress">

              <div
                className="progress-circle"
                style={{
                  background: `conic-gradient(#079d74 0% ${overallProgress}%, #e4eaf2 ${overallProgress}% 100%)`,
                }}
              >

                <div className="progress-inner">
                  {overallProgress}%
                </div>

              </div>

              <div className="progress-info">

                <h2>
                  Overall Learning Progress
                </h2>

                <p>
                  You're making great progress!
                </p>

                <div className="large-progress">

                  <div>
                    <span
                      style={{
                        width: `${overallProgress}%`,
                      }}
                    />
                  </div>

                  <strong>
                    {completedLessons} of {currentLessons.length} lessons completed
                  </strong>

                </div>

              </div>

            </div>


            <div className="quote-card">

              <div className="bulb">
                💡
              </div>

              <p>
                “Financial knowledge
                <br />
                gives you choices in life.”
              </p>

              <span>
                — GrowAIs
              </span>

            </div>

          </section>


          {/* ================= FILTERS ================= */}

          <section className="filters">

            <div className="filter-buttons">

              {[
                'All Lessons',
                'Not Started',
                'In Progress',
                'Completed',
              ].map((item) => (

                <button
                  key={item}
                  className={
                    filter === item
                      ? 'filter active'
                      : 'filter'
                  }
                  onClick={() => setFilter(item)}
                >
                  {item}
                </button>

              ))}

            </div>


            <div className="sort">

              <span>
                Sort by
              </span>

              <select>
                <option>
                  Recommended
                </option>

                <option>
                  Progress
                </option>

                <option>
                  Newest
                </option>

              </select>

            </div>

          </section>


          {/* ================= LESSON GRID ================= */}

          <section className="lesson-grid">

            {filteredLessons.map((lesson) => (

              <article
                key={lesson.id}
                className={
                  lesson.status === 'In Progress'
                    ? 'lesson-card current'
                    : 'lesson-card'
                }
              >

                <div className="lesson-top">

                  <div className="lesson-image">

                    <img
                      src={lesson.image}
                      alt={lesson.title}
                    />

                  </div>

                  <span
                    className={
                      lesson.status === 'In Progress'
                        ? 'status progress'
                        : lesson.status === 'Locked'
                        ? 'status locked'
                        : 'status'
                    }
                  >

                    {lesson.status === 'Locked' && '🔒 '}

                    {lesson.status}

                  </span>

                </div>


                <div className="lesson-body">

                  <h3>
                    {lesson.title}
                  </h3>

                  <p>
                    {lesson.description}
                  </p>


                  {!lesson.locked && (
                    <div className="lesson-progress">

                      <div className="mini-progress">

                        <span
                          style={{
                            width: `${lesson.progress}%`,
                          }}
                        />

                      </div>

                      <strong>
                        {lesson.progress}%
                      </strong>

                    </div>
                  )}


                  <div className="lesson-meta">

                    <span>
                      ▤ {lesson.lessons} Lessons
                    </span>

                    <span>
                      ▣ {lesson.quizzes} Quizzes
                    </span>

                  </div>


                  {lesson.locked ? (

                    <button
                      className="lesson-button locked-button"
                      disabled
                    >
                      🔒 &nbsp; Coming Soon
                    </button>

                  ) : lesson.status === 'Completed' ? (

                    <a
                      href={`/student/lessons/${lesson.id}`}
                      className="lesson-button continue"
                    >
                      Review Lesson
                      <span>→</span>
                    </a>

                  ) : lesson.status === 'In Progress' ? (

                    <a
                      href={`/student/lessons/${lesson.id}`}
                      className="lesson-button continue"
                    >
                      Continue Learning
                      <span>→</span>
                    </a>

                  ) : (

                    <a
                      href={`/student/lessons/${lesson.id}`}
                      className="lesson-button start"
                    >
                      Start Learning
                      <span>→</span>
                    </a>

                  )}

                </div>

              </article>

            ))}

          </section>

        </main>

      </div>


      {/* ================= STYLES ================= */}

      <style jsx>{`

        * {
          box-sizing: border-box;
        }

        .lessons-page {
          min-height: 100vh;
          background: #ffffff;
          color: #11185d;
          font-family: Arial, Helvetica, sans-serif;
        }


        /* SIDEBAR */

        .sidebar {
          width: 280px;
          height: 100vh;
          min-height: 0;
          overflow-y: auto;
          overflow-x: hidden;
          overscroll-behavior: contain;
          scrollbar-width: thin;
          scrollbar-color: #cbd5e1 transparent;
          border-right: 1px solid #e7edf5;
          background: #ffffff;
          position: fixed;
          left: 0;
          top: 0;
          bottom: 0;
          display: flex;
          flex-direction: column;
          z-index: 20;
        }

        .logo-area {
          flex-shrink: 0;
          height: 88px;
          display: flex;
          align-items: center;
          padding: 12px 25px;
          border-bottom: 1px solid #eef2f7;
        }

        .logo {
          width: 205px;
          height: auto;
          object-fit: contain;
        }

        .main-nav,
        .secondary-nav {
          flex-shrink: 0;
          padding: 18px 16px;
        }

        .nav-item {
          width: 100%;
          height: 54px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          gap: 20px;
          padding: 0 22px;
          margin-bottom: 5px;
          color: #4c5b82;
          text-decoration: none;
          font-size: 17px;
          font-weight: 500;
          transition: 0.2s;
          background: transparent;
          border: none;
          cursor: pointer;
          text-align: left;
        }

        .nav-item:hover {
          background: #f2faf7;
          color: #008f70;
        }

        .nav-item.active {
          background: #e4f7f1;
          color: #008f70;
          font-weight: 700;
        }

        .nav-icon {
          width: 28px;
          text-align: center;
          font-size: 23px;
          font-weight: 700;
        }

        .sidebar-divider {
          flex-shrink: 0;
          height: 1px;
          background: #e6ebf2;
          margin: 5px 24px;
        }

        .secondary-nav {
          padding-top: 12px;
        }

        .logout-button {
          font-family: inherit;
        }

        .sidebar-message {
          flex-shrink: 0;
          margin-top: auto;
          min-height: 105px;
          display: flex;
          align-items: flex-end;
          padding: 0 20px 18px;
          gap: 8px;
        }

        .sidebar-message img {
          width: 82px;
          height: 82px;
          object-fit: contain;
        }

        .sidebar-message p {
          margin: 0 0 8px;
          color: #18245d;
          font-size: 14px;
          line-height: 1.45;
        }

        /* =========================================
           MAIN
        ========================================= */

        .main {
          margin-left: 280px;
          min-height: 100vh;
        }


        /* =========================================
           TOP BAR
        ========================================= */

        .topbar {
          height: 88px;

          display: flex;
          align-items: center;
          justify-content: space-between;

          padding: 0 32px;

          border-bottom: 1px solid #e5eaf1;

          background: white;
        }

        .search {
          width: 560px;
          height: 48px;

          background: #f3f6fb;

          border-radius: 12px;

          display: flex;
          align-items: center;

          gap: 12px;

          padding: 0 16px;
        }

        .search span {
          font-size: 30px;
          color: #516287;

          transform: rotate(-20deg);
        }

        .search input {
          border: none;
          outline: none;

          background: transparent;

          width: 100%;

          font-size: 16px;

          color: #17215d;
        }

        .search input::placeholder {
          color: #8190ad;
        }

        .profile-area {
          position: relative;
          display: flex;
          align-items: center;
          gap: 20px;
        }

        .notification {
          position: relative;
          width: 42px;
          height: 42px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          border: none;
          border-radius: 10px;
          background: transparent;
          font-size: 22px;
          color: #4a5b81;
          cursor: pointer;
        }

        .notification:hover {
          background: #f2faf7;
        }

        .notification span {
          position: absolute;

          width: 9px;
          height: 9px;

          border-radius: 50%;

          background: #f04444;

          top: 1px;
          right: 0;

          border: 2px solid white;
        }

        .top-divider {
          width: 1px;
          height: 42px;

          background: #e1e6ee;
        }

        .profile {
          display: flex;
          align-items: center;
          gap: 12px;
          min-width: 175px;
        }

        .profile-toggle {
          border: 0;
          background: transparent;
          color: inherit;
          font: inherit;
          text-align: left;
          cursor: pointer;
          padding: 4px;
          border-radius: 12px;
        }

        .profile-toggle:hover { background: #f2faf7; }

        .profile-dropdown {
          position: absolute;
          right: 18px;
          top: calc(100% - 4px);
          min-width: 180px;
          padding: 8px;
          background: #fff;
          border: 1px solid #e1e8f0;
          border-radius: 14px;
          box-shadow: 0 12px 32px rgba(25, 45, 80, .16);
          z-index: 1200;
        }

        .profile-menu-item {
          display: block;
          width: 100%;
          padding: 11px 12px;
          border: 0;
          border-radius: 9px;
          background: transparent;
          color: #17215d;
          font: inherit;
          text-align: left;
          text-decoration: none;
          cursor: pointer;
        }

        .profile-menu-item:hover { background: #eef8f5; }
        .profile-menu-logout { color: #c62828; }

        .avatar {
          width: 44px;
          height: 44px;

          border-radius: 50%;

          display: flex;
          justify-content: center;
          align-items: center;

          background: #0b9b72;

          color: white;

          font-weight: 700;
        }

        .profile-text {
          display: flex;
          flex-direction: column;

          gap: 3px;
        }

        .profile-text strong {
          font-size: 16px;
        }

        .profile-text small {
          color: #58688e;
          font-size: 14px;
        }

        .arrow {
          margin-left: auto;
          font-size: 20px;
        }


        /* =========================================
           CONTENT
        ========================================= */

        .content {
          padding: 0 24px 35px;

          max-width: 1600px;

          margin: auto;
        }


        /* =========================================
           HERO
        ========================================= */

        .hero {
          height: 205px;

          display: flex;
          align-items: center;

          position: relative;

          overflow: hidden;

          margin-bottom: 16px;
          border-radius: 18px;
          background: linear-gradient(
            110deg,
            #e8f8f2 0%,
            #f0fbf8 55%,
            #e3f5ee 100%
          );
        }

        .hero-text {
          padding-left: 8px;

          position: relative;
          z-index: 2;
        }

        .eyebrow {
          display: block;

          margin-bottom: 8px;

          color: #5b6b91;

          letter-spacing: 2px;

          font-size: 14px;

          font-weight: 700;
        }

        .hero h1 {
          margin: 0;

          font-size: 48px;

          line-height: 1.05;

          color: #11165e;
        }

        .hero h1 span {
          color: #10165e;
        }

        .hero h1 strong {
          color: #069c73;
        }

        .hero p {
          margin: 9px 0 0;

          font-size: 19px;

          line-height: 1.45;

          color: #42547d;
        }

        .hero-image {
          position: absolute;

          right: 110px;
          bottom: 0;

          width: 410px;
          height: 205px;
        }

        .hero-image img {
          width: 100%;
          height: 100%;

          object-fit: contain;

          object-position: center bottom;
        }


        /* =========================================
           PROGRESS
        ========================================= */

        .progress-section {
          display: grid;

          grid-template-columns: 1fr 285px;

          gap: 16px;

          margin-top: 0;
        }

        .overall-progress {
          min-height: 110px;

          border: 1px solid #e2eaf3;

          border-radius: 15px;

          display: flex;
          align-items: center;

          gap: 20px;

          padding: 10px 20px;

          background: white;
        }

        .progress-circle {
          width: 91px;
          height: 91px;

          flex-shrink: 0;

          border-radius: 50%;

          background: conic-gradient(
            #e4eaf2 0% 100%
          );

          display: flex;
          align-items: center;
          justify-content: center;
        }

        .progress-inner {
          width: 71px;
          height: 71px;

          border-radius: 50%;

          background: white;

          display: flex;
          align-items: center;
          justify-content: center;

          font-size: 19px;

          font-weight: 700;

          color: #10165e;
        }

        .progress-info {
          flex: 1;
        }

        .progress-info h2 {
          margin: 0;

          font-size: 20px;
        }

        .progress-info p {
          margin: 4px 0 10px;

          color: #4f6087;

          font-size: 14px;
        }

        .large-progress {
          display: flex;
          align-items: center;

          gap: 20px;
        }

        .large-progress > div {
          height: 15px;

          border-radius: 20px;

          background: #e5eaf2;

          flex: 1;

          overflow: hidden;
        }

        .large-progress > div span {
          display: block;

          height: 100%;

          background: #079d74;

          border-radius: 20px;
        }

        .large-progress strong {
          white-space: nowrap;

          font-size: 14px;

          color: #46567d;

          font-weight: 500;
        }

        .quote-card {
          min-height: 110px;

          border-radius: 15px;

          background: #eef8ff;

          border: 1px solid #dcebf7;

          padding: 15px 20px;

          display: flex;
          flex-direction: column;

          justify-content: center;
        }

        .bulb {
          font-size: 25px;

          float: left;

          margin-right: 7px;
        }

        .quote-card p {
          margin: 0;

          font-size: 15px;

          line-height: 1.4;

          color: #152064;
        }

        .quote-card span {
          margin-top: 5px;

          font-size: 13px;

          color: #42537a;

          align-self: flex-end;
        }


        /* =========================================
           FILTERS
        ========================================= */

        .filters {
          display: flex;
          align-items: center;
          justify-content: space-between;

          margin: 22px 0 17px;
        }

        .filter-buttons {
          display: flex;
          gap: 9px;
        }

        .filter {
          border: none;

          border-radius: 20px;

          background: #f2f5f9;

          color: #43547b;

          padding: 11px 21px;

          font-size: 14px;

          cursor: pointer;
        }

        .filter.active {
          background: #009d74;

          color: white;

          font-weight: 700;
        }

        .sort {
          display: flex;

          align-items: center;

          gap: 10px;

          color: #43547b;

          font-size: 14px;
        }

        .sort select {
          height: 40px;

          min-width: 190px;

          padding: 0 15px;

          border-radius: 12px;

          border: 1px solid #dbe4ee;

          background: white;

          color: #253263;

          outline: none;

          font-size: 14px;
        }


        /* =========================================
           LESSON GRID
        ========================================= */

        .lesson-grid {
          display: grid;

          grid-template-columns: repeat(3, 1fr);

          gap: 16px;
        }

        .lesson-card {
          min-height: 350px;

          border: 1px solid #e1e8f0;

          border-radius: 15px;

          background: white;

          overflow: hidden;

          transition: 0.2s;
        }

        .lesson-card:hover {
          transform: translateY(-2px);

          box-shadow:
            0 8px 25px rgba(25, 50, 80, 0.07);
        }

        .lesson-card.current {
          border: 1.5px solid #00a278;
        }

        .lesson-top {
          height: 150px;

          padding: 16px;

          position: relative;
        }

        .lesson-image {
          width: 120px;
          height: 120px;

          border-radius: 13px;

          overflow: hidden;
        }

        .lesson-image img {
          width: 100%;
          height: 100%;

          object-fit: cover;
        }

        .status {
          position: absolute;

          right: 15px;
          top: 15px;

          padding: 7px 12px;

          border-radius: 12px;

          background: #f1f4f8;

          color: #5a698c;

          font-size: 12px;
        }

        .status.progress {
          background: #e5f3ff;

          color: #0675d8;
        }

        .status.locked {
          background: #f0f3f8;

          color: #647292;
        }

        .lesson-body {
          padding: 4px 16px 16px;
        }

        .lesson-body h3 {
          margin: 0 0 7px;

          font-size: 19px;

          color: #10165e;
        }

        .lesson-body p {
          min-height: 39px;

          margin: 0 0 11px;

          color: #4d5f86;

          font-size: 13px;

          line-height: 1.4;
        }

        .lesson-progress {
          display: flex;

          align-items: center;

          gap: 10px;

          margin-bottom: 13px;
        }

        .mini-progress {
          height: 10px;

          flex: 1;

          background: #e6ebf2;

          border-radius: 20px;

          overflow: hidden;
        }

        .mini-progress span {
          display: block;

          height: 100%;

          border-radius: 20px;

          background: #079d74;
        }

        .lesson-progress strong {
          font-size: 14px;

          color: #27558d;
        }

        .lesson-meta {
          display: flex;

          gap: 25px;

          margin-bottom: 14px;
        }

        .lesson-meta span {
          color: #46577c;

          font-size: 13px;
        }

        .lesson-button {
          width: 100%;

          height: 45px;

          border-radius: 11px;

          display: flex;

          align-items: center;
          justify-content: center;

          gap: 25px;

          text-decoration: none;

          font-size: 14px;

          font-weight: 700;

          border: none;
        }

        .lesson-button.continue {
          background: #009d74;

          color: white;
        }

        .lesson-button.start {
          background: #e5f8f1;

          color: #00946c;
        }

        .lesson-button.locked-button {
          background: #f0f2f6;

          color: #8a96ad;
        }


        /* =========================================
           LOADING
        ========================================= */

        .loading-screen {
          min-height: 100vh;

          display: flex;
          align-items: center;
          justify-content: center;

          color: #11185d;

          font-size: 20px;
        }


        /* =========================================
           RESPONSIVE
        ========================================= */

        @media (max-width: 1100px) {

          .sidebar {
            width: 210px;
          }

          .main {
            margin-left: 210px;
          }

          .topbar {
            padding: 0 20px;
          }

          .search {
            width: min(480px, 55vw);
          }

          .content {
            padding: 0 18px 35px;
          }

          .lesson-grid {
            grid-template-columns: repeat(2, 1fr);
          }

        }


@media (max-width: 700px) {

  body {
    overflow-x: hidden;
  }

  /* =========================================
     MOBILE BOTTOM NAVIGATION
     SAME AS STUDENT DASHBOARD
  ========================================= */

  .lessons-page {
    min-height: 100vh;
    padding-bottom: 70px;
  }

  .sidebar {
    position: fixed;
    left: 0;
    right: 0;
    top: auto;
    bottom: 0;

    width: 100%;
    height: 66px;
    min-height: 66px;

    border-right: 0;
    border-top: 1px solid #e4eaf2;

    background: #ffffff;

    box-shadow: 0 -8px 25px rgba(34, 68, 100, 0.08);

    display: block;
    overflow: hidden;

    z-index: 1000;
  }

  /* Hide desktop sidebar elements */

  .logo-area,
  .sidebar-divider,
  .secondary-nav,
  .sidebar-message {
    display: none;
  }

  /* Bottom navigation container */

  .main-nav {
    width: 100%;
    height: 100%;

    padding: 4px 3px;

    display: flex;
    align-items: stretch;
    justify-content: space-between;

    gap: 0;
    overflow: hidden;
  }

  /* Navigation items */

  .main-nav .nav-item {
    flex: 1 1 0;

    width: auto;
    min-width: 0;

    height: 58px;

    margin: 0;
    padding: 4px 1px;

    border-radius: 9px;

    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;

    gap: 2px;

    font-size: 9px;
    line-height: 1.1;

    text-align: center;
  }

  /* Show navigation text */

  .main-nav .nav-item span:last-child {
    display: block;

    white-space: nowrap;
  }

  /* Navigation icons */

  .main-nav .nav-icon {
    width: auto;

    font-size: 19px;
    line-height: 20px;
  }

  /* Main page becomes full width */

  .main {
    margin-left: 0;
    width: 100%;

    min-height: calc(100vh - 66px);
  }

  /* =========================================
     MOBILE TOP BAR
  ========================================= */

  .topbar {
    height: 64px;

    padding: 0 12px;

    position: sticky;
    top: 0;

    z-index: 100;

    background: #ffffff;
  }

  .search {
    flex: 1;

    width: auto;
    min-width: 0;

    height: 42px;

    padding: 0 11px;

    gap: 7px;
  }

  .search span {
    font-size: 22px;
  }

  .search input {
    font-size: 12px;

    min-width: 0;
  }

  .profile-area {
    display: flex;
    flex: 0 0 auto;
    gap: 4px;
  }

  .profile-area .notification,
  .profile-area .top-divider {
    display: none;
  }

  .profile-toggle {
    min-width: 0 !important;
    gap: 6px !important;
    padding: 2px !important;
  }

  .profile-toggle .avatar {
    width: 38px;
    height: 38px;
    flex: 0 0 38px;
  }

  .profile-toggle .profile-text { display: none; }
  .profile-toggle .arrow { margin-left: 0; font-size: 16px; }

  .profile-dropdown {
    position: fixed;
    top: 58px;
    right: 10px;
    min-width: 190px;
  }

  /* =========================================
     MOBILE CONTENT
  ========================================= */

  .content {
    padding: 0 12px 20px;
  }

  /* =========================================
     HERO
  ========================================= */

  .hero {
    height: 300px;
    margin-bottom: 14px;
    border-radius: 16px;
  }

  .hero-text {
    padding: 22px 20px;

    position: relative;
    z-index: 2;
  }

  .hero h1 {
    font-size: 29px;
  }

  .hero p {
    font-size: 13px;

    line-height: 1.5;
  }

  .hero-image {
    right: -8%;

    width: 70%;

    opacity: 0.38;
  }

  /* =========================================
     PROGRESS
  ========================================= */

  .overall-progress {
    flex-direction: column;

    align-items: flex-start;

    padding: 20px;
  }

  .large-progress {
    flex-direction: column;

    align-items: stretch;
  }

  /* =========================================
     FILTERS
  ========================================= */

  .filters {
    flex-direction: column;

    align-items: stretch;

    gap: 15px;
  }

  .filter-buttons {
    flex-wrap: wrap;
  }

  .sort {
    justify-content: space-between;
  }

  /* =========================================
     LESSON GRID
  ========================================= */

  .lesson-grid {
    grid-template-columns: 1fr;
  }

}

      `}</style>

    </div>
  );
}