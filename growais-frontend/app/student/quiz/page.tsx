"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import { apiFetch } from "../../../lib/api";

export default function QuizHomePage() {
  const [quizCompleted, setQuizCompleted] = useState(false);

  useEffect(() => {
    const completed =
      localStorage.getItem("growais_quiz_1_completed") === "true";

    setQuizCompleted(completed);
  }, []);

  return (
    <div className="quiz-home-page">

      {/* ================= HEADER ================= */}

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
          >
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
            className="nav-item active"
          >
            <span className="nav-icon">▤</span>
            <span>Quizzes</span>
          </a>


          <a
            href="/student/scenarios"
            className="nav-item"
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

      <main className="quiz-main">


        {/* ================= PAGE INTRO ================= */}

        <section className="page-intro">

          <div>

            <Link
              href="/student/dashboard"
              className="back-link"
            >
              ← Back to Dashboard
            </Link>


            <h1>
              My Quizzes
            </h1>


            <p>
              Test what you have learned and build your financial knowledge.
            </p>

          </div>


          <div className="intro-icon">

            <Image
              src="/assets/quiz-thinking-student.png"
              alt="Student taking a quiz"
              width={170}
              height={140}
            />

          </div>

        </section>



        {/* ================= QUIZ CONTENT ================= */}

        <section className="quiz-content">


          {/* ================= SECTION TITLE ================= */}

          <div className="section-heading">

            <div>

              <h2>
                Available Quiz
              </h2>

              <p>
                Complete the quiz after finishing the lesson.
              </p>

            </div>

            <span className="quiz-count">
              1 Quiz
            </span>

          </div>



          {/* ================= SINGLE QUIZ CARD ================= */}

          <div className="quiz-card">


            {/* IMAGE */}

            <div className="quiz-image">

              <Image
                src="/assets/budgeting.png"
                alt="Budgeting Basics"
                fill
                sizes="(max-width: 700px) 100vw, 360px"
                className="quiz-card-image"
              />

            </div>



            {/* DETAILS */}

            <div className="quiz-details">

              <span className="quiz-label">
                MODULE 1 • LESSON 1
              </span>


              <h2>
                Budgeting Basics
              </h2>


              <p className="quiz-description">
                Test your understanding of budgeting, needs,
                expenses, saving, and making better decisions
                with your money.
              </p>


              {/* QUIZ INFORMATION */}

              <div className="quiz-info-row">


                <div className="info-item">

                  <span className="info-icon">
                    ◉
                  </span>

                  <div>
                    <strong>5</strong>
                    <small>Questions</small>
                  </div>

                </div>


                <div className="info-item">

                  <span className="info-icon">
                    ◷
                  </span>

                  <div>
                    <strong>5–10</strong>
                    <small>Minutes</small>
                  </div>

                </div>


                <div className="info-item">

                  <span className="info-icon">
                    ★
                  </span>

                  <div>
                    <strong>40</strong>
                    <small>Points</small>
                  </div>

                </div>

              </div>


              {/* STATUS */}

              <div className="quiz-bottom">


                <div className={`quiz-status ${quizCompleted ? "completed-status" : ""}`}>

                  <span className="status-dot" />

                  {quizCompleted ? "Completed" : "Not Started"}

                </div>


                <Link
                  href="/student/quiz/1"
                  className="start-button"
                >
                  {quizCompleted ? "Review Quiz" : "Start Quiz"}
                  <span>→</span>
                </Link>

              </div>

            </div>

          </div>



          {/* ================= MOTIVATION CARD ================= */}

          <div className="motivation-card">


            <div className="motivation-icon">
              💡
            </div>


            <div>

              <h3>
                Ready to test yourself?
              </h3>

              <p>
                Take your time, read each question carefully,
                and choose the answer that you think is correct.
              </p>

            </div>

          </div>


        </section>

      </main>



      {/* ================= STYLES ================= */}

      <style jsx>{`

        * {
          box-sizing: border-box;
        }


        .quiz-home-page {
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



        /* ================= SIDEBAR ================= */

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

        .quiz-main {
          margin-left: 280px;

          padding: 100px 40px 50px;

          min-height: 100vh;
        }



        /* ================= PAGE INTRO ================= */

        .page-intro {
          min-height: 190px;

          border-radius: 20px;

          background: linear-gradient(
            135deg,
            #e9faf4 0%,
            #f3fbff 100%
          );

          border: 1px solid #dfeee9;

          display: flex;

          align-items: center;

          justify-content: space-between;

          padding: 28px 45px;

          overflow: hidden;
        }


        .back-link {
          display: inline-block;

          color: #006cff;

          text-decoration: none;

          font-size: 15px;

          margin-bottom: 15px;
        }


        .page-intro h1 {
          margin: 0 0 8px;

          color: #10165c;

          font-size: 32px;

          line-height: 1.2;
        }


        .page-intro p {
          margin: 0;

          color: #52638d;

          font-size: 16px;

          line-height: 1.5;
        }


        .intro-icon {
          width: 230px;
          height: 160px;

          display: flex;
          align-items: center;
          justify-content: center;
        }


        .intro-icon img {
          object-fit: contain;
        }



        /* ================= CONTENT ================= */

        .quiz-content {
          margin-top: 32px;
        }


        .section-heading {
          display: flex;

          align-items: flex-end;

          justify-content: space-between;

          margin-bottom: 18px;
        }


        .section-heading h2 {
          margin: 0 0 5px;

          color: #10165c;

          font-size: 24px;
        }


        .section-heading p {
          margin: 0;

          color: #66769a;

          font-size: 14px;
        }


        .quiz-count {
          padding: 8px 15px;

          border-radius: 20px;

          background: #e9f8f3;

          color: #008f70;

          font-size: 13px;

          font-weight: 700;
        }



        /* ================= QUIZ CARD ================= */

        .quiz-card {
          display: grid;

          grid-template-columns: 360px 1fr;

          min-height: 310px;

          background: #ffffff;

          border: 1px solid #e0e7f0;

          border-radius: 18px;

          overflow: hidden;

          box-shadow: 0 6px 25px rgba(
            30,
            60,
            100,
            0.06
          );
        }


        .quiz-image {
          position: relative;

          min-height: 310px;

          background: #e2f8ed;

          overflow: hidden;
        }


        .quiz-card-image {
          object-fit: cover;
        }


        .quiz-details {
          padding: 30px 35px;

          display: flex;

          flex-direction: column;
        }


        .quiz-label {
          color: #05a779;

          font-size: 13px;

          font-weight: 700;

          letter-spacing: 0.6px;
        }


        .quiz-details h2 {
          margin: 8px 0 10px;

          color: #10165c;

          font-size: 27px;
        }


        .quiz-description {
          max-width: 720px;

          margin: 0;

          color: #52638d;

          font-size: 15px;

          line-height: 1.6;
        }



        /* ================= INFO ================= */

        .quiz-info-row {
          display: flex;

          gap: 38px;

          margin-top: 24px;

          padding-top: 20px;

          border-top: 1px solid #edf1f6;
        }


        .info-item {
          display: flex;

          align-items: center;

          gap: 10px;
        }


        .info-icon {
          width: 38px;
          height: 38px;

          border-radius: 10px;

          background: #eef9f5;

          color: #05a779;

          display: flex;

          align-items: center;
          justify-content: center;

          font-size: 17px;

          font-weight: 700;
        }


        .info-item div {
          display: flex;

          flex-direction: column;

          gap: 2px;
        }


        .info-item strong {
          color: #10165c;

          font-size: 16px;
        }


        .info-item small {
          color: #7180a3;

          font-size: 12px;
        }



        /* ================= BOTTOM ================= */

        .quiz-bottom {
          margin-top: auto;

          padding-top: 24px;

          display: flex;

          align-items: center;

          justify-content: space-between;

          gap: 20px;
        }


        .quiz-status {
          display: flex;

          align-items: center;

          gap: 8px;

          color: #7180a3;

          font-size: 14px;

          font-weight: 600;
        }


        .quiz-status.completed-status {
          color: #05a779;
        }


        .quiz-status.completed-status .status-dot {
          background: #05a779;
        }


        .status-dot {
          width: 9px;
          height: 9px;

          border-radius: 50%;

          background: #a9b5c8;
        }


        .start-button {
          min-width: 170px;
          height: 50px;

          padding: 0 24px;

          border-radius: 11px;

          background: #05a779;

          color: #ffffff;

          text-decoration: none;

          display: flex;

          align-items: center;
          justify-content: center;

          gap: 18px;

          font-size: 15px;

          font-weight: 700;

          box-shadow: 0 8px 18px rgba(
            5,
            167,
            121,
            0.18
          );

          transition: 0.2s;
        }


        .start-button:hover {
          background: #008f68;

          transform: translateY(-1px);
        }


        .start-button span {
          font-size: 20px;
        }



        /* ================= MOTIVATION ================= */

        .motivation-card {
          margin-top: 22px;

          border-radius: 15px;

          padding: 20px 24px;

          background: #f1f8ff;

          border: 1px solid #dcecff;

          display: flex;

          align-items: center;

          gap: 18px;
        }


        .motivation-icon {
          width: 48px;
          height: 48px;

          border-radius: 12px;

          background: #ffffff;

          display: flex;

          align-items: center;
          justify-content: center;

          font-size: 25px;

          flex-shrink: 0;
        }


        .motivation-card h3 {
          margin: 0 0 5px;

          color: #10165c;

          font-size: 17px;
        }


        .motivation-card p {
          margin: 0;

          color: #52638d;

          font-size: 14px;

          line-height: 1.5;
        }



        /* ================= TABLET ================= */

        @media (max-width: 1100px) {

          .sidebar {
            width: 210px;
          }


          .quiz-header {
            left: 210px;

            padding: 0 20px;
          }


          .quiz-main {
            margin-left: 210px;

            padding-left: 20px;
            padding-right: 20px;
          }


          .quiz-search {
            width: min(
              480px,
              55vw
            );
          }


          .quiz-card {
            grid-template-columns: 280px 1fr;
          }


          .quiz-image {
            min-height: 340px;
          }


          .quiz-info-row {
            gap: 20px;
          }

        }



        /* ================= MOBILE ================= */

        @media (max-width: 700px) {

          html,
          body {
            width: 100%;
            max-width: 100%;
            overflow-x: hidden;
          }


          .quiz-home-page {
            width: 100%;
            min-width: 0;

            padding-bottom: 70px;
          }


          /* HEADER */

          .quiz-header {
            left: 0;
            right: 0;

            width: 100%;

            height: 64px;

            padding: 0 12px;

            gap: 8px;
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
            width: 38px;
            height: 38px;

            font-size: 15px;
          }



          /* SIDEBAR → BOTTOM NAV */

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

            box-shadow:
              0 -8px 25px
              rgba(34, 68, 100, 0.08);

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

          .quiz-main {
            margin-left: 0;

            width: 100%;

            max-width: 100%;

            min-height:
              calc(100vh - 66px);

            padding:
              76px 12px 24px;
          }



          /* INTRO */

          .page-intro {
            min-height: 0;

            padding: 20px;

            border-radius: 14px;

            display: flex;

            align-items: center;

            gap: 10px;
          }


          .back-link {
            font-size: 11px;

            margin-bottom: 8px;
          }


          .page-intro h1 {
            font-size: 24px;

            margin-bottom: 6px;
          }


          .page-intro p {
            font-size: 12px;

            line-height: 1.45;
          }


          .intro-icon {
            width: 105px;

            height: 95px;

            flex-shrink: 0;
          }


          .intro-icon img {
            width: 105px;
            height: 95px;
          }



          /* CONTENT */

          .quiz-content {
            margin-top: 20px;
          }


          .section-heading {
            align-items: center;

            margin-bottom: 12px;
          }


          .section-heading h2 {
            font-size: 19px;

            margin-bottom: 3px;
          }


          .section-heading p {
            font-size: 11px;
          }


          .quiz-count {
            font-size: 10px;

            padding: 6px 10px;
          }



          /* QUIZ CARD */

          .quiz-card {
            display: flex;

            flex-direction: column;

            width: 100%;

            min-height: 0;

            border-radius: 14px;
          }


          .quiz-image {
            width: 100%;

            height: 180px;

            min-height: 180px;
          }


          .quiz-details {
            padding: 20px 17px;
          }


          .quiz-label {
            font-size: 10px;
          }


          .quiz-details h2 {
            font-size: 22px;

            margin: 7px 0 8px;
          }


          .quiz-description {
            font-size: 12px;

            line-height: 1.5;
          }


          .quiz-info-row {
            gap: 12px;

            margin-top: 18px;

            padding-top: 16px;
          }


          .info-item {
            gap: 6px;
          }


          .info-icon {
            width: 32px;
            height: 32px;

            font-size: 14px;
          }


          .info-item strong {
            font-size: 13px;
          }


          .info-item small {
            font-size: 10px;
          }


          .quiz-bottom {
            margin-top: 20px;

            padding-top: 16px;

            flex-direction: column;

            align-items: stretch;

            gap: 12px;
          }


          .quiz-status {
            font-size: 12px;
          }


          .start-button {
            width: 100%;

            min-width: 0;

            height: 46px;

            font-size: 13px;
          }



          /* MOTIVATION */

          .motivation-card {
            margin-top: 14px;

            padding: 15px;

            gap: 12px;

            border-radius: 12px;
          }


          .motivation-icon {
            width: 38px;
            height: 38px;

            font-size: 19px;
          }


          .motivation-card h3 {
            font-size: 14px;
          }


          .motivation-card p {
            font-size: 11px;
          }

        }



        /* ================= SMALL PHONES ================= */

        @media (max-width: 380px) {

          .quiz-main {
            padding-left: 10px;
            padding-right: 10px;
          }


          .page-intro {
            padding: 16px;
          }


          .page-intro h1 {
            font-size: 21px;
          }


          .page-intro p {
            font-size: 11px;
          }


          .intro-icon {
            width: 85px;
            height: 80px;
          }


          .intro-icon img {
            width: 85px;
            height: 80px;
          }


          .quiz-image {
            height: 160px;
            min-height: 160px;
          }


          .quiz-details {
            padding: 17px 14px;
          }


          .quiz-details h2 {
            font-size: 20px;
          }


          .quiz-info-row {
            gap: 8px;
          }


          .info-icon {
            width: 29px;
            height: 29px;
          }


          .info-item strong {
            font-size: 12px;
          }


          .info-item small {
            font-size: 9px;
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