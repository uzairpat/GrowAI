"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import { apiFetch } from "../../../../lib/api";

export default function LessonPage() {
  const [completed, setCompleted] = useState(false);

  useEffect(() => {
    const savedCompletion = localStorage.getItem("growais_lesson_1_completed");

    if (savedCompletion === "true") {
      setCompleted(true);
    }
  }, []);

  const completeLesson = () => {
    localStorage.setItem("growais_lesson_1_completed", "true");
    setCompleted(true);
  };

  return (
    <div className="growais-lesson-page">

      {/* =====================================================
          TOP HEADER
      ===================================================== */}
      <header className="growais-lesson-header">

        <div className="growais-search-box">
          <span className="growais-search-icon">⌕</span>
          <span>Search lessons, quizzes, or topics...</span>
        </div>

        <div className="growais-header-right">

          <div className="growais-notification">
            ♧
            <span className="growais-notification-dot"></span>
          </div>

          <div className="growais-profile">

            <div className="growais-profile-circle">
              M
            </div>

            <div className="growais-profile-info">
              <strong>Hi, Mohamed</strong>
              <span>Student</span>
            </div>

            <span className="growais-profile-arrow">
             ⌄
            </span>

          </div>

        </div>

      </header>


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

          <a href="/student/quizzes" className="nav-item">
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




      {/* =====================================================
          MAIN CONTENT
      ===================================================== */}
      <main className="growais-lesson-main">

        {/* BACK */}
        <Link
          href="/student/lessons"
          className="growais-back-link"
        >
          ← Back to My Lessons
        </Link>


        {/* =====================================================
            LESSON HEADER
        ===================================================== */}
        <section className="growais-lesson-heading">

          <div className="growais-lesson-thumbnail">

            <Image
              src="/assets/budgeting-basics.png"
              alt="Budgeting Basics"
              width={120}
              height={120}
              className="growais-lesson-thumbnail-image"
            />

          </div>


          <div className="growais-lesson-title">

            <div className="growais-sample-label">
              SAMPLE LESSON
            </div>

            <h1>
              Budgeting Basics
            </h1>

            <p>
              Learn the basics of planning and managing your money.
            </p>

          </div>


          <div className="growais-lesson-progress">

            <div className="growais-progress-title">
              Lesson Progress
            </div>

            <div className="growais-progress-row">

              <div className="growais-progress-background">

                <div
                  className="growais-progress-fill"
                  style={{
                    width: completed ? "100%" : "0%",
                  }}
                />

              </div>

              <strong>
                {completed ? "100%" : "0%"}
              </strong>

            </div>

          </div>

        </section>


        {/* =====================================================
            HERO
        ===================================================== */}
        <section className="growais-lesson-hero">

          <div className="growais-hero-copy">

            <h2>
              A simple plan
              <br />
              for a brighter
              <br />
              tomorrow!
            </h2>

          </div>


          <div className="growais-hero-visual">

            <div className="growais-hero-circle">

              <Image
                src="/assets/budgeting-basics.png"
                alt="Budgeting"
                width={300}
                height={220}
                className="growais-hero-image"
              />

            </div>

          </div>

        </section>


        {/* =====================================================
            LESSON CONTENT
        ===================================================== */}
        <article className="growais-lesson-content">


          {/* WHAT IS A BUDGET */}
          <h2>
            What is a Budget?
          </h2>

          <p>
            A budget is a simple plan for how you will use your money.
            It helps you understand how much money you have, what you
            need to spend, and how much you can save.
          </p>

          <p>
            For example, imagine you receive $500 during a month.
            Instead of spending all of it immediately, you can decide
            how much will go towards food, entertainment, shopping,
            savings, and other needs.
          </p>


          {/* KEY POINT */}
          <div className="growais-key-point">

            <div className="growais-key-icon">
              💡
            </div>

            <div>

              <h3>
                Key Point
              </h3>

              <p>
                A budget helps you plan before you spend.
                It can make it easier to control your spending
                and work towards your goals.
              </p>

            </div>

          </div>


          {/* WHY BUDGETING */}
          <h2>
            Why is Budgeting Important?
          </h2>

          <p>
            Budgeting is useful because it gives you a clearer picture
            of your money. When you know where your money is going,
            you can make more informed choices.
          </p>


          {/* THREE CARDS */}
          <div className="growais-info-cards">

            <div className="growais-info-card growais-card-blue">

              <div className="growais-info-icon">
                💰
              </div>

              <h3>
                Plan
              </h3>

              <p>
                Decide how you want to use your money before spending it.
              </p>

            </div>


            <div className="growais-info-card growais-card-purple">

              <div className="growais-info-icon">
                🛍️
              </div>

              <h3>
                Control
              </h3>

              <p>
                Understand your spending and avoid unnecessary purchases.
              </p>

            </div>


            <div className="growais-info-card growais-card-green">

              <div className="growais-info-icon">
                🎯
              </div>

              <h3>
                Save
              </h3>

              <p>
                Put money aside for something you want or need in the future.
              </p>

            </div>

          </div>


          {/* SIMPLE EXAMPLE */}
          <h2>
            A Simple Example
          </h2>

          <p>
            Imagine you receive $500 this month. You could create
            a simple plan like this:
          </p>


          {/* TABLE */}
          <div className="growais-budget-table">

            <div className="growais-table-row growais-table-header">
              <span>Category</span>
              <span>Amount</span>
            </div>


            <div className="growais-table-row">
              <span>Food</span>
              <strong>$150</strong>
            </div>


            <div className="growais-table-row">
              <span>Entertainment</span>
              <strong>$100</strong>
            </div>


            <div className="growais-table-row">
              <span>Shopping</span>
              <strong>$100</strong>
            </div>


            <div className="growais-table-row">
              <span>Savings</span>
              <strong>$150</strong>
            </div>


            <div className="growais-table-row growais-total-row">
              <strong>Total</strong>
              <strong>$500</strong>
            </div>

          </div>


          {/* TAKEAWAYS */}
          <h2>
            Key Takeaways
          </h2>


          <div className="growais-takeaways">

            <p>
              ✓ A budget is a plan for your money.
            </p>

            <p>
              ✓ Budgeting helps you understand where your money goes.
            </p>

            <p>
              ✓ Planning can help you control unnecessary spending.
            </p>

            <p>
              ✓ Saving is easier when you give your money a purpose.
            </p>

          </div>


          {/* =====================================================
              COMPLETION
          ===================================================== */}
          <div className="growais-completion-card">

            <div className="growais-completion-icon">
              {completed ? "🎉" : "🎓"}
            </div>


            <h2>
              {completed
                ? "Lesson Completed!"
                : "Finished reading?"}
            </h2>


            <p>
              {completed
                ? "Great job! You have completed this sample lesson. Continue to the quiz when you're ready."
                : "Once you understand the lesson, mark it as complete. You can then continue to the quiz and test what you learned."}
            </p>


            <div className="growais-completion-actions">

              <button
                type="button"
                className={
                  completed
                    ? "growais-complete-button growais-completed"
                    : "growais-complete-button"
                }
                onClick={completeLesson}
                disabled={completed}
              >
                {completed
                  ? "✓ Lesson Completed"
                  : "✓ Complete Lesson"}
              </button>


              <Link
                href="/student/quiz/1"
                className="growais-quiz-button"
              >
                Continue to Quiz →
              </Link>

            </div>

          </div>

        </article>

      </main>


      {/* =====================================================
          CSS
      ===================================================== */}
      <style jsx>{`

        /* =====================================================
           PAGE
        ===================================================== */

        .growais-lesson-page {
          min-height: 100vh;
          background: #ffffff;
          color: #10165c;
          font-family: Arial, Helvetica, sans-serif;
        }


        /* =====================================================
           HEADER
        ===================================================== */

        .growais-lesson-header {
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


        .growais-search-box {
          width: 560px;
          height: 44px;

          background: #f4f7fb;
          border-radius: 12px;

          display: flex;
          align-items: center;

          gap: 12px;

          padding: 0 18px;

          color: #7180a3;

          font-size: 15px;
        }


        .growais-search-icon {
          font-size: 24px;
          color: #344879;
        }


        .growais-header-right {
          display: flex;
          align-items: center;
          gap: 24px;
        }


        .growais-notification {
          position: relative;

          font-size: 26px;
          color: #344879;

          width: 30px;
          height: 35px;

          display: flex;
          align-items: center;
          justify-content: center;
        }


        .growais-notification-dot {
          position: absolute;

          width: 8px;
          height: 8px;

          background: #ff4d4d;

          border-radius: 50%;

          top: 3px;
          right: 0;
        }


        .growais-profile {
          height: 50px;

          display: flex;
          align-items: center;

          gap: 12px;

          border-left: 1px solid #e4e8f0;

          padding-left: 22px;
        }


        .growais-profile-circle {
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


        .growais-profile-info {
          display: flex;
          flex-direction: column;
          gap: 3px;
        }


        .growais-profile-info strong {
          font-size: 15px;
        }


        .growais-profile-info span {
          font-size: 13px;
          color: #53638a;
        }


        .growais-profile-arrow {
          margin-left: 8px;
          font-size: 18px;
        }


        /* SIDEBAR */

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

        .growais-lesson-main {
          margin-left: 280px;

          padding: 100px 48px 70px;

          max-width: 1600px;

          min-height: 100vh;
        }


        .growais-back-link {
          display: inline-block;

          color: #1264d6;

          text-decoration: none;

          font-size: 15px;

          font-weight: 500;

          margin-bottom: 24px;
        }


        .growais-back-link:hover {
          text-decoration: underline;
        }


        /* =====================================================
           LESSON HEADER
        ===================================================== */

        .growais-lesson-heading {
          display: flex;

          align-items: center;

          gap: 20px;

          margin-bottom: 26px;
        }


        .growais-lesson-thumbnail {
          width: 100px;
          height: 100px;

          flex-shrink: 0;

          background: #eafaf4;

          border-radius: 18px;

          display: flex;

          align-items: center;
          justify-content: center;

          overflow: hidden;
        }


        .growais-lesson-thumbnail-image {
          width: 100%;
          height: 100%;

          object-fit: contain;
        }


        .growais-lesson-title {
          flex: 1;
          min-width: 0;
        }


        .growais-sample-label {
          color: #05a779;

          font-size: 13px;

          font-weight: 700;

          letter-spacing: 0.12em;

          margin-bottom: 5px;
        }


        .growais-lesson-title h1 {
          margin: 0 0 7px;

          font-size: 38px;

          line-height: 1.1;

          color: #10165c;
        }


        .growais-lesson-title p {
          margin: 0;

          color: #53638a;

          font-size: 16px;
        }


        /* PROGRESS */

        .growais-lesson-progress {
          width: 280px;

          flex-shrink: 0;
        }


        .growais-progress-title {
          font-weight: 700;

          font-size: 14px;

          margin-bottom: 9px;
        }


        .growais-progress-row {
          display: flex;

          align-items: center;

          gap: 12px;

          color: #05a779;
        }


        .growais-progress-background {
          flex: 1;

          height: 10px;

          background: #e7edf5;

          border-radius: 20px;

          overflow: hidden;
        }


        .growais-progress-fill {
          height: 100%;

          background: #05a779;

          border-radius: 20px;

          transition: width 0.4s ease;
        }


        /* =====================================================
           HERO
        ===================================================== */

        .growais-lesson-hero {
          width: 100%;

          height: 260px;

          border-radius: 22px;

          overflow: hidden;

          background:
            linear-gradient(
              90deg,
              #e5faf2 0%,
              #d8f7ea 50%,
              #effbf7 100%
            );

          display: flex;

          align-items: center;

          justify-content: space-between;

          margin-bottom: 40px;
        }


        .growais-hero-copy {
          width: 45%;

          padding-left: 55px;
        }


        .growais-hero-copy h2 {
          margin: 0;

          font-size: 27px;

          line-height: 1.45;

          font-style: italic;

          font-weight: 600;

          color: #23467b;
        }


        .growais-hero-visual {
          width: 55%;

          height: 100%;

          display: flex;

          align-items: center;

          justify-content: center;
        }


        .growais-hero-circle {
          width: 260px;
          height: 220px;

          display: flex;

          align-items: center;
          justify-content: center;
        }


        .growais-hero-image {
          width: 260px;
          height: 200px;

          object-fit: contain;
        }


        /* =====================================================
           CONTENT
        ===================================================== */

        .growais-lesson-content {
          max-width: 1050px;

          margin: 0 auto;
        }


        .growais-lesson-content h2 {
          font-size: 30px;

          line-height: 1.25;

          margin: 0 0 14px;

          color: #10165c;
        }


        .growais-lesson-content > p {
          font-size: 17px;

          line-height: 1.75;

          color: #405084;

          margin: 0 0 20px;
        }


        /* =====================================================
           KEY POINT
        ===================================================== */

        .growais-key-point {
          display: flex;

          gap: 18px;

          background: #eaf5ff;

          border-radius: 18px;

          padding: 22px 26px;

          margin: 30px 0 38px;
        }


        .growais-key-icon {
          font-size: 35px;

          flex-shrink: 0;
        }


        .growais-key-point h3 {
          margin: 0 0 7px;

          color: #1264d6;

          font-size: 21px;
        }


        .growais-key-point p {
          margin: 0;

          color: #405084;

          line-height: 1.6;
        }


        /* =====================================================
           INFO CARDS
        ===================================================== */

        .growais-info-cards {
          display: grid;

          grid-template-columns: repeat(3, 1fr);

          gap: 18px;

          margin: 25px 0 40px;
        }


        .growais-info-card {
          padding: 24px;

          border-radius: 18px;
        }


        .growais-card-blue {
          background: #eef8ff;
        }


        .growais-card-purple {
          background: #f5efff;
        }


        .growais-card-green {
          background: #effbf5;
        }


        .growais-info-icon {
          font-size: 30px;

          margin-bottom: 10px;
        }


        .growais-info-card h3 {
          margin: 0 0 8px;

          font-size: 21px;
        }


        .growais-info-card p {
          margin: 0;

          color: #53638a;

          line-height: 1.55;
        }


        /* =====================================================
           TABLE
        ===================================================== */

        .growais-budget-table {
          border: 1px solid #dce5f2;

          border-radius: 18px;

          overflow: hidden;

          margin: 24px 0 40px;
        }


        .growais-table-row {
          display: grid;

          grid-template-columns: 1fr 150px;

          padding: 15px 20px;

          border-top: 1px solid #e4e9f1;

          color: #405084;
        }


        .growais-table-row strong:last-child {
          text-align: right;
        }


        .growais-table-header {
          background: #eafaf4;

          border-top: none;

          font-weight: 700;

          color: #10165c;
        }


        .growais-total-row {
          background: #dff7ec;

          color: #10165c;
        }


        /* =====================================================
           TAKEAWAYS
        ===================================================== */

        .growais-takeaways {
          background: #f7f9fc;

          border-radius: 18px;

          padding: 22px 26px;

          margin: 20px 0 40px;
        }


        .growais-takeaways p {
          margin: 0 0 13px;

          font-size: 16px;

          color: #405084;
        }


        .growais-takeaways p:last-child {
          margin-bottom: 0;
        }


        /* =====================================================
           COMPLETION
        ===================================================== */

        .growais-completion-card {
          margin-top: 45px;

          padding: 45px 35px;

          border-radius: 24px;

          background:
            linear-gradient(
              135deg,
              #e8faf3,
              #edf8ff
            );

          border: 1px solid #dcecf0;

          text-align: center;
        }


        .growais-completion-icon {
          font-size: 42px;

          margin-bottom: 12px;
        }


        .growais-completion-card h2 {
          margin: 0 0 12px;

          font-size: 30px;
        }


        .growais-completion-card > p {
          max-width: 650px;

          margin: 0 auto 25px;

          color: #53638a;

          font-size: 16px;

          line-height: 1.6;
        }


        .growais-completion-actions {
          display: flex;

          align-items: center;

          justify-content: center;

          gap: 14px;

          flex-wrap: wrap;
        }


        .growais-complete-button {
          border: none;

          background: #05a779;

          color: #ffffff;

          padding: 14px 28px;

          border-radius: 12px;

          font-family: Arial, Helvetica, sans-serif;

          font-size: 15px;

          font-weight: 700;

          cursor: pointer;

          transition: 0.2s ease;
        }


        .growais-complete-button:hover {
          background: #048f68;

          transform: translateY(-1px);
        }


        .growais-complete-button:disabled {
          cursor: default;

          transform: none;
        }


        .growais-completed {
          background: #078f68;
        }


        .growais-quiz-button {
          display: inline-flex;

          align-items: center;

          justify-content: center;

          background: #ffffff;

          color: #05a779;

          border: 2px solid #05a779;

          text-decoration: none;

          padding: 12px 28px;

          border-radius: 12px;

          font-size: 15px;

          font-weight: 700;

          transition: 0.2s ease;
        }


        .growais-quiz-button:hover {
          background: #e8faf3;
        }


        /* =====================================================
           RESPONSIVE
        ===================================================== */

        @media (max-width: 1100px) {

          .growais-lesson-sidebar {
            width: 210px;
          }

          .growais-lesson-header {
            left: 210px;
            padding-left: 22px;
            padding-right: 22px;
          }

          .growais-lesson-main {
            margin-left: 210px;
            padding-left: 28px;
            padding-right: 28px;
          }

          .growais-search-box {
            width: min(480px, 55vw);
          }

          .growais-lesson-progress {
            width: 210px;
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

  .growais-lesson-page {
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

  /* =========================================
     MOBILE HEADER
  ========================================= */

  .growais-lesson-header {
    position: sticky;

    top: 0;
    left: 0;
    right: 0;

    height: 64px;

    padding: 0 12px;

    background: #ffffff;

    z-index: 100;
  }

  .growais-search-box {
    flex: 1;

    width: auto;
    min-width: 0;

    height: 42px;

    padding: 0 11px;

    gap: 7px;

    font-size: 12px;
  }

  .growais-search-icon {
    font-size: 22px;
  }

  .growais-header-right {
    display: none;
  }

  /* =========================================
     MAIN CONTENT
  ========================================= */

  .growais-lesson-main {
    margin-left: 0;

    padding: 22px 14px 80px;

    width: 100%;

    min-height: calc(100vh - 64px);
  }

  /* =========================================
     LESSON HEADER
  ========================================= */

  .growais-lesson-heading {
    flex-wrap: wrap;

    gap: 14px;
  }

  .growais-lesson-progress {
    width: 100%;
  }

  .growais-lesson-title h1 {
    font-size: 29px;
  }

  .growais-lesson-title p {
    font-size: 14px;

    line-height: 1.5;
  }

  /* =========================================
     LESSON HERO
  ========================================= */

  .growais-lesson-hero {
    height: 220px;

    border-radius: 18px;
  }

  .growais-hero-copy {
    width: 50%;

    padding-left: 25px;
  }

  .growais-hero-copy h2 {
    font-size: 22px;

    line-height: 1.35;
  }

  .growais-hero-visual {
    width: 50%;
  }

  .growais-hero-image {
    width: 210px;
    height: 170px;
  }

  /* =========================================
     CONTENT
  ========================================= */

  .growais-lesson-content h2 {
    font-size: 25px;
  }

  .growais-lesson-content > p {
    font-size: 15px;

    line-height: 1.7;
  }

  /* =========================================
     INFO CARDS
  ========================================= */

  .growais-info-cards {
    grid-template-columns: 1fr;
  }

  /* =========================================
     BUDGET TABLE
  ========================================= */

  .growais-table-row {
    grid-template-columns: 1fr 100px;

    padding: 13px 15px;

    font-size: 14px;
  }

  /* =========================================
     KEY POINT
  ========================================= */

  .growais-key-point {
    padding: 18px;

    gap: 12px;
  }

  /* =========================================
     COMPLETION
  ========================================= */

  .growais-completion-card {
    padding: 30px 20px;
  }

  .growais-completion-card h2 {
    font-size: 25px;
  }

  .growais-completion-actions {
    flex-direction: column;

    align-items: stretch;

    gap: 12px;
  }

  .growais-complete-button,
  .growais-quiz-button {
    width: 100%;

    text-align: center;
  }

}


/* =========================================
   EXTRA SMALL PHONES
========================================= */

@media (max-width: 380px) {

  .main-nav .nav-item {
    font-size: 8px;
  }

  .main-nav .nav-icon {
    font-size: 18px;
  }

  .growais-lesson-title h1 {
    font-size: 24px;
  }

  .growais-lesson-hero {
    height: 185px;
  }

  .growais-hero-copy {
    padding-left: 18px;
  }

  .growais-hero-copy h2 {
    font-size: 17px;
  }

  .growais-hero-image {
    width: 155px;
    height: 125px;
  }

}
        
      `}</style>

    </div>
  );
}