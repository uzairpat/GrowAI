'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { apiFetch } from '../../../../../lib/api';

type User = {
  id: number;
  role: string;
  username: string;
  email: string | null;
  full_name: string;
};

export default function ScenarioResultPage() {
  const [answers, setAnswers] = useState({
    1: "",
    2: "",
  });

  const [user, setUser] = useState<User | null>(null);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [resultLoading, setResultLoading] = useState(true);
  const [earnedPoints, setEarnedPoints] = useState(0);

  const handleLogout = async () => {
    try {
      await apiFetch("/api/auth/logout", {
        method: "POST",
      });
    } finally {
      window.location.href = "/login";
    }
  };

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

  useEffect(() => {
    const loadScenarioResult = async () => {
      try {
        const result = await apiFetch(
          "/api/student/scenarios/1/attempts/latest"
        );

        if (!result.attempt) {
          window.location.href = "/student/scenarios";
          return;
        }

        const savedAnswers = {
          1: "",
          2: "",
        };

        for (const response of result.responses || []) {
          const choiceOrder = Number(response.choice_order);

          if (choiceOrder >= 1 && choiceOrder <= 3) {
            savedAnswers[1] =
              response.response_data?.selected_option ||
              String.fromCharCode(64 + choiceOrder);
          } else if (choiceOrder >= 4 && choiceOrder <= 6) {
            savedAnswers[2] =
              response.response_data?.selected_option ||
              String.fromCharCode(64 + (choiceOrder - 3));
          }
        }

        setAnswers(savedAnswers);
        setEarnedPoints(Number(result.attempt.score) || 0);
      } catch (error) {
        console.error("Unable to load scenario result:", error);
        window.location.href = "/student/scenarios";
      } finally {
        setResultLoading(false);
      }
    };

    loadScenarioResult();
  }, []);

  const correctAnswers: Record<number, string> = {
    1: "B",
    2: "B",
  };

  const questions = [
    {
      number: 1,
      question: "What would you do?",
      options: {
        A: "Spend most of the money on entertainment",
        B: "Set a spending limit and save the rest",
        C: "Spend everything now",
      },
    },
    {
      number: 2,
      question: "Your friends suggest an expensive dinner. What would you do?",
      options: {
        A: "Agree and spend freely",
        B: "Suggest a cheaper option",
        C: "Use your savings for dinner",
      },
    },
  ];

  const score = Math.round(earnedPoints / 20);
  const percentage = Math.min(
    Math.round((earnedPoints / 40) * 100),
    100
  );
  const points = earnedPoints;

  const studentName = user?.full_name || "Student";
  const firstName = studentName.split(" ")[0] || "Student";

  if (resultLoading) {
    return (
      <div className="scenario-result-page">
        Loading your scenario result...
      </div>
    );
  }

  return (
    <div className="scenario-result-page">

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

          <a
            href="/student/scenarios"
            className="nav-item active"
          >
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
          UPDATED STUDENT HEADER
      ===================================================== */}

      <header className="quiz-header">
        <div className="quiz-search">
          <span className="search-icon">⌕</span>

          <input
            type="text"
            placeholder="Search lessons, quizzes, or topics..."
          />
        </div>

        <div className="quiz-profile-area">
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
                <strong>Hi, {firstName}</strong>
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
          MAIN CONTENT
      ===================================================== */}

      <main className="result-main">

        {/* TOP SCENARIO HEADER */}

        <section className="scenario-top">

          <Link
            href="/student/scenarios/1"
            className="back-link"
          >
            ← Back to Scenario
          </Link>

          <div className="scenario-heading-row">

            <div className="scenario-info">

              <div className="scenario-thumbnail">

                <img
                  src="/assets/weekend-spending.png"
                  alt="Weekend Spending"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                  }}
                />

              </div>

              <div className="scenario-title">

                <span className="eyebrow">
                  WEEKEND SPENDING
                </span>

                <h1>
                  Weekend Spending
                </h1>

                <p>
                  Scenario 1 of 3
                </p>

                <div className="difficulty">
                  <span>▮▮▮</span>
                  Beginner
                </div>

              </div>

            </div>


            {/* HERO */}

            <div className="scenario-hero">

              <img
                src="/assets/scenario-result-hero.png"
                alt="Scenario completed"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                }}
              />

            </div>

          </div>

        </section>


        {/* CONTENT GRID */}

        <section className="result-grid">

          {/* =================================================
              MAIN RESULT CARD
          ================================================= */}

          <article className="result-card">

            <div className="result-intro">

              <div className="trophy">
                🏆
              </div>

              <div>

                <h2>
                  Scenario Complete!
                </h2>

                <h3>
                  Well done, {firstName}!
                </h3>

                <p>
                  You made smart choices and showed a good
                  understanding of how to manage money in real life.
                </p>

              </div>

            </div>


            {/* SCORE + AWARDS */}

            <div className="score-awards">

              <div
                className="score-circle"
                style={{
                  background: `conic-gradient(
                    #00aa7e 0deg ${percentage * 3.6}deg,
                    #e8edf5 ${percentage * 3.6}deg 360deg
                  )`,
                }}
              >

                <div className="score-inner">
                  <strong>{score} / {questions.length}</strong>
                  <span>{percentage}%</span>
                </div>

              </div>


              <div className="award-content">

                <div className="award-row">

                  <div className="award-box">

                    <div className="award-icon">
                      ⭐
                    </div>

                    <div>
                      <strong>+{points}</strong>
                      <span>Points Earned</span>
                    </div>

                  </div>


                  <div className="award-box">

                    <div className="award-icon">
                      🏅
                    </div>

                    <div>
                      <strong>Responsible Spender</strong>
                      <span>New Badge Unlocked</span>
                    </div>

                  </div>

                </div>

              </div>

            </div>


            {/* CHOICES */}

            <section className="choices-section">

              <h2>
                Your Choices and Results
              </h2>

              <div className="choice-list">

                {questions.map((question) => {
                  const answer = answers[question.number as 1 | 2];
                  const isCorrect =
                    answer === correctAnswers[question.number];

                  return (
                    <div
                      key={question.number}
                      className={`result-choice ${
                        isCorrect ? "good" : "needs-work"
                      }`}
                    >

                      <div className="choice-number">
                        {question.number}
                      </div>

                      <div className="choice-question">
                        <strong>{question.question}</strong>
                        <span className="answer-text">
                          Your answer:{" "}
                          {answer
                            ? `${answer} — ${
                                question.options[
                                  answer as "A" | "B" | "C"
                                ]
                              }`
                            : "No answer selected"}
                        </span>
                      </div>

                      <div className="choice-status">
                        {isCorrect ? "✓ Correct" : "✕ Could Be Better"}
                      </div>

                      <span className="choice-arrow">
                        ⌄
                      </span>

                    </div>
                  );
                })}

              </div>

            </section>


          </article>


          {/* =================================================
              RIGHT COLUMN
          ================================================= */}

          <aside className="result-sidebar">


            {/* WHAT YOU PRACTISED */}

            <section className="side-card">

              <h2>
                What You Practised
              </h2>

              <div className="practice-item">
                <span>✓</span>
                Making spending decisions
              </div>

              <div className="practice-item">
                <span>✓</span>
                Considering short-term vs long-term needs
              </div>

              <div className="practice-item">
                <span>✓</span>
                Managing a limited budget
              </div>

              <div className="practice-item">
                <span>✓</span>
                Understanding the consequences of your choices
              </div>

            </section>


            {/* KEY TAKEAWAY */}

            <section className="side-card takeaway-card">

              <div className="side-card-title">

                <span className="big-icon">
                  💡
                </span>

                <h2>
                  Key Takeaway
                </h2>

              </div>

              <p>
                You can still enjoy your money while making
                thoughtful choices. Setting a spending limit
                helps you have fun and still save for your goals.
              </p>

            </section>


            {/* QUOTE */}

            <section className="side-card quote-card">

              <div className="quote-mark">
                “
              </div>

              <p>
                Small decisions today
                <br />
                can lead to big opportunities
                <br />
                tomorrow.
              </p>

              <span>
                — GrowAIs
              </span>

              <div className="quote-leaf">
                🌱
              </div>

            </section>


            {/* WHAT'S NEXT */}

            <section className="side-card next-card">

              <div className="next-title">

                <span>
                  🎮
                </span>

                <h2>
                  What's Next?
                </h2>

              </div>

              <p>
                Try another scenario to keep practising
                your money skills.
              </p>

              <Link
                href="/student/scenarios"
                className="primary-button"
              >
                Explore More Scenarios
                <span>→</span>
              </Link>

              <Link
                href="/student/scenarios"
                className="secondary-button"
              >
                Back to Scenarios
              </Link>

            </section>

          </aside>

        </section>

      </main>


      {/* =====================================================
          MOBILE BOTTOM NAVIGATION
      ===================================================== */}

      <nav className="mobile-bottom-nav">

        <Link href="/student/dashboard">
          <span>⌂</span>
          <small>Home</small>
        </Link>

        <Link href="/student/lessons">
          <span>▣</span>
          <small>My Lessons</small>
        </Link>

        <Link href="/student/quiz">
          <span>▤</span>
          <small>Quizzes</small>
        </Link>

        <Link
          href="/student/scenarios"
          className="mobile-active"
        >
          <span>🎮</span>
          <small>Scenarios</small>
        </Link>

        <Link href="/student/goals">
          <span>◎</span>
          <small>My Goals</small>
        </Link>

        <Link href="/student/progress">
          <span>▥</span>
          <small>My Progress</small>
        </Link>

        <Link href="/student/ai-assistant">
          <span>🤖</span>
          <small>AI Assistant</small>
        </Link>

      </nav>


      {/* =====================================================
          CSS
      ===================================================== */}

      <style jsx>{`

        * {
          box-sizing: border-box;
        }

        .scenario-result-page {
          min-height: 100vh;
          background: #ffffff;
          color: #10165c;
          font-family: Arial, Helvetica, sans-serif;
          overflow-x: hidden;
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
           UPDATED STUDENT HEADER
        ===================================================== */

        .quiz-header {
          position: fixed;
          top: 0;
          left: 280px;
          right: 0;
          height: 88px;
          background: #ffffff;
          border-bottom: 1px solid #e7edf5;
          z-index: 2000;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 32px;
        }

        .quiz-search {
          width: 515px;
          height: 48px;
          background: #f3f6fb;
          border-radius: 12px;
          display: flex;
          align-items: center;
          padding: 0 16px;
          gap: 12px;
        }

        .search-icon {
          font-size: 29px;
          margin-right: 0;
          color: #5b6b91;
          transform: rotate(-20deg);
          flex-shrink: 0;
        }

        .quiz-search input {
          border: none;
          outline: none;
          background: transparent;
          width: 100%;
          color: #10165c;
          font-size: 16px;
        }

        .quiz-search input::placeholder {
          color: #8290ad;
        }

        .quiz-profile-area {
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
          height: 42px;
          width: 1px;
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
          color: #ffffff;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 17px;
          font-weight: 700;
          flex-shrink: 0;
        }

        .profile-text {
          display: flex;
          flex-direction: column;
          line-height: 1.2;
          gap: 3px;
        }

        .profile-text strong {
          font-size: 16px;
          color: #11195b;
        }

        .profile-text small {
          color: #59698e;
          font-size: 14px;
        }

        .profile-arrow {
          margin-left: auto;
          font-size: 20px;
        }

        .profile-dropdown {
          position: absolute;
          right: 0;
          top: calc(100% + 8px);
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

        /* ================= MAIN ================= */

        .result-main {
          margin-left: 280px;
          padding: 96px 25px 50px;
          min-height: 100vh;
        }


        /* ================= TOP ================= */

        .scenario-top {
          max-width: 1250px;
          margin: 0 auto 18px;
        }

        .back-link {
          display: inline-block;
          color: #006cff;
          text-decoration: none;
          font-size: 16px;
          margin-bottom: 15px;
        }

        .scenario-heading-row {
          display: grid;
          grid-template-columns: 380px minmax(0, 1fr);
          gap: 30px;
          align-items: center;
        }

        .scenario-info {
          display: flex;
          align-items: center;
          gap: 18px;
        }

        .scenario-thumbnail {
          width: 116px;
          height: 116px;
          border-radius: 13px;
          overflow: hidden;
          background: #e4f8ef;
          flex-shrink: 0;
        }

        .scenario-thumbnail img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .scenario-title {
          min-width: 0;
        }

        .eyebrow {
          color: #00a67d;
          font-size: 14px;
          letter-spacing: 2px;
          font-weight: 800;
        }

        .scenario-title h1 {
          margin: 5px 0;
          font-size: 26px;
          line-height: 1.15;
        }

        .scenario-title p {
          margin: 0 0 8px;
          font-size: 17px;
          color: #384987;
        }

        .difficulty {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          background: #e1f8ee;
          color: #00a67d;
          padding: 8px 14px;
          border-radius: 30px;
          font-weight: 700;
          font-size: 14px;
        }

        .scenario-hero {
          height: 170px;
          border-radius: 16px;
          overflow: hidden;
          background: #e2f8ef;
        }

        .scenario-hero img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          object-position: center;
          display: block;
        }


        /* ================= GRID ================= */

        .result-grid {
          max-width: 1250px;
          margin: 0 auto;
          display: grid;
          grid-template-columns: minmax(0, 1fr) 340px;
          gap: 20px;
          align-items: start;
        }

        .result-card {
          background: #ffffff;
          border: 1px solid #dfe7f2;
          border-radius: 16px;
          padding: 28px 25px 30px;
        }


        /* ================= INTRO ================= */

        .result-intro {
          display: flex;
          align-items: flex-start;
          gap: 18px;
        }

        .trophy {
          font-size: 55px;
          line-height: 1;
        }

        .result-intro h2 {
          margin: 0;
          font-size: 31px;
          color: #10165c;
        }

        .result-intro h3 {
          margin: 5px 0 7px;
          color: #00a67d;
          font-size: 22px;
        }

        .result-intro p {
          margin: 0;
          color: #354a8d;
          font-size: 17px;
          line-height: 1.45;
        }


        /* ================= SCORE ================= */

        .score-awards {
          display: grid;
          grid-template-columns: 250px minmax(0, 1fr);
          gap: 25px;
          align-items: center;
          margin-top: 20px;
        }

        .score-circle {
          width: 205px;
          height: 205px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          transform: rotate(-90deg);
        }

        .score-inner {
          width: 155px;
          height: 155px;
          border-radius: 50%;
          background: #ffffff;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          transform: rotate(90deg);
        }

        .score-inner strong {
          font-size: 34px;
          color: #10165c;
        }

        .score-inner span {
          font-size: 22px;
          font-weight: 700;
          margin-top: 5px;
        }

        .award-row {
          display: grid;
          grid-template-columns: 1fr 1.3fr;
          gap: 15px;
        }

        .award-box {
          min-height: 75px;
          background: #edf7ff;
          border-radius: 12px;
          display: flex;
          align-items: center;
          gap: 14px;
          padding: 12px 18px;
        }

        .award-icon {
          font-size: 38px;
        }

        .award-box strong {
          display: block;
          font-size: 18px;
        }

        .award-box span {
          display: block;
          font-size: 13px;
          color: #50649a;
          margin-top: 3px;
        }


        /* ================= CHOICES ================= */

        .choices-section {
          margin-top: 10px;
        }

        .choices-section h2 {
          font-size: 24px;
          margin: 0 0 5px;
        }

        .choice-list {
          margin-top: 10px;
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .result-choice {
          min-height: 55px;
          border: 1px solid #dfe7f2;
          border-radius: 11px;
          background: #fafdff;
          display: grid;
          grid-template-columns: 45px minmax(0, 1fr) auto 25px;
          align-items: center;
          gap: 12px;
          padding: 7px 13px;
        }

        .choice-number {
          width: 35px;
          height: 35px;
          border-radius: 50%;
          background: #edf2fb;
          display: flex;
          justify-content: center;
          align-items: center;
          font-weight: 700;
        }

        .choice-question {
          font-size: 15px;
        }

        .answer-text {
          display: block;
          margin-top: 4px;
          color: #50649a;
          font-size: 13px;
          line-height: 1.35;
        }


        .choice-status {
          padding: 8px 13px;
          border-radius: 20px;
          font-size: 13px;
          white-space: nowrap;
          background: #def8ed;
          color: #00a67d;
        }

        .needs-work .choice-status {
          background: #ffe8e7;
          color: #f04444;
        }

        .choice-arrow {
          color: #006cff;
          font-size: 20px;
        }


        /* ================= RIGHT SIDEBAR ================= */

        .result-sidebar {
          display: flex;
          flex-direction: column;
          gap: 15px;
        }

        .side-card {
          border: 1px solid #dfe7f2;
          border-radius: 15px;
          padding: 20px;
          background: #ffffff;
        }

        .side-card h2 {
          margin: 0 0 14px;
          font-size: 20px;
        }

        .practice-item {
          display: flex;
          align-items: flex-start;
          gap: 10px;
          font-size: 15px;
          line-height: 1.35;
          margin: 11px 0;
        }

        .practice-item span {
          width: 22px;
          height: 22px;
          border-radius: 50%;
          background: #00aa7e;
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          font-size: 13px;
        }

        .takeaway-card {
          background: #e4faf1;
          border: none;
        }

        .side-card-title {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .side-card-title h2 {
          margin: 0;
        }

        .big-icon {
          font-size: 32px;
        }

        .takeaway-card p {
          color: #344b88;
          line-height: 1.5;
          margin-bottom: 0;
        }

        .quote-card {
          background: #edf5ff;
          position: relative;
          overflow: hidden;
        }

        .quote-mark {
          color: #6fa5ed;
          font-size: 50px;
          line-height: 0.7;
          font-weight: 700;
        }

        .quote-card p {
          font-size: 18px;
          line-height: 1.4;
          margin: 12px 0 8px;
        }

        .quote-card > span {
          color: #344b88;
        }

        .quote-leaf {
          position: absolute;
          right: 15px;
          bottom: 10px;
          font-size: 55px;
        }

        .next-card {
          background: #ffffff;
        }

        .next-title {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .next-title span {
          font-size: 30px;
        }

        .next-title h2 {
          margin: 0;
        }

        .next-card p {
          color: #354a8d;
          line-height: 1.4;
        }

        .primary-button,
        .secondary-button {
          display: flex;
          align-items: center;
          justify-content: center;
          text-decoration: none;
          min-height: 48px;
          border-radius: 10px;
          font-weight: 700;
          margin-top: 10px;
        }

        .primary-button {
          background: #00a67d;
          color: white;
          gap: 15px;
        }

        .secondary-button {
          border: 1px solid #006cff;
          color: #006cff;
          background: white;
        }


        /* ================= MOBILE NAV ================= */

        .mobile-bottom-nav {
          display: none;
        }


        /* ================= TABLET ================= */

        @media (max-width: 1050px) {

          .sidebar {
            width: 225px;
          }

          .quiz-header {
            left: 225px;
          }

          .result-main {
            margin-left: 225px;
          }

          .result-grid {
            grid-template-columns: 1fr;
          }

          .result-sidebar {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
          }

          .scenario-heading-row {
            grid-template-columns: 320px minmax(0, 1fr);
          }

        }


        /* ================= MOBILE ================= */

        @media (max-width: 700px) {

          .quiz-header {
            position: fixed;
            left: 0;
            right: 0;
            top: 0;
            width: 100%;
            height: 64px;
            padding: 0 12px;
            z-index: 4000;
          }

          .quiz-search {
            flex: 1;
            width: auto;
            min-width: 0;
            height: 42px;
            padding: 0 10px;
            gap: 7px;
          }

          .quiz-search input {
            min-width: 0;
            font-size: 11px;
          }

          .search-icon {
            font-size: 19px;
            margin-right: 0;
          }

          .quiz-profile-area {
            gap: 0;
            flex-shrink: 0;
          }

          .notification,
          .top-divider,
          .profile-text,
          .profile-arrow {
            display: none;
          }

          .avatar {
            width: 38px;
            height: 38px;
            font-size: 15px;
          }

          .profile {
            min-width: 0;
            gap: 0;
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


          .sidebar {
            display: none;
          }

          .quiz-header {
            position: fixed;
            left: 0;
            right: 0;
            top: 0;
            height: 61px;
            padding: 0 12px;
            z-index: 200;
          }

          .quiz-search {
            width: calc(100% - 52px);
            height: 40px;
            padding: 0 10px;
          }

          .search-icon {
            font-size: 18px;
            margin-right: 7px;
          }

          .quiz-search input {
            font-size: 11px;
          }

          .quiz-profile-area {
            gap: 0;
          }

          .notification,
          .top-divider,
          .profile-text,
          .profile-arrow {
            display: none;
          }

          .avatar {
            width: 36px;
            height: 36px;
            font-size: 14px;
          }

          .result-main {
            margin-left: 0;
            padding: 76px 12px 82px;
          }


          /* TOP */

          .scenario-top {
            margin-bottom: 12px;
          }

          .back-link {
            font-size: 13px;
            margin-bottom: 8px;
          }

          .scenario-heading-row {
            display: flex;
            flex-direction: column;
            gap: 10px;
          }

          .scenario-info {
            gap: 10px;
          }

          .scenario-thumbnail {
            width: 58px;
            height: 58px;
            border-radius: 9px;
          }

          .eyebrow {
            font-size: 9px;
            letter-spacing: 1.4px;
          }

          .scenario-title h1 {
            font-size: 18px;
            margin: 2px 0;
          }

          .scenario-title p {
            font-size: 12px;
            margin-bottom: 3px;
          }

          .difficulty {
            padding: 4px 8px;
            font-size: 10px;
          }

          .scenario-hero {
            width: 100%;
            height: 125px;
            border-radius: 12px;
          }


          /* RESULT */

          .result-grid {
            display: flex;
            flex-direction: column;
            gap: 12px;
          }

          .result-card {
            padding: 17px 12px 20px;
            border-radius: 13px;
          }

          .result-intro {
            gap: 9px;
          }

          .trophy {
            font-size: 34px;
          }

          .result-intro h2 {
            font-size: 22px;
          }

          .result-intro h3 {
            font-size: 16px;
            margin: 3px 0;
          }

          .result-intro p {
            font-size: 11px;
            line-height: 1.35;
          }


          /* SCORE */

          .score-awards {
            display: flex;
            flex-direction: column;
            gap: 12px;
            margin-top: 15px;
          }

          .score-circle {
            width: 145px;
            height: 145px;
          }

          .score-inner {
            width: 110px;
            height: 110px;
          }

          .score-inner strong {
            font-size: 25px;
          }

          .score-inner span {
            font-size: 16px;
          }

          .award-content {
            width: 100%;
          }

          .award-row {
            width: 100%;
            grid-template-columns: 1fr 1fr;
            gap: 7px;
          }

          .award-box {
            min-height: 58px;
            padding: 7px;
            gap: 5px;
          }

          .award-icon {
            font-size: 25px;
          }

          .award-box strong {
            font-size: 10px;
          }

          .award-box span {
            font-size: 8px;
          }


          /* CHOICES */

          .choices-section {
            margin-top: 14px;
          }

          .choices-section h2 {
            font-size: 18px;
          }

          .result-choice {
            grid-template-columns: 30px minmax(0, 1fr);
            gap: 7px;
            padding: 8px;
          }

          .choice-number {
            width: 28px;
            height: 28px;
            font-size: 12px;
          }

          .choice-question {
            font-size: 11px;
            line-height: 1.35;
          }

          .choice-status {
            grid-column: 2;
            justify-self: start;
            padding: 5px 9px;
            font-size: 9px;
          }

          .choice-arrow {
            position: absolute;
            right: 13px;
          }


          /* RIGHT CARDS */

          .result-sidebar {
            display: flex;
            flex-direction: column;
            gap: 10px;
          }

          .side-card {
            padding: 14px;
            border-radius: 12px;
          }

          .side-card h2 {
            font-size: 17px;
          }

          .practice-item {
            font-size: 11px;
            margin: 8px 0;
          }

          .practice-item span {
            width: 18px;
            height: 18px;
            font-size: 10px;
          }

          .takeaway-card p,
          .next-card p {
            font-size: 11px;
          }

          .quote-card p {
            font-size: 14px;
          }

          .primary-button,
          .secondary-button {
            min-height: 42px;
            font-size: 12px;
          }


          /* BOTTOM NAV */

          .mobile-bottom-nav {
            position: fixed;
            display: flex;
            left: 0;
            right: 0;
            bottom: 0;
            height: 57px;
            background: #ffffff;
            border-top: 1px solid #dfe5ef;
            z-index: 300;
            justify-content: space-around;
            align-items: stretch;
            padding: 3px 2px;
          }

          .mobile-bottom-nav a {
            flex: 1;
            min-width: 0;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            text-decoration: none;
            color: #17216a;
            gap: 2px;
          }

          .mobile-bottom-nav a span {
            font-size: 15px;
            line-height: 1;
          }

          .mobile-bottom-nav a small {
            font-size: 7px;
            white-space: nowrap;
          }

          .mobile-bottom-nav a.mobile-active {
            color: #00a67d;
            font-weight: 700;
          }

        }

      `}</style>

    </div>
  );
}