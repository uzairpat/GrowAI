"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import { apiFetch } from "../../../lib/api";

type User = {
  id: number;
  role: string;
  username: string;
  email: string | null;
  full_name: string;
};

type Goal = {
  id: number;
  type: "savings" | "completion";
  title: string;
  targetAmount?: number;
  savedAmount?: number;
  targetActivities?: number;
  completedActivities?: number;
  active: boolean;
};

export default function ProgressPage() {
  const [showAllActivity, setShowAllActivity] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);

  const [lessonCompleted, setLessonCompleted] = useState(false);
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [scenarioCompleted, setScenarioCompleted] = useState(false);
  const [quizScore, setQuizScore] = useState(0);
  const [scenarioPoints, setScenarioPoints] = useState(0);
  const [scenarioBadgeEarned, setScenarioBadgeEarned] = useState(false);
  const [goalProgress, setGoalProgress] = useState(0);
  const [goalTitle, setGoalTitle] = useState("No Active Goal");

  useEffect(() => {
    const loadProgress = () => {
      let activeGoalProgress = 0;
      let activeGoalTitle = "No Active Goal";
      const storedGoals = window.localStorage.getItem("growais_goals");

      if (storedGoals) {
        try {
          const goals = JSON.parse(storedGoals);

          if (Array.isArray(goals) && goals.length > 0) {
            const activeGoal =
              goals.find((goal: Goal) => goal.active) || goals[0];

            activeGoalTitle = activeGoal?.title || "No Active Goal";

            if (activeGoal?.type === "savings") {
              const target = Number(activeGoal.targetAmount) || 0;
              const saved = Number(activeGoal.savedAmount) || 0;

              activeGoalProgress =
                target > 0
                  ? Math.min(Math.round((saved / target) * 100), 100)
                  : 0;
            } else if (activeGoal?.type === "completion") {
              const target = Number(activeGoal.targetActivities) || 0;
              const completed = Number(activeGoal.completedActivities) || 0;

              activeGoalProgress =
                target > 0
                  ? Math.min(Math.round((completed / target) * 100), 100)
                  : 0;
            }
          }
        } catch {
          activeGoalProgress = 0;
          activeGoalTitle = "No Active Goal";
        }
      }

      // Scenario completion/score are loaded from PostgreSQL below.
      setScenarioCompleted(false);
      setScenarioPoints(0);
      setScenarioBadgeEarned(false);
      setGoalProgress(activeGoalProgress);
      setGoalTitle(activeGoalTitle);
    };

    const loadUser = async () => {
      try {
        const data = await apiFetch("/api/auth/me");

        if (data.user.role !== "student") {
          window.location.href = "/login";
          return;
        }

        setUser(data.user);

        // Lesson progress is student-specific and comes from PostgreSQL.
        try {
          const lessonResult = await apiFetch(
            "/api/student/lessons/2/progress"
          );

          setLessonCompleted(
            lessonResult.progress?.status === "completed"
          );
        } catch (error) {
          console.error("Unable to load lesson progress:", error);
          setLessonCompleted(false);
        }

        // Quiz progress and score are student-specific and come from
        // this student's latest PostgreSQL attempt for Quiz 2.
        try {
          const quizResult = await apiFetch(
            "/api/student/quizzes/2/attempts/latest"
          );

          if (quizResult.attempt) {
            setQuizCompleted(true);

            const score = Number(quizResult.attempt.score);
            setQuizScore(Number.isFinite(score) ? score : 0);
          } else {
            setQuizCompleted(false);
            setQuizScore(0);
          }
        } catch (error) {
          console.error("Unable to load quiz progress:", error);
          setQuizCompleted(false);
          setQuizScore(0);
        }
        // Scenario progress and score come from PostgreSQL for the
        // logged-in student's latest Scenario 1 attempt.
        try {
          const scenarioResult = await apiFetch(
            "/api/student/scenarios/1/attempts/latest"
          );

          if (scenarioResult.attempt) {
            const completed = Boolean(
              scenarioResult.attempt.completed
            );
            const score = Number(
              scenarioResult.attempt.score
            );

            setScenarioCompleted(completed);
            setScenarioPoints(
              Number.isFinite(score) ? score : 0
            );
            setScenarioBadgeEarned(completed);
          } else {
            setScenarioCompleted(false);
            setScenarioPoints(0);
            setScenarioBadgeEarned(false);
          }
        } catch (error) {
          console.error(
            "Unable to load scenario progress:",
            error
          );
          setScenarioCompleted(false);
          setScenarioPoints(0);
          setScenarioBadgeEarned(false);
        }
      } catch {
        window.location.href = "/login";
      } finally {
        setLoading(false);
      }
    };

    loadProgress();
    loadUser();

    const handleStorageChange = () => {
      loadProgress();
    };

    window.addEventListener("storage", handleStorageChange);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
    };
  }, []);

  const lessonProgress = lessonCompleted ? 100 : 0;
  const quizProgress = quizCompleted ? 100 : 0;
  const scenarioProgress = scenarioCompleted ? 100 : 0;

  const overallProgress = Math.round(
    (lessonProgress + quizProgress + scenarioProgress + goalProgress) / 4
  );

  const learningActivitiesCompleted =
    Number(lessonCompleted) +
    Number(quizCompleted) +
    Number(scenarioCompleted);

  const totalLearningActivities = 3;
  const totalPoints = scenarioPoints + quizScore * 10;
  const badgesUnlocked = scenarioBadgeEarned ? 1 : 0;

  const activities = [
    ...(lessonCompleted
      ? [{
          icon: "▣",
          title: "Completed lesson: Budgeting Basics",
          time: "Completed",
          type: "lesson",
        }]
      : []),
    ...(quizCompleted
      ? [{
          icon: "▤",
          title: `Scored ${Math.round((quizScore / 5) * 100)}% on Budgeting Quiz`,
          time: "Completed",
          type: "quiz",
        }]
      : []),
    ...(scenarioCompleted
      ? [{
          icon: "🎮",
          title: "Completed scenario: Weekend Spending",
          time: "Completed",
          type: "scenario",
        }]
      : []),
    ...(goalTitle !== "No Active Goal"
      ? [{
          icon: "◎",
          title: `Active goal: ${goalTitle}`,
          time: `${goalProgress}% complete`,
          type: "goal",
        }]
      : []),
  ];

  if (loading) {
    return (
      <div className="dashboard-loading">
        Loading your progress...
      </div>
    );
  }

  const studentName = user?.full_name || "Student";

  const handleLogout = async () => {
    try {
      await apiFetch("/api/auth/logout", {
        method: "POST",
      });
    } finally {
      window.location.href = "/login";
    }
  };

  return (
    <div className="progress-page">
      {/* =====================================================
          UPDATED STUDENT HEADER
      ===================================================== */}

      <header className="progress-header">
        <div className="progress-search">
          <span className="search-icon">⌕</span>

          <input
            type="text"
            placeholder="Search lessons, quizzes, or topics..."
          />
        </div>

        <div className="progress-profile-area">
          <button
            className="notification"
            type="button"
            aria-label="Notifications"
            title="Notifications"
          >
            🔔
            <span />
          </button>

          <div className="top-divider" />

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
                <strong>Hi, {studentName.split(" ")[0]}</strong>
                <small>Student</small>
              </div>

              <span className="profile-arrow" aria-hidden="true">
                ⌄
              </span>
            </button>

            {profileMenuOpen && (
              <div className="profile-dropdown" role="menu">
                <div className="profile-dropdown-user">
                  <strong>{studentName}</strong>
                  <span>Student</span>
                </div>

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
                  onClick={handleLogout}
                >
                  Log Out
                </button>
              </div>
            )}
          </div>
        </div>
      </header>


      {/* =====================================================
          UPDATED STUDENT SIDEBAR
      ===================================================== */}

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

          <a
            href="/student/progress"
            className="nav-item active"
          >
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

          <a href="/student/profile" className="nav-item">
            <span className="nav-icon">♙</span>
            <span>Profile</span>
          </a>

          <a href="/student/settings" className="nav-item">
            <span className="nav-icon">⚙</span>
            <span>Settings</span>
          </a>

          <a href="/student/help" className="nav-item">
            <span className="nav-icon">?</span>
            <span>Help</span>
          </a>

          <button
            type="button"
            className="nav-item logout-button"
            onClick={handleLogout}
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


      {/* =====================================================
          MAIN
      ===================================================== */}

      <main className="progress-main">

        {/* HERO */}

        <section className="progress-hero">
          <Image
            src="/assets/progress-hero-reference(1).png"
            alt="My Progress"
            fill
            priority
            sizes="(max-width: 700px) 100vw, 1000px"
            className="progress-hero-image"
          />
        </section>

        {/* MAIN CONTENT */}

        <section className="progress-layout">

          {/* LEFT */}

          <div className="progress-left">

            {/* OVERALL PROGRESS */}

            <section className="card overall-card">
              <h2>Overall Progress</h2>

              <div className="overall-content">

                <div
                  className="progress-ring"
                  style={{
                    background: `conic-gradient(
                      #05a779 0deg ${overallProgress * 3.6}deg,
                      #e8edf5 ${overallProgress * 3.6}deg 360deg
                    )`,
                  }}
                >
                  <div className="ring-inner">
                    <strong>{overallProgress}%</strong>
                    <span>Complete</span>
                  </div>
                </div>

                <div className="overall-details">
                  <h3>
                    {overallProgress >= 100
                      ? `Excellent work, ${studentName.split(" ")[0]}!`
                      : `Great Progress, ${studentName.split(" ")[0]}!`}
                  </h3>

                  <p>
                    You&apos;ve completed {learningActivitiesCompleted} of{" "}
                    {totalLearningActivities} learning activities.
                    <br />
                    Keep going to build your financial knowledge and skills!
                  </p>

                  <div className="stat-row">

                    <div className="stat-box">
                      <span className="stat-icon star">★</span>
                      <div>
                        <strong>{totalPoints}</strong>
                        <small>Points Earned</small>
                      </div>
                    </div>

                    <div className="stat-box">
                      <span className="stat-icon trophy">🏆</span>
                      <div>
                        <strong>{badgesUnlocked}</strong>
                        <small>Badges Unlocked</small>
                      </div>
                    </div>

                    <div className="stat-box">
                      <span className="stat-icon bars">▥</span>
                      <div>
                        <strong>{learningActivitiesCompleted} / {totalLearningActivities}</strong>
                        <small>Activities Completed</small>
                      </div>
                    </div>

                  </div>
                </div>

              </div>
            </section>

            {/* PROGRESS BY CATEGORY */}

            <section className="card category-card">
              <h2>Progress by Category</h2>

              <div className="category-grid">

                <div className="category lessons">
                  <div className="category-icon">▣</div>
                  <h3>Lessons</h3>
                  <strong>{lessonProgress}%</strong>

                  <div className="category-bar">
                    <span style={{ width: `${lessonProgress}%` }} />
                  </div>

                  <p>{lessonCompleted ? "1 of 1 completed" : "0 of 1 completed"}</p>

                  <Link href="/student/lessons">
                    Continue Learning <span>→</span>
                  </Link>
                </div>

                <div className="category quizzes">
                  <div className="category-icon">▤</div>
                  <h3>Quizzes</h3>
                  <strong>{quizProgress}%</strong>

                  <div className="category-bar">
                    <span style={{ width: `${quizProgress}%` }} />
                  </div>

                  <p>{quizCompleted ? "1 of 1 completed" : "0 of 1 completed"}</p>

                  <Link href="/student/quiz">
                    Take a Quiz <span>→</span>
                  </Link>
                </div>

                <div className="category scenarios">
                  <div className="category-icon">🎮</div>
                  <h3>Scenarios</h3>
                  <strong>{scenarioProgress}%</strong>

                  <div className="category-bar">
                    <span style={{ width: `${scenarioProgress}%` }} />
                  </div>

                  <p>{scenarioCompleted ? "1 of 1 completed" : "0 of 1 completed"}</p>

                  <Link href="/student/scenarios">
                    Try a Scenario <span>→</span>
                  </Link>
                </div>

                <div className="category goals">
                  <div className="category-icon">◎</div>
                  <h3>Goals</h3>
                  <strong>{goalProgress}%</strong>

                  <div className="category-bar">
                    <span style={{ width: `${goalProgress}%` }} />
                  </div>

                  <p>
                    {goalTitle === "No Active Goal"
                      ? "No active goal"
                      : `${goalProgress}% of active goal completed`}
                  </p>

                  <Link href="/student/goals">
                    Manage Goals <span>→</span>
                  </Link>
                </div>

              </div>
            </section>

            {/* BOTTOM GRID */}

            <div className="bottom-grid">

              {/* RECENT ACTIVITY */}

              <section className="card activity-card">
                <div className="section-heading">
                  <h2>Recent Activity</h2>

                  <button
                    onClick={() =>
                      setShowAllActivity(!showAllActivity)
                    }
                  >
                    {showAllActivity ? "Show Less" : "View All"} →
                  </button>
                </div>

                <div className="activity-list">
                  {(showAllActivity
                    ? [...activities, {
                        icon: "★",
                        title: "Earned the First Lesson badge",
                        time: "1 week ago",
                        type: "badge",
                      }]
                    : activities
                  ).map((activity, index) => (
                    <div
                      className="activity-item"
                      key={`${activity.title}-${index}`}
                    >
                      <div
                        className={`activity-icon ${activity.type}`}
                      >
                        {activity.icon}
                      </div>

                      <span className="activity-title">
                        {activity.title}
                      </span>

                      <span className="activity-time">
                        {activity.time}
                      </span>
                    </div>
                  ))}
                </div>
              </section>

              {/* ACHIEVEMENTS */}

              <section className="card achievement-card">
                <div className="section-heading">
                  <h2>Achievements</h2>

                  <button>
                    View All →
                  </button>
                </div>

                <div className="achievement-list">

                  <div className="achievement-item">
                    <div className="achievement-icon gold">
                      ★
                    </div>

                    <div>
                      <strong>First Lesson</strong>
                      <p>Completed your first lesson</p>
                    </div>

                    <span>1 Sep 2026</span>
                  </div>

                  <div className="achievement-item">
                    <div className="achievement-icon blue">
                      🏆
                    </div>

                    <div>
                      <strong>Quiz Star</strong>
                      <p>Scored 80% or higher on a quiz</p>
                    </div>

                    <span>3 Sep 2026</span>
                  </div>

                  <div className="achievement-item">
                    <div className="achievement-icon purple">
                      🎮
                    </div>

                    <div>
                      <strong>Scenario Explorer</strong>
                      <p>Completed your first scenario</p>
                    </div>

                    <span>5 Sep 2026</span>
                  </div>

                </div>
              </section>

            </div>

          </div>


          {/* RIGHT */}

          <aside className="progress-right">

            {/* QUOTE */}

            <section className="quote-card">
              <div className="quote-mark">“</div>

              <strong>
                “Progress, no matter
                <br />
                how small, is still progress.”
              </strong>

              <span>— GrowAIs</span>
            </section>


            {/* KEEP GOING */}

            <section className="side-card keep-going">

              <div className="side-icon">
                🚀
              </div>

              <h2>
                Keep Going!
              </h2>

              <p>
                You&apos;re on the right track. Continue
                learning to unlock more lessons,
                badges, and achieve your goals!
              </p>

              <Link
                href="/student/lessons"
                className="primary-button"
              >
                Continue Learning
                <span>→</span>
              </Link>

            </section>


            {/* HELP */}

            <section className="side-card help-card">

              <div className="side-icon">
                🤖
              </div>

              <h2>
                Need Help?
              </h2>

              <p>
                Have questions about your progress
                or what to do next? Ask our AI
                Assistant anytime!
              </p>

              <Link
                href="/student/ai-assistant"
                className="outline-button"
              >
                Ask AI Assistant
                <span>→</span>
              </Link>

            </section>


            {/* FUTURE */}

            <section className="future-card">

              <div className="future-content">
                <span className="future-icon">🌱</span>

                <div>
                  <h2>
                    Your Future Starts Today
                  </h2>

                  <p>
                    Every lesson, quiz, and goal brings
                    you one step closer to a brighter
                    tomorrow.
                  </p>
                </div>
              </div>

              <img
                src="/assets/dashboard-plant.png"
                alt=""
              />

            </section>

          </aside>

        </section>

      </main>


      {/* =====================================================
          STYLES
      ===================================================== */}

      <style jsx>{`

        * {
          box-sizing: border-box;
        }

        .progress-page {
          min-height: 100vh;
          background: #ffffff;
          color: #10165c;
          font-family: Arial, Helvetica, sans-serif;
          overflow-x: hidden;
        }


        /* =====================================================
           UPDATED STUDENT HEADER
        ===================================================== */

        .progress-header {
          position: fixed;
          top: 0;
          left: 280px;
          right: 0;
          height: 88px;
          background: #ffffff;
          border-bottom: 1px solid #e7edf5;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 32px;
          z-index: 2000;
        }

        .progress-search {
          width: 515px;
          height: 48px;
          background: #f3f6fb;
          border-radius: 12px;
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 0 16px;
        }

        .progress-search input {
          width: 100%;
          border: none;
          outline: none;
          background: transparent;
          color: #18245d;
          font-size: 16px;
        }

        .progress-search input::placeholder {
          color: #8290ad;
        }

        .search-icon {
          font-size: 29px;
          color: #5b6b91;
          transform: rotate(-20deg);
          flex-shrink: 0;
        }

        .progress-profile-area {
          display: flex;
          align-items: center;
          gap: 20px;
        }

        .notification {
          position: relative;
          width: 38px;
          height: 42px;
          border: none;
          background: transparent;
          color: #46577d;
          font-size: 29px;
          cursor: pointer;
        }

        .notification span {
          position: absolute;
          width: 9px;
          height: 9px;
          background: #f0444a;
          border-radius: 50%;
          top: 2px;
          right: 0;
          border: 2px solid #ffffff;
        }

        .top-divider {
          width: 1px;
          height: 42px;
          background: #e2e7ef;
        }

        .profile-area {
          position: relative;
          display: flex;
          align-items: center;
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

        .avatar {
          width: 44px;
          height: 44px;
          border-radius: 50%;
          background: #0c9a72;
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 700;
          font-size: 17px;
          flex-shrink: 0;
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
          font-size: 14px;
          color: #59698e;
        }

        .profile-arrow {
          margin-left: auto;
          font-size: 20px;
        }

        .profile-dropdown {
          position: absolute;
          top: calc(100% + 8px);
          right: 0;
          min-width: 205px;
          padding: 8px;
          background: #ffffff;
          border: 1px solid #e1e8f0;
          border-radius: 14px;
          box-shadow: 0 12px 32px rgba(25, 45, 80, 0.16);
          z-index: 5000;
        }

        .profile-dropdown-user {
          padding: 10px 12px 12px;
          margin-bottom: 4px;
          border-bottom: 1px solid #edf1f5;
          display: flex;
          flex-direction: column;
          gap: 3px;
        }

        .profile-dropdown-user strong {
          color: #17215d;
          font-size: 14px;
        }

        .profile-dropdown-user span {
          color: #657397;
          font-size: 12px;
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


        /* =====================================================
           UPDATED STUDENT SIDEBAR
        ===================================================== */

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
          z-index: 2100;
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

        /* =====================================================
           MAIN
        ===================================================== */

        .progress-main {
          margin-left: 280px;
          padding: 92px 32px 40px;
          min-height: 100vh;
        }


        /* =====================================================
           HERO
        ===================================================== */

        .progress-hero {
          position: relative;
          width: 100%;
          height: 175px;
          border-radius: 18px;
          overflow: hidden;
          margin-bottom: 12px;
          background: #f4fbf8;
        }

        .progress-hero-image {
          object-fit: cover;
          object-position: center;
        }


        /* =====================================================
           LAYOUT
        ===================================================== */

        .progress-layout {
          display: grid;
          grid-template-columns: minmax(0, 1fr) 310px;
          gap: 18px;
          align-items: start;
        }

        .progress-left,
        .progress-right {
          min-width: 0;
        }

        .progress-left {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .progress-right {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .card {
          border: 1px solid #e0e7f0;
          border-radius: 15px;
          background: #ffffff;
        }


        /* =====================================================
           OVERALL
        ===================================================== */

        .overall-card {
          padding: 15px 20px 18px;
        }

        .overall-card > h2,
        .category-card > h2,
        .section-heading h2 {
          margin: 0;
          color: #10165c;
          font-size: 21px;
        }

        .overall-content {
          display: flex;
          align-items: center;
          gap: 30px;
          margin-top: 12px;
        }

        .progress-ring {
          width: 178px;
          height: 178px;
          border-radius: 50%;
          flex-shrink: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          transform: rotate(-45deg);
        }

        .ring-inner {
          width: 138px;
          height: 138px;
          border-radius: 50%;
          background: #ffffff;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          transform: rotate(45deg);
        }

        .ring-inner strong {
          font-size: 34px;
          color: #10165c;
        }

        .ring-inner span {
          margin-top: 2px;
          font-size: 15px;
          color: #40538b;
        }

        .overall-details {
          flex: 1;
          min-width: 0;
        }

        .overall-details h3 {
          margin: 0 0 4px;
          color: #00956f;
          font-size: 24px;
        }

        .overall-details > p {
          margin: 0;
          color: #40538b;
          font-size: 15px;
          line-height: 1.4;
        }

        .stat-row {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 12px;
          margin-top: 15px;
        }

        .stat-box {
          min-height: 65px;
          border-radius: 10px;
          background: #f0f7ff;
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 10px 12px;
        }

        .stat-icon {
          font-size: 30px;
        }

        .stat-icon.star {
          color: #f7b500;
        }

        .stat-icon.bars {
          color: #008f70;
        }

        .stat-box strong {
          display: block;
          color: #10165c;
          font-size: 18px;
        }

        .stat-box small {
          display: block;
          margin-top: 2px;
          color: #40538b;
          font-size: 12px;
        }


        /* =====================================================
           CATEGORY
        ===================================================== */

        .category-card {
          padding: 14px 20px 18px;
        }

        .category-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 14px;
          margin-top: 9px;
        }

        .category {
          min-height: 160px;
          border-radius: 12px;
          padding: 14px 16px;
        }

        .category.lessons {
          background: #e9faf4;
        }

        .category.quizzes {
          background: #edf5ff;
        }

        .category.scenarios {
          background: #f3efff;
        }

        .category.goals {
          background: #fff8e8;
        }

        .category-icon {
          float: left;
          margin-right: 9px;
          font-size: 28px;
        }

        .category h3 {
          margin: 2px 0 0;
          color: #10165c;
          font-size: 15px;
        }

        .category > strong {
          display: block;
          clear: both;
          margin-top: 6px;
          color: #10165c;
          font-size: 23px;
        }

        .category-bar {
          width: 100%;
          height: 12px;
          margin-top: 8px;
          border-radius: 20px;
          background: rgba(100, 120, 160, 0.12);
          overflow: hidden;
        }

        .category-bar span {
          display: block;
          height: 100%;
          border-radius: inherit;
          background: #05a779;
        }

        .quizzes .category-bar span {
          background: #347ce5;
        }

        .scenarios .category-bar span {
          background: #773de0;
        }

        .goals .category-bar span {
          background: #f0a000;
        }

        .category p {
          margin: 7px 0;
          color: #52638d;
          font-size: 12px;
        }

        .category a {
          color: #008f70;
          text-decoration: none;
          font-size: 12px;
          font-weight: 700;
        }

        .quizzes a {
          color: #1261c7;
        }

        .scenarios a {
          color: #6932c6;
        }

        .goals a {
          color: #d47c00;
        }

        .category a span {
          margin-left: 7px;
          font-size: 16px;
        }


        /* =====================================================
           BOTTOM GRID
        ===================================================== */

        .bottom-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 14px;
        }

        .activity-card,
        .achievement-card {
          padding: 13px 18px;
        }

        .section-heading {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 10px;
          margin-bottom: 8px;
        }

        .section-heading button {
          border: none;
          background: transparent;
          color: #006cff;
          cursor: pointer;
          font-size: 12px;
          font-weight: 600;
        }

        .activity-list,
        .achievement-list {
          display: flex;
          flex-direction: column;
        }

        .activity-item {
          min-height: 43px;
          border-top: 1px solid #edf0f5;
          display: flex;
          align-items: center;
          gap: 9px;
        }

        .activity-item:first-child {
          border-top: none;
        }

        .activity-icon {
          width: 34px;
          height: 34px;
          border-radius: 9px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          font-size: 17px;
        }

        .activity-icon.lesson {
          background: #e5f8f1;
          color: #008f70;
        }

        .activity-icon.quiz {
          background: #eaf3ff;
          color: #1261c7;
        }

        .activity-icon.scenario {
          background: #f1ebff;
          color: #6932c6;
        }

        .activity-icon.goal {
          background: #fff2df;
          color: #e26f00;
        }

        .activity-icon.badge {
          background: #fff3ca;
          color: #e49b00;
        }

        .activity-title {
          flex: 1;
          min-width: 0;
          color: #253b77;
          font-size: 12px;
        }

        .activity-time {
          color: #68779d;
          font-size: 11px;
          white-space: nowrap;
        }


        /* ACHIEVEMENTS */

        .achievement-item {
          min-height: 50px;
          border-top: 1px solid #edf0f5;
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .achievement-item:first-child {
          border-top: none;
        }

        .achievement-icon {
          width: 40px;
          height: 40px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 22px;
          flex-shrink: 0;
        }

        .achievement-icon.gold {
          background: #fff1ca;
          color: #eaa500;
        }

        .achievement-icon.blue {
          background: #e8f3ff;
          color: #2377d8;
        }

        .achievement-icon.purple {
          background: #f0eaff;
          color: #6e39d4;
        }

        .achievement-item div:nth-child(2) {
          flex: 1;
          min-width: 0;
        }

        .achievement-item strong {
          display: block;
          color: #10165c;
          font-size: 13px;
        }

        .achievement-item p {
          margin: 2px 0 0;
          color: #52638d;
          font-size: 10px;
        }

        .achievement-item > span {
          color: #68779d;
          font-size: 10px;
          white-space: nowrap;
        }


        /* =====================================================
           RIGHT COLUMN
        ===================================================== */

        .quote-card {
          min-height: 132px;
          border-radius: 15px;
          background: #e4faf3;
          padding: 17px 22px;
        }

        .quote-mark {
          color: #16bc8c;
          font-size: 42px;
          line-height: 25px;
          font-weight: 700;
        }

        .quote-card strong {
          display: block;
          margin-left: 42px;
          color: #10165c;
          font-size: 15px;
          line-height: 1.45;
        }

        .quote-card span {
          display: block;
          margin: 10px 0 0 42px;
          color: #40538b;
          font-size: 12px;
        }

        .side-card {
          border: 1px solid #e0e7f0;
          border-radius: 15px;
          padding: 19px 18px;
        }

        .keep-going {
          background: #ffffff;
        }

        .side-icon {
          float: left;
          margin-right: 10px;
          font-size: 30px;
        }

        .side-card h2 {
          margin: 4px 0 10px;
          color: #10165c;
          font-size: 19px;
        }

        .side-card p {
          clear: both;
          margin: 10px 0 15px;
          color: #40538b;
          font-size: 13px;
          line-height: 1.45;
        }

        .primary-button,
        .outline-button {
          width: 100%;
          min-height: 47px;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 18px;
          text-decoration: none;
          font-size: 14px;
          font-weight: 700;
        }

        .primary-button {
          background: #05a779;
          color: white;
        }

        .outline-button {
          border: 1px solid #006cff;
          background: #ffffff;
          color: #006cff;
        }

        .primary-button span,
        .outline-button span {
          font-size: 20px;
        }

        .help-card {
          background: #f2f8ff;
        }

        .future-card {
          min-height: 185px;
          position: relative;
          overflow: hidden;
          border-radius: 15px;
          padding: 18px;
          background: #e5faf2;
        }

        .future-content {
          position: relative;
          z-index: 2;
          display: flex;
          gap: 12px;
        }

        .future-icon {
          font-size: 37px;
        }

        .future-card h2 {
          margin: 2px 0 8px;
          color: #10165c;
          font-size: 17px;
        }

        .future-card p {
          margin: 0;
          color: #40538b;
          font-size: 12px;
          line-height: 1.45;
        }

        .future-card > img {
          position: absolute;
          width: 90px;
          height: 90px;
          right: 8px;
          bottom: -12px;
          object-fit: contain;
        }


        /* =====================================================
           TABLET
        ===================================================== */

        @media (max-width: 1200px) {

          .sidebar {
            width: 230px;
          }

          .progress-header {
            left: 230px;
          }

          .progress-main {
            margin-left: 230px;
            padding-left: 20px;
            padding-right: 20px;
          }

          .progress-layout {
            grid-template-columns: minmax(0, 1fr) 270px;
          }

          .category-grid {
            grid-template-columns: repeat(2, 1fr);
          }

          .stat-row {
            grid-template-columns: repeat(3, 1fr);
          }

        }


        @media (max-width: 1000px) {

          .progress-layout {
            grid-template-columns: 1fr;
          }

          .progress-right {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
          }

          .quote-card {
            grid-column: span 1;
          }

          .future-card {
            grid-column: span 1;
          }

        }


        /* =====================================================
           MOBILE
        ===================================================== */

        @media (max-width: 700px) {

          .progress-header {
            left: 0;
            right: 0;
            width: 100%;
            height: 64px;
            padding: 0 12px;
            gap: 8px;
          }

          .progress-search {
            flex: 1;
            width: auto;
            min-width: 0;
            height: 42px;
            padding: 0 10px;
            gap: 7px;
          }

          .progress-search input {
            min-width: 0;
            font-size: 11px;
          }

          .search-icon {
            font-size: 19px;
          }

          .progress-profile-area {
            gap: 0;
            flex-shrink: 0;
          }

          .notification,
          .top-divider,
          .profile-text,
          .profile-arrow {
            display: none;
          }

          .profile {
            min-width: 0;
            gap: 0;
          }

          .avatar {
            width: 38px;
            height: 38px;
            font-size: 15px;
          }

          .profile-dropdown {
            position: fixed;
            top: 72px;
            right: 10px;
            min-width: 195px;
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
            max-height: 66px;
            border: 0;
            border-top: 1px solid #e4eaf2;
            background: #ffffff;
            box-shadow: 0 -8px 25px rgba(34, 68, 100, 0.08);
            display: block;
            overflow: hidden;
            z-index: 3500;
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
            padding: 3px 2px;
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
            height: 60px;
            margin: 0;
            padding: 3px 1px;
            border-radius: 8px;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            gap: 2px;
            font-size: 8px;
            line-height: 1.1;
            text-align: center;
          }

          .main-nav .nav-item span:last-child {
            display: block;
            max-width: 100%;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
          }

          .main-nav .nav-icon {
            width: auto;
            min-width: 0;
            font-size: 18px;
            line-height: 20px;
          }


          html,
          body {
            width: 100%;
            max-width: 100%;
            overflow-x: hidden;
          }

          .progress-page {
            width: 100%;
            min-width: 0;
            padding-bottom: 72px;
          }

          .progress-header {
            position: fixed;
            left: 0;
            right: 0;
            top: 0;
            width: 100%;
            height: 64px;
            padding: 0 12px;
            gap: 8px;
            z-index: 2000;
          }

          .progress-search {
            flex: 1;
            width: auto;
            min-width: 0;
            height: 42px;
            padding: 0 10px;
            gap: 7px;
          }

          .progress-search input {
            min-width: 0;
            font-size: 11px;
          }

          .search-icon {
            font-size: 19px;
          }

          .progress-profile-area {
            display: flex;
            flex-shrink: 0;
          }

          .notification,
          .top-divider,
          .profile-text,
          .profile-arrow {
            display: none;
          }

          .profile {
            gap: 0;
          }

          .avatar {
            width: 38px;
            height: 38px;
            font-size: 15px;
          }


          /* MOBILE NAV */

          .sidebar {
            position: fixed;
            left: 0;
            right: 0;
            top: auto;
            bottom: 0;
            width: 100%;
            height: 66px;
            min-height: 66px;
            border: 0;
            border-top: 1px solid #e4eaf2;
            background: #ffffff;
            box-shadow: 0 -8px 25px rgba(34, 68, 100, 0.08);
            display: block;
            z-index: 3000;
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
            padding: 3px 2px;
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
            height: 60px;
            margin: 0;
            padding: 3px 1px;
            border-radius: 8px;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            gap: 2px;
            font-size: 8px;
            line-height: 1.1;
            text-align: center;
          }

          .main-nav .nav-item span:last-child {
            display: block;
            max-width: 100%;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
          }

          .main-nav .nav-icon {
            width: auto;
            min-width: 0;
            font-size: 18px;
            line-height: 20px;
          }


          /* MAIN */

          .progress-main {
            margin-left: 0;
            width: 100%;
            max-width: 100%;
            padding: 76px 12px 82px;
          }

          .progress-hero {
            height: 190px;
            border-radius: 14px;
          }

          .progress-hero-image {
            object-position: center;
          }


          /* OVERALL */

          .overall-card {
            padding: 14px;
          }

          .overall-card > h2,
          .category-card > h2,
          .section-heading h2 {
            font-size: 18px;
          }

          .overall-content {
            flex-direction: column;
            gap: 15px;
          }

          .progress-ring {
            width: 150px;
            height: 150px;
          }

          .ring-inner {
            width: 116px;
            height: 116px;
          }

          .ring-inner strong {
            font-size: 29px;
          }

          .overall-details {
            width: 100%;
            text-align: center;
          }

          .overall-details h3 {
            font-size: 21px;
          }

          .overall-details > p {
            font-size: 12px;
          }

          .stat-row {
            grid-template-columns: 1fr;
          }

          .stat-box {
            justify-content: center;
          }


          /* CATEGORIES */

          .category-card {
            padding: 14px;
          }

          .category-grid {
            grid-template-columns: 1fr 1fr;
            gap: 8px;
          }

          .category {
            padding: 11px;
            min-height: 155px;
          }

          .category-icon {
            font-size: 22px;
          }

          .category h3 {
            font-size: 13px;
          }

          .category > strong {
            font-size: 21px;
          }

          .category p,
          .category a {
            font-size: 10px;
          }


          /* BOTTOM */

          .bottom-grid {
            grid-template-columns: 1fr;
          }

          .activity-card,
          .achievement-card {
            padding: 13px;
          }

          .activity-title {
            font-size: 11px;
          }


          /* RIGHT */

          .progress-right {
            display: flex;
            flex-direction: column;
            gap: 10px;
          }

          .quote-card,
          .side-card,
          .future-card {
            width: 100%;
          }

          .future-card {
            min-height: 150px;
          }

        }


        /* =====================================================
           SMALL PHONES
        ===================================================== */

        @media (max-width: 380px) {

          .progress-main {
            padding-left: 10px;
            padding-right: 10px;
          }

          .progress-hero {
            height: 155px;
          }

          .category-grid {
            grid-template-columns: 1fr;
          }

          .main-nav .nav-item {
            font-size: 7px;
          }

          .main-nav .nav-icon {
            font-size: 17px;
          }

        }

      `}</style>
    </div>
  );
}
