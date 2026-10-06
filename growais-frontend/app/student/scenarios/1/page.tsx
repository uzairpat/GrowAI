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

export default function ScenarioDetailPage() {
  const [currentQuestion, setCurrentQuestion] = useState(1);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [user, setUser] = useState<User | null>(null);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

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

  const selectedChoice = answers[currentQuestion] ?? null;

  const studentName = user?.full_name || "Student";
  const firstName = studentName.split(" ")[0] || "Student";

  const setSelectedChoice = (choice: string) => {
    setAnswers((previous) => ({
      ...previous,
      [currentQuestion]: choice,
    }));

  };

  const handleLogout = async () => {
    try {
      await apiFetch("/api/auth/logout", {
        method: "POST",
      });
    } finally {
      window.location.href = "/login";
    }
  };

  const handleSubmit = async () => {
    if (!answers[1] || !answers[2] || isSubmitting) {
      return;
    }

    const choiceIdMap: Record<number, Record<string, number>> = {
      1: { A: 1, B: 2, C: 3 },
      2: { A: 4, B: 5, C: 6 },
    };

    const choice1 = choiceIdMap[1][answers[1]];
    const choice2 = choiceIdMap[2][answers[2]];

    if (!choice1 || !choice2) {
      alert("Unable to determine your selected choices. Please try again.");
      return;
    }

    setIsSubmitting(true);

    try {
      await apiFetch("/api/student/scenarios/1/attempts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          answers: [
            {
              question_number: 1,
              choice_id: choice1,
              selected_option: answers[1],
            },
            {
              question_number: 2,
              choice_id: choice2,
              selected_option: answers[2],
            },
          ],
        }),
      });

      window.location.href = "/student/scenarios/1/result";
    } catch (error) {
      console.error("Unable to save scenario attempt:", error);
      alert("Unable to save your scenario result. Please try again.");
      setIsSubmitting(false);
    }
  };

  return (
    <div className="scenario-page">

      {/* =====================================================
          UPDATED STUDENT HEADER
      ===================================================== */}

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
                <strong>Hi, {firstName}</strong>
                <small>Student</small>
              </div>

              <span className="arrow" aria-hidden="true">
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

          <a
            href="/student/profile"
            className="nav-item"
          >
            <span className="nav-icon">♙</span>
            <span>Profile</span>
          </a>

          <a
            href="/student/settings"
            className="nav-item"
          >
            <span className="nav-icon">⚙</span>
            <span>Settings</span>
          </a>

          <a
            href="/student/help"
            className="nav-item"
          >
            <span className="nav-icon">?</span>
            <span>Help</span>
          </a>

          <button
            className="nav-item logout-button"
            type="button"
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

      <main className="scenario-main">

        {/* ===================================================
            TOP SCENARIO HEADER
        =================================================== */}

        <section className="scenario-top">

          <Link
            href="/student/scenarios"
            className="back-link"
          >
            ← Back to Scenarios
          </Link>


          <div className="scenario-heading-row">

            <div className="scenario-info">

              <div className="scenario-icon">

                <Image
                  src="/assets/scenario-weekend-spending.png"
                  alt="Weekend Spending"
                  fill
                  sizes="120px"
                  className="scenario-icon-image"
                />

              </div>


              <div className="scenario-title">

                <h1>
                  Weekend Spending
                </h1>

                <p>
                  Scenario 1
                </p>

                <span className="difficulty">
                  <span>▮▮▮</span>
                  Beginner
                </span>

              </div>

            </div>


            <div className="scenario-hero">

<Image
  src="/assets/scenario-hero-weekend-spending.png"
  alt="Student thinking about spending choices"
  fill
  priority
  sizes="(max-width: 700px) 100vw, 60vw"
  className="scenario-hero-image"
/>

</div>

          </div>

        </section>


        {/* ===================================================
            MAIN CONTENT
        =================================================== */}

        <section className="scenario-content-layout">

          {/* =================================================
              QUESTION AREA
          ================================================= */}

          <div className="question-section">

            <div className="question-card">

              <div className="question-label">
                <span className="question-label-icon">
                  ▤
                </span>

                Situation
              </div>


              <h2>
                It&apos;s the weekend!
              </h2>


              <p className="situation-text">
                You have $500 to spend this weekend. Your friends
                invite you to go to a concert, have dinner together,
                and do some shopping. You also want to save some
                money for a new phone you&apos;ve been thinking about.
              </p>


              {/* QUESTION PROMPT */}

              <div className="decision-box">

                <div className="question-mark">
                  ?
                </div>

                <div>

                  <h3>
                    {currentQuestion === 1
                      ? "What would you do?"
                      : "Your friends suggest an expensive dinner. What would you do?"}
                  </h3>

                  <p>
                    {currentQuestion === 1
                      ? "Choose the option that you think is the best decision."
                      : "Choose the option that best fits your budget and goals."}
                  </p>

                </div>

              </div>


              {/* =================================================
                  QUESTION CHOICES
              ================================================= */}

              <div className="choices">

                {/* QUESTION 1 */}

                {currentQuestion === 1 && (
                  <>
                    {/* OPTION A */}

                    <button
                      type="button"
                      className={`choice-card choice-a ${
                        selectedChoice === "A" ? "selected" : ""
                      }`}
                      onClick={() => setSelectedChoice("A")}
                    >

                      <div className="choice-letter">
                        A
                      </div>

                      <div className="choice-image">

                        <Image
                          src="/assets/scenario-choice-concert1.png"
                          alt="Concert"
                          fill
                          sizes="300px"
                          className="choice-image-img"
                        />

                      </div>

                      <h3>
                        Spend most of the money
                        on entertainment
                      </h3>

                      <p>
                        Go to the concert, have dinner
                        and do some shopping. Spend
                        around $400.
                      </p>

                      <div className="choice-radio">
                        {selectedChoice === "A" && (
                          <span />
                        )}
                      </div>

                    </button>


                    {/* OPTION B */}

                    <button
                      type="button"
                      className={`choice-card choice-b ${
                        selectedChoice === "B" ? "selected" : ""
                      }`}
                      onClick={() => setSelectedChoice("B")}
                    >

                      <div className="choice-letter">
                        B
                      </div>

                      <div className="choice-image">

                        <Image
                          src="/assets/scenario-choice-piggybank2.png"
                          alt="Saving money"
                          fill
                          sizes="300px"
                          className="choice-image-img"
                        />

                      </div>

                      <h3>
                        Set a spending limit
                        and save the rest
                      </h3>

                      <p>
                        Enjoy some activities with
                        friends, but keep a limit
                        (e.g. $250) and save the rest.
                      </p>

                      <div className="choice-radio">
                        {selectedChoice === "B" && (
                          <span />
                        )}
                      </div>

                    </button>


                    {/* OPTION C */}

                    <button
                      type="button"
                      className={`choice-card choice-c ${
                        selectedChoice === "C" ? "selected" : ""
                      }`}
                      onClick={() => setSelectedChoice("C")}
                    >

                      <div className="choice-letter">
                        C
                      </div>

                      <div className="choice-image">

                        <Image
                          src="/assets/scenario-choice-shopping3.png"
                          alt="Shopping"
                          fill
                          sizes="300px"
                          className="choice-image-img"
                        />

                      </div>

                      <h3>
                        Spend everything now
                      </h3>

                      <p>
                        Buy the things you want and
                        enjoy the weekend. You can
                        save later.
                      </p>

                      <div className="choice-radio">
                        {selectedChoice === "C" && (
                          <span />
                        )}
                      </div>

                    </button>
                  </>
                )}


                {/* QUESTION 2 */}

                {currentQuestion === 2 && (
                  <>
                    {/* OPTION A */}

                    <button
                      type="button"
                      className={`choice-card choice-a ${
                        selectedChoice === "A" ? "selected" : ""
                      }`}
                      onClick={() => setSelectedChoice("A")}
                    >

                      <div className="choice-letter">
                        A
                      </div>

                      <div className="choice-image">

                        <Image
                          src="/assets/scenario-weekend-spending.png"
                          alt="Dinner"
                          fill
                          sizes="300px"
                          className="choice-image-img"
                        />

                      </div>

                      <h3>
                        Agree and spend freely
                      </h3>

                      <p>
                        Join your friends and spend
                        a large part of your remaining
                        budget on the dinner.
                      </p>

                      <div className="choice-radio">
                        {selectedChoice === "A" && (
                          <span />
                        )}
                      </div>

                    </button>


                    {/* OPTION B */}

                    <button
                      type="button"
                      className={`choice-card choice-b ${
                        selectedChoice === "B" ? "selected" : ""
                      }`}
                      onClick={() => setSelectedChoice("B")}
                    >

                      <div className="choice-letter">
                        B
                      </div>

                      <div className="choice-image">

                        <Image
                          src="/assets/scenario-save-money.png"
                          alt="Save money"
                          fill
                          sizes="300px"
                          className="choice-image-img"
                        />

                      </div>

                      <h3>
                        Suggest a cheaper option
                      </h3>

                      <p>
                        Explain that you want to enjoy
                        dinner while still staying within
                        your spending limit.
                      </p>

                      <div className="choice-radio">
                        {selectedChoice === "B" && (
                          <span />
                        )}
                      </div>

                    </button>


                    {/* OPTION C */}

                    <button
                      type="button"
                      className={`choice-card choice-c ${
                        selectedChoice === "C" ? "selected" : ""
                      }`}
                      onClick={() => setSelectedChoice("C")}
                    >

                      <div className="choice-letter">
                        C
                      </div>

                      <div className="choice-image">

                        <Image
                          src="/assets/scenario-credit-card.png"
                          alt="Shopping"
                          fill
                          sizes="300px"
                          className="choice-image-img"
                        />

                      </div>

                      <h3>
                        Use your savings for dinner
                      </h3>

                      <p>
                        Spend the money now and worry
                        about saving for your phone later.
                      </p>

                      <div className="choice-radio">
                        {selectedChoice === "C" && (
                          <span />
                        )}
                      </div>

                    </button>
                  </>
                )}

              </div>


              {/* =================================================
                  ACTIONS
              ================================================= */}

              <div className="question-actions">

                <button
                  type="button"
                  className="previous-button"
                  onClick={() => {
                    if (currentQuestion === 2) {
                      setCurrentQuestion(1);
                    } else {
                      window.location.href = "/student/scenarios";
                    }
                  }}
                >
                  ← &nbsp; Previous
                </button>


                {currentQuestion === 1 ? (

                  <button
                    type="button"
                    className={`continue-button ${
                      !selectedChoice ? "disabled" : ""
                    }`}
                    disabled={!selectedChoice}
                    onClick={() => {
                      if (selectedChoice) {
                        setCurrentQuestion(2);
                      }
                    }}
                  >
                    Next
                    <span>→</span>
                  </button>

                ) : (

<button
  type="button"
  className={`continue-button ${
    !(answers[1] && answers[2]) || isSubmitting
      ? "disabled"
      : ""
  }`}
  disabled={!(answers[1] && answers[2]) || isSubmitting}
  onClick={handleSubmit}
>
  {isSubmitting ? "Saving..." : "Submit"}
  <span>{isSubmitting ? "…" : "✓"}</span>
</button>
                )}

              </div>

            </div>

          </div>

          {/* =================================================
              RIGHT SIDEBAR
          ================================================= */}

          <aside className="scenario-right">

            {/* PROGRESS */}

            <div className="right-card progress-card">

              <div className="progress-heading">

                <h3>
                  Scenario Progress
                </h3>

                <span>
                  {currentQuestion} of 2
                </span>

              </div>


              <div className="scenario-progress">

                <div
                  className={`progress-segment ${
                    currentQuestion === 1 ? "active" : ""
                  }`}
                />
                <div
                  className={`progress-segment ${
                    currentQuestion === 2 ? "active" : ""
                  }`}
                />

              </div>

            </div>


            {/* HINT */}

            <div className="right-card hint-card">

              <div className="hint-icon">
                💡
              </div>

              <div>

                <h3>
                  Need a hint?
                </h3>

                <p>
                  Think about your goals and
                  how this choice might affect
                  your future.
                </p>

                <button className="outline-button">
                  Get a Hint
                  <span>→</span>
                </button>

              </div>

            </div>


            {/* REMEMBER */}

            <div className="right-card remember-card">

              <div className="remember-icon">
                🌱
              </div>

              <div>

                <h3>
                  Remember
                </h3>

                <ul>
                  <li>
                    Think about your short-term
                    and long-term goals.
                  </li>

                  <li>
                    Consider what you really need
                    versus what you want.
                  </li>

                  <li>
                    Your choices can have
                    consequences.
                  </li>
                </ul>

              </div>

            </div>


            {/* AI ASSISTANT */}

            <div className="right-card ai-card">

              <div className="ai-icon">
                🤖
              </div>

              <div>

                <h3>
                  Ask AI Assistant
                </h3>

                <p>
                  Have a question about this
                  scenario? Ask our AI Assistant
                  for guidance.
                </p>

                <Link
                  href="/student/ai-assistant"
                  className="outline-button"
                >
                  Ask a Question
                  <span>→</span>
                </Link>

              </div>

            </div>

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


        .scenario-page {
          min-height: 100vh;
          background: #ffffff;
          color: #10165c;
          font-family: Arial, Helvetica, sans-serif;
          overflow-x: hidden;
        }


        /* =====================================================
           UPDATED STUDENT HEADER
        ===================================================== */

        .topbar {
          position: fixed;
          top: 0;
          left: 280px;
          right: 0;
          height: 88px;
          border-bottom: 1px solid #e7edf5;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 32px;
          background: #ffffff;
          z-index: 2000;
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
          flex-shrink: 0;
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

        .notification-button {
          position: relative;
          border: none;
          background: none;
          font-size: 29px;
          color: #46577d;
          cursor: pointer;
          width: 38px;
          height: 42px;
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
          color: #59698e;
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

        .scenario-main {
          margin-left: 280px;
          padding: 96px 32px 40px;
          min-height: 100vh;
        }


        /* =====================================================
           TOP
        ===================================================== */

        .scenario-top {
          min-height: 190px;
        }


        .back-link {
          display: inline-block;
          color: #006cff;
          text-decoration: none;
          font-size: 16px;
          margin: 5px 0 20px 8px;
        }


        .scenario-heading-row {
          display: grid;
          grid-template-columns: 360px minmax(0, 1fr);
          gap: 14px;
          align-items: center;
          justify-content: start;
        }


        .scenario-info {
          display: flex;
          align-items: center;
          gap: 18px;
        }


        .scenario-icon {
          position: relative;
          width: 132px;
          height: 92px;
          flex-shrink: 0;
          border-radius: 14px;
          overflow: hidden;
          background: #f0edff;
        }


        .scenario-icon-image {
          object-fit: contain;
          object-position: center;
        }


        .scenario-title {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }


        .scenario-title h1 {
          margin: 0;
          color: #10165c;
          font-size: 25px;
          line-height: 1.15;
        }


        .scenario-title p {
          margin: 0;
          color: #344879;
          font-size: 16px;
        }


        .difficulty {
          width: fit-content;
          display: inline-flex;
          align-items: center;
          gap: 7px;
          padding: 8px 13px;
          border-radius: 20px;
          background: #e4f8f1;
          color: #008f70;
          font-size: 14px;
          font-weight: 600;
        }


        .scenario-hero {
          position: relative;
          width: 100%;
          max-width: none;
          aspect-ratio: 1791 / 382;
          height: auto;
          min-height: 0;
          border-radius: 16px;
          overflow: hidden;
          background: #e2f8ef;
          justify-self: start;
        }


        .scenario-hero-image {
          object-fit: contain;
          object-position: center;
        }


        .hero-message {
          position: absolute;
          z-index: 2;
          left: 7%;
          top: 34px;
          width: 180px;
          color: #1261a0;
          font-size: 20px;
          line-height: 1.3;
          font-style: italic;
          text-align: center;
        }


        /* =====================================================
           CONTENT LAYOUT
        ===================================================== */

        .scenario-content-layout {
  position: relative;
  z-index: 2;
  clear: both;
  display: grid;
  grid-template-columns: minmax(0, 1fr) 320px;
  gap: 20px;
  align-items: start;
  width: 100%;
  margin-top: 0;
}

.scenario-right {
  position: relative;
  z-index: 3;
  display: flex;
  flex-direction: column;
  gap: 16px;
}


        .question-section {
          min-width: 0;
        }


        .question-card {
          border: 1px solid #e1e8f2;
          border-radius: 16px;
          padding: 18px 20px 22px;
          background: #ffffff;
          box-shadow: 0 4px 18px rgba(30, 60, 100, 0.035);
        }


        .question-label {
          width: fit-content;
          min-height: 42px;
          padding: 0 15px;
          border-radius: 12px;
          background: #edf4ff;
          color: #18245d;
          display: flex;
          align-items: center;
          gap: 10px;
          font-size: 16px;
          font-weight: 700;
        }


        .question-label-icon {
          color: #347ce5;
          font-size: 20px;
        }


        .question-card h2 {
          margin: 17px 0 5px;
          color: #10165c;
          font-size: 30px;
          line-height: 1.2;
        }


        .situation-text {
          max-width: 930px;
          margin: 0;
          color: #40538b;
          font-size: 18px;
          line-height: 1.45;
        }


        /* =====================================================
           DECISION BOX
        ===================================================== */

        .decision-box {
          margin-top: 20px;
          padding: 16px 20px;
          border-radius: 13px;
          background: #edf7ff;
          display: flex;
          align-items: center;
          gap: 16px;
        }


        .question-mark {
          width: 42px;
          height: 42px;
          flex-shrink: 0;
          border-radius: 50%;
          background: #5a9cf0;
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 23px;
          font-weight: 700;
        }


        .decision-box h3 {
          margin: 0 0 3px;
          color: #10165c;
          font-size: 19px;
        }


        .decision-box p {
          margin: 0;
          color: #30477e;
          font-size: 14px;
        }


        /* =====================================================
           CHOICES
        ===================================================== */

        .choices {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 14px;
          margin-top: 14px;
        }


        .choice-card {
          position: relative;
          min-width: 0;
          min-height: 355px;
          padding: 9px;
          border-radius: 13px;
          cursor: pointer;
          text-align: left;
          transition: 0.2s ease;
        }


        .choice-a {
          border: 1px solid #f2dcdc;
          background: #fff7f7;
        }


        .choice-b {
          border: 1px solid #b9eadb;
          background: #f2fcf8;
        }


        .choice-c {
          border: 1px solid #eee3bf;
          background: #fffdf5;
        }


        .choice-card:hover {
          transform: translateY(-2px);
        }


        .choice-card.selected {
          border: 2px solid #05a779;
          box-shadow: 0 0 0 3px rgba(5, 167, 121, 0.08);
        }


        .choice-letter {
          position: absolute;
          top: 14px;
          left: 14px;
          z-index: 3;
          width: 42px;
          height: 42px;
          border-radius: 50%;
          background: rgba(255,255,255,0.9);
          border: 2px solid #ffffff;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 17px;
          font-weight: 700;
          color: #18245d;
        }


        .choice-image {
          position: relative;
          width: 100%;
          aspect-ratio: 700 / 310;
          height: auto;
          min-height: 0;
          border-radius: 11px;
          overflow: hidden;
        }


        .choice-image-img {
          object-fit: contain;
          object-position: center;
        }


        .choice-card h3 {
          margin: 12px 7px 5px;
          color: #10165c;
          font-size: 17px;
          line-height: 1.25;
        }


        .choice-card p {
          margin: 0 7px;
          color: #40538b;
          font-size: 13px;
          line-height: 1.45;
        }


        .choice-radio {
          width: 25px;
          height: 25px;
          margin: 17px auto 0;
          border: 3px solid #7180a3;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
        }


        .choice-card.selected .choice-radio {
          border-color: #05a779;
        }


        .choice-radio span {
          width: 11px;
          height: 11px;
          border-radius: 50%;
          background: #05a779;
        }


        /* =====================================================
           ACTIONS
        ===================================================== */

        .question-actions {
          margin-top: 16px;
          padding-top: 15px;
          border-top: 1px solid #edf0f5;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }


        .previous-button,
        .continue-button {
          min-width: 190px;
          height: 52px;
          padding: 0 24px;
          border-radius: 11px;
          display: flex;
          align-items: center;
          justify-content: center;
          text-decoration: none;
          font-size: 16px;
          font-weight: 600;
        }


        .previous-button {
          background: #edf1f7;
          color: #40538b;
          border: none;
          cursor: pointer;
          font-family: inherit;
        }


        .continue-button {
          background: #05a779;
          color: white;
          gap: 25px;
        }


        .continue-button:hover {
          background: #008f68;
        }


        .continue-button.disabled {
          background: #d8e0e6;
          color: #8a96a5;
          cursor: not-allowed;
        }


        .continue-button span {
          font-size: 22px;
        }


        /* =====================================================
           RIGHT SIDEBAR
        ===================================================== */

        .scenario-right {
          position: relative;
          z-index: 5;
          display: flex;
          flex-direction: column;
          align-items: stretch;
          gap: 18px;
          align-self: start;
          min-width: 0;
          height: fit-content;
        }


        .right-card {
          position: relative;
          z-index: 1;
          width: 100%;
          flex: 0 0 auto;
          border: 1px solid #e0e7f0;
          border-radius: 15px;
          padding: 20px;
          background: #ffffff;
          margin: 0;
          transform: none;
        }


        .progress-card,
        .hint-card,
        .remember-card,
        .ai-card {
          position: relative;
          z-index: 1;
          margin: 0;
          transform: none;
        }


        .progress-card {
          min-height: 116px;
          align-self: stretch;
          margin-top: -24px;
          margin-left: 0;
          margin-right: 0;
          left: 0;
          right: auto;
        }


        .hint-card,
        .remember-card,
        .ai-card {
          align-self: stretch;
          margin-left: 0;
          margin-right: 0;
          left: 0;
          right: auto;
        }


        .progress-heading {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 10px;
        }


        .progress-heading h3 {
          margin: 0;
          color: #10165c;
          font-size: 18px;
        }


        .progress-heading span {
          color: #40538b;
          font-size: 15px;
        }


        .scenario-progress {
          display: grid;
          grid-template-columns: repeat(5, 1fr);
          gap: 5px;
          margin-top: 18px;
        }


        .progress-segment {
          height: 15px;
          border-radius: 20px;
          background: #e8edf5;
        }


        .progress-segment.active {
          background: #05a779;
        }


        .hint-card {
          display: flex;
          gap: 14px;
          background: #f2f8ff;
        }


        .hint-icon {
          font-size: 36px;
          flex-shrink: 0;
        }


        .hint-card h3,
        .remember-card h3,
        .ai-card h3 {
          margin: 0 0 10px;
          color: #10165c;
          font-size: 18px;
        }


        .hint-card p,
        .ai-card p {
          margin: 0 0 15px;
          color: #344879;
          font-size: 14px;
          line-height: 1.45;
        }


        .outline-button {
          width: 100%;
          min-height: 43px;
          padding: 0 12px;
          border: 1px solid #006cff;
          border-radius: 10px;
          background: white;
          color: #006cff;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 15px;
          text-decoration: none;
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
        }


        .remember-card {
          display: flex;
          gap: 14px;
          background: #ffffff;
        }


        .remember-icon {
          font-size: 32px;
          flex-shrink: 0;
        }


        .remember-card ul {
          margin: 0;
          padding-left: 18px;
          color: #344879;
          font-size: 14px;
          line-height: 1.5;
        }


        .remember-card li {
          margin-bottom: 7px;
        }


        .ai-card {
          display: flex;
          gap: 14px;
          background: #f1f8ff;
        }


        .ai-icon {
          font-size: 36px;
          flex-shrink: 0;
        }


        /* =====================================================
           TABLET
        ===================================================== */

        @media (max-width: 1200px) {

          .sidebar {
            width: 230px;
          }


          .scenario-header {
            left: 230px;
          }


          .scenario-main {
            margin-left: 230px;
            padding-left: 20px;
            padding-right: 20px;
          }


          .scenario-heading-row {
            grid-template-columns: 300px minmax(0, 1fr);
            gap: 18px;
            justify-content: start;
          }

          .scenario-hero {
            max-width: 100%;
          }


          .scenario-content-layout {
            grid-template-columns: minmax(0, 1fr) 270px;
          }


          .scenario-title h1 {
            font-size: 21px;
          }


          .situation-text {
            font-size: 16px;
          }


          .choice-card h3 {
            font-size: 15px;
          }

        }


        @media (max-width: 1000px) {

          .scenario-heading-row {
            grid-template-columns: 1fr;
            gap: 14px;
          }


          .scenario-hero {
            width: 100%;
            max-width: 100%;
            height: auto;
            aspect-ratio: 1791 / 382;
          }


          .scenario-content-layout {
            grid-template-columns: 1fr;
          }


          .scenario-right {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
          }

          .progress-card {
            margin-top: 0;
          }

        }


        /* =====================================================
           MOBILE
        ===================================================== */

        @media (max-width: 700px) {

          html,
          body {
            width: 100%;
            max-width: 100%;
            overflow-x: hidden;
          }


          .scenario-page {
            width: 100%;
            min-width: 0;
            padding-bottom: 72px;
          }


          /* UPDATED HEADER */

          .topbar {
            left: 0;
            right: 0;
            width: 100%;
            height: 64px;
            padding: 0 12px;
            gap: 8px;
          }

          .search-box {
            flex: 1;
            width: auto;
            min-width: 0;
            height: 42px;
            padding: 0 10px;
            gap: 7px;
          }

          .search-box input {
            min-width: 0;
            font-size: 11px;
          }

          .search-box span {
            font-size: 19px;
          }

          .topbar-right {
            gap: 0;
          }

          .notification-button,
          .topbar-divider,
          .profile-text,
          .arrow {
            display: none;
          }

          .profile {
            gap: 0;
            min-width: 0;
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

          .scenario-main {
            margin-left: 0;
            width: 100%;
            max-width: 100%;
            padding: 76px 12px 24px;
          }


          .scenario-icon {
            width: 118px;
            height: 82px;
          }


          /* TOP */

          .scenario-top {
  position: relative;
  z-index: 5;
  min-height: 205px;
  width: 100%;
}

.back-link {
  position: relative;
  z-index: 20;
  display: inline-block;
  color: #006cff;
  text-decoration: none;
  font-size: 16px;
  margin: 5px 0 18px 8px;
}

.scenario-heading-row {
  position: relative;
  z-index: 10;
  display: grid;
  grid-template-columns: 360px minmax(0, 1fr);
  gap: 25px;
  align-items: center;
  width: 100%;
}

.scenario-info {
  position: relative;
  z-index: 20;
  display: flex;
  align-items: center;
  gap: 18px;
}

.scenario-hero {
  position: relative;
  z-index: 1;
  width: 100%;
  max-width: 100%;
  height: auto;
  aspect-ratio: 1791 / 382;
  border-radius: 16px;
  overflow: hidden;
  background: #e2f8ef;
}

.scenario-hero-image {
  object-fit: contain;
  object-position: center;
}

          /* CONTENT */

          .scenario-content-layout {
            width: 100%;
            display: flex;
            flex-direction: column;
            gap: 12px;
            margin-top: 12px;
          }


          .question-card {
            width: 100%;
            padding: 13px;
            border-radius: 13px;
          }


          .question-label {
            min-height: 35px;
            padding: 0 11px;
            font-size: 13px;
            border-radius: 9px;
          }


          .question-label-icon {
            font-size: 16px;
          }


          .question-card h2 {
            margin-top: 13px;
            font-size: 23px;
          }


          .situation-text {
            font-size: 13px;
            line-height: 1.45;
          }


          .decision-box {
            margin-top: 14px;
            padding: 12px;
            gap: 10px;
            border-radius: 10px;
          }


          .question-mark {
            width: 34px;
            height: 34px;
            font-size: 18px;
          }


          .decision-box h3 {
            font-size: 15px;
          }


          .decision-box p {
            font-size: 11px;
          }


          /* CHOICES */

          .choices {
            display: flex;
            flex-direction: column;
            gap: 9px;
            margin-top: 10px;
          }


          .choice-card {
            min-height: 0;
            padding: 8px;
            border-radius: 11px;
          }


          .choice-letter {
            top: 12px;
            left: 12px;
            width: 34px;
            height: 34px;
            font-size: 14px;
          }


          .choice-image {
            height: 125px;
            border-radius: 9px;
          }


          .choice-card h3 {
            margin: 9px 6px 4px;
            font-size: 15px;
          }


          .choice-card p {
            margin: 0 6px;
            font-size: 11px;
          }


          .choice-radio {
            width: 22px;
            height: 22px;
            margin: 10px auto 2px;
          }


          .choice-radio span {
            width: 9px;
            height: 9px;
          }


          /* ACTIONS */

          .question-actions {
            margin-top: 12px;
            padding-top: 12px;
            gap: 8px;
          }


          .previous-button,
          .continue-button {
            min-width: 0;
            width: 50%;
            height: 46px;
            padding: 0 10px;
            font-size: 13px;
          }


          .continue-button {
            gap: 10px;
          }


          /* RIGHT SIDE */

          .scenario-right {
            position: relative;
            z-index: 5;
            width: 100%;
            display: flex;
            flex-direction: column;
            align-items: stretch;
            gap: 12px;
            align-self: stretch;
            height: fit-content;
          }


          .right-card {
            width: 100%;
            padding: 14px;
            border-radius: 12px;
          }


          .progress-heading h3 {
            font-size: 14px;
          }


          .progress-heading span {
            font-size: 11px;
          }


          .progress-segment {
            height: 10px;
          }


          .hint-card h3,
          .remember-card h3,
          .ai-card h3 {
            font-size: 15px;
          }


          .hint-card p,
          .ai-card p,
          .remember-card ul {
            font-size: 11px;
          }

        }


        /* =====================================================
           SMALL PHONES
        ===================================================== */

        @media (max-width: 380px) {

          .scenario-main {
            padding-left: 10px;
            padding-right: 10px;
          }


          .scenario-hero {
            height: auto;
            aspect-ratio: 1791 / 382;
          }


          .scenario-icon {
            width: 108px;
            height: 76px;
          }


          .hero-message {
            font-size: 11px;
          }


          .question-card h2 {
            font-size: 21px;
          }


          .situation-text {
            font-size: 12px;
          }


          .choice-image {
            height: auto;
            aspect-ratio: 700 / 310;
          }


          .choice-card h3 {
            font-size: 14px;
          }


          .choice-card p {
            font-size: 10.5px;
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