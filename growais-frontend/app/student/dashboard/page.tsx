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

export default function StudentDashboard() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [lessonCompleted, setLessonCompleted] = useState(false);
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [scenarioCompleted, setScenarioCompleted] = useState(false);
  const [scenarioPoints, setScenarioPoints] = useState(0);
  const [scenarioBadgeEarned, setScenarioBadgeEarned] = useState(false);
  const [activeGoalTitle, setActiveGoalTitle] = useState('No Active Goal');
  const [activeGoalProgress, setActiveGoalProgress] = useState(0);


  useEffect(() => {
    const loadGoalFromStorage = () => {
      const storedGoals = window.localStorage.getItem('growais_goals');

      if (!storedGoals) {
        setActiveGoalTitle('No Active Goal');
        setActiveGoalProgress(0);
        return;
      }

      try {
        const goals = JSON.parse(storedGoals);

        if (!Array.isArray(goals) || goals.length === 0) {
          setActiveGoalTitle('No Active Goal');
          setActiveGoalProgress(0);
          return;
        }

        const activeGoal =
          goals.find((goal: { active?: boolean }) => goal.active) || goals[0];

        setActiveGoalTitle(activeGoal?.title || 'No Active Goal');

        let progress = 0;

        if (activeGoal?.type === 'savings') {
          const target = Number(activeGoal.targetAmount) || 0;
          const saved = Number(activeGoal.savedAmount) || 0;

          progress =
            target > 0
              ? Math.min(Math.round((saved / target) * 100), 100)
              : 0;
        } else if (activeGoal?.type === 'completion') {
          const target = Number(activeGoal.targetActivities) || 0;
          const completed = Number(activeGoal.completedActivities) || 0;

          progress =
            target > 0
              ? Math.min(Math.round((completed / target) * 100), 100)
              : 0;
        }

        setActiveGoalProgress(progress);
      } catch {
        setActiveGoalTitle('No Active Goal');
        setActiveGoalProgress(0);
      }
    };

    loadGoalFromStorage();

    const handleStorageChange = () => {
      loadGoalFromStorage();
    };

    window.addEventListener('storage', handleStorageChange);

    const loadUser = async () => {
      try {
        const data = await apiFetch('/api/auth/me');
    
        if (data.user.role !== 'student') {
          window.location.href = '/login';
          return;
        }
    
        setUser(data.user);
    
        // Load this student's Budgeting Basics progress
        try {
          const lessonProgress = await apiFetch(
            '/api/student/lessons/2/progress'
          );
    
          setLessonCompleted(
            lessonProgress.progress?.status === 'completed'
          );
        } catch {
          setLessonCompleted(false);
        }

        // Load this student's latest Quiz 2 attempt from PostgreSQL.
        // The backend uses the authenticated session, so the result
        // is specific to the currently logged-in student.
        try {
          const quizResult = await apiFetch(
            '/api/student/quizzes/2/attempts/latest'
          );

          setQuizCompleted(Boolean(quizResult.attempt));
        } catch (error) {
          console.error('Unable to load quiz progress:', error);
          setQuizCompleted(false);
        }
        
        // Load this student's latest Scenario 1 attempt from PostgreSQL.
        try {
          const scenarioResult = await apiFetch(
            '/api/student/scenarios/1/attempts/latest'
          );

          if (scenarioResult.attempt) {
            const completed = Boolean(scenarioResult.attempt.completed);
            const score = Number(scenarioResult.attempt.score);

            setScenarioCompleted(completed);
            setScenarioPoints(Number.isFinite(score) ? score : 0);
            setScenarioBadgeEarned(completed);
          } else {
            setScenarioCompleted(false);
            setScenarioPoints(0);
            setScenarioBadgeEarned(false);
          }
        } catch (error) {
          console.error('Unable to load scenario progress:', error);
          setScenarioCompleted(false);
          setScenarioPoints(0);
          setScenarioBadgeEarned(false);
        }
    
      } catch {
        window.location.href = '/login';
      } finally {
        setLoading(false);
      }
    };

    loadUser();

    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  if (loading) {
    return (
      <div className="dashboard-loading">
        Loading your dashboard...
      </div>
    );
  }

  const studentName = user?.full_name || 'Student';

  return (
    <div className="student-dashboard">

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

          <a href="/student/dashboard" className="nav-item active">
            <span className="nav-icon">⌂</span>
            <span>Home</span>
          </a>

          <a href="/student/lessons" className="nav-item">
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
            <span className="nav-icon">🔔
           </span>
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
      <div className="dashboard-main">

        {/* TOP BAR */}
        <header className="topbar">

          <div className="search-box">
            <span>⌕</span>

            <input
              type="text"
              placeholder="Search lessons, quizzes, or topics..."
            />
          </div>

          <div className="topbar-right">

            <button
              className="notification-button"
              type="button"
              aria-label="Notifications"
              title="Notifications"
            >
              🔔
              <span className="notification-dot" />
            </button>

            <div className="topbar-divider" />

            <div className="profile-area">

              <button
                className="profile profile-toggle"
                type="button"
                aria-expanded={profileMenuOpen}
                aria-haspopup="menu"
                aria-label="Open profile menu"
                onClick={() => setProfileMenuOpen((open) => !open)}
              >

                <div className="avatar">
                  {studentName.charAt(0).toUpperCase()}
                </div>

                <div className="profile-text">

                  <strong>
                    Hi, {studentName.split(' ')[0]}
                  </strong>

                  <small>
                    Student
                  </small>

                </div>

                <span className="arrow" aria-hidden="true">
                  ⌄
                </span>

              </button>

              {profileMenuOpen && (
                <div className="profile-dropdown" role="menu">

                  <a
                    href="/student/profile"
                    className="profile-menu-item"
                    role="menuitem"
                  >
                    Profile
                  </a>

                  <a
                    href="/student/settings"
                    className="profile-menu-item"
                    role="menuitem"
                  >
                    Settings
                  </a>

                  <a
                    href="/student/help"
                    className="profile-menu-item"
                    role="menuitem"
                  >
                    Help
                  </a>

                  <button
                    type="button"
                    className="profile-menu-item profile-menu-logout"
                    role="menuitem"
                    onClick={async () => {
                      try {
                        await apiFetch('/api/auth/logout', {
                          method: 'POST',
                        });
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

          </div>

        </header>


        {/* CONTENT */}
        <main className="dashboard-content">

          {/* ================= HERO ================= */}
          <section className="hero-card">

            <div className="hero-content">

              <h1>
                Hi, {studentName.split(' ')[0]}! <span>👋</span>
              </h1>

              <h2>
                Ready to build a brighter financial future?
              </h2>

              <p>
                Continue learning, practise real-life skills,
                and achieve your goals.
              </p>

              <a
                href="/student/lessons"
                className="primary-button"
              >
                Continue Learning
                <span>→</span>
              </a>

            </div>

            <div className="hero-image">

              <img
                src="/assets/student-dashboard-hero.png"
                alt="Student learning"
              />

            </div>

          </section>


          {/* ================= STATS ================= */}
          <section className="stats-grid">

            <div className="stat-card yellow">

              <div className="stat-icon">
                ★
              </div>

              <div>
                <strong>{scenarioPoints}</strong>
                <span>Total Points</span>
              </div>

            </div>


            <div className="stat-card purple">

              <div className="stat-icon">
                ♛
              </div>

              <div>
                <strong>{scenarioBadgeEarned ? 1 : 0}</strong>
                <span>Badges Earned</span>
              </div>

            </div>


            <div className="stat-card green">

              <div className="stat-icon">
                ◎
              </div>

              <div>
                <strong>{activeGoalTitle}</strong>
                <span>{activeGoalProgress}% complete</span>
              </div>

            </div>


            <div className="stat-card red">

              <div className="stat-icon">
                🔥
              </div>

              <div>
                <strong>0 Days</strong>
                <span>Learning Streak</span>
              </div>

            </div>

          </section>


          {/* ================= MIDDLE ================= */}
          <section className="middle-grid">

            {/* CONTINUE LEARNING */}
            <div className="panel learning-panel">

              <div className="panel-header">

                <h2>
                  <span>▣</span>
                  Continue Your Learning
                </h2>

                <a href="/student/lessons">
                  View All
                </a>

              </div>


              <div className="learning-content">

                <div className="lesson-image">

                  <img
                    src="/assets/budgeting-basics.png"
                    alt="Budgeting Basics"
                  />

                </div>


                <div className="lesson-info">

                  <h3>
                    Budgeting Basics
                  </h3>

                  <p className="lesson-meta">
                    Module 1 • Lesson 1
                  </p>

                  <p className="lesson-description">
                    {lessonCompleted
                      ? 'You have completed this lesson. You can review it anytime.'
                      : 'Learn how to plan and manage your money.'}
                  </p>


                  <div className="progress-row">

                    <div className="progress-bar">
                      <div
                        className="progress-fill"
                        style={{
                          width: lessonCompleted ? '100%' : '0%',
                        }}
                      />
                    </div>

                    <span>
                      {lessonCompleted ? '100% complete' : '0% complete'}
                    </span>

                  </div>


                  <a
                    href="/student/lessons/1"
                    className="primary-button small"
                  >
                    {lessonCompleted ? 'Review Lesson' : 'Continue Lesson'}
                    <span>→</span>
                  </a>

                </div>

              </div>

            </div>


            {/* QUICK ACTIONS */}
            <div className="panel quick-panel">

              <div className="panel-header">

                <h2>
                  Quick Actions
                </h2>

              </div>


              <div className="quick-grid">

                <a
                  href="/student/lessons"
                  className="quick-card blue"
                >

                  <div className="quick-icon">
                    ▣
                  </div>

                  <div>
                    <strong>Lessons</strong>
                    <span>Learn key concepts</span>
                  </div>

                  <b>›</b>

                </a>


                <a
                  href="/student/quizzes"
                  className="quick-card purple"
                >

                  <div className="quick-icon">
                    ▤
                  </div>

                  <div>
                    <strong>Quizzes</strong>
                    <span>Test your knowledge</span>
                  </div>

                  <b>›</b>

                </a>


                <a
                  href="/student/scenarios"
                  className="quick-card orange"
                >

                  <div className="quick-icon">
                    🎮
                  </div>

                  <div>
                    <strong>Scenarios</strong>
                    <span>Make real-life decisions</span>
                  </div>

                  <b>›</b>

                </a>


                <a
                  href="/student/goals"
                  className="quick-card green"
                >

                  <div className="quick-icon">
                    ◎
                  </div>

                  <div>
                    <strong>My Goals</strong>
                    <span>Track your goals</span>
                  </div>

                  <b>›</b>

                </a>

              </div>

            </div>

          </section>


          {/* ================= BOTTOM ================= */}
          <section className="bottom-grid">

            {/* PROGRESS */}
            <div className="panel progress-panel">

              <div className="panel-header">

                <h2>
                  <span className="blue-icon">
                    ▥
                  </span>
                  Your Progress
                </h2>

                <a href="/student/progress">
                  View Details
                </a>

              </div>


              <div className="progress-circles">

                <ProgressCircle
                  percentage={lessonCompleted ? 100 : 0}
                  label="Lessons"
                  className="circle-green"
                />

                <ProgressCircle
                  percentage={quizCompleted ? 100 : 0}
                  label="Quizzes"
                  className="circle-blue"
                />

                <ProgressCircle
                  percentage={scenarioCompleted ? 100 : 0}
                  label="Scenarios"
                  className="circle-purple"
                />

                <ProgressCircle
                  percentage={activeGoalProgress}
                  label="Goals"
                  className="circle-orange"
                />

              </div>

            </div>


            {/* AI HELP */}
            <div className="panel ai-panel">

              <div className="ai-main">

                <div className="ai-icon">
                  🤖
                </div>

                <div>

                  <h2>
                    Need Help?
                  </h2>

                  <p>
                    Ask GrowAIs about your lessons,
                    quizzes or financial questions.
                  </p>

                  <a
                    href="/student/ai-assistant"
                    className="ai-button"
                  >
                    Ask AI Assistant
                    <span>→</span>
                  </a>

                </div>

              </div>


              <div className="suggestions">

                <span>
                  “Why is budgeting important?”
                </span>

                <span>
                  “Can you explain this question?”
                </span>

                <span>
                  “Give me a hint.”
                </span>

              </div>

            </div>

          </section>

        </main>

      </div>


      {/* ================= PAGE STYLES ================= */}
      <style jsx>{`

        * {
          box-sizing: border-box;
        }

        .student-dashboard {
          min-height: 100vh;
          background: #ffffff;
          color: #10185c;
          font-family: Arial, Helvetica, sans-serif;
          display: flex;
        }

        /* SIDEBAR */

        .sidebar {
          width: 280px;
          height: 100vh;
          min-height: 0;
          border-right: 1px solid #e7edf5;
          background: #ffffff;
          position: fixed;
          left: 0;
          top: 0;
          bottom: 0;
          display: flex;
          flex-direction: column;
          overflow-y: auto;
          overflow-x: hidden;
          overscroll-behavior: contain;
          scrollbar-width: thin;
          scrollbar-color: #cbd5e1 transparent;
          z-index: 20;
        }

        .sidebar::-webkit-scrollbar {
          width: 6px;
        }

        .sidebar::-webkit-scrollbar-thumb {
          background: #cbd5e1;
          border-radius: 10px;
        }

        .sidebar::-webkit-scrollbar-track {
          background: transparent;
        }

        .logo-area,
        .main-nav,
        .sidebar-divider,
        .secondary-nav,
        .sidebar-message {
          flex-shrink: 0;
        }

        .logo-area {
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

        /* MAIN */

        .dashboard-main {
          width: calc(100% - 280px);
          margin-left: 280px;
          min-height: 100vh;
        }

        .topbar {
          height: 88px;
          border-bottom: 1px solid #e7edf5;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 32px;
          background: white;
        }

        .search-box {
          width: 515px;
          height: 48px;
          border-radius: 12px;
          background: #f3f6fb;
          display: flex;
          align-items: center;
          padding: 0 16px;
          gap: 12px;
        }

        .search-box span {
          font-size: 29px;
          color: #5b6b91;
          transform: rotate(-20deg);
        }

        .search-box input {
          border: none;
          outline: none;
          background: transparent;
          width: 100%;
          font-size: 16px;
          color: #18245d;
        }

        .search-box input::placeholder {
          color: #8290ad;
        }

        .topbar-right {
          display: flex;
          align-items: center;
          gap: 20px;
        }

        /* Working profile menu pattern used by the Lessons page */
        .profile-area {
          position: relative;
          display: flex;
          align-items: center;
          gap: 20px;
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

        .profile-toggle:hover {
          background: #f2faf7;
        }

        .profile-dropdown {
          position: absolute;
          right: 0;
          top: calc(100% + 6px);
          min-width: 190px;
          padding: 8px;
          background: #ffffff;
          border: 1px solid #e1e8f0;
          border-radius: 14px;
          box-shadow: 0 12px 32px rgba(25, 45, 80, 0.16);
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

        .profile-menu-item:hover {
          background: #eef8f5;
        }

        .profile-menu-logout {
          color: #c62828;
        }

        .profile-text {
          display: flex;
          flex-direction: column;
          gap: 3px;
        }

        .profile-text strong {
          font-size: 16px;
          color: #11195b;
        }

        .profile-text small {
          color: #58688e;
          font-size: 14px;
        }

        .arrow {
          margin-left: auto;
          font-size: 20px;
        }

        .notification-button {
          position: relative;
          border: none;
          background: none;
          font-size: 29px;
          color: #46577d;
          cursor: pointer;
        }

        .notification-dot {
          position: absolute;
          width: 9px;
          height: 9px;
          background: #f0444a;
          border-radius: 50%;
          top: 2px;
          right: 0;
          border: 2px solid white;
        }

        .topbar-divider {
          width: 1px;
          height: 42px;
          background: #e2e7ef;
        }

        .profile-mini {
          display: flex;
          align-items: center;
          gap: 12px;
          min-width: 175px;
        }

        .avatar {
          width: 44px;
          height: 44px;
          border-radius: 50%;
          background: #0c9a72;
          color: white;
          display: flex;
          justify-content: center;
          align-items: center;
          font-size: 17px;
          font-weight: 700;
        }

        .profile-mini div:nth-child(2) {
          display: flex;
          flex-direction: column;
          gap: 3px;
        }

        .profile-mini strong {
          font-size: 16px;
          color: #11195b;
        }

        .profile-mini span {
          font-size: 14px;
          color: #59698e;
        }

        .profile-arrow {
          margin-left: auto;
          font-size: 20px !important;
        }

        /* CONTENT */

        .dashboard-content {
          padding: 20px 24px 35px;
          max-width: 1600px;
          margin: 0 auto;
        }

        /* HERO */

        .hero-card {
          min-height: 238px;
          border-radius: 18px;
          overflow: hidden;
          position: relative;
          background: linear-gradient(
            110deg,
            #e6f8f1 0%,
            #eefcf6 65%,
            #ddf6eb 100%
          );
          display: flex;
        }

        .hero-content {
          padding: 26px 34px;
          position: relative;
          z-index: 2;
        }

        .hero-content h1 {
          margin: 0;
          font-size: 42px;
          line-height: 1.1;
          color: #080f59;
        }

        .hero-content h1 span {
          font-size: 39px;
        }

        .hero-content h2 {
          margin: 9px 0 7px;
          font-size: 25px;
          color: #10145c;
        }

        .hero-content p {
          margin: 0 0 20px;
          font-size: 17px;
          color: #3f5078;
        }

        .hero-image {
          position: absolute;
          right: 70px;
          bottom: 0;
          width: 470px;
          height: 100%;
          display: flex;
          align-items: flex-end;
          justify-content: center;
        }

        .hero-image img {
          width: 100%;
          height: 100%;
          object-fit: contain;
          object-position: center bottom;
        }

        .primary-button {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 35px;
          min-width: 250px;
          height: 56px;
          padding: 0 25px;
          border-radius: 12px;
          background: #009c75;
          color: white;
          text-decoration: none;
          font-size: 17px;
          font-weight: 700;
          border: none;
          cursor: pointer;
          box-shadow: 0 7px 16px rgba(0, 145, 108, 0.18);
        }

        .primary-button:hover {
          background: #008866;
        }

        .primary-button.small {
          min-width: 220px;
          height: 44px;
          font-size: 15px;
          gap: 25px;
        }

        /* STATS */

        .stats-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 16px;
          margin-top: 20px;
        }

        .stat-card {
          min-height: 102px;
          border-radius: 16px;
          display: flex;
          align-items: center;
          gap: 20px;
          padding: 18px;
        }

        .stat-card.yellow {
          background: #fff8e6;
        }

        .stat-card.purple {
          background: #f6f0ff;
        }

        .stat-card.green {
          background: #edf9ed;
        }

        .stat-card.red {
          background: #fff0f0;
        }

        .stat-icon {
          width: 70px;
          height: 70px;
          border-radius: 16px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 35px;
          flex-shrink: 0;
        }

        .yellow .stat-icon {
          background: #fff0c4;
          color: #ffad00;
        }

        .purple .stat-icon {
          background: #e7d9ff;
          color: #7138d7;
        }

        .green .stat-icon {
          background: #d7f1d8;
          color: #0b9b68;
        }

        .red .stat-icon {
          background: #ffdcdc;
          color: #f04444;
        }

        .stat-card div:last-child {
          display: flex;
          flex-direction: column;
          gap: 5px;
        }

        .stat-card strong {
          font-size: 27px;
          color: #10165e;
        }

        .stat-card span {
          color: #46577d;
          font-size: 16px;
        }

        /* PANELS */

        .middle-grid,
        .bottom-grid {
          display: grid;
          grid-template-columns: 1.03fr 0.97fr;
          gap: 16px;
          margin-top: 18px;
        }

        .panel {
          border: 1px solid #e4eaf2;
          border-radius: 17px;
          background: white;
          padding: 20px;
        }

        .panel-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 17px;
        }

        .panel-header h2 {
          margin: 0;
          color: #10165e;
          font-size: 21px;
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .panel-header h2 span {
          color: #40557f;
          font-size: 25px;
        }

        .panel-header a {
          color: #006de5;
          font-size: 15px;
        }

        /* LEARNING */

        .learning-content {
          display: flex;
          gap: 20px;
          align-items: center;
        }

        .lesson-image {
          width: 160px;
          height: 153px;
          flex-shrink: 0;
          border-radius: 13px;
          overflow: hidden;
          background: #dff8e9;
        }

        .lesson-image img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .lesson-info {
          flex: 1;
        }

        .lesson-info h3 {
          margin: 0 0 6px;
          font-size: 21px;
          color: #10165e;
        }

        .lesson-meta {
          margin: 0 0 8px;
          color: #526389;
          font-size: 15px;
        }

        .lesson-description {
          margin: 0 0 12px;
          color: #536286;
          font-size: 14px;
        }

        .progress-row {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 12px;
        }

        .progress-bar {
          height: 10px;
          border-radius: 20px;
          background: #e6eaf0;
          overflow: hidden;
          flex: 1;
          max-width: 270px;
        }

        .progress-fill {
          height: 100%;
          background: #079d75;
          border-radius: 20px;
        }

        .progress-row span {
          white-space: nowrap;
          font-size: 14px;
          color: #536286;
        }

        /* QUICK ACTIONS */

        .quick-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 14px;
        }

        .quick-card {
          min-height: 75px;
          border-radius: 13px;
          padding: 12px;
          display: flex;
          align-items: center;
          gap: 11px;
          text-decoration: none;
          color: #10165e;
        }

        .quick-card.blue {
          background: #edf6ff;
        }

        .quick-card.purple {
          background: #f5efff;
        }

        .quick-card.orange {
          background: #fff4e7;
        }

        .quick-card.green {
          background: #edf9f2;
        }

        .quick-icon {
          width: 51px;
          height: 51px;
          border-radius: 12px;
          display: flex;
          justify-content: center;
          align-items: center;
          font-size: 25px;
          flex-shrink: 0;
        }

        .blue .quick-icon {
          background: #dceeff;
          color: #2276dc;
        }

        .purple .quick-icon {
          background: #eadcff;
          color: #7537d8;
        }

        .orange .quick-icon {
          background: #ffe6ca;
          color: #f07912;
        }

        .green .quick-icon {
          background: #d7f2e1;
          color: #06996c;
        }

        .quick-card div:nth-child(2) {
          display: flex;
          flex-direction: column;
          gap: 4px;
          flex: 1;
        }

        .quick-card strong {
          font-size: 15px;
        }

        .quick-card span {
          font-size: 12px;
          color: #58698f;
        }

        .quick-card b {
          font-size: 28px;
          font-weight: 400;
        }

        /* PROGRESS */

        .blue-icon {
          color: #2879db !important;
        }

        .progress-circles {
          display: flex;
          justify-content: space-around;
          align-items: center;
          padding: 5px 5px 0;
        }

        /* AI */

        .ai-panel {
          background: #e9f6ff;
          border: none;
          display: flex;
          justify-content: space-between;
          gap: 20px;
          overflow: hidden;
        }

        .ai-main {
          display: flex;
          gap: 15px;
          flex: 1;
        }

        .ai-icon {
          font-size: 40px;
          width: 55px;
          flex-shrink: 0;
        }

        .ai-main h2 {
          margin: 7px 0 7px;
          font-size: 23px;
          color: #10165e;
        }

        .ai-main p {
          margin: 0 0 16px;
          color: #40547c;
          line-height: 1.45;
          font-size: 14px;
          max-width: 390px;
        }

        .ai-button {
          display: inline-flex;
          align-items: center;
          gap: 25px;
          height: 46px;
          padding: 0 23px;
          border: 1.5px solid #1675e5;
          border-radius: 10px;
          color: #1269d2;
          text-decoration: none;
          font-weight: 700;
          background: white;
        }

        .suggestions {
          display: flex;
          flex-direction: column;
          justify-content: center;
          gap: 9px;
          min-width: 245px;
        }

        .suggestions span {
          background: white;
          padding: 9px 15px;
          border-radius: 16px;
          font-size: 12px;
          color: #43547a;
          box-shadow: 0 1px 5px rgba(50, 80, 110, 0.04);
        }

        /* CIRCLES */

        .circle-wrapper {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 7px;
        }

        .circle {
          width: 88px;
          height: 88px;
          min-width: 88px;
          min-height: 88px;
          flex-shrink: 0;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
          overflow: hidden;
        }

        .circle-inner {
          width: 72px;
          height: 72px;
          min-width: 72px;
          min-height: 72px;
          border-radius: 50%;
          background: #ffffff;
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
          z-index: 1;
        }

        .circle span {
          font-size: 17px;
          font-weight: 700;
          color: #11185e;
        }

        .circle-wrapper label {
          font-size: 14px;
          color: #151c5d;
        }

        /* LOADING */

        .dashboard-loading {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          font-family: Arial, Helvetica, sans-serif;
          color: #10165e;
          font-size: 20px;
        }

        /* RESPONSIVE */

        @media (max-width: 1200px) {

          .sidebar {
            width: 235px;
          }

          .dashboard-main {
            margin-left: 235px;
            width: calc(100% - 235px);
          }

          .hero-image {
            right: 15px;
            width: 390px;
          }

          .hero-content h1 {
            font-size: 35px;
          }

          .hero-content h2 {
            font-size: 21px;
          }

          .stats-grid {
            grid-template-columns: repeat(2, 1fr);
          }

        }

        @media (max-width: 900px) {

          .sidebar {
            width: 75px;
          }

          .logo-area {
            padding: 10px;
            justify-content: center;
          }

          .logo {
            width: 55px;
            object-fit: cover;
            object-position: left;
          }

          .nav-item {
            justify-content: center;
            padding: 0;
          }

          .nav-item span:last-child {
            display: none;
          }

          .sidebar-message {
            display: none;
          }

          .dashboard-main {
            margin-left: 75px;
            width: calc(100% - 75px);
          }

          .middle-grid,
          .bottom-grid {
            grid-template-columns: 1fr;
          }

          .hero-image {
            opacity: 0.35;
          }

        }

        @media (max-width: 650px) {

          .topbar {
            padding: 0 15px;
          }

          .search-box {
            width: 100%;
          }

          .topbar-right {
            display: none;
          }

          .dashboard-content {
            padding: 15px;
          }

          .stats-grid {
            grid-template-columns: 1fr;
          }

          .hero-card {
            min-height: 350px;
          }

          .hero-content {
            padding: 25px;
          }

          .hero-image {
            right: -60px;
            width: 330px;
            opacity: 0.3;
          }

          .learning-content {
            flex-direction: column;
            align-items: stretch;
          }

          .lesson-image {
            width: 100%;
          }

          .quick-grid {
            grid-template-columns: 1fr;
          }

          .progress-circles {
            flex-wrap: wrap;
            gap: 20px;
          }

          .ai-panel {
            flex-direction: column;
          }

          .suggestions {
            min-width: 0;
          }

        }



        /* =====================================================
           FINAL RESPONSIVE OVERRIDES
           Desktop -> tablet -> phone
        ===================================================== */

        .student-dashboard,
        .dashboard-main,
        .dashboard-content {
          max-width: 100%;
          overflow-x: hidden;
        }

        @media (max-width: 1100px) {
          .sidebar {
            width: 210px;
          }

          .dashboard-main {
            margin-left: 210px;
            width: calc(100% - 210px);
          }

          .topbar {
            padding: 0 20px;
          }

          .search-box {
            width: min(480px, 55vw);
          }

          .dashboard-content {
            padding: 18px;
          }

          .stats-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }

          .middle-grid,
          .bottom-grid {
            grid-template-columns: 1fr;
          }
        }

        @media (max-width: 800px) {
          .sidebar {
            width: 76px;
          }

          .logo-area {
            padding: 12px 8px;
            justify-content: center;
          }

          .logo {
            width: 48px;
            height: 48px;
            object-fit: cover;
            object-position: left;
          }

          .nav-item {
            justify-content: center;
            padding: 0;
            gap: 0;
          }

          .nav-item span:last-child {
            display: none;
          }

          .sidebar-message {
            display: none;
          }

          .dashboard-main {
            margin-left: 76px;
            width: calc(100% - 76px);
          }

          .hero-card {
            min-height: 250px;
          }

          .hero-content {
            max-width: 62%;
            padding: 24px;
          }

          .hero-content h1 {
            font-size: 34px;
          }

          .hero-content h2 {
            font-size: 20px;
          }

          .hero-content p {
            font-size: 15px;
          }

          .hero-image {
            width: 52%;
            right: -20px;
          }

          .learning-content {
            flex-wrap: wrap;
          }

          .lesson-info {
            min-width: 0;
          }
        }

        @media (max-width: 700px) {
          body {
            overflow-x: hidden;
          }

          .student-dashboard {
            display: block;
            min-height: 100vh;
            padding-bottom: 70px;
          }

          /* Full-width phone layout */
          .sidebar {
            position: fixed;
            left: 0;
            right: 0;
            top: auto;
            bottom: 0;
            width: 100%;
            height: 66px;
            min-height: 66px;
            overflow: hidden;
            border-right: 0;
            border-top: 1px solid #e4eaf2;
            box-shadow: 0 -8px 25px rgba(34, 68, 100, 0.08);
            display: block;
            z-index: 1000;
          }

          .logo-area,
          .sidebar-divider,
          .secondary-nav,
          .sidebar-message {
            display: none;
          }

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

          .main-nav .nav-item span:last-child {
            display: block;
            white-space: nowrap;
          }

          .main-nav .nav-icon {
            width: auto;
            font-size: 19px;
            line-height: 20px;
          }

          .dashboard-main {
            margin-left: 0;
            width: 100%;
            min-height: calc(100vh - 66px);
          }

          .topbar {
            position: sticky;
            top: 0;
            height: 64px;
            padding: 0 12px;
            gap: 8px;
            z-index: 100;
          }

          .search-box {
            flex: 1;
            width: auto;
            min-width: 0;
            height: 42px;
            padding: 0 11px;
            gap: 7px;
          }

          .search-box span {
            font-size: 22px;
          }

          .search-box input {
            font-size: 12px;
            min-width: 0;
          }

          .topbar-right {
            display: flex;
            flex-shrink: 0;
          }

          .notification-button,
          .topbar-divider {
            display: none;
          }

          .profile-area {
            display: flex;
            flex: 0 0 auto;
            gap: 4px;
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
            font-size: 15px;
          }

          .profile-toggle .profile-text {
            display: none;
          }

          .profile-toggle .arrow {
            margin-left: 0;
            font-size: 16px;
          }

          .profile-dropdown {
            position: fixed;
            top: 72px;
            right: 10px;
            min-width: 190px;
          }

          .avatar {
            width: 36px;
            height: 36px;
            font-size: 15px;
          }

          .dashboard-content {
            padding: 12px 12px 20px;
          }

          .hero-card {
            min-height: 300px;
            display: block;
            border-radius: 16px;
          }

          .hero-content {
            max-width: 100%;
            padding: 22px 20px;
            position: relative;
            z-index: 3;
          }

          .hero-content h1,
          .hero-content h1 span {
            font-size: 29px;
          }

          .hero-content h2 {
            font-size: 18px;
            max-width: 300px;
          }

          .hero-content p {
            font-size: 13px;
            line-height: 1.5;
            max-width: 290px;
          }

          .primary-button {
            min-height: 42px;
            padding: 11px 16px;
            font-size: 13px;
          }

          .hero-image {
            width: 70%;
            right: -8%;
            bottom: 0;
            opacity: 0.38;
          }

          .stats-grid {
            grid-template-columns: 1fr 1fr;
            gap: 10px;
            margin-top: 12px;
          }

          .stat-card {
            min-height: 82px;
            padding: 12px;
            gap: 9px;
            border-radius: 13px;
          }

          .stat-icon {
            width: 42px;
            height: 42px;
            border-radius: 11px;
            font-size: 22px;
          }

          .stat-card strong {
            font-size: 18px;
          }

          .stat-card span {
            font-size: 11px;
          }

          .middle-grid,
          .bottom-grid {
            grid-template-columns: 1fr;
            gap: 12px;
            margin-top: 12px;
          }

          .panel {
            padding: 14px;
            border-radius: 14px;
          }

          .panel-header h2 {
            font-size: 17px;
          }

          .panel-header a {
            font-size: 12px;
          }

          .learning-content {
            display: flex;
            flex-direction: column;
            gap: 12px;
          }

          .lesson-image {
            width: 100%;
            height: 145px;
          }

          .lesson-image img {
            width: 100%;
            height: 100%;
            object-fit: contain;
          }

          .lesson-info h3 {
            font-size: 18px;
          }

          .lesson-description,
          .lesson-meta,
          .progress-row {
            font-size: 12px;
          }

          .quick-grid {
            grid-template-columns: 1fr 1fr;
            gap: 8px;
          }

          .quick-card {
            min-height: 74px;
            padding: 10px;
            gap: 7px;
          }

          .quick-card strong {
            font-size: 12px;
          }

          .quick-card span {
            font-size: 9px;
          }

          .quick-icon {
            width: 34px;
            height: 34px;
            font-size: 17px;
          }

          .progress-circles {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 16px 8px;
          }

          .circle-wrapper {
            min-width: 0;
          }

          .ai-panel {
            flex-direction: column;
            gap: 16px;
          }

          .suggestions {
            width: 100%;
            min-width: 0;
          }

          .suggestions span {
            font-size: 10px;
          }
        }

        @media (max-width: 380px) {
          .main-nav .nav-item {
            font-size: 8px;
          }

          .main-nav .nav-icon {
            font-size: 17px;
          }

          .stats-grid {
            grid-template-columns: 1fr;
          }

          .quick-grid {
            grid-template-columns: 1fr;
          }
        }



        /* =====================================================
           DESKTOP SIDEBAR: SCROLL INDEPENDENTLY FROM THE PAGE
           Keep the mobile bottom navigation unchanged.
        ===================================================== */
        @media (min-width: 701px) {
          .sidebar {
            position: fixed !important;
            top: 0;
            bottom: 0;
            height: 100vh;
            height: 100dvh;
            max-height: 100dvh;
            min-height: 0;
            overflow-y: scroll !important;
            overflow-x: hidden !important;
            overscroll-behavior-y: contain;
            scrollbar-width: thin;
            scrollbar-color: #cbd5e1 transparent;
          }

          .sidebar > * {
            flex-shrink: 0;
          }
        }

      `}</style>

    </div>
  );
}


/* ================= PROGRESS CIRCLE ================= */

function ProgressCircle({
  percentage,
  label,
  className
}: {
  percentage: number;
  label: string;
  className: string;
}) {
  const safePercentage = Math.max(0, Math.min(100, percentage));

  const colorMap: Record<string, string> = {
    'circle-green': '#079c74',
    'circle-blue': '#2879df',
    'circle-purple': '#7843dd',
    'circle-orange': '#ff7517',
  };

  const color = colorMap[className] || '#079c74';

  return (
    <div className="circle-wrapper">

      <div
        className="circle"
        style={{
          background: `conic-gradient(
            ${color} 0 ${safePercentage}%,
            #e6ebf2 ${safePercentage}% 100%
          )`,
        }}
      >
        <div className="circle-inner">
          <span>{safePercentage}%</span>
        </div>
      </div>

      <label>
        {label}
      </label>

    </div>
  );
}
