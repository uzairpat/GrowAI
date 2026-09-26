"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { apiFetch } from "../../../../lib/api";

type Question = {
  question: string;
  options: string[];
  answer: number;
};

const questions: Question[] = [
  {
    question: "What is a budget?",
    options: [
      "A plan for how you will use your money",
      "A list of things you want to buy",
      "A way to spend all your money",
      "A type of bank account",
    ],
    answer: 0,
  },
  {
    question: "Which of the following is a need?",
    options: [
      "A new video game",
      "Food and basic groceries",
      "The latest smartphone",
      "Expensive headphones",
    ],
    answer: 1,
  },
  {
    question: "What is a good reason to create a budget?",
    options: [
      "To spend all your money quickly",
      "To avoid saving money",
      "To understand and plan where your money goes",
      "To buy more expensive things",
    ],
    answer: 2,
  },
  {
    question: "Which is an example of a fixed expense?",
    options: [
      "A monthly phone subscription",
      "A snack you buy after school",
      "A movie with friends",
      "An occasional shopping trip",
    ],
    answer: 0,
  },
  {
    question: "How can a budget help you in the future?",
    options: [
      "It helps you spend without thinking",
      "It helps you plan, save, and work towards your goals",
      "It makes everything free",
      "It means you cannot spend any money",
    ],
    answer: 1,
  },
];

export default function QuizPage() {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const [answers, setAnswers] = useState<(number | null)[]>(
    Array(questions.length).fill(null)
  );

  const question = questions[currentQuestion];

  const answeredCount = submitted
    ? currentQuestion + 1
    : currentQuestion;

  const progress =
    ((currentQuestion + (submitted ? 1 : 0)) / questions.length) * 100;

  const handleSubmit = () => {
    if (selectedAnswer === null || submitted) return;

    const updatedAnswers = [...answers];
    updatedAnswers[currentQuestion] = selectedAnswer;

    setAnswers(updatedAnswers);
    setSubmitted(true);
  };

  const handleNext = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion((previous) => previous + 1);
      setSelectedAnswer(null);
      setSubmitted(false);
      return;
    }

    const finalAnswers = [...answers];

    if (selectedAnswer !== null) {
      finalAnswers[currentQuestion] = selectedAnswer;
    }

    const finalScore = finalAnswers.reduce<number>(
      (total, answer, index) => {
        if (
          answer !== null &&
          answer === questions[index].answer
        ) {
          return total + 1;
        }
    
        return total;
      },
      0
    );

    localStorage.setItem(
      "growais_quiz_1_answers",
      JSON.stringify(finalAnswers)
    );

    localStorage.setItem(
      "growais_quiz_1_score",
      String(finalScore)
    );

    // Mark the quiz as completed so the Quiz Home,
    // Dashboard, and Progress pages can read the same status.
    localStorage.setItem("growais_quiz_1_completed", "true");

    window.location.href = "/student/quiz/result";
  };

  return (
    <div className="quiz-page">

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


      {/* ================= MAIN ================= */}

      <main className="quiz-main">

        {/* ================= TOP COURSE AREA ================= */}

        <section className="quiz-course-header">

          <Link
            href="/student/lessons/1"
            className="back-link"
          >
            ← Back to Lesson
          </Link>


          <div className="course-info">

            <div className="course-icon">

              <Image
                src="/assets/budgeting.png"
                alt="Budgeting Basics"
                width={115}
                height={115}
              />

            </div>


            <div className="course-title">

              <span>
                Budgeting Basics
              </span>

              <h1>
                Module 1 • Lesson 1
              </h1>

              <p>
                Quiz
              </p>

            </div>

          </div>


          <div className="quiz-hero">

            <Image
              src="/assets/quiz-thinking-student.png"
              alt="Student thinking about a quiz"
              fill
              priority
              className="quiz-hero-image"
            />

            <div className="hero-copy">

              <strong>
                Think.
                <br />
                Choose.
                <br />
                Learn.
                <br />
                Grow!
              </strong>

            </div>

            <div className="hero-quote">
              “Good financial decisions
              <br />
              build a brighter
              <br />
              tomorrow.”
            </div>

          </div>

        </section>


        {/* ================= QUIZ LAYOUT ================= */}

        <section className="quiz-layout">


          {/* ================= QUESTION ================= */}

          <div className="question-card">

            <div className="question-top">

              <div>

                <h2>
                  Question {currentQuestion + 1} of {questions.length}
                </h2>

              </div>

              <span className="complete-text">
                {Math.round(progress)}% Complete
              </span>

            </div>


            <div className="question-progress">

              <div
                className="question-progress-fill"
                style={{
                  width: `${progress}%`,
                }}
              />

            </div>


            <div className="question-divider" />


            <h3 className="question-title">
              {question.question}
            </h3>

            <p className="question-instruction">
              Select one answer.
            </p>


            {/* ================= OPTIONS ================= */}

            <div className="options">

              {question.options.map((option, index) => {

                const isSelected =
                  selectedAnswer === index;

                const isCorrect =
                  submitted &&
                  index === question.answer;

                const isWrong =
                  submitted &&
                  isSelected &&
                  index !== question.answer;

                return (

                  <button
                    key={option}
                    type="button"
                    className={`
                      option
                      ${isSelected ? "selected" : ""}
                      ${isCorrect ? "correct" : ""}
                      ${isWrong ? "wrong" : ""}
                    `}
                    onClick={() => {
                      if (!submitted) {
                        setSelectedAnswer(index);
                      }
                    }}
                    disabled={submitted}
                  >

                    <span className="radio">

                      {isSelected && (
                        <span className="radio-dot" />
                      )}

                    </span>


                    <span className="option-letter">
                      {String.fromCharCode(65 + index)}.
                    </span>


                    <span className="option-text">
                      {option}
                    </span>

                  </button>

                );

              })}

            </div>


            {/* ================= FEEDBACK ================= */}

            {submitted && (

              <div
                className={
                  selectedAnswer === question.answer
                    ? "answer-feedback correct-feedback"
                    : "answer-feedback wrong-feedback"
                }
              >

                <strong>
                  {selectedAnswer === question.answer
                    ? "✓ Correct!"
                    : "✕ Not quite"}
                </strong>

                <span>
                  {selectedAnswer === question.answer
                    ? "Great job! You understood the concept."
                    : `The correct answer is ${String.fromCharCode(
                        65 + question.answer
                      )}.`}
                </span>

              </div>

            )}


            {/* ================= BUTTON ================= */}

            <div className="question-actions">

              {!submitted ? (

                <button
                  type="button"
                  className="submit-button"
                  disabled={selectedAnswer === null}
                  onClick={handleSubmit}
                >
                  Submit Answer
                  <span>→</span>
                </button>

              ) : (

                <button
                  type="button"
                  className="submit-button"
                  onClick={handleNext}
                >
                  {currentQuestion === questions.length - 1
                    ? "View Results"
                    : "Next Question"}
                  <span>→</span>
                </button>

              )}

            </div>

          </div>


          {/* ================= RIGHT SIDE ================= */}

          <aside className="quiz-right">


            {/* QUIZ PROGRESS */}

            <div className="side-card quiz-progress-card">

              <div className="side-card-title">

                <h3>
                  Quiz Progress
                </h3>

                <span>
                  {answeredCount} of {questions.length} answered
                </span>

              </div>


              <div className="question-numbers">

                {questions.map((_, index) => (

                  <div
                    key={index}
                    className={`
                      question-number
                      ${
                        index < currentQuestion
                          ? "completed"
                          : ""
                      }
                      ${
                        index === currentQuestion
                          ? "current"
                          : ""
                      }
                    `}
                  >
                    {index + 1}
                  </div>

                ))}

              </div>

            </div>


            {/* HINT */}

            <div className="side-card hint-card">

              <div className="hint-icon">
                💡
              </div>

              <div>

                <h3>
                  Need a hint?
                </h3>

                <p>
                  Think about how a budget
                  helps you make better
                  choices with your money.
                </p>

              </div>

            </div>


            {/* QUOTE */}

            <div className="side-card quote-card">

              <div className="quote-mark">
                “
              </div>

              <p>
                “A plan today
                <br />
                leads to a brighter
                <br />
                tomorrow.”
              </p>

              <span>
                — GrowAIs
              </span>

              <div className="quote-leaf">
                🌿
              </div>

            </div>


            {/* AI */}

            <div className="side-card ai-card">

              <div className="ai-icon">
                🤖
              </div>

              <div>

                <h3>
                  Ask AI Assistant
                </h3>

                <p>
                  Need help understanding
                  this question?
                </p>

                <Link
                  href="/student/ai-assistant"
                  className="ai-button"
                >
                  Ask a Question
                  <span>→</span>
                </Link>

              </div>

            </div>

          </aside>

        </section>

      </main>


      {/* ================= STYLES ================= */}

      <style jsx>{`

        * {
          box-sizing: border-box;
        }

        .quiz-page {
          min-height: 100vh;
          background: #ffffff;
          color: #10165c;
          font-family: Arial, Helvetica, sans-serif;
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
          z-index: 100;
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



        /* ================= MAIN ================= */

        .quiz-main {
          margin-left: 280px;
          padding: 96px 32px 40px;
          min-height: 100vh;
        }


        /* ================= COURSE HEADER ================= */

        .quiz-course-header {
          position: relative;
          min-height: 190px;
        }

        .back-link {
          display: inline-block;
          color: #006cff;
          text-decoration: none;
          font-size: 16px;
          margin: 5px 0 20px 8px;
        }

        .course-info {
          display: flex;
          align-items: center;
          gap: 20px;
        }

        .course-icon {
          width: 116px;
          height: 116px;
          background: #dff8ec;
          border-radius: 14px;
          overflow: hidden;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .course-icon img {
          object-fit: contain;
        }

        .course-title {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .course-title span {
          color: #05a779;
          font-size: 22px;
          font-weight: 700;
        }

        .course-title h1 {
          margin: 0;
          font-size: 21px;
          font-weight: 400;
          color: #182365;
        }

        .course-title p {
          margin: 0;
          font-size: 18px;
          color: #182365;
        }


        /* ================= QUIZ HERO ================= */

        .quiz-hero {
          position: absolute;
          top: 0;
          right: 0;
          width: 55%;
          height: 172px;
          border-radius: 16px;
          overflow: hidden;
          background: #e0f8ef;
        }

        .quiz-hero-image {
          object-fit: cover;
          object-position: center;
        }

        .hero-copy {
          position: absolute;
          left: 8%;
          top: 25px;
          z-index: 2;
          font-size: 20px;
          line-height: 1.3;
          color: #1261a0;
          font-style: italic;
        }

        .hero-quote {
          position: absolute;
          right: 7%;
          top: 34px;
          z-index: 2;
          color: #1261a0;
          font-size: 18px;
          line-height: 1.3;
          font-style: italic;
          text-align: center;
        }


        /* ================= QUIZ LAYOUT ================= */

        .quiz-layout {
          display: grid;
          grid-template-columns: minmax(0, 1fr) 330px;
          gap: 22px;
          align-items: start;
        }


        /* ================= QUESTION CARD ================= */

        .question-card {
          border: 1px solid #e1e8f2;
          border-radius: 16px;
          padding: 28px 38px 30px;
          background: #ffffff;
          box-shadow: 0 4px 18px rgba(30, 60, 100, 0.04);
        }

        .question-top {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .question-top h2 {
          margin: 0;
          font-size: 20px;
          color: #10165c;
        }

        .complete-text {
          color: #05a779;
          font-size: 15px;
          font-weight: 600;
        }

        .question-progress {
          width: 100%;
          height: 15px;
          margin-top: 16px;
          background: #e6ebf4;
          border-radius: 999px;
          overflow: hidden;
        }

        .question-progress-fill {
          height: 100%;
          background: #05a779;
          border-radius: 999px;
          transition: width 0.3s ease;
        }

        .question-divider {
          height: 1px;
          background: #edf0f5;
          margin: 22px 0;
        }

        .question-title {
          margin: 0;
          font-size: 29px;
          line-height: 1.25;
          color: #10165c;
        }

        .question-instruction {
          margin: 10px 0 25px;
          font-size: 16px;
          color: #30477e;
        }


        /* ================= OPTIONS ================= */

        .options {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .option {
          width: 100%;
          min-height: 74px;
          border: 1px solid #dce5f2;
          border-radius: 13px;
          background: #ffffff;
          display: flex;
          align-items: center;
          padding: 15px 20px;
          gap: 17px;
          cursor: pointer;
          text-align: left;
          color: #10165c;
          font-size: 17px;
          transition: 0.2s ease;
        }

        .option:hover:not(:disabled) {
          border-color: #05a779;
          background: #f5fcfa;
        }

        .option.selected {
          border-color: #05a779;
          background: #e9faf4;
        }

        .option.correct {
          border-color: #05a779;
          background: #e7f9f2;
        }

        .option.wrong {
          border-color: #f16c6c;
          background: #fff1f1;
        }

        .radio {
          width: 29px;
          height: 29px;
          border: 2px solid #7180a3;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .option.selected .radio,
        .option.correct .radio {
          border-color: #05a779;
        }

        .radio-dot {
          width: 15px;
          height: 15px;
          border-radius: 50%;
          background: #05a779;
        }

        .option-letter {
          font-weight: 700;
          min-width: 25px;
        }

        .option-text {
          line-height: 1.4;
        }


        /* ================= FEEDBACK ================= */

        .answer-feedback {
          margin-top: 18px;
          padding: 15px 18px;
          border-radius: 12px;
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .answer-feedback strong {
          font-size: 16px;
        }

        .answer-feedback span {
          font-size: 14px;
        }

        .correct-feedback {
          background: #e8f8f2;
          color: #087f60;
        }

        .wrong-feedback {
          background: #fff0f0;
          color: #c43f3f;
        }


        /* ================= ACTION ================= */

        .question-actions {
          display: flex;
          justify-content: flex-end;
          margin-top: 28px;
        }

        .submit-button {
          min-width: 250px;
          height: 56px;
          border: none;
          border-radius: 12px;
          background: #05a779;
          color: #ffffff;
          font-size: 17px;
          font-weight: 700;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 22px;
          box-shadow: 0 8px 20px rgba(5, 167, 121, 0.16);
        }

        .submit-button:hover {
          background: #008f68;
        }

        .submit-button:disabled {
          background: #cbd5df;
          cursor: not-allowed;
          box-shadow: none;
        }

        .submit-button span {
          font-size: 23px;
        }


        /* ================= RIGHT CARDS ================= */

        .quiz-right {
          display: flex;
          flex-direction: column;
          gap: 18px;
        }

        .side-card {
          border: 1px solid #e0e7f0;
          border-radius: 16px;
          background: #ffffff;
          padding: 22px;
        }

        .side-card-title {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 10px;
        }

        .side-card-title h3 {
          margin: 0;
          font-size: 18px;
          color: #10165c;
        }

        .side-card-title span {
          font-size: 14px;
          color: #263d77;
        }


        /* QUESTION NUMBERS */

        .question-numbers {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-top: 25px;
        }

        .question-number {
          width: 43px;
          height: 43px;
          border-radius: 50%;
          background: #edf1f8;
          color: #304477;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 17px;
          font-weight: 700;
        }

        .question-number.completed {
          background: #05a779;
          color: white;
        }

        .question-number.current {
          background: #ffffff;
          color: #10165c;
          border: 2px solid #05a779;
          box-shadow: 0 0 0 5px #e8f8f3;
        }


        /* HINT */

        .hint-card {
          background: #edf7ff;
          display: flex;
          gap: 18px;
        }

        .hint-icon {
          font-size: 38px;
        }

        .hint-card h3 {
          margin: 0 0 8px;
          font-size: 20px;
          color: #0069e8;
        }

        .hint-card p {
          margin: 0;
          color: #263d77;
          line-height: 1.5;
          font-size: 15px;
        }


        /* QUOTE */

        .quote-card {
          position: relative;
          overflow: hidden;
          min-height: 165px;
          background: #f3f8ff;
        }

        .quote-mark {
          font-size: 54px;
          line-height: 30px;
          color: #9dc6f5;
        }

        .quote-card p {
          margin: 15px 0 5px;
          font-size: 20px;
          line-height: 1.35;
          color: #10165c;
        }

        .quote-card span {
          color: #304477;
          font-size: 14px;
        }

        .quote-leaf {
          position: absolute;
          right: 10px;
          bottom: -8px;
          font-size: 48px;
        }


        /* AI */

        .ai-card {
          display: flex;
          gap: 16px;
          background: #f1f8ff;
        }

        .ai-icon {
          font-size: 42px;
        }

        .ai-card h3 {
          margin: 0 0 8px;
          font-size: 19px;
          color: #10165c;
        }

        .ai-card p {
          margin: 0 0 15px;
          color: #304477;
          line-height: 1.4;
          font-size: 14px;
        }

        .ai-button {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 15px;
          border: 1px solid #006cff;
          border-radius: 10px;
          min-height: 45px;
          padding: 0 15px;
          color: #006cff;
          text-decoration: none;
          font-weight: 600;
          background: #ffffff;
        }


        /* =========================================
           RESPONSIVE
        ========================================= */

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
            width: min(480px, 55vw);
          }

          .quiz-layout {
            grid-template-columns: 1fr;
          }

          .quiz-right {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
          }

          .quiz-hero {
            width: 50%;
          }

          .question-title {
            font-size: 26px;
          }

        }


        @media (max-width: 700px) {

          body {
            overflow-x: hidden;
          }

          .quiz-page {
            min-height: 100vh;
            padding-bottom: 70px;
          }

          /* Same sidebar becomes the mobile bottom navigation */

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

          /* Hide desktop-only sidebar sections */

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
            min-width: 0;
            font-size: 19px;
            line-height: 20px;
          }

          /* Main content */

          .quiz-header {
            position: fixed;
            left: 0;
            right: 0;
            top: 0;
            height: 64px;
            padding: 0 12px;
            z-index: 900;
          }

          .quiz-search {
            flex: 1;
            width: auto;
            min-width: 0;
            height: 42px;
            padding: 0 11px;
            gap: 7px;
          }

          .quiz-search input {
            font-size: 12px;
            min-width: 0;
          }

          .search-icon {
            font-size: 22px;
          }

          .quiz-profile-area {
            display: none;
          }

          .quiz-main {
            margin-left: 0;
            width: 100%;
            min-height: calc(100vh - 66px);
            padding: 76px 12px 25px;
          }

          /* Quiz header */

          .quiz-course-header {
            min-height: auto;
          }

          .back-link {
            font-size: 12px;
            margin: 3px 0 10px;
          }

          .course-info {
            gap: 10px;
          }

          .course-icon {
            width: 62px;
            height: 62px;
            border-radius: 10px;
          }

          .course-title {
            gap: 2px;
          }

          .course-title span {
            font-size: 15px;
          }

          .course-title h1 {
            font-size: 14px;
          }

          .course-title p {
            font-size: 13px;
          }

          .quiz-hero {
            position: relative;
            top: auto;
            right: auto;
            width: 100%;
            height: 150px;
            margin-top: 15px;
            border-radius: 12px;
          }

          .hero-copy {
            font-size: 15px;
            top: 25px;
          }

          .hero-quote {
            font-size: 12px;
            top: 30px;
          }

          /* Quiz content */

          .quiz-layout {
            display: block;
            margin-top: 15px;
          }

          .question-card {
            padding: 18px 14px 20px;
            border-radius: 13px;
          }

          .question-top h2 {
            font-size: 15px;
          }

          .complete-text {
            font-size: 11px;
          }

          .question-progress {
            height: 9px;
            margin-top: 10px;
          }

          .question-divider {
            margin: 15px 0;
          }

          .question-title {
            font-size: 21px;
            line-height: 1.3;
          }

          .question-instruction {
            font-size: 13px;
            margin: 7px 0 15px;
          }

          .options {
            gap: 8px;
          }

          .option {
            min-height: 58px;
            padding: 10px;
            gap: 9px;
            font-size: 13px;
            border-radius: 10px;
          }

          .radio {
            width: 23px;
            height: 23px;
          }

          .radio-dot {
            width: 11px;
            height: 11px;
          }

          .option-letter {
            min-width: 18px;
          }

          .question-actions {
            margin-top: 18px;
          }

          .submit-button {
            width: 100%;
            min-width: 0;
            height: 48px;
            font-size: 14px;
          }

          .quiz-right {
            display: flex;
            margin-top: 15px;
            gap: 10px;
          }

          .side-card {
            padding: 15px;
            border-radius: 12px;
          }

          .side-card-title h3 {
            font-size: 15px;
          }

          .side-card-title span {
            font-size: 11px;
          }

          .question-number {
            width: 34px;
            height: 34px;
            font-size: 13px;
          }

          .hint-card,
          .quote-card,
          .ai-card {
            display: none;
          }

        }


        @media (max-width: 380px) {

          .quiz-search input {
            font-size: 10px;
          }

          .question-title {
            font-size: 19px;
          }

          .option {
            font-size: 12px;
          }

        }

        /* =========================================================
           FINAL MOBILE LAYOUT FIX
           Desktop/tablet styles above remain unchanged.
        ========================================================= */

        @media (max-width: 700px) {

          html,
          body {
            width: 100%;
            max-width: 100%;
            overflow-x: hidden;
          }

          .quiz-page {
            width: 100%;
            min-width: 0;
            min-height: 100vh;
            overflow-x: hidden;
            padding-bottom: 72px;
          }

          /* ================= MOBILE HEADER ================= */

          .quiz-header {
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
            width: 100%;
            font-size: 11px;
          }

          .search-icon {
            flex-shrink: 0;
            font-size: 19px;
          }

          .quiz-profile-area {
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

          /* ================= MOBILE BOTTOM NAV ================= */

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

          /* ================= MOBILE MAIN ================= */

          .quiz-main {
            margin-left: 0;
            width: 100%;
            max-width: 100%;
            min-height: calc(100vh - 66px);
            padding: 76px 12px 24px;
            overflow-x: hidden;
          }

          /* ================= COURSE HEADER ================= */

          .quiz-course-header {
            width: 100%;
            min-height: 0;
            position: relative;
          }

          .back-link {
            display: block;
            width: fit-content;
            font-size: 12px;
            line-height: 1.3;
            margin: 2px 0 10px 2px;
          }

          .course-info {
            width: 100%;
            display: flex;
            align-items: center;
            gap: 10px;
            min-width: 0;
          }

          .course-icon {
            width: 62px;
            min-width: 62px;
            height: 62px;
            border-radius: 10px;
          }

          .course-icon img {
            width: 58px;
            height: 58px;
          }

          .course-title {
            min-width: 0;
            flex: 1;
            gap: 2px;
          }

          .course-title span {
            font-size: 15px;
            line-height: 1.2;
          }

          .course-title h1 {
            font-size: 14px;
            line-height: 1.25;
            overflow-wrap: anywhere;
          }

          .course-title p {
            font-size: 13px;
            line-height: 1.2;
          }

          /* Hero is deliberately moved BELOW the course title.
             This is the main fix for the overlap seen in the phone screenshot. */

          .quiz-hero {
            position: relative;
            top: auto;
            right: auto;
            left: auto;
            width: 100%;
            height: 132px;
            margin: 13px 0 0;
            border-radius: 12px;
            overflow: hidden;
          }

          .quiz-hero-image {
            position: absolute !important;
            inset: 0;
            width: 100% !important;
            height: 100% !important;
            object-fit: cover;
            object-position: center;
          }

          .hero-copy {
            left: 8%;
            top: 22px;
            font-size: 14px;
            line-height: 1.25;
          }

          .hero-quote {
            right: 7%;
            top: 28px;
            font-size: 11px;
            line-height: 1.3;
          }

          /* ================= QUIZ LAYOUT ================= */

          .quiz-layout {
            width: 100%;
            max-width: 100%;
            display: flex;
            flex-direction: column;
            gap: 12px;
            margin-top: 12px;
            min-width: 0;
          }

          .question-card {
            width: 100%;
            min-width: 0;
            padding: 17px 13px 18px;
            border-radius: 13px;
          }

          .question-top {
            width: 100%;
            min-width: 0;
            gap: 8px;
          }

          .question-top h2 {
            font-size: 15px;
            line-height: 1.25;
          }

          .complete-text {
            flex-shrink: 0;
            font-size: 10px;
            white-space: nowrap;
          }

          .question-progress {
            height: 8px;
            margin-top: 9px;
          }

          .question-divider {
            margin: 14px 0;
          }

          .question-title {
            font-size: 20px;
            line-height: 1.3;
            overflow-wrap: anywhere;
          }

          .question-instruction {
            font-size: 12px;
            line-height: 1.35;
            margin: 7px 0 14px;
          }

          .options {
            width: 100%;
            gap: 8px;
          }

          .option {
            width: 100%;
            min-width: 0;
            min-height: 54px;
            padding: 9px 10px;
            gap: 8px;
            border-radius: 10px;
            font-size: 12.5px;
            line-height: 1.3;
          }

          .radio {
            width: 22px;
            min-width: 22px;
            height: 22px;
          }

          .radio-dot {
            width: 10px;
            height: 10px;
          }

          .option-letter {
            min-width: 17px;
            flex-shrink: 0;
          }

          .option-text {
            min-width: 0;
            overflow-wrap: anywhere;
            word-break: normal;
          }

          .answer-feedback {
            width: 100%;
            margin-top: 10px;
            padding: 12px;
            font-size: 12px;
          }

          .answer-feedback strong {
            font-size: 13px;
          }

          .answer-feedback span {
            font-size: 11px;
          }

          .question-actions {
            width: 100%;
            margin-top: 16px;
          }

          .submit-button {
            width: 100%;
            min-width: 0;
            height: 46px;
            border-radius: 10px;
            font-size: 13px;
            gap: 12px;
          }

          /* ================= MOBILE QUIZ PROGRESS ================= */

          .quiz-right {
            width: 100%;
            min-width: 0;
            display: flex;
            flex-direction: column;
            gap: 10px;
            margin-top: 0;
          }

          .quiz-progress-card {
            width: 100%;
            min-width: 0;
            display: block;
            padding: 14px;
            border-radius: 12px;
          }

          .side-card-title {
            width: 100%;
            gap: 8px;
          }

          .side-card-title h3 {
            font-size: 14px;
          }

          .side-card-title span {
            font-size: 10px;
            white-space: nowrap;
          }

          .question-numbers {
            width: 100%;
            display: flex;
            justify-content: space-between;
            align-items: center;
            gap: 5px;
            margin-top: 12px;
          }

          .question-number {
            width: 34px;
            min-width: 34px;
            height: 34px;
            font-size: 12px;
          }

          /* Hide the extra desktop cards on a phone.
             The quiz progress remains visible. */

          .hint-card,
          .quote-card,
          .ai-card {
            display: none;
          }
        }

        /* ================= SMALL PHONES ================= */

        @media (max-width: 380px) {

          .quiz-main {
            padding-left: 10px;
            padding-right: 10px;
          }

          .quiz-search input {
            font-size: 10px;
          }

          .course-icon {
            width: 58px;
            min-width: 58px;
            height: 58px;
          }

          .course-icon img {
            width: 54px;
            height: 54px;
          }

          .course-title span {
            font-size: 14px;
          }

          .course-title h1 {
            font-size: 13px;
          }

          .course-title p {
            font-size: 12px;
          }

          .quiz-hero {
            height: 118px;
          }

          .hero-copy {
            font-size: 12px;
          }

          .hero-quote {
            font-size: 10px;
          }

          .question-title {
            font-size: 19px;
          }

          .option {
            min-height: 52px;
            font-size: 12px;
          }

          .question-number {
            width: 32px;
            min-width: 32px;
            height: 32px;
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