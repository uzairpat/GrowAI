"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import { apiFetch } from "../../../lib/api";

type Message = {
  id: number;
  sender: "ai" | "user";
  text: string;
  time: string;
};

const popularQuestions = [
  "What is a budget?",
  "How can I start saving money?",
  "What is the difference between a need and a want?",
  "How do I set a financial goal?",
  "Can you give me tips for managing my pocket money?",
];

const quickQuestions = [
  {
    icon: "💡",
    title: "Explain a financial concept",
    question: "What is a budget?",
  },
  {
    icon: "📘",
    title: "Get help with a lesson",
    question: "Can you explain this topic in simpler words?",
  },
  {
    icon: "🎯",
    title: "Get advice for a situation",
    question: "Should I save or spend my money?",
  },
  {
    icon: "📊",
    title: "Tips to reach my goals",
    question: "How can I save money faster?",
  },
  {
    icon: "🎮",
    title: "Help with a scenario",
    question: "What's the best choice in this situation?",
  },
  {
    icon: "📖",
    title: "Recommend learning",
    question: "What should I learn next?",
  },
];

const learningSuggestions = [
  {
    image: "/assets/learning-budgeting-icon.png",
    title: "Budgeting Basics",
    type: "Lesson",
    time: "5–10 mins",
    href: "/student/lessons",
  },
  {
    image: "/assets/learning-spending-icon.png",
    title: "Smart Spending",
    type: "Lesson",
    time: "5–10 mins",
    href: "/student/lessons",
  },
  {
    image: "/assets/learning-goals-icon.png",
    title: "Setting Financial Goals",
    type: "Lesson",
    time: "5–10 mins",
    href: "/student/lessons",
  },
];

function getAIResponse(question: string) {
  const q = question.toLowerCase();

  if (q.includes("budget")) {
    return "A budget is a simple plan for how you will use your money. It helps you keep track of money coming in, money you spend, and money you want to save. A good budget helps you make better choices and reach your goals.";
  }

  if (
    q.includes("saving") ||
    q.includes("save money") ||
    q.includes("save")
  ) {
    return "A good way to start saving is to decide on a small amount you can save regularly. You could save part of your pocket money before spending the rest. Even small amounts can grow over time!";
  }

  if (q.includes("need") || q.includes("want")) {
    return "A need is something important that you require, such as food, basic clothing, or school supplies. A want is something you would like to have but can live without. Thinking about this difference can help you make smarter spending decisions.";
  }

  if (q.includes("goal")) {
    return "A financial goal is something you want to save or plan your money for. Start by choosing a specific goal, deciding how much it costs, and setting a target date. Then break it into smaller saving steps.";
  }

  if (q.includes("spend") || q.includes("pocket money")) {
    return "Before spending your money, think about whether the purchase is a need or a want. You can also set a spending limit and save part of your money for something important later.";
  }

  if (q.includes("scenario") || q.includes("choice")) {
    return "When making a financial decision, think about both the short-term and long-term consequences. Ask yourself what you need, what you can afford, and whether the choice helps you reach your goals.";
  }

  if (q.includes("lesson") || q.includes("learn")) {
    return "Based on your learning journey, you could continue with Budgeting Basics, Smart Spending, or Setting Financial Goals. These topics will help strengthen your everyday money skills.";
  }

  return "That's a great question! Think about the decision step by step. Consider what you need, what you can afford, and how your choice could affect your future goals. If you give me a little more detail, I can explain it in a simpler way.";
}

export default function AIAssistantPage() {
    const [studentName, setStudentName] = useState("Student");

    const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      sender: "ai",
      text: `Hi ${studentName}! I’m your GrowAIs AI Assistant. 😊\nYou can ask me anything about financial literacy, your lessons, goals, or real-life situations. How can I help you today?`,
      time: "10:24 AM",
    },
    {
      id: 2,
      sender: "user",
      text: "Can you explain what a budget is?",
      time: "10:25 AM",
    },
    {
      id: 3,
      sender: "ai",
      text: "Of course!\nA budget is a plan for how you will spend and save your money. It helps you keep track of your income (money you receive) and your expenses (money you spend) so you can make good choices and reach your goals.\n\nWould you like me to show you an example budget? 😊",
      time: "10:25 AM",
    },
  ]);

  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
 
  useEffect(() => {
    try {
      const savedMessages = localStorage.getItem("growais_ai_messages");
      if (savedMessages) {
        setMessages(JSON.parse(savedMessages));
      }
    } catch {
      localStorage.removeItem("growais_ai_messages");
    }

    const loadStudent = async () => {
      try {
        const data = await apiFetch("/api/auth/me");
        if (data?.user?.name) {
          setStudentName(data.user.name);
        } else if (data?.name) {
          setStudentName(data.name);
        }
      } catch {
        // Keep the default name if the user information cannot be loaded.
      }
    };

    loadStudent();
  }, []);

  useEffect(() => {
    if (messages.length > 0) {
      localStorage.setItem("growais_ai_messages", JSON.stringify(messages));
    }
  }, [messages]);

  const sendMessage = (question?: string) => {
    const messageText = (question ?? input).trim();

    if (!messageText || isTyping) {
      return;
    }

    const now = new Date();

    const userMessage: Message = {
      id: Date.now(),
      sender: "user",
      text: messageText,
      time: now.toLocaleTimeString([], {
        hour: "numeric",
        minute: "2-digit",
      }),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsTyping(true);

    setTimeout(() => {
      const aiMessage: Message = {
        id: Date.now() + 1,
        sender: "ai",
        text: getAIResponse(messageText),
        time: new Date().toLocaleTimeString([], {
          hour: "numeric",
          minute: "2-digit",
        }),
      };

      setMessages((prev) => [...prev, aiMessage]);
      setIsTyping(false);
    }, 700);
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    sendMessage();
  };

  const handleKeyDown = (
    event: React.KeyboardEvent<HTMLInputElement>
  ) => {
    if (event.key === "Enter") {
      event.preventDefault();
      sendMessage();
    }
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

  return (
    <>
      <div className="student-page">

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
            href="/student/quizzes"
            className="nav-item"
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
            className="nav-item active"
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
            src="/assets/goals-bottom-plant.png"
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
            MAIN AREA
        ===================================================== */}

        <main className="main-content">

          {/* ===================================================
              HEADER
          =================================================== */}

      <header className="goals-header">

        <div className="goals-search">
          <span className="search-icon">⌕</span>

          <input
            type="text"
            placeholder="Search lessons, quizzes, or topics..."
          />
        </div>

        <div className="goals-profile-area">

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
              <strong>Hi, {studentName}</strong>
              <small>Student</small>
            </div>

            <span className="profile-arrow">
              ⌄
            </span>

          </div>

        </div>

      </header>

          {/* ===================================================
              PAGE CONTENT
          =================================================== */}

          <div className="page-wrapper">

            {/* =================================================
                HERO
            ================================================= */}

            <section className="assistant-hero">

              <div className="hero-copy">

                <div className="eyebrow">
                  AI ASSISTANT
                </div>

                <h1>
                  Ask. Learn. <span>Grow.</span>
                </h1>

                <p>
                  Have questions about money, lessons, or life situations?
                  <br />
                  I’m here to help you learn and make smarter decisions!
                </p>

              </div>

              <div className="hero-image">

                <Image
                  src="/assets/ai-assistant-hero.png"
                  alt="GrowAIs AI Assistant"
                  fill
                  priority
                  sizes="(max-width: 900px) 100vw, 55vw"
                />

              </div>

            </section>

            {/* =================================================
                CONTENT GRID
            ================================================= */}

            <div className="content-grid">

              <div className="main-column">

                {/* =============================================
                    QUICK QUESTIONS
                ============================================= */}

                <section className="quick-section">

                  <h2>Try asking me something...</h2>

                  <div className="quick-grid">

                    {quickQuestions.map((item) => (
                      <button
                        key={item.title}
                        className="quick-card"
                        onClick={() => sendMessage(item.question)}
                        disabled={isTyping}
                      >

                        <div className="quick-icon">
                          {item.icon}
                        </div>

                        <div className="quick-content">

                          <strong>{item.title}</strong>

                          <span>
                            “{item.question}”
                          </span>

                        </div>

                      </button>
                    ))}

                  </div>

                </section>

                {/* =============================================
                    CHAT
                ============================================= */}

                <section className="chat-card">

                  <div className="chat-messages">

                    {messages.map((message) => (

                      <div
                        key={message.id}
                        className={`message-row ${
                          message.sender === "user"
                            ? "user-row"
                            : "ai-row"
                        }`}
                      >

                        {message.sender === "ai" && (
                          <Image
                            className="chat-avatar"
                            src="/assets/ai-bot-avatar.png"
                            alt="GrowAIs AI Assistant"
                            width={58}
                            height={58}
                          />
                        )}

                        <div className="message-content">

                          <div
                            className={`message-bubble ${
                              message.sender === "user"
                                ? "user-bubble"
                                : "ai-bubble"
                            }`}
                          >
                            {message.text.split("\n").map(
                              (line, index) => (
                                <span key={index}>
                                  {line}
                                  {index <
                                    message.text.split("\n").length -
                                      1 && <br />}
                                </span>
                              )
                            )}
                          </div>

                          <span className="message-time">
                            {message.time}
                          </span>

                        </div>

                        {message.sender === "user" && (
                          <div className="user-chat-avatar">
                            AU
                          </div>
                        )}

                      </div>

                    ))}

                    {isTyping && (
                      <div className="message-row ai-row">

                        <Image
                          className="chat-avatar"
                          src="/assets/ai-bot-avatar.png"
                          alt="GrowAIs AI Assistant"
                          width={58}
                          height={58}
                        />

                        <div className="message-content">

                          <div className="message-bubble ai-bubble typing">
                            <span />
                            <span />
                            <span />
                          </div>

                        </div>

                      </div>
                    )}

                  </div>

                  {/* ===========================================
                      CHAT INPUT
                  =========================================== */}

                  <form
                    className="chat-input-area"
                    onSubmit={handleSubmit}
                  >

                    <button
                      type="button"
                      className="attachment-button"
                      aria-label="Attach file"
                    >
                      📎
                    </button>

                    <input
                      value={input}
                      onChange={(event) =>
                        setInput(event.target.value)
                      }
                      onKeyDown={handleKeyDown}
                      placeholder="Type your question here..."
                      disabled={isTyping}
                    />

                    <button
                      type="submit"
                      className="send-button"
                      disabled={!input.trim() || isTyping}
                      aria-label="Send message"
                    >
                      ➤
                    </button>

                  </form>

                </section>

              </div>

              {/* =================================================
                  RIGHT SIDEBAR
              ================================================= */}

              <aside className="right-column">

                {/* =============================================
                    POPULAR QUESTIONS
                ============================================= */}

                <section className="side-card popular-card">

                  <div className="side-card-header">

                    <h2>Popular Questions</h2>

                    <button
                      onClick={() =>
                        setInput(popularQuestions[0])
                      }
                    >
                      View All →
                    </button>

                  </div>

                  <div className="popular-list">

                    {popularQuestions.map((question) => (

                      <button
                        key={question}
                        className="popular-item"
                        onClick={() => sendMessage(question)}
                        disabled={isTyping}
                      >

                        <span>{question}</span>

                        <span className="question-arrow">
                          ›
                        </span>

                      </button>

                    ))}

                  </div>

                </section>

                {/* =============================================
                    LEARNING SUGGESTIONS
                ============================================= */}

                <section className="side-card learning-card">

                  <h2>📚 Learning Suggestions</h2>

                  <p className="side-description">
                    Based on your progress and interests
                  </p>

                  <div className="learning-list">

                    {learningSuggestions.map((item) => (

                      <Link
                        href={item.href}
                        key={item.title}
                        className="learning-item"
                      >

                        <Image
                          src={item.image}
                          alt=""
                          width={62}
                          height={62}
                        />

                        <div className="learning-info">

                          <strong>
                            {item.title}
                          </strong>

                          <span>
                            {item.type} · {item.time}
                          </span>

                        </div>

                        <span className="learning-arrow">
                          ›
                        </span>

                      </Link>

                    ))}

                  </div>

                </section>

                {/* =============================================
                    REMEMBER
                ============================================= */}

                <section className="remember-card">

                  <Image
                    src="/assets/remember-card-reference.png"
                    alt=""
                    width={70}
                    height={70}
                  />

                  <div>

                    <h2>Remember</h2>

                    <p>
                      “There are no silly questions.
                      Every question helps you grow!”
                    </p>

                    <span>— GrowAIs</span>

                  </div>

                </section>

              </aside>

            </div>

          </div>

        </main>

      </div>

      {/* =====================================================
          STYLES
      ===================================================== */}

      <style jsx>{`

        * {
          box-sizing: border-box;
        }

        .student-page {
          min-height: 100vh;
          background: #ffffff;
          color: #111d68;
          font-family: Arial, Helvetica, sans-serif;
        }

        /* =====================================================
           HEADER
        ===================================================== */

        .goals-header {
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


        .goals-search {
          width: 560px;
          height: 44px;
          background: #f4f7fb;
          border-radius: 12px;
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 0 18px;
        }


        .goals-search input {
          width: 100%;
          border: none;
          outline: none;
          background: transparent;
          color: #344879;
          font-size: 15px;
        }


        .goals-search input::placeholder {
          color: #7180a3;
        }


        .search-icon {
          font-size: 24px;
          color: #344879;
        }


        .goals-profile-area {
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

        .main-content {
          margin-left: 280px;
          min-height: 100vh;
          padding-top: 72px;
        }

        /* ================================================
           PAGE
        ================================================ */

        .page-wrapper {
          padding: 24px 28px 40px;
          max-width: 1600px;
          margin: auto;
        }

        /* ================================================
           HERO
        ================================================ */

        .assistant-hero {
          min-height: 180px;
          border-radius: 18px;
          background: linear-gradient(
            90deg,
            #f0fff9 0%,
            #e7fff7 100%
          );
          display: flex;
          align-items: center;
          overflow: hidden;
          position: relative;
          margin-bottom: 18px;
        }

        .hero-copy {
          padding: 26px 32px;
          position: relative;
          z-index: 2;
          width: 53%;
        }

        .eyebrow {
          font-size: 13px;
          font-weight: 800;
          letter-spacing: 4px;
          color: #59679b;
          margin-bottom: 8px;
        }

        .hero-copy h1 {
          margin: 0;
          font-size: 48px;
          line-height: 1.05;
          color: #10156d;
        }

        .hero-copy h1 span {
          color: #08a47a;
        }

        .hero-copy p {
          margin: 8px 0 0;
          color: #44558f;
          font-size: 19px;
          line-height: 1.4;
        }

        .hero-image {
          position: absolute;
          right: 0;
          top: 0;
          bottom: 0;
          width: 52%;
        }

        .hero-image img {
          object-fit: cover;
          object-position: center;
        }

        /* ================================================
           GRID
        ================================================ */

        .content-grid {
          display: grid;
          grid-template-columns: minmax(0, 1fr) 330px;
          gap: 18px;
          align-items: start;
        }

        .main-column {
          min-width: 0;
        }

        .right-column {
          min-width: 0;
        }

        /* ================================================
           QUICK SECTION
        ================================================ */

        .quick-section {
          border: 1px solid #e1e8f3;
          border-radius: 14px;
          padding: 16px;
          background: white;
          margin-bottom: 14px;
        }

        .quick-section h2,
        .side-card h2 {
          margin: 0;
          font-size: 20px;
          color: #11176c;
        }

        .quick-grid {
          margin-top: 12px;
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 10px;
        }

        .quick-card {
          min-height: 88px;
          border: 0;
          border-radius: 12px;
          background: #f2f7ff;
          padding: 13px 15px;
          display: flex;
          align-items: flex-start;
          gap: 12px;
          text-align: left;
          cursor: pointer;
          color: #11176c;
          transition: transform 0.2s ease, box-shadow 0.2s ease;
        }

        .quick-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 5px 15px rgba(22, 49, 111, 0.08);
        }

        .quick-card:disabled {
          cursor: default;
          opacity: 0.65;
        }

        .quick-icon {
          font-size: 27px;
          line-height: 1;
        }

        .quick-content {
          display: flex;
          flex-direction: column;
          gap: 5px;
        }

        .quick-content strong {
          font-size: 15px;
        }

        .quick-content span {
          color: #41548b;
          font-size: 14px;
          line-height: 1.3;
        }

        /* ================================================
           CHAT
        ================================================ */

        .chat-card {
          border: 1px solid #e0e7f1;
          border-radius: 14px;
          background: white;
          overflow: hidden;
        }

        .chat-messages {
          padding: 16px;
          min-height: 410px;
          max-height: 550px;
          overflow-y: auto;
        }

        .message-row {
          display: flex;
          align-items: flex-start;
          gap: 10px;
          margin-bottom: 16px;
        }

        .user-row {
          justify-content: flex-end;
        }

        .chat-avatar {
          border-radius: 50%;
          flex-shrink: 0;
        }

        .message-content {
          max-width: 72%;
          display: flex;
          flex-direction: column;
        }

        .user-row .message-content {
          align-items: flex-end;
        }

        .message-bubble {
          padding: 13px 17px;
          border-radius: 14px;
          font-size: 15px;
          line-height: 1.5;
          white-space: normal;
        }

        .ai-bubble {
          background: #edf4ff;
          color: #283a82;
          border-top-left-radius: 5px;
        }

        .user-bubble {
          background: #dff8ee;
          color: #173b72;
          border-top-right-radius: 5px;
        }

        .message-time {
          margin-top: 4px;
          padding: 0 5px;
          color: #69769a;
          font-size: 12px;
        }

        .typing {
          display: flex;
          gap: 4px;
          align-items: center;
          min-width: 55px;
          height: 38px;
        }

        .typing span {
          width: 7px;
          height: 7px;
          border-radius: 50%;
          background: #6b7ca7;
          animation: typing 1.2s infinite;
        }

        .typing span:nth-child(2) {
          animation-delay: 0.15s;
        }

        .typing span:nth-child(3) {
          animation-delay: 0.3s;
        }

        @keyframes typing {
          0%,
          60%,
          100% {
            transform: translateY(0);
          }

          30% {
            transform: translateY(-4px);
          }
        }

        .chat-input-area {
          min-height: 66px;
          border-top: 1px solid #e3e9f2;
          padding: 10px 14px;
          display: flex;
          align-items: center;
          gap: 10px;
          background: #fafcff;
        }

        .chat-input-area input {
          flex: 1;
          height: 46px;
          border: 1px solid #d5dfed;
          border-radius: 10px;
          padding: 0 15px;
          outline: none;
          color: #18256e;
          font-size: 15px;
          background: white;
        }

        .chat-input-area input:focus {
          border-color: #0baa7e;
        }

        .attachment-button {
          width: 36px;
          height: 36px;
          border: none;
          background: transparent;
          cursor: pointer;
          font-size: 21px;
        }

        .send-button {
          width: 48px;
          height: 46px;
          border: none;
          border-radius: 10px;
          background: #08aa7c;
          color: white;
          font-size: 23px;
          cursor: pointer;
          transition: 0.2s ease;
        }

        .send-button:hover:not(:disabled) {
          background: #078e69;
        }

        .send-button:disabled {
          opacity: 0.45;
          cursor: not-allowed;
        }

        /* ================================================
           RIGHT CARDS
        ================================================ */

        .side-card {
          border: 1px solid #e0e7f1;
          border-radius: 14px;
          background: white;
          overflow: hidden;
          margin-bottom: 14px;
        }

        .popular-card {
          padding: 16px 16px 5px;
        }

        .side-card-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 8px;
        }

        .side-card-header button {
          border: none;
          background: transparent;
          color: #0065df;
          cursor: pointer;
          font-size: 14px;
        }

        .popular-list {
          margin-top: 10px;
        }

        .popular-item {
          width: 100%;
          min-height: 48px;
          border: none;
          border-top: 1px solid #edf1f6;
          background: transparent;
          display: flex;
          align-items: center;
          justify-content: space-between;
          text-align: left;
          gap: 10px;
          padding: 9px 3px;
          color: #33457f;
          font-size: 14px;
          cursor: pointer;
        }

        .popular-item:hover {
          color: #009f78;
        }

        .question-arrow {
          font-size: 22px;
          color: #006fe8;
        }

        .learning-card {
          padding: 17px 16px 8px;
        }

        .side-description {
          margin: 6px 0 8px;
          color: #68769a;
          font-size: 13px;
        }

        .learning-list {
          display: flex;
          flex-direction: column;
        }

        .learning-item {
          min-height: 76px;
          border-top: 1px solid #edf1f6;
          display: flex;
          align-items: center;
          gap: 10px;
          text-decoration: none;
          color: #11176c;
          padding: 7px 0;
        }

        .learning-item img {
          border-radius: 10px;
          object-fit: cover;
          flex-shrink: 0;
        }

        .learning-info {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .learning-info strong {
          font-size: 14px;
        }

        .learning-info span {
          color: #657398;
          font-size: 12px;
        }

        .learning-arrow {
          color: #006fe8;
          font-size: 23px;
        }

        .remember-card {
          border-radius: 14px;
          background: #e2faef;
          padding: 18px;
          display: flex;
          align-items: flex-start;
          gap: 10px;
        }

        .remember-card img {
          object-fit: contain;
          flex-shrink: 0;
        }

        .remember-card h2 {
          margin: 3px 0 7px;
          font-size: 19px;
        }

        .remember-card p {
          margin: 0;
          color: #40548b;
          font-size: 14px;
          line-height: 1.5;
        }

        .remember-card span {
          display: block;
          margin-top: 7px;
          color: #40548b;
          font-size: 13px;
        }

        /* ================================================
           RESPONSIVE
        ================================================ */

        @media (max-width: 1200px) {

          .sidebar {
            width: 230px;
          }


          .goals-header {
            left: 230px;
          }


          .goals-main {
            margin-left: 230px;
            padding-left: 20px;
            padding-right: 20px;
          }


          .goals-layout {
            grid-template-columns: minmax(0, 1fr) 280px;
          }


          .hero-copy h1 {
            font-size: 34px;
          }


          .goal-stats strong {
            font-size: 18px;
          }

        }


        @media (max-width: 1000px) {

          .goals-layout {
            grid-template-columns: 1fr;
          }


          .goals-right {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
          }


          .hero-copy {
            width: 55%;
          }


          .hero-image {
            width: 52%;
          }


          .hero-copy h1 {
            font-size: 30px;
          }


          .goal-main {
            align-items: flex-start;
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


          .goals-page {
            width: 100%;
            min-width: 0;
            padding-bottom: 72px;
          }


          /* HEADER */

          .goals-header {
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


          .goals-search {
            flex: 1;
            width: auto;
            min-width: 0;
            height: 42px;
            padding: 0 10px;
            gap: 7px;
          }


          .goals-search input {
            min-width: 0;
            font-size: 11px;
          }


          .search-icon {
            font-size: 19px;
          }


          .goals-profile-area {
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

@media (max-width: 1200px) {

          .hero-copy h1 {
            font-size: 40px;
          }

          .hero-copy p {
            font-size: 16px;
          }

          .content-grid {
            grid-template-columns: minmax(0, 1fr) 290px;
          }

          .quick-grid {
            grid-template-columns: repeat(2, 1fr);
          }

        }

@media (max-width: 900px) {

          .logo-area,
          .sidebar-divider,
          .secondary-nav,

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

          .student-search input {
            min-width: 0;
            font-size: 11px;
          }

          .student-search .search-icon {
            font-size: 19px;
          }

          .notification,
          .top-divider,
          .profile-text,

          .profile {
            gap: 0;
          }

          .page-wrapper {
            padding: 15px;
          }

          .content-grid {
            grid-template-columns: 1fr;
          }

          .right-column {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 14px;
          }

          .side-card,
          .remember-card {
            margin-bottom: 0;
          }

        }

@media (max-width: 650px) {

          .hero-image {
            opacity: 0.35;
            width: 75%;
          }

          .hero-copy {
            width: 100%;
            padding: 22px;
          }

          .hero-copy h1 {
            font-size: 34px;
          }

          .hero-copy p {
            font-size: 15px;
          }

          .hero-copy p br {
            display: none;
          }

          .quick-grid {
            grid-template-columns: 1fr;
          }

          .chat-messages {
            min-height: 380px;
          }

          .message-content {
            max-width: 82%;
          }

          .right-column {
            grid-template-columns: 1fr;
          }

          .learning-item {
            min-height: 68px;
          }

        }

      `}</style>
    </>
  );
}