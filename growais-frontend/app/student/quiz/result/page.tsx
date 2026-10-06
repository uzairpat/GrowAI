"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import { apiFetch } from "../../../../lib/api";
type User = {
  id: number;
  role: string;
  username: string;
  email: string | null;
  full_name: string;
};
const questions = [
  {
    number: 1,
    text: "What is a budget?",
    options: [
      "A plan for how you will use your money",
      "A list of things you want to buy",
      "A way to spend all your money",
      "A type of bank account",
    ],
    answer: 0,
  },
  {
    number: 2,
    text: "Which of the following is a need?",
    options: [
      "A new video game",
      "Food and basic groceries",
      "The latest smartphone",
      "Expensive headphones",
    ],
    answer: 1,
  },
  {
    number: 3,
    text: "What is a good reason to create a budget?",
    options: [
      "To spend all your money quickly",
      "To avoid saving money",
      "To understand and plan where your money goes",
      "To buy more expensive things",
    ],
    answer: 2,
  },
  {
    number: 4,
    text: "Which is an example of a fixed expense?",
    options: [
      "A monthly phone subscription",
      "A snack you buy after school",
      "A movie with friends",
      "An occasional shopping trip",
    ],
    answer: 0,
  },
  {
    number: 5,
    text: "How can a budget help you in the future?",
    options: [
      "It helps you spend without thinking",
      "It helps you plan, save, and work towards your goals",
      "It makes everything free",
      "It means you cannot spend any money",
    ],
    answer: 1,
  },
];

export default function QuizResultPage() {
  const [answers, setAnswers] = useState<(number | null)[]>(
    Array(questions.length).fill(null)
  );
  const [score, setScore] = useState(0);
  const [user, setUser] = useState<User | null>(null);
  const [quizData, setQuizData] = useState<any>(null);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);

  useEffect(() => {
    const loadResult = async () => {
      try {
        const data = await apiFetch("/api/auth/me");

        if (data.user.role !== "student") {
          window.location.href = "/login";
          return;
        }

        setUser(data.user);

        // Load the real quiz definition so database question/option IDs
        // can be converted back into the UI answer indexes.
        const quizResult = await apiFetch("/api/student/quizzes/2");

        if (quizResult.quiz) {
          setQuizData(quizResult.quiz);
        }

        // Load only this logged-in student's latest attempt.
        const attemptResult = await apiFetch(
          "/api/student/quizzes/2/attempts/latest"
        );

        if (!attemptResult.attempt) {
          window.location.href = "/student/quiz";
          return;
        }

        setScore(Number(attemptResult.attempt.score) || 0);

        const latestAnswers = Array(questions.length).fill(null);

        if (
          quizResult.quiz &&
          Array.isArray(quizResult.quiz.questions) &&
          Array.isArray(attemptResult.answers)
        ) {
          attemptResult.answers.forEach((savedAnswer: any) => {
            const questionIndex = quizResult.quiz.questions.findIndex(
              (dbQuestion: any) =>
                Number(dbQuestion.id) === Number(savedAnswer.question_id)
            );

            if (questionIndex === -1) {
              return;
            }

            const optionIndex =
            quizResult.quiz.questions[questionIndex]?.options?.findIndex(
              (dbOption: any) =>
                Number(dbOption.id) === Number(savedAnswer.selected_option_id)
            );

            if (optionIndex !== undefined && optionIndex >= 0) {
              latestAnswers[questionIndex] = optionIndex;
            }
          });
        }

        setAnswers(latestAnswers);
      } catch (error) {
        console.error("Unable to load quiz result:", error);
        window.location.href = "/student/quiz";
      }
    };

    loadResult();
  }, []);

  const studentName = user?.full_name || "Student";
  const percentage = Math.round((score / questions.length) * 100);
  const points = score * 10;

  return (
    <div className="result-page">

      {/* ================= DASHBOARD-STYLE STUDENT SIDEBAR ================= */}
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

          <a href="/student/quiz" className="nav-item active">
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
            className="nav-item logout-button"
            type="button"
            onClick={async () => {
              try {
                await apiFetch("/api/auth/logout", {
                  method: "POST",
                });
              } finally {
                window.location.href = "/login";
              }
            }}
          >
            <span className="nav-icon">↪</span>
            <span>Log Out</span>
          </button>
        </nav>

        <div className="sidebar-message">
          <img src="/assets/dashboard-plant.png" alt="" />
          <p>
            Small steps
            <br />
            today, big dreams
            <br />
            tomorrow.
          </p>
        </div>
      </aside>

      {/* ================= DASHBOARD-STYLE HEADER ================= */}
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
                <strong>Hi, {studentName.split(" ")[0]}</strong>
                <small>Student</small>
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
                      await apiFetch("/api/auth/logout", {
                        method: "POST",
                      });
                    } finally {
                      window.location.href = "/login";
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


      {/* ================= MAIN ================= */}
      <main className="main-content">
        {/* ================= COURSE HEADER ================= */}
        <section className="course-header">
          <Link href="/student/quiz" className="back-link">
            ← Back to Quiz
          </Link>

          <div className="course-info">
            <div className="course-icon">
              <Image
                src="/assets/budgeting-basics.png"
                alt="Budgeting Basics"
                width={115}
                height={115}
                className="course-icon-image"
              />
            </div>

            <div className="course-title">
              <span>BUDGETING BASICS</span>
              <h1>Budgeting Basics</h1>
              <p>Module 1 • Lesson 1</p>
              <small>Quiz Complete</small>
            </div>
          </div>

          <div className="result-hero">
            <Image
              src="/assets/quiz-result-student.png"
              alt="Student celebrating after completing the quiz"
              width={220}
              height={170}
              priority
              sizes="(max-width: 700px) 100vw, 55vw"
              className="result-hero-image"
            />
          </div>
        </section>

        {/* ================= RESULT CONTENT ================= */}
        <section className="result-layout">
          <div className="result-main">
            <div className="result-intro">
              <div className="party-icon">🎉</div>

              <div>
                <h2>Quiz Complete!</h2>
                <p>
                  You're one step closer to a brighter financial future.
                </p>
              </div>
            </div>

            <div className="score-row">
              <div
                className="score-circle"
                aria-label={`Score ${score} out of ${questions.length}, ${percentage} percent`}
                style={{
                  background: `conic-gradient(
                    #08a879 0deg ${percentage * 3.6}deg,
                    #e8edf6 ${percentage * 3.6}deg 360deg
                  )`,
                }}
              >
                <div>
                  <strong>{score} / {questions.length}</strong>
                  <span>{percentage}%</span>
                </div>
              </div>

              <div className="score-copy">
              <h3>
  {score === questions.length
    ? "Excellent Job!"
    : score >= 3
    ? "Great Job!"
    : score >= 1
    ? "Good Try!"
    : "Keep Practising!"}
</h3>

<p>
  {score === questions.length
    ? "You got every question correct. Excellent understanding!"
    : score >= 3
    ? "You've shown a good understanding of this topic. Keep going!"
    : score >= 1
    ? "You're getting there. Review the lesson and try again!"
    : "Don't worry! Review the lesson and try the quiz again."}
</p>

                <div className="reward-row">
                  <div className="reward-card">
                    <span className="reward-emoji star">⭐</span>
                    <div>
                      <strong>+{points}</strong>
                      <span>Points Earned</span>
                    </div>
                  </div>

                  <div className="reward-card">
                    <span className="reward-emoji">🏆</span>
                    <div>
                      <strong>Budget Beginner</strong>
                      <span>New Badge Unlocked</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* ================= QUESTION REVIEW ================= */}
            <section className="review-section">
              <h3>Question Review</h3>
              <p className="section-subtitle">
                See how you did and learn from each question.
              </p>

              <div className="question-list">
                {questions.map((question, index) => {
                  const userAnswer = answers[index];
                  const isCorrect = userAnswer === question.answer;

                  return (
                    <div className="review-row" key={question.number}>
                      <div className="question-number">
                        {question.number}
                      </div>

                      <div className="question-text">
                        {question.text}
                      </div>

                      <div
                        className={`status ${
                          isCorrect ? "correct" : "incorrect"
                        }`}
                      >
                        <span>{isCorrect ? "✓" : "×"}</span>
                        {isCorrect ? "Correct" : "Incorrect"}
                      </div>

                      <button type="button" className="view-button">
                        View →
                      </button>
                    </div>
                  );
                })}
              </div>
            </section>
          </div>

          {/* ================= RIGHT COLUMN ================= */}
          <aside className="right-column">
            <section className="side-card learned-card">
              <div className="side-title">
                <span className="side-emoji">📖</span>
                <h3>What You Learned</h3>
              </div>

              <ul>
                <li>A budget helps you plan and control your money.</li>
                <li>
                  You can make better choices when you know your income and
                  expenses.
                </li>
                <li>It's important to balance needs and wants.</li>
                <li>Budgeting can help you reach your goals.</li>
              </ul>
            </section>

            <section className="side-card keep-card">
              <div className="side-title">
                <span className="side-emoji">💡</span>
                <h3>Keep Going!</h3>
              </div>

              <p className="keep-intro">
                Now that you've completed the quiz, you can:
              </p>

              <Link href="/student/lessons/1" className="action-card">
                <span className="action-icon">📖</span>
                <span>
                  <strong>Review Lesson</strong>
                  <small>Go back and review the lesson content</small>
                </span>
                <b>›</b>
              </Link>

              <Link href="/student/quiz" className="action-card">
                <span className="action-icon retry">↻</span>
                <span>
                  <strong>Try Again</strong>
                  <small>Retake the quiz to improve your score</small>
                </span>
                <b>›</b>
              </Link>

              <Link href="/student/lessons" className="continue-card">
                <span className="continue-icon">→</span>
                <span>
                  <strong>Continue Learning</strong>
                  <small>Move on to the next lesson</small>
                </span>
                <b>›</b>
              </Link>
            </section>

            <section className="side-card help-card">
              <div className="side-title">
                <span className="side-emoji">🤖</span>
                <h3>Need Help?</h3>
              </div>

              <p>
                Have questions about this quiz or topic?
                <br />
                Ask GrowAIs AI Assistant anytime!
              </p>

              <Link
                href="/student/ai-assistant"
                className="ask-button"
              >
                Ask AI Assistant →
              </Link>
            </section>
          </aside>
        </section>
      </main>

      {/* ================= SAME MOBILE BOTTOM BAR AS QUIZ PAGE ================= */}
      <nav className="mobile-bottom-nav">
        <Link href="/student/dashboard">
          <span>⌂</span>
          <small>Home</small>
        </Link>

        <Link href="/student/lessons">
          <span>▣</span>
          <small>My Lessons</small>
        </Link>

        <Link href="/student/quiz" className="mobile-active">
          <span>▤</span>
          <small>Quizzes</small>
        </Link>

        <Link href="/student/scenarios">
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

      <style jsx>{`
        * {
          box-sizing: border-box;
        }

        .result-page {
          min-height: 100vh;
          background: #ffffff;
          color: #10165c;
          font-family: Arial, Helvetica, sans-serif;
          overflow-x: hidden;
        }

        /* ================= HEADER ================= */

        .quiz-header {
          position: fixed;
          top: 0;
          left: 280px;
          right: 0;
          height: 72px;
          background: #ffffff;
          border-bottom: 1px solid #e5eaf2;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 32px;
          z-index: 1000;
        }

        .quiz-search {
          width: 560px;
          height: 44px;
          background: #f4f7fb;
          border-radius: 12px;
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 0 18px;
        }

        .quiz-search input {
          width: 100%;
          min-width: 0;
          border: none;
          outline: none;
          background: transparent;
          color: #344879;
          font-size: 15px;
        }

        .quiz-search input::placeholder {
          color: #7180a3;
        }

        .search-icon {
          font-size: 24px;
          color: #344879;
        }

        .quiz-profile-area {
          display: flex;
          align-items: center;
          gap: 22px;
        }

        .notification {
          position: relative;
          width: 32px;
          height: 36px;
          border: none;
          background: transparent;
          color: #344879;
          font-size: 27px;
          cursor: pointer;
        }

        .notification span {
          position: absolute;
          width: 8px;
          height: 8px;
          background: #ff4d4d;
          border-radius: 50%;
          top: 2px;
          right: 0;
        }

        .top-divider {
          width: 1px;
          height: 42px;
          background: #e3e8f0;
        }

        .profile {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .avatar {
          width: 44px;
          height: 44px;
          border-radius: 50%;
          background: #05a779;
          color: #ffffff;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 700;
          font-size: 18px;
        }

        .profile-text {
          display: flex;
          flex-direction: column;
          gap: 2px;
        }

        .profile-text strong {
          font-size: 15px;
          color: #10165c;
        }

        .profile-text small {
          font-size: 13px;
          color: #52638d;
        }

        .profile-arrow {
          margin-left: 18px;
          font-size: 20px;
        }

        /* ================= SAME SIDEBAR AS QUIZ PAGE ================= */

        .sidebar {
          width: 280px;
          min-height: 100vh;
          border-right: 1px solid #e7edf5;
          background: #ffffff;
          position: fixed;
          left: 0;
          top: 0;
          bottom: 0;
          display: flex;
          flex-direction: column;
          z-index: 1100;
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
          white-space: nowrap;
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
          min-width: 28px;
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

        /* ================= MAIN ================= */

        .main-content {
          margin-left: 280px;
          padding: 96px 32px 42px;
          min-height: 100vh;
        }

        /* ================= COURSE HEADER ================= */

        .course-header {
          position: relative;
          min-height: 190px;
        }

        .back-link {
          display: inline-block;
          color: #006cff;
          text-decoration: none;
          font-size: 16px;
          margin: 5px 0 18px 8px;
        }

        .course-info {
          position: relative;
          z-index: 3;
          display: flex;
          align-items: center;
          gap: 20px;
          max-width: 520px;
        }

        .course-icon {
          width: 116px;
          min-width: 116px;
          height: 116px;
          background: #dff8ec;
          border-radius: 14px;
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
        }

        .course-icon-image {
          width: 105px;
          height: 105px;
          object-fit: contain;
        }

        .course-title {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .course-title span {
          color: #05a779;
          font-size: 17px;
          font-weight: 800;
          letter-spacing: 2px;
        }

        .course-title h1 {
          margin: 0;
          font-size: 29px;
          line-height: 1.15;
          color: #182365;
        }

        .course-title p,
        .course-title small {
          margin: 0;
          font-size: 17px;
          line-height: 1.25;
          color: #182365;
        }

        .course-title small {
          font-size: 16px;
        }

        /* ================= RESULT HERO ================= */

        .result-hero {
          position: absolute;
          top: 0;
          right: 0;
          width: 52%;
          height: 168px;
          border-radius: 18px;
          overflow: hidden;
          background: #e0f8ef;
          z-index: 1;
          display: flex;
          align-items: center;
          justify-content: center;
        }

       .result-hero-image-container {
  position: relative;
  width: 100%;
  height: 220px;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 20px;
} .result-hero-image {
          object-fit: contain !important;
          object-position: center center !important;
          width: 100% !important;
          height: 100% !important;
          padding: 0 !important;
        }

        /* ================= RESULT LAYOUT ================= */

        .result-layout {
          display: grid;
          grid-template-columns: minmax(0, 1fr) 380px;
          gap: 18px;
          align-items: start;
        }

        .result-main {
          border: 1px solid #e1e8f2;
          border-radius: 16px;
          padding: 22px 20px 25px;
          background: #ffffff;
          box-shadow: 0 4px 18px rgba(30, 60, 100, 0.04);
          min-width: 0;
        }

        .result-intro {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .party-icon {
          font-size: 48px;
          line-height: 1;
        }

        .result-intro h2 {
          margin: 0;
          font-size: 34px;
          line-height: 1.1;
        }

        .result-intro p {
          margin: 4px 0 0;
          color: #263a87;
          font-size: 17px;
        }

        /* ================= SCORE ================= */

        .score-row {
          display: flex;
          align-items: center;
          gap: 32px;
          padding: 8px 8px 12px;
        }

        .score-circle {
          width: 185px;
          height: 185px;
          min-width: 185px;
          border-radius: 50%;
          background: conic-gradient(
            #08a879 0deg 288deg,
            #e8edf6 288deg 360deg
          );
          display: grid;
          place-items: center;
          position: relative;
        }

        .score-circle::before {
          content: "";
          position: absolute;
          width: 147px;
          height: 147px;
          border-radius: 50%;
          background: #ffffff;
        }

        .score-circle > div {
          position: relative;
          z-index: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
        }

        .score-circle strong {
          font-size: 38px;
          line-height: 1;
        }

        .score-circle span {
          margin-top: 7px;
          font-size: 23px;
          font-weight: 700;
        }

        .score-copy {
          flex: 1;
          min-width: 0;
        }

        .score-copy h3 {
          margin: 0;
          font-size: 35px;
          line-height: 1.1;
          color: #08886d;
        }

        .score-copy > p {
          margin: 5px 0 15px;
          font-size: 17px;
          line-height: 1.35;
        }

        .reward-row {
          display: grid;
          grid-template-columns: 1fr 1.15fr;
          gap: 10px;
        }

        .reward-card {
          min-height: 68px;
          border-radius: 11px;
          background: #eff7fd;
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 9px 12px;
          min-width: 0;
        }

        .reward-emoji {
          width: 44px;
          min-width: 44px;
          text-align: center;
          font-size: 38px;
          line-height: 1;
        }

        .reward-card strong,
        .reward-card div > span {
          display: block;
        }

        .reward-card strong {
          font-size: 17px;
          line-height: 1.2;
        }

        .reward-card div > span {
          margin-top: 3px;
          font-size: 12px;
        }

        /* ================= QUESTION REVIEW ================= */

        .review-section {
          margin-top: 4px;
        }

        .review-section h3 {
          margin: 0;
          font-size: 25px;
        }

        .section-subtitle {
          margin: 4px 0 10px;
          color: #263a72;
          font-size: 14px;
        }

        .question-list {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .review-row {
          min-height: 52px;
          border: 1px solid #e3eaf3;
          border-radius: 10px;
          background: linear-gradient(90deg, #f8fbff, #ffffff);
          display: grid;
          grid-template-columns: 42px minmax(0, 1fr) 115px 62px;
          align-items: center;
          gap: 7px;
          padding: 5px 10px;
        }

        .question-number {
          width: 34px;
          height: 34px;
          border-radius: 50%;
          background: #edf2fb;
          display: grid;
          place-items: center;
          font-size: 15px;
          font-weight: 700;
        }

        .question-text {
          min-width: 0;
          font-size: 14px;
          line-height: 1.3;
        }

        .status {
          justify-self: start;
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 6px 8px;
          border-radius: 14px;
          font-size: 12px;
          white-space: nowrap;
        }

        .status span {
          width: 20px;
          height: 20px;
          border-radius: 50%;
          color: #ffffff;
          display: grid;
          place-items: center;
          font-weight: 700;
        }

        .status.correct {
          color: #08a779;
          background: #e6faf2;
        }

        .status.correct span {
          background: #08a779;
        }

        .status.incorrect {
          color: #e33f3f;
          background: #fff0f0;
        }

        .status.incorrect span {
          background: #f04b4b;
        }

        .view-button {
          border: 0;
          background: transparent;
          color: #0068df;
          font-size: 12px;
          cursor: pointer;
          white-space: nowrap;
        }

        /* ================= RIGHT CARDS ================= */

        .right-column {
          display: flex;
          flex-direction: column;
          gap: 13px;
        }

        .side-card {
          border: 1px solid #e0e7f0;
          border-radius: 15px;
          background: #ffffff;
          padding: 16px 18px;
        }

        .side-title {
          display: flex;
          align-items: center;
          gap: 9px;
        }

        .side-title h3 {
          margin: 0;
          font-size: 20px;
          line-height: 1.2;
        }

        .side-emoji {
          font-size: 27px;
          line-height: 1;
        }

        .learned-card ul {
          list-style: none;
          margin: 13px 0 0;
          padding: 0;
          display: flex;
          flex-direction: column;
          gap: 11px;
        }

        .learned-card li {
          position: relative;
          padding-left: 30px;
          font-size: 13px;
          line-height: 1.4;
        }

        .learned-card li::before {
          content: "✓";
          position: absolute;
          left: 0;
          top: 0;
          width: 21px;
          height: 21px;
          border-radius: 50%;
          background: #08a779;
          color: #ffffff;
          display: grid;
          place-items: center;
          font-size: 11px;
          font-weight: 700;
        }

        .keep-card {
          background: #fffaf0;
        }

        .keep-intro {
          margin: 7px 0 8px;
          font-size: 13px;
          line-height: 1.4;
        }

        .action-card,
        .continue-card {
          min-height: 64px;
          border-radius: 11px;
          display: grid;
          grid-template-columns: 38px minmax(0, 1fr) 20px;
          align-items: center;
          gap: 12px;
          padding: 10px 12px;
          text-decoration: none;
          color: #101c68;
          background: #ffffff;
          margin-top: 8px;
          box-sizing: border-box;
        }

        .action-card > span:nth-child(2),
        .continue-card > span:nth-child(2) {
          min-width: 0;
        }

        .action-card strong,
        .action-card small,
        .continue-card strong,
        .continue-card small {
          display: block;
        }

        .action-card strong,
        .continue-card strong {
          font-size: 14px;
          line-height: 1.25;
        }

        .action-card small,
        .continue-card small {
          margin-top: 3px;
          font-size: 11px;
          line-height: 1.35;
          overflow-wrap: anywhere;
        }

        .action-card > b,
        .continue-card > b {
          justify-self: end;
          font-size: 25px;
          color: #d18a52;
          font-weight: 400;
        }

        .continue-card {
          min-height: 64px;
          background: #05a879;
          color: #ffffff;
        }

        .continue-card > b {
          color: #ffffff;
        }

        .continue-icon {
          font-size: 31px;
          text-align: center;
        }

        .help-card {
          background: #eef8ff;
        }

        .help-card p {
          margin: 8px 0 12px 37px;
          font-size: 12px;
          line-height: 1.4;
        }

        .ask-button {
          display: block;
          width: fit-content;
          margin-left: auto;
          border: 1px solid #006bff;
          color: #006bff;
          background: #ffffff;
          border-radius: 9px;
          padding: 9px 15px;
          text-decoration: none;
          font-size: 12px;
          font-weight: 600;
        }

        /* ================= TABLET ================= */

        @media (max-width: 1100px) {
          .quiz-header {
            left: 210px;
            padding: 0 20px;
          }

          .sidebar {
            width: 210px;
          }

          .logo-area {
            padding-left: 18px;
          }

          .logo {
            width: 174px;
          }

          .nav-item {
            padding: 0 14px;
            gap: 12px;
            font-size: 14px;
          }

          .nav-icon {
            font-size: 20px;
          }

          .main-content {
            margin-left: 210px;
            padding-left: 20px;
            padding-right: 20px;
          }

          .result-layout {
            grid-template-columns: 1fr;
          }

          .right-column {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
          }

          .result-hero {
            width: 50%;
          }

          .score-row {
            gap: 20px;
          }
        }

        /* ================= MOBILE ================= */

        @media (max-width: 700px) {
          .result-page {
            padding-bottom: 72px;
          }

          .sidebar {
            display: none;
          }

          .quiz-header {
            left: 0;
            right: 0;
            width: 100%;
            height: 62px;
            padding: 0 12px;
            gap: 8px;
          }

          .quiz-search {
            width: calc(100% - 48px);
            min-width: 0;
            height: 40px;
            padding: 0 10px;
            gap: 7px;
          }

          .quiz-search input {
            min-width: 0;
            font-size: 11px;
          }

          .search-icon {
            flex-shrink: 0;
            font-size: 17px;
          }

          .quiz-profile-area {
            flex-shrink: 0;
            width: 38px;
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

          .main-content {
            width: 100%;
            max-width: 100%;
            margin: 0;
            padding: 74px 12px 82px;
            overflow-x: hidden;
          }

          .course-header {
            width: 100%;
            min-height: 0;
            display: flex;
            flex-direction: column;
          }

          .back-link {
            font-size: 12px;
            margin: 0 0 10px 2px;
            line-height: 1.3;
          }

          .course-info {
            width: 100%;
            display: flex;
            align-items: center;
            gap: 10px;
            max-width: none;
          }

          .course-icon {
            width: 62px;
            min-width: 62px;
            height: 62px;
            border-radius: 10px;
          }

          .course-icon-image {
            width: 55px;
            height: 55px;
          }

          .course-title {
            min-width: 0;
            gap: 2px;
          }

          .course-title span {
            font-size: 11px;
            letter-spacing: 1.2px;
            line-height: 1.2;
          }

          .course-title h1 {
            font-size: 18px;
            line-height: 1.15;
          }

          .course-title p {
            font-size: 12px;
          }

          .course-title small {
            font-size: 11px;
          }

          .result-hero {
            position: relative;
            top: auto;
            right: auto;
            width: 100%;
            height: 125px;
            margin-top: 13px;
            border-radius: 12px;
          }

         .result-hero-image {
  object-fit: contain;
  object-position: center;
  width: 100%;
  height: 100%;
}

          .result-layout {
            width: 100%;
            display: flex;
            flex-direction: column;
            gap: 12px;
            margin-top: 12px;
          }

          .result-main {
            width: 100%;
            min-width: 0;
            padding: 16px 12px 18px;
            border-radius: 13px;
          }

          .result-intro {
            gap: 8px;
          }

          .party-icon {
            font-size: 36px;
          }

          .result-intro h2 {
            font-size: 23px;
          }

          .result-intro p {
            font-size: 11px;
            line-height: 1.35;
          }

          .score-row {
            width: 100%;
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 14px;
            padding: 14px 0 9px;
          }

          .score-circle {
            width: 145px;
            min-width: 145px;
            height: 145px;
          }

          .score-circle::before {
            width: 115px;
            height: 115px;
          }

          .score-circle strong {
            font-size: 29px;
          }

          .score-circle span {
            font-size: 18px;
            margin-top: 5px;
          }

          .score-copy {
            width: 100%;
            text-align: center;
          }

          .score-copy h3 {
            font-size: 28px;
          }

          .score-copy > p {
            font-size: 12px;
            line-height: 1.4;
            margin: 4px 0 11px;
          }

          .reward-row {
            width: 100%;
            grid-template-columns: 1fr 1fr;
            gap: 7px;
          }

          .reward-card {
            min-height: 62px;
            padding: 7px 6px;
            gap: 5px;
            text-align: left;
          }

          .reward-emoji {
            width: 31px;
            min-width: 31px;
            font-size: 27px;
          }

          .reward-card strong {
            font-size: 11px;
          }

          .reward-card div > span {
            font-size: 8px;
          }

          .review-section h3 {
            font-size: 20px;
          }

          .section-subtitle {
            font-size: 10px;
          }

          .question-list {
            gap: 5px;
          }

          .review-row {
            width: 100%;
            min-height: 59px;
            grid-template-columns: 30px minmax(0, 1fr);
            gap: 5px 7px;
            padding: 8px;
          }

          .question-number {
            width: 28px;
            height: 28px;
            font-size: 12px;
          }

          .question-text {
            font-size: 11px;
            line-height: 1.3;
            align-self: center;
          }

          .status {
            grid-column: 2;
            justify-self: start;
            padding: 4px 7px;
            font-size: 9px;
          }

          .status span {
            width: 17px;
            height: 17px;
            font-size: 9px;
          }

          .view-button {
            grid-column: 2;
            justify-self: end;
            grid-row: 2;
            font-size: 9px;
          }

          .right-column {
            width: 100%;
            display: flex;
            gap: 10px;
          }

          .side-card {
            width: 100%;
            min-width: 0;
            padding: 14px;
            border-radius: 12px;
          }

          .side-title h3 {
            font-size: 18px;
          }

          .side-emoji {
            font-size: 24px;
          }

          .learned-card li {
            font-size: 11px;
            padding-left: 27px;
          }

          .learned-card li::before {
            width: 19px;
            height: 19px;
            font-size: 10px;
          }

          .keep-intro {
            font-size: 10px;
          }

          .action-card,
          .continue-card {
            min-height: 57px;
          }

          .action-card strong,
          .continue-card strong {
            font-size: 11px;
          }

          .action-card small,
          .continue-card small {
            font-size: 8px;
          }

          .help-card p {
            margin-left: 34px;
            font-size: 10px;
          }

          .ask-button {
            font-size: 10px;
            padding: 8px 12px;
          }

          /* SAME 7-ITEM MOBILE BAR AS QUIZ PAGE */
          .mobile-bottom-nav {
            position: fixed;
            left: 0;
            right: 0;
            bottom: 0;
            width: 100%;
            height: 66px;
            display: grid;
            grid-template-columns: repeat(7, minmax(0, 1fr));
            align-items: stretch;
            background: #ffffff;
            border-top: 1px solid #dfe5ee;
            box-shadow: 0 -4px 15px rgba(20, 40, 80, 0.08);
            z-index: 9999;
            padding: 3px 2px;
          }

          .mobile-bottom-nav a {
            min-width: 0;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            gap: 2px;
            color: #42547f;
            text-decoration: none;
            font-size: 16px;
            line-height: 1;
            overflow: hidden;
          }

          .mobile-bottom-nav a span {
            display: block;
            font-size: 16px;
            line-height: 20px;
          }

          .mobile-bottom-nav small {
            display: block;
            max-width: 100%;
            font-size: 7px;
            line-height: 9px;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
          }

          .mobile-bottom-nav a.mobile-active {
            color: #009f76;
            font-weight: 700;
          }
        }

        @media (max-width: 380px) {
          .main-content {
            padding-left: 10px;
            padding-right: 10px;
          }

          .quiz-search {
            width: calc(100% - 46px);
          }

          .quiz-search input {
            font-size: 10px;
          }

          .course-title h1 {
            font-size: 17px;
          }

          .result-intro h2 {
            font-size: 21px;
          }

          .question-text {
            font-size: 10.5px;
          }

          .reward-card strong {
            font-size: 10px;
          }

          .mobile-bottom-nav small {
            font-size: 6px;
          }

          .mobile-bottom-nav a span {
            font-size: 15px;
          }
        }

        /* =========================================================
           DASHBOARD HEADER + SIDEBAR + RESULT UI FINAL OVERRIDES
        ========================================================= */

        .topbar {
          position: fixed;
          top: 0;
          left: 280px;
          right: 0;
          width: auto;
          height: 88px;
          border-bottom: 1px solid #e7edf5;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 32px;
          background: #ffffff;
          z-index: 2000;
          box-sizing: border-box;
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
          box-sizing: border-box;
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
          min-width: 0;
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

        .notification-button {
          position: relative;
          border: none;
          background: none;
          font-size: 29px;
          cursor: pointer;
          line-height: 1;
        }

        .notification-dot {
          position: absolute;
          width: 9px;
          height: 9px;
          background: #f0444a;
          border-radius: 50%;
          top: 2px;
          right: 0;
          border: 2px solid #ffffff;
        }

        .topbar-divider {
          width: 1px;
          height: 42px;
          background: #e2e7ef;
        }

        .profile-area {
          position: relative;
          display: flex;
          align-items: center;
        }

        .profile.profile-toggle {
          display: flex;
          align-items: center;
          gap: 12px;
          min-width: 175px;
          padding: 4px;
          border: 0;
          border-radius: 12px;
          background: transparent;
          color: inherit;
          font: inherit;
          text-align: left;
          cursor: pointer;
        }

        .profile.profile-toggle:hover {
          background: #f2faf7;
        }

        .avatar {
          width: 44px;
          height: 44px;
          border-radius: 50%;
          background: #0c9a72;
          color: #ffffff;
          display: flex;
          justify-content: center;
          align-items: center;
          font-size: 17px;
          font-weight: 700;
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
          color: #58688e;
          font-size: 14px;
        }

        .arrow {
          margin-left: auto;
          font-size: 20px;
        }

        .profile-dropdown {
          position: absolute;
          right: 0;
          top: calc(100% + 8px);
          min-width: 210px;
          padding: 8px;
          background: #ffffff;
          border: 1px solid #e1e8f0;
          border-radius: 14px;
          box-shadow: 0 12px 32px rgba(25, 45, 80, 0.16);
          z-index: 3000;
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

        .main-content {
          margin-left: 280px;
          padding-top: 108px;
        }

        /* Keep Going section: make the action rows breathe and align. */
        .keep-card {
          padding-bottom: 14px;
        }

        .action-card:hover {
          background: #f7fbff;
        }

        @media (max-width: 1100px) {
          .topbar {
            left: 210px;
            padding: 0 20px;
          }

          .sidebar {
            width: 210px;
          }

          .main-content {
            margin-left: 210px;
            padding-left: 20px;
            padding-right: 20px;
          }

          .search-box {
            width: min(480px, 55vw);
          }

          .result-hero {
            width: 50%;
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

          .topbar {
            left: 76px;
          }

          .main-content {
            margin-left: 76px;
          }
        }

        @media (max-width: 700px) {
          .result-page {
            min-height: 100vh;
            padding-bottom: 72px;
          }

          .topbar {
            left: 0;
            right: 0;
            width: 100%;
            height: 64px;
            padding: 0 12px;
            gap: 8px;
            z-index: 4000;
          }

          .search-box {
            flex: 1 1 auto;
            width: auto;
            max-width: none;
            min-width: 0;
            height: 42px;
          }

          .search-box input {
            font-size: 12px;
          }

          .notification-button,
          .topbar-divider {
            display: none;
          }

          .profile-area {
            flex: 0 0 auto;
          }

          .profile.profile-toggle {
            min-width: 0;
            gap: 6px;
          }

          .profile-text {
            display: none;
          }

          .profile.profile-toggle .arrow {
            margin-left: 0;
            font-size: 16px;
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
            min-width: 200px;
          }

          /* Dashboard-style mobile bottom navigation */
          .mobile-bottom-nav {
            position: fixed;
            left: 0;
            right: 0;
            bottom: 0;
            width: 100%;
            height: 66px;
            display: grid;
            grid-template-columns: repeat(7, minmax(0, 1fr));
            align-items: stretch;
            background: #ffffff;
            border-top: 1px solid #dfe5ee;
            box-shadow: 0 -4px 15px rgba(20, 40, 80, 0.08);
            z-index: 5000;
            padding: 3px 2px;
          }

          .mobile-bottom-nav a {
            min-width: 0;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            gap: 2px;
            color: #42547f;
            text-decoration: none;
            font-size: 16px;
            line-height: 1;
            overflow: hidden;
          }

          .mobile-bottom-nav a span {
            display: block;
            font-size: 16px;
            line-height: 20px;
          }

          .mobile-bottom-nav small {
            display: block;
            max-width: 100%;
            font-size: 7px;
            line-height: 9px;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
          }

          .mobile-bottom-nav a.mobile-active {
            color: #009f76;
            font-weight: 700;
          }

          .main-content {
            margin-left: 0;
            width: 100%;
            min-height: calc(100vh - 66px);
            padding: 76px 12px 82px;
            overflow-x: hidden;
          }

          .course-header {
            min-height: 0;
          }

          .result-hero {
            position: relative;
            top: auto;
            right: auto;
            width: 100%;
            height: 145px;
            min-height: 145px;
            margin-top: 13px;
            border-radius: 14px;
          }

          .result-hero-image {
            object-fit: contain !important;
            object-position: center !important;
            padding: 0 !important;
          }

          .result-layout {
            margin-top: 14px;
          }

          .action-card,
          .continue-card {
            grid-template-columns: 36px minmax(0, 1fr) 18px;
            gap: 10px;
            padding: 10px;
          }
        }

      `}</style>
    </div>
  );
}
