"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import { apiFetch } from "../../../lib/api";

const scenarios = [
  {
    id: 1,
    title: "Weekend Spending",
    description:
      "You have a budget for the weekend. Can you make good choices and still enjoy yourself?",
    image: "/assets/scenario-weekend-spending.png",
    level: "Beginner",
    time: "5–10 mins",
    recommended: true,
    available: true,
    status: "Not Started",
  },
];

export default function ScenariosPage() {
  const [filter, setFilter] = useState("All Scenarios");
  const [scenarioCompleted, setScenarioCompleted] = useState(false);
  const [scenarioInProgress, setScenarioInProgress] = useState(false);

  useEffect(() => {
    const completed =
      window.localStorage.getItem("growais_scenario_1_completed") === "true";

    const inProgress =
      window.localStorage.getItem("growais_scenario_1_in_progress") === "true";

    setScenarioCompleted(completed);
    setScenarioInProgress(inProgress);
  }, []);

  const currentScenarioStatus = scenarioCompleted
    ? "Completed"
    : scenarioInProgress
      ? "In Progress"
      : "Not Started";

  const filteredScenarios = scenarios.filter((scenario) => {
    if (filter === "All Scenarios") return true;
    return currentScenarioStatus === filter;
  });

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
    <div className="scenario-page">

      {/* =====================================================
          HEADER
      ===================================================== */}

      <header className="scenario-header">

        <div className="scenario-search">
          <span className="search-icon">⌕</span>

          <input
            type="text"
            placeholder="Search lessons, quizzes, or topics..."
          />
        </div>

        <div className="scenario-profile-area">

          <button className="notification">
            ♧
            <span />
          </button>

          <div className="top-divider" />

          <div className="profile">

            <div className="avatar">
              M
            </div>

            <div className="profile-text">
              <strong>Hi, Mohamed</strong>
              <small>Student</small>
            </div>

            <span className="profile-arrow">
              ⌄
            </span>

          </div>

        </div>

      </header>


      {/* =====================================================
          SIDEBAR
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

          <a
            href="/student/dashboard"
            className="nav-item"
          >
            <span className="nav-icon">⌂</span>
            <span>Home</span>
          </a>


          <a
            href="/student/lessons"
            className="nav-item"
          >
            <span className="nav-icon">▣</span>
            <span>My Learning</span>
          </a>


          <a
            href="/student/quiz"
            className="nav-item"
          >
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


          <a
            href="/student/goals"
            className="nav-item"
          >
            <span className="nav-icon">◎</span>
            <span>My Goals</span>
          </a>


          <a
            href="/student/progress"
            className="nav-item"
          >
            <span className="nav-icon">▥</span>
            <span>My Progress</span>
          </a>


          <a
            href="/student/ai-assistant"
            className="nav-item"
          >
            <span className="nav-icon">🤖</span>
            <span>AI Assistant</span>
          </a>

        </nav>


        <div className="sidebar-divider" />


        <nav className="secondary-nav">

          <a href="#" className="nav-item">
            <span className="nav-icon">♧</span>
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

        <section className="scenario-layout">

          {/* =================================================
              MAIN CONTENT
          ================================================= */}

          <div className="scenario-content">

            {/* HERO */}

            <section className="scenario-intro">

              <div className="intro-text">

                <span className="eyebrow">
                  FINANCIAL SCENARIOS
                </span>

                <h1>
                  Practise. Decide.{" "}
                  <span>Grow.</span>
                </h1>

                <p>
                  Explore real-life situations, make decisions,
                  and see how your choices can impact your
                  financial future.
                </p>

              </div>


              <div className="scenario-hero">

                <Image
                  src="/assets/scenario-list-hero.png"
                  alt="Student exploring financial scenarios"
                  fill
                  priority
                  sizes="(max-width: 700px) 100vw, 55vw"
                  className="scenario-hero-image"
                />

              </div>

            </section>


            {/* FILTER BAR */}

            <section className="scenario-toolbar">

              <div className="filters">

                {[
                  "All Scenarios",
                  "Not Started",
                  "In Progress",
                  "Completed",
                ].map((item) => (

                  <button
                    key={item}
                    className={
                      filter === item
                        ? "filter active"
                        : "filter"
                    }
                    onClick={() => setFilter(item)}
                  >
                    {item}
                  </button>

                ))}

              </div>


              <div className="sort-area">

                <span>
                  Sort by
                </span>

                <button className="sort-button">
                  Recommended
                  <span>⌄</span>
                </button>

              </div>

            </section>


            {/* SCENARIO CARDS */}

            <section className="scenario-grid">

              {filteredScenarios.map((scenario) => (

                <article
                  key={scenario.id}
                  className={`scenario-card ${
                    scenario.recommended
                      ? "recommended-card"
                      : ""
                  }`}
                >

                  {scenario.recommended && (
                    <div className="recommended-badge">
                      ★ Recommended
                    </div>
                  )}


                  <div className="scenario-image">

                    <Image
                      src={scenario.image}
                      alt={scenario.title}
                      fill
                      sizes="(max-width: 700px) 100vw, 30vw"
                      className="scenario-card-image"
                    />

                  </div>


                  <h2>
                    {scenario.id}. {scenario.title}
                  </h2>


                  <p className="scenario-description">
                    {scenario.description}
                  </p>


                  <div className="scenario-meta">

                    <span
                      className={`difficulty ${scenario.level.toLowerCase()}`}
                    >
                      <span className="difficulty-icon">
                        ▮▮▮
                      </span>

                      {scenario.level}
                    </span>


                    <span className="scenario-time">
                      ◷ {scenario.time}
                    </span>

                  </div>

                  <div className={`scenario-status ${currentScenarioStatus.toLowerCase().replace(" ", "-")}`}>
                    {currentScenarioStatus}
                  </div>


                  {scenario.available ? (

                    <Link
                      href="/student/scenarios/1"
                      className={`start-button ${
                        scenario.id !== 1
                          ? "secondary-start"
                          : ""
                      }`}
                    >
                      {scenarioCompleted ? "Review Scenario" : scenarioInProgress ? "Continue Scenario" : "Start Scenario"}
                      <span>→</span>
                    </Link>

                  ) : (

                    <button
                      className="coming-button"
                      disabled
                    >
                      <span>🔒</span>
                      Coming Soon
                    </button>

                  )}

                </article>

              ))}

            </section>

          </div>


          {/* =================================================
              RIGHT SIDEBAR
          ================================================= */}

          <aside className="scenario-right">

            {/* WHY SCENARIOS */}

            <div className="right-card why-card">

              <div className="right-card-icon">
                💡
              </div>

              <h3>
                Why Scenarios?
              </h3>

              <p>
                Practising real-life situations helps you
                build confidence and make smarter financial
                decisions in the future.
              </p>

            </div>


            {/* QUOTE */}

            <div className="right-card quote-card">

              <div className="quote-symbol">
                “
              </div>

              <p>
                “Small decisions
                <br />
                today can lead to
                <br />
                big opportunities
                <br />
                tomorrow.”
              </p>

              <span>
                — GrowAIs
              </span>

              <div className="quote-plant">
                🌿
              </div>

            </div>


            {/* AI HELP */}

            <div className="right-card ai-help-card">

              <div className="ai-help-icon">
                🤖
              </div>

              <h3>
                Need Help?
              </h3>

              <p>
                Ask our AI Assistant if you're not sure
                what to do or want to understand a
                scenario better.
              </p>

              <Link
                href="/student/ai-assistant"
                className="ai-help-button"
              >
                Ask AI Assistant
                <span>→</span>
              </Link>

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
           HEADER
        ===================================================== */

        .scenario-header {
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
          z-index: 100;
        }


        .scenario-search {
          width: 560px;
          height: 44px;
          background: #f4f7fb;
          border-radius: 12px;
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 0 18px;
        }


        .scenario-search input {
          width: 100%;
          border: none;
          outline: none;
          background: transparent;
          color: #344879;
          font-size: 15px;
        }


        .scenario-search input::placeholder {
          color: #7180a3;
        }


        .search-icon {
          font-size: 24px;
          color: #344879;
        }


        .scenario-profile-area {
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
          color: white;
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


        /* =====================================================
           SIDEBAR
        ===================================================== */

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
          z-index: 20;
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


        .scenario-layout {
          display: grid;
          grid-template-columns: minmax(0, 1fr) 245px;
          gap: 22px;
          align-items: start;
        }


        .scenario-content {
          min-width: 0;
        }


        /* =====================================================
           INTRO
        ===================================================== */

        .scenario-intro {
          min-height: 175px;
          display: grid;
          grid-template-columns: minmax(0, 1fr) 58%;
          gap: 25px;
          align-items: center;
        }


        .intro-text {
          padding-left: 8px;
        }


        .eyebrow {
          display: block;
          margin-bottom: 8px;
          color: #52659a;
          font-size: 14px;
          font-weight: 700;
          letter-spacing: 3px;
        }


        .intro-text h1 {
          margin: 0;
          color: #10165c;
          font-size: clamp(34px, 3.2vw, 54px);
          line-height: 1.05;
          font-weight: 800;
        }


        .intro-text h1 span {
          color: #05a779;
        }


        .intro-text p {
          max-width: 620px;
          margin: 14px 0 0;
          color: #40538b;
          font-size: 20px;
          line-height: 1.4;
        }


        .scenario-hero {
          position: relative;
          width: 100%;
          height: 180px;
          border-radius: 18px;
          overflow: hidden;
          background: #e5faf3;
        }


        .scenario-hero-image {
          object-fit: cover;
          object-position: center;
        }


        /* =====================================================
           TOOLBAR
        ===================================================== */

        .scenario-toolbar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 20px;
          margin: 5px 0 16px;
        }


        .filters {
          display: flex;
          gap: 10px;
          flex-wrap: wrap;
        }


        .filter {
          height: 42px;
          padding: 0 22px;
          border: none;
          border-radius: 22px;
          background: #f2f5fa;
          color: #344879;
          font-size: 14px;
          cursor: pointer;
        }


        .filter.active {
          background: #05a779;
          color: #ffffff;
          font-weight: 700;
        }


        .sort-area {
          display: flex;
          align-items: center;
          gap: 10px;
          color: #344879;
          font-size: 14px;
          white-space: nowrap;
        }


        .sort-button {
          min-width: 155px;
          height: 42px;
          padding: 0 14px;
          border: 1px solid #e0e7f0;
          border-radius: 22px;
          background: #ffffff;
          color: #18245d;
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-size: 14px;
        }


        /* =====================================================
           SCENARIO GRID
        ===================================================== */

        .scenario-grid {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 14px;
        }


        .scenario-card {
          position: relative;
          min-width: 0;
          border: 1px solid #e1e8f2;
          border-radius: 15px;
          padding: 16px;
          background: #ffffff;
          box-shadow: 0 4px 16px rgba(30, 60, 100, 0.035);
        }


        .scenario-card.recommended-card {
          border-color: #05a779;
        }


        .recommended-badge {
          position: absolute;
          top: 10px;
          right: 10px;
          z-index: 5;
          height: 32px;
          padding: 0 13px;
          border-radius: 17px;
          background: #05a779;
          color: #ffffff;
          display: flex;
          align-items: center;
          font-size: 12px;
          font-weight: 700;
        }


        .scenario-image {
          position: relative;
          width: 100%;
          height: 128px;
          border-radius: 12px;
          overflow: hidden;
          background: #edf6ff;
        }


        .scenario-card-image {
          object-fit: cover;
          object-position: center;
        }


        .scenario-card h2 {
          margin: 12px 0 5px;
          color: #10165c;
          font-size: 18px;
          line-height: 1.25;
        }


        .scenario-description {
          min-height: 54px;
          margin: 0;
          color: #52638d;
          font-size: 14px;
          line-height: 1.4;
        }


        .scenario-meta {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 8px;
          margin: 14px 0 12px;
        }


        .difficulty {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 6px 11px;
          border-radius: 18px;
          font-size: 12px;
          font-weight: 700;
        }


        .difficulty.beginner {
          background: #e4f8f1;
          color: #008f70;
        }


        .difficulty.intermediate {
          background: #fff4dc;
          color: #dc8b00;
        }


        .difficulty.advanced {
          background: #ffe9ed;
          color: #e64a61;
        }


        .difficulty-icon {
          font-size: 11px;
        }


        .scenario-status {
          margin-top: 8px;
          font-size: 13px;
          font-weight: 700;
          color: #6b7899;
        }

        .scenario-status.completed {
          color: #05a779;
        }

        .scenario-status.in-progress {
          color: #d28a00;
        }

        .scenario-status.not-started {
          color: #6b7899;
        }

        .scenario-time {
          color: #52638d;
          font-size: 13px;
          white-space: nowrap;
        }


        .start-button,
        .coming-button {
          width: 100%;
          min-height: 45px;
          border-radius: 11px;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 14px;
          text-decoration: none;
          font-size: 14px;
          font-weight: 700;
        }


        .start-button {
          background: #05a779;
          color: #ffffff;
        }


        .start-button:hover {
          background: #008f68;
        }


        .secondary-start {
          background: #e5f8f2;
          color: #008f70;
        }


        .secondary-start:hover {
          background: #d5f2e9;
        }


        .coming-button {
          border: none;
          background: #eef1f5;
          color: #7180a3;
        }


        /* =====================================================
           RIGHT CARDS
        ===================================================== */

        .scenario-right {
          display: flex;
          flex-direction: column;
          gap: 18px;
        }


        .right-card {
          border: 1px solid #e0e7f0;
          border-radius: 15px;
          padding: 20px;
          background: #ffffff;
        }


        .right-card h3 {
          margin: 0;
          color: #10165c;
          font-size: 18px;
        }


        .right-card p {
          color: #344879;
          font-size: 14px;
          line-height: 1.5;
        }


        .why-card {
          background: #f2f8ff;
        }


        .right-card-icon {
          font-size: 32px;
          margin-bottom: 8px;
        }


        .why-card p {
          margin: 12px 0 0;
        }


        .quote-card {
          position: relative;
          min-height: 205px;
          overflow: hidden;
          background: #f2f8ff;
        }


        .quote-symbol {
          color: #8eb9f0;
          font-size: 55px;
          line-height: 35px;
        }


        .quote-card p {
          position: relative;
          z-index: 2;
          margin: 15px 0 8px;
          color: #10165c;
          font-size: 19px;
          line-height: 1.35;
          font-weight: 500;
        }


        .quote-card span {
          color: #40538b;
          font-size: 14px;
        }


        .quote-plant {
          position: absolute;
          right: -5px;
          bottom: -5px;
          font-size: 55px;
        }


        .progress-card {
          background: #ffffff;
        }


        .progress-title {
          display: flex;
          align-items: center;
          gap: 10px;
        }


        .progress-title h3 {
          font-size: 17px;
        }


        .trophy {
          font-size: 28px;
        }


        .progress-card p {
          margin: 18px 0 10px;
        }


        .progress-bar {
          width: 100%;
          height: 12px;
          border-radius: 20px;
          background: #e8edf5;
          overflow: hidden;
        }


        .progress-fill {
          height: 100%;
          border-radius: inherit;
          background: #05a779;
        }


        .progress-bottom {
          display: flex;
          justify-content: flex-end;
          margin-top: 6px;
        }


        .progress-bottom span {
          color: #05a779;
          font-weight: 700;
          font-size: 14px;
        }


        .progress-link {
          display: block;
          margin-top: 18px;
          padding-top: 15px;
          border-top: 1px solid #edf0f5;
          text-align: center;
          color: #006cff;
          text-decoration: none;
          font-size: 14px;
          font-weight: 600;
        }


        .ai-help-card {
          background: #f1f8ff;
        }


        .ai-help-icon {
          font-size: 36px;
          margin-bottom: 8px;
        }


        .ai-help-card p {
          margin: 12px 0 15px;
        }


        .ai-help-button {
          min-height: 44px;
          padding: 0 12px;
          border: 1px solid #006cff;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          color: #006cff;
          background: #ffffff;
          text-decoration: none;
          font-size: 13px;
          font-weight: 600;
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
            padding-left: 22px;
            padding-right: 22px;
          }


          .scenario-layout {
            grid-template-columns: minmax(0, 1fr) 220px;
          }


          .scenario-intro {
            grid-template-columns: minmax(0, 1fr) 52%;
          }


          .intro-text h1 {
            font-size: 38px;
          }


          .intro-text p {
            font-size: 17px;
          }


          .scenario-grid {
            gap: 10px;
          }


          .scenario-card {
            padding: 12px;
          }

        }


        @media (max-width: 1000px) {

          .scenario-layout {
            grid-template-columns: 1fr;
          }


          .scenario-right {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
          }


          .scenario-intro {
            grid-template-columns: 1fr 48%;
          }


          .scenario-grid {
            grid-template-columns: repeat(2, 1fr);
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


          /* HEADER */

          .scenario-header {
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


          .scenario-search {
            flex: 1;
            width: auto;
            min-width: 0;
            height: 42px;
            padding: 0 10px;
            gap: 7px;
          }


          .scenario-search input {
            min-width: 0;
            width: 100%;
            font-size: 11px;
          }


          .search-icon {
            flex-shrink: 0;
            font-size: 19px;
          }


          .scenario-profile-area {
            display: flex;
            flex-shrink: 0;
            gap: 0;
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


          /* =================================================
             MOBILE BOTTOM NAV
          ================================================= */

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
            min-height: calc(100vh - 66px);
            padding: 76px 12px 24px;
            overflow-x: hidden;
          }


          .scenario-layout {
            width: 100%;
            display: flex;
            flex-direction: column;
            gap: 14px;
          }


          .scenario-content {
            width: 100%;
          }


          /* INTRO */

          .scenario-intro {
            width: 100%;
            min-height: 0;
            display: flex;
            flex-direction: column;
            gap: 12px;
            align-items: stretch;
          }


          .intro-text {
            padding-left: 2px;
          }


          .eyebrow {
            margin-bottom: 5px;
            font-size: 10px;
            letter-spacing: 2px;
          }


          .intro-text h1 {
            font-size: 30px;
            line-height: 1.05;
          }


          .intro-text p {
            margin-top: 8px;
            font-size: 13px;
            line-height: 1.4;
          }


          .scenario-hero {
            width: 100%;
            height: 135px;
            border-radius: 12px;
          }


          .scenario-hero-image {
            object-fit: cover;
            object-position: center;
          }


          /* TOOLBAR */

          .scenario-toolbar {
            width: 100%;
            margin: 4px 0 12px;
            display: flex;
            flex-direction: column;
            align-items: stretch;
            gap: 9px;
          }


          .filters {
            width: 100%;
            display: flex;
            overflow-x: auto;
            flex-wrap: nowrap;
            gap: 7px;
            padding-bottom: 2px;
            scrollbar-width: none;
          }


          .filters::-webkit-scrollbar {
            display: none;
          }


          .filter {
            flex-shrink: 0;
            height: 36px;
            padding: 0 14px;
            font-size: 11px;
          }


          .sort-area {
            width: 100%;
            justify-content: space-between;
            font-size: 12px;
          }


          .sort-button {
            min-width: 145px;
            height: 36px;
            font-size: 12px;
          }


          /* CARDS */

          .scenario-grid {
            width: 100%;
            display: flex;
            flex-direction: column;
            gap: 12px;
          }


          .scenario-card {
            width: 100%;
            padding: 12px;
            border-radius: 13px;
          }


          .recommended-badge {
            top: 8px;
            right: 8px;
            height: 27px;
            padding: 0 9px;
            font-size: 10px;
          }


          .scenario-image {
            width: 100%;
            height: 145px;
            border-radius: 10px;
          }


          .scenario-card h2 {
            margin-top: 10px;
            font-size: 17px;
          }


          .scenario-description {
            min-height: 0;
            font-size: 12px;
            line-height: 1.45;
          }


          .scenario-meta {
            margin: 11px 0;
          }


          .difficulty {
            padding: 5px 9px;
            font-size: 10px;
          }


          .scenario-time {
            font-size: 11px;
          }


          .start-button,
          .coming-button {
            min-height: 43px;
            font-size: 12px;
          }


          /* RIGHT SIDE */

          .scenario-right {
            width: 100%;
            display: flex;
            flex-direction: column;
            gap: 10px;
          }


          .right-card {
            width: 100%;
            padding: 15px;
            border-radius: 12px;
          }


          .right-card h3 {
            font-size: 15px;
          }


          .right-card p {
            font-size: 12px;
          }


          .quote-card {
            min-height: 165px;
          }


          .quote-card p {
            font-size: 16px;
          }


          .progress-title h3 {
            font-size: 14px;
          }


          .ai-help-card {
            margin-bottom: 5px;
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


          .intro-text h1 {
            font-size: 27px;
          }


          .intro-text p {
            font-size: 12px;
          }


          .scenario-hero {
            height: 120px;
          }


          .scenario-image {
            height: 130px;
          }


          .scenario-card h2 {
            font-size: 16px;
          }


          .scenario-description {
            font-size: 11px;
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