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

type GoalType = "savings" | "completion";

type Goal = {
  id: number;
  type: GoalType;
  title: string;
  description: string;
  targetAmount?: number;
  savedAmount?: number;
  targetActivities?: number;
  completedActivities?: number;
  active: boolean;
};

export default function GoalsPage() {
  const defaultGoals: Goal[] = [
    {
      id: 1,
      type: "savings",
      title: "Save for New Headphones",
      description:
        "A pair of headphones for studying, online classes, and music.",
      targetAmount: 1000,
      savedAmount: 400,
      active: true,
    },
    {
      id: 2,
      type: "completion",
      title: "Complete My Learning Activities",
      description:
        "Finish lessons, quizzes, and scenarios to build my financial skills.",
      targetActivities: 3,
      completedActivities: 2,
      active: false,
    },
  ];

  const [goals, setGoals] = useState<Goal[]>(defaultGoals);
  const [selectedGoalId, setSelectedGoalId] = useState(1);
  const [customAmount, setCustomAmount] = useState("");
  const [showEditGoal, setShowEditGoal] = useState(false);
  const [showAddGoal, setShowAddGoal] = useState(false);
  const [goalLoaded, setGoalLoaded] = useState(false);
  const [editTitle, setEditTitle] = useState("");
  const [editTarget, setEditTarget] = useState("");
  const [newGoalType, setNewGoalType] = useState<GoalType>("savings");
  const [newGoalTitle, setNewGoalTitle] = useState("");
  const [newGoalTarget, setNewGoalTarget] = useState("");
  const [user, setUser] = useState<User | null>(null);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);

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
    const storedGoals = localStorage.getItem("growais_goals");

    if (storedGoals) {
      try {
        const parsedGoals = JSON.parse(storedGoals);

        if (Array.isArray(parsedGoals) && parsedGoals.length > 0) {
          setGoals(parsedGoals);
          const activeGoal = parsedGoals.find((goal: Goal) => goal.active);
          setSelectedGoalId(activeGoal?.id ?? parsedGoals[0].id);
        }
      } catch {
        localStorage.removeItem("growais_goals");
      }
    }

    setGoalLoaded(true);
  }, []);

  useEffect(() => {
    if (!goalLoaded) return;
    localStorage.setItem("growais_goals", JSON.stringify(goals));
  }, [goals, goalLoaded]);

  const activeGoal =
    goals.find((goal) => goal.id === selectedGoalId) ?? goals[0];

  const isSavingsGoal = activeGoal?.type === "savings";
  const targetAmount = activeGoal?.targetAmount ?? 0;
  const savedAmount = activeGoal?.savedAmount ?? 0;
  const remaining = Math.max(targetAmount - savedAmount, 0);

  const progress = isSavingsGoal
    ? targetAmount > 0
      ? Math.min(Math.round((savedAmount / targetAmount) * 100), 100)
      : 0
    : activeGoal?.targetActivities
      ? Math.min(
          Math.round(
            ((activeGoal.completedActivities ?? 0) /
              activeGoal.targetActivities) *
              100
          ),
          100
        )
      : 0;

  const updateGoal = (id: number, updates: Partial<Goal>) => {
    setGoals((currentGoals) =>
      currentGoals.map((goal) =>
        goal.id === id ? { ...goal, ...updates } : goal
      )
    );
  };

  const selectGoal = (id: number) => {
    setSelectedGoalId(id);

    setGoals((currentGoals) =>
      currentGoals.map((goal) => ({
        ...goal,
        active: goal.id === id,
      }))
    );
  };

  const addSaving = (amount: number) => {
    if (!activeGoal || !isSavingsGoal || amount <= 0) return;

    updateGoal(activeGoal.id, {
      savedAmount: Math.min(savedAmount + amount, targetAmount),
    });
  };

  const subtractSaving = (amount: number) => {
    if (!activeGoal || !isSavingsGoal || amount <= 0) return;

    updateGoal(activeGoal.id, {
      savedAmount: Math.max(savedAmount - amount, 0),
    });
  };

  const addCustomSaving = () => {
    const amount = Number(customAmount);
    if (!amount || amount <= 0) return;

    addSaving(amount);
    setCustomAmount("");
  };

  const openEditGoal = () => {
    if (!activeGoal) return;

    setEditTitle(activeGoal.title);
    setEditTarget(
      String(
        activeGoal.type === "savings"
          ? activeGoal.targetAmount ?? ""
          : activeGoal.targetActivities ?? ""
      )
    );
    setShowEditGoal(!showEditGoal);
  };

  const saveGoalChanges = () => {
    if (!activeGoal || !editTitle.trim()) return;

    const newTarget = Number(editTarget);
    if (!newTarget || newTarget <= 0) return;

    if (activeGoal.type === "savings") {
      updateGoal(activeGoal.id, {
        title: editTitle.trim(),
        targetAmount: newTarget,
        savedAmount: Math.min(savedAmount, newTarget),
      });
    } else {
      updateGoal(activeGoal.id, {
        title: editTitle.trim(),
        targetActivities: Math.round(newTarget),
        completedActivities: Math.min(
          activeGoal.completedActivities ?? 0,
          Math.round(newTarget)
        ),
      });
    }

    setShowEditGoal(false);
  };

  const createGoal = () => {
    if (!newGoalTitle.trim()) return;

    const target = Number(newGoalTarget);
    if (!target || target <= 0) return;

    const newGoal: Goal =
      newGoalType === "savings"
        ? {
            id: Date.now(),
            type: "savings",
            title: newGoalTitle.trim(),
            description: "A new savings target I want to reach.",
            targetAmount: target,
            savedAmount: 0,
            active: false,
          }
        : {
            id: Date.now(),
            type: "completion",
            title: newGoalTitle.trim(),
            description:
              "Complete lessons, quizzes, and scenarios to keep learning.",
            targetActivities: Math.round(target),
            completedActivities: 0,
            active: false,
          };

    setGoals((currentGoals) => [...currentGoals, newGoal]);
    setNewGoalTitle("");
    setNewGoalTarget("");
    setShowAddGoal(false);
  };

  const studentName = user?.full_name || "Student";
  const firstName = studentName.split(" ")[0] || "Student";

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
    <div className="goals-page">

      {/* =====================================================
          UPDATED STUDENT HEADER
      ===================================================== */}

      <header className="goals-header">
        <div className="goals-search">
          <span className="search-icon">⌕</span>

          <input
            type="text"
            placeholder="Search lessons, quizzes, or topics..."
          />
        </div>

        <div className="goals-profile-area">
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

          <a
            href="/student/goals"
            className="nav-item active"
          >
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
          MAIN
      ===================================================== */}

      <main className="goals-main">

        {/* =================================================
            HERO
        ================================================= */}

        <section className="goals-hero">

          <div className="hero-copy">

            <span className="hero-label">
              MY FINANCIAL GOAL
            </span>

            <h1>
              Set a goal.{" "}
              <span>Build your future.</span>
            </h1>

            <p>
              A small step today can make a big difference tomorrow.
              <br />
              Choose something meaningful and start saving!
            </p>

          </div>


          <div className="hero-image">

            <Image
              src="/assets/goals-hero-illustration(2).png"
              alt="Student working towards a financial goal"
              fill
              priority
              sizes="700px"
              className="hero-image-img"
            />

          </div>

        </section>


        {/* =================================================
            MAIN GRID
        ================================================= */}

        <section className="goals-layout">

          {/* =================================================
              LEFT COLUMN
          ================================================= */}

          <div className="goals-left">

            {/* =================================================
                MY GOALS
            ================================================= */}

            <section className="card my-goals-card">

              <div className="my-goals-header">
                <div>
                  <h2>My Goals</h2>
                  <p>Choose an active goal or create another goal.</p>
                </div>

                <button
                  className="new-goal-button"
                  onClick={() => setShowAddGoal(!showAddGoal)}
                >
                  + Add Goal
                </button>
              </div>

              {showAddGoal && (
                <div className="add-goal-box">

                  <select
                    value={newGoalType}
                    onChange={(event) =>
                      setNewGoalType(event.target.value as GoalType)
                    }
                  >
                    <option value="savings">Savings Goal</option>
                    <option value="completion">
                      Learning Completion Goal
                    </option>
                  </select>

                  <input
                    type="text"
                    value={newGoalTitle}
                    onChange={(event) => setNewGoalTitle(event.target.value)}
                    placeholder={
                      newGoalType === "savings"
                        ? "e.g. Save for a new phone"
                        : "e.g. Finish this month's learning"
                    }
                  />

                  <input
                    type="number"
                    min="1"
                    value={newGoalTarget}
                    onChange={(event) => setNewGoalTarget(event.target.value)}
                    placeholder={
                      newGoalType === "savings"
                        ? "Target amount (HK$)"
                        : "Number of activities"
                    }
                  />

                  <button onClick={createGoal}>Create Goal</button>

                </div>
              )}

              <div className="goal-list">

                {goals.map((goal) => {
                  const goalProgress =
                    goal.type === "savings"
                      ? goal.targetAmount
                        ? Math.min(
                            Math.round(
                              ((goal.savedAmount ?? 0) /
                                goal.targetAmount) *
                                100
                            ),
                            100
                          )
                        : 0
                      : goal.targetActivities
                        ? Math.min(
                            Math.round(
                              ((goal.completedActivities ?? 0) /
                                goal.targetActivities) *
                                100
                            ),
                            100
                          )
                        : 0;

                  return (
                    <button
                      key={goal.id}
                      className={`goal-list-item ${
                        goal.id === selectedGoalId ? "selected" : ""
                      }`}
                      onClick={() => selectGoal(goal.id)}
                    >
                      <span className="goal-list-icon">
                        {goal.type === "savings" ? "💰" : "📚"}
                      </span>

                      <span className="goal-list-content">
                        <strong>{goal.title}</strong>
                        <small>
                          {goal.type === "savings"
                            ? `HK$ ${(goal.savedAmount ?? 0).toLocaleString()} / HK$ ${(goal.targetAmount ?? 0).toLocaleString()}`
                            : `${goal.completedActivities ?? 0} / ${goal.targetActivities ?? 0} activities`}
                        </small>
                      </span>

                      <span className="goal-list-progress">
                        {goalProgress}%
                      </span>
                    </button>
                  );
                })}

              </div>

            </section>


            {/* =================================================
                CURRENT GOAL
            ================================================= */}

            <section className="card current-goal-card">

              <div className="card-title-row">

                <div className="current-goal-heading">
                  <h2>
                    Current Goal
                  </h2>
                  <span className="active-goal-badge">● Active</span>
                </div>

                <button
                  className="edit-goal-button"
                  onClick={openEditGoal}
                >
                  ✎ &nbsp; Edit Goal
                </button>

              </div>


              {showEditGoal && (
                <div className="edit-goal-box">

                  <input
                    type="text"
                    value={editTitle}
                    onChange={(event) => setEditTitle(event.target.value)}
                    placeholder="Goal name"
                  />

                  <input
                    type="number"
                    min="1"
                    value={editTarget}
                    onChange={(event) => setEditTarget(event.target.value)}
                    placeholder={
                      isSavingsGoal
                        ? "Target amount"
                        : "Number of activities"
                    }
                  />

                  <button onClick={saveGoalChanges}>
                    Save
                  </button>

                </div>
              )}


              <div className="goal-main">

                <div className="goal-image-box">

                  <Image
                    src="/assets/goal-headphones.png"
                    alt="Headphones"
                    fill
                    sizes="180px"
                    className="goal-image"
                  />

                </div>


                <div className="goal-details">

                  <h3>
                    {activeGoal?.title}
                  </h3>

                  <p className="goal-description">
                    {activeGoal?.description}
                  </p>


                  <div className="goal-stats">

                  {isSavingsGoal ? (
                    <>
                      <div>
                        <span>Target Amount</span>
                        <strong>
                          HK$ {targetAmount.toLocaleString()}
                        </strong>
                      </div>

                      <div>
                        <span>Saved Amount</span>
                        <strong className="saved">
                          HK$ {savedAmount.toLocaleString()}
                        </strong>
                      </div>

                      <div>
                        <span>Remaining</span>
                        <strong>
                          HK$ {remaining.toLocaleString()}
                        </strong>
                      </div>
                    </>
                  ) : (
                    <>
                      <div>
                        <span>Activities Target</span>
                        <strong>
                          {activeGoal?.targetActivities ?? 0}
                        </strong>
                      </div>

                      <div>
                        <span>Completed</span>
                        <strong className="saved">
                          {activeGoal?.completedActivities ?? 0}
                        </strong>
                      </div>

                      <div>
                        <span>Still To Do</span>
                        <strong>
                          {Math.max(
                            (activeGoal?.targetActivities ?? 0) -
                              (activeGoal?.completedActivities ?? 0),
                            0
                          )}
                        </strong>
                      </div>
                    </>
                  )}

                </div>

              </div>

              </div>


              {/* PROGRESS */}

              <div className="goal-progress-row">

                <div className="goal-progress">

                  <div
                    className="goal-progress-fill"
                    style={{
                      width: `${progress}%`,
                    }}
                  />

                </div>

                <strong>
                  {progress}%
                </strong>

              </div>


              {/* MOTIVATION */}

              <div className="goal-message">

                <span className="plant-icon">
                  🌱
                </span>

                <div>

                  <strong>
                    {progress >= 100
                      ? "Goal reached!"
                      : isSavingsGoal
                        ? "You're doing great!"
                        : "Keep learning!"}
                  </strong>

                  <p>
                    {progress >= 100
                      ? isSavingsGoal
                        ? "You reached your savings goal. Great work!"
                        : "You completed your learning goal. Great work!"
                      : isSavingsGoal
                        ? `You've saved ${progress}% of your goal. ${remaining > 0 ? `Only HK$ ${remaining.toLocaleString()} more to go.` : "Keep it going!"}`
                        : `You've completed ${activeGoal?.completedActivities ?? 0} of ${activeGoal?.targetActivities ?? 0} learning activities. Keep going!`}
                  </p>

                </div>

              </div>

            </section>


            {isSavingsGoal ? (
              <section className="card savings-card">

                <div className="savings-heading-row">
                  <div>
                    <h2>Update Savings</h2>
                    <p>
                      Add money when you save, or subtract money if you need
                      to correct your saved amount.
                    </p>
                  </div>

                  <div className="savings-balance">
                    HK$ {savedAmount.toLocaleString()}
                  </div>
                </div>

                <div className="savings-actions">

                  <button
                    className="minus-button"
                    onClick={() => subtractSaving(50)}
                    disabled={savedAmount <= 0}
                  >
                    − HK$ 50
                  </button>

                  <button onClick={() => addSaving(50)}>+ HK$ 50</button>
                  <button onClick={() => addSaving(100)}>+ HK$ 100</button>
                  <button onClick={() => addSaving(200)}>+ HK$ 200</button>
                  <button onClick={() => addSaving(500)}>+ HK$ 500</button>

                  <div className="custom-saving">
                    <span>HK$</span>

                    <input
                      type="number"
                      min="1"
                      value={customAmount}
                      onChange={(event) =>
                        setCustomAmount(event.target.value)
                      }
                      placeholder="Enter amount"
                    />
                  </div>

                  <button className="add-button" onClick={addCustomSaving}>
                    Add
                  </button>

                </div>

              </section>
            ) : (
              <section className="card completion-goal-card">

                <div className="completion-goal-header">
                  <div>
                    <h2>Learning Goal</h2>
                    <p>
                      Your current learning goal covers lessons, quizzes,
                      and scenarios.
                    </p>
                  </div>

                  <span className="completion-percent">{progress}%</span>
                </div>

                <div className="completion-items">

                  <div className="completion-item completed">
                    <span>✓</span>
                    <div>
                      <strong>Lessons</strong>
                      <small>1 / 1 completed</small>
                    </div>
                  </div>

                  <div className="completion-item completed">
                    <span>✓</span>
                    <div>
                      <strong>Quizzes</strong>
                      <small>1 / 1 completed</small>
                    </div>
                  </div>

                  <div className="completion-item">
                    <span>○</span>
                    <div>
                      <strong>Scenarios</strong>
                      <small>0 / 1 completed</small>
                    </div>
                  </div>

                </div>

              </section>
            )}


            {/* =================================================
                GOAL TIMELINE
            ================================================= */}

            <section className="card timeline-card">

              <h2>
                Goal Timeline
              </h2>

              <p>
                Your savings journey so far.
              </p>


              <div className="timeline">

                <div className="timeline-line" />

                <div className="timeline-item completed">

                  <div className="timeline-circle">
                    ✓
                  </div>

                  <strong>
                    Goal Created
                  </strong>

                  <span>
                    18 Sep 2026
                  </span>

                </div>


                <div className="timeline-item completed">

                  <div className="timeline-circle">
                    ✓
                  </div>

                  <strong>
                    First HK$ 200 Saved
                  </strong>

                  <span>
                    21 Sep 2026
                  </span>

                </div>


                <div className="timeline-item completed">

                  <div className="timeline-circle">
                    ✓
                  </div>

                  <strong>
                    HK$ {savedAmount.toLocaleString()} Saved
                  </strong>

                  <span>
                    current
                  </span>

                </div>


                <div className="timeline-item">

                  <div className="timeline-circle empty" />

                  <strong>
                    HK$ {remaining.toLocaleString()} More
                  </strong>

                  <span>
                    to reach target
                  </span>

                </div>


                <div className="timeline-item">

                  <div className="timeline-circle empty" />

                  <strong>
                    Reach HK$ {targetAmount.toLocaleString()}
                  </strong>

                  <span>
                    goal target
                  </span>

                </div>

              </div>

            </section>

          </div>


          {/* =================================================
              RIGHT COLUMN
          ================================================= */}

          <aside className="goals-right">

            {/* WHY SET A GOAL */}

            <section className="card why-card">

              <div className="side-title">

                <span>
                  💡
                </span>

                <h2>
                  Why Set a Goal?
                </h2>

              </div>

              <p>
                You already have a clear target, so you can
                track your saving instead of spending without
                a plan.
              </p>


              <ul>

                <li>
                  <span>✓</span>
                  Keeps your savings focused on one goal
                </li>

                <li>
                  <span>✓</span>
                  Shows how much you still need to save
                </li>

                <li>
                  <span>✓</span>
                  Turns small savings into visible progress
                </li>

                <li>
                  <span>✓</span>
                  Helps you reach something you actually want
                </li>

              </ul>

            </section>


            {/* STAY MOTIVATED */}

            <section className="card motivation-card">

              <div className="motivation-title">

                <span>
                  🏆
                </span>

                <h2>
                  Stay Motivated!
                </h2>

              </div>

              <blockquote>
                “You are already 40% of the way there.
                Keep the small savings coming.”
              </blockquote>

              <span className="motivation-author">
                — GrowAIs
              </span>

            </section>


            {/* NEED HELP */}

            <section className="card help-card">

              <div className="help-icon">
                🤖
              </div>

              <h2>
                Need Help?
              </h2>

              <p>
                Need help deciding how much to save
                each week or what to cut from your spending?
              </p>

              <Link
                href="/student/ai-assistant"
                className="ai-button"
              >
                Ask AI Assistant
                <span>→</span>
              </Link>

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


        .goals-page {
          min-height: 100vh;
          background: #ffffff;
          color: #10165c;
          font-family: Arial, Helvetica, sans-serif;
          overflow-x: hidden;
        }


        /* =====================================================
           UPDATED STUDENT HEADER
        ===================================================== */

        .goals-header {
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

        .goals-search {
          width: 515px;
          height: 48px;
          background: #f3f6fb;
          border-radius: 12px;
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 0 16px;
        }

        .goals-search input {
          width: 100%;
          border: none;
          outline: none;
          background: transparent;
          color: #18245d;
          font-size: 16px;
        }

        .goals-search input::placeholder {
          color: #8290ad;
        }

        .search-icon {
          font-size: 29px;
          color: #5b6b91;
          transform: rotate(-20deg);
          flex-shrink: 0;
        }

        .goals-profile-area {
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

        .goals-main {
          margin-left: 280px;
          padding: 96px 32px 40px;
          min-height: 100vh;
        }


        /* =====================================================
           HERO
        ===================================================== */

        .goals-hero {
          width: 100%;
          min-height: 190px;
          border-radius: 20px;
          background: linear-gradient(
            90deg,
            #ffffff 0%,
            #f6fffb 45%,
            #e9faf4 100%
          );
          display: flex;
          align-items: center;
          overflow: hidden;
          position: relative;
          margin-bottom: 20px;
        }


        .hero-copy {
          width: 48%;
          padding: 22px 0 22px 28px;
          position: relative;
          z-index: 2;
        }


        .hero-label {
          display: block;
          color: #596895;
          font-size: 15px;
          font-weight: 700;
          letter-spacing: 3px;
          margin-bottom: 8px;
        }


        .hero-copy h1 {
          margin: 0;
          color: #10165c;
          font-size: 42px;
          line-height: 1.05;
          font-weight: 800;
        }


        .hero-copy h1 span {
          color: #008f70;
        }


        .hero-copy p {
          margin: 12px 0 0;
          color: #40538b;
          font-size: 18px;
          line-height: 1.45;
        }


        .hero-image {
          position: absolute;
          right: 0;
          top: 0;
          width: 55%;
          height: 100%;
        }


        .hero-image-img {
          object-fit: cover;
          object-position: center;
        }


        /* =====================================================
           MAIN GRID
        ===================================================== */

        .goals-layout {
          display: grid;
          grid-template-columns: minmax(0, 1fr) 350px;
          gap: 20px;
          align-items: start;
        }


        .goals-left,
        .goals-right {
          min-width: 0;
        }


        .goals-left {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }


        .goals-right {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }


        .card {
          border: 1px solid #e0e7f0;
          border-radius: 16px;
          background: #ffffff;
        }


        /* =====================================================
           CURRENT GOAL
        ===================================================== */

        .my-goals-card {
          padding: 18px 24px;
        }

        .my-goals-header,
        .completion-goal-header,
        .savings-heading-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 15px;
        }

        .my-goals-header h2,
        .completion-goal-header h2 {
          margin: 0;
          color: #10165c;
          font-size: 24px;
        }

        .my-goals-header p,
        .completion-goal-header p,
        .savings-heading-row p {
          margin: 5px 0 0;
          color: #52638d;
          font-size: 14px;
        }

        .new-goal-button {
          border: none;
          border-radius: 10px;
          background: #05a779;
          color: white;
          padding: 10px 15px;
          font-weight: 700;
          cursor: pointer;
        }

        .add-goal-box {
          margin-top: 15px;
          padding: 14px;
          border-radius: 12px;
          background: #f4f8fc;
          display: grid;
          grid-template-columns: 180px 1fr 180px auto;
          gap: 10px;
        }

        .add-goal-box input,
        .add-goal-box select {
          min-width: 0;
          border: 1px solid #d8e1ed;
          border-radius: 9px;
          padding: 10px;
          background: white;
          color: #344879;
          outline: none;
        }

        .add-goal-box button {
          border: none;
          border-radius: 9px;
          padding: 0 16px;
          background: #10165c;
          color: white;
          font-weight: 700;
          cursor: pointer;
        }

        .goal-list {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 10px;
          margin-top: 15px;
        }

        .goal-list-item {
          width: 100%;
          min-width: 0;
          border: 1px solid #e0e7f0;
          border-radius: 12px;
          background: white;
          padding: 12px;
          display: flex;
          align-items: center;
          gap: 10px;
          text-align: left;
          cursor: pointer;
        }

        .goal-list-item.selected {
          border: 2px solid #05a779;
          background: #effbf7;
        }

        .goal-list-icon {
          width: 38px;
          height: 38px;
          border-radius: 10px;
          background: #e8f7f2;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 20px;
          flex-shrink: 0;
        }

        .goal-list-content {
          flex: 1;
          min-width: 0;
          display: flex;
          flex-direction: column;
          gap: 3px;
        }

        .goal-list-content strong {
          color: #10165c;
          font-size: 14px;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .goal-list-content small {
          color: #52638d;
          font-size: 12px;
        }

        .goal-list-progress {
          color: #008f70;
          font-size: 14px;
          font-weight: 800;
        }

        .savings-balance {
          color: #008f70;
          font-size: 24px;
          font-weight: 800;
          white-space: nowrap;
        }

        .minus-button {
          background: #fff0f0 !important;
          color: #c84b4b !important;
          border: 1px solid #ffd3d3 !important;
        }

        .minus-button:disabled {
          opacity: 0.45;
          cursor: not-allowed;
        }

        .completion-goal-card {
          padding: 20px 24px;
        }

        .completion-percent {
          min-width: 62px;
          height: 42px;
          padding: 0 12px;
          border-radius: 12px;
          background: #e7faf3;
          color: #008f70;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 800;
        }

        .completion-items {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 10px;
          margin-top: 18px;
        }

        .completion-item {
          padding: 12px;
          border: 1px solid #e0e7f0;
          border-radius: 11px;
          display: flex;
          align-items: center;
          gap: 10px;
          background: #fafcff;
        }

        .completion-item > span {
          width: 27px;
          height: 27px;
          border-radius: 50%;
          background: #e9eef6;
          color: #657494;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 800;
        }

        .completion-item.completed {
          background: #f0fbf7;
          border-color: #c7ecdf;
        }

        .completion-item.completed > span {
          background: #05a779;
          color: white;
        }

        .completion-item div {
          display: flex;
          flex-direction: column;
          gap: 2px;
        }

        .completion-item strong {
          color: #10165c;
          font-size: 13px;
        }

        .completion-item small {
          color: #52638d;
          font-size: 11px;
        }

        .current-goal-card {
          padding: 20px 24px;
        }


        .card-title-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 15px;
        }


        .card-title-row h2,
        .savings-card h2,
        .timeline-card h2 {
          margin: 0;
          color: #10165c;
          font-size: 24px;
        }

        .current-goal-heading {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .active-goal-badge {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          padding: 6px 10px;
          border-radius: 999px;
          background: #e7faf3;
          color: #008f70;
          font-size: 12px;
          font-weight: 700;
        }


        .edit-goal-button {
          border: none;
          background: #edf4ff;
          color: #006cff;
          border-radius: 10px;
          padding: 10px 16px;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
        }


        .edit-goal-box {
          margin-top: 15px;
          padding: 12px;
          border-radius: 10px;
          background: #f5f8fc;
          display: flex;
          gap: 10px;
          flex-wrap: wrap;
        }


        .edit-goal-box input {
          flex: 1 1 220px;
          min-width: 0;
          border: 1px solid #d8e1ed;
          border-radius: 8px;
          padding: 10px;
          outline: none;
        }


        .edit-goal-box button {
          border: none;
          border-radius: 8px;
          padding: 0 18px;
          background: #05a779;
          color: white;
          cursor: pointer;
        }


        .goal-main {
          display: flex;
          gap: 22px;
          margin-top: 18px;
          align-items: center;
        }


        .goal-image-box {
          position: relative;
          width: 170px;
          height: 150px;
          border-radius: 15px;
          background: #e5faf2;
          overflow: hidden;
          flex-shrink: 0;
        }


        .goal-image {
          object-fit: contain;
          padding: 10px;
        }


        .goal-details {
          flex: 1;
          min-width: 0;
        }


        .goal-details h3 {
          margin: 0;
          color: #10165c;
          font-size: 24px;
        }


        .goal-description {
          margin: 5px 0 22px;
          color: #344879;
          font-size: 17px;
        }


        .goal-stats {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 20px;
        }


        .goal-stats div {
          min-width: 0;
          padding-right: 18px;
          border-right: 1px solid #edf0f5;
        }


        .goal-stats div:last-child {
          border-right: none;
        }


        .goal-stats span {
          display: block;
          color: #52638d;
          font-size: 14px;
          margin-bottom: 6px;
        }


        .goal-stats strong {
          color: #10165c;
          font-size: 22px;
        }


        .goal-stats strong.saved {
          color: #05a779;
        }


        .goal-progress-row {
          display: flex;
          align-items: center;
          gap: 18px;
          margin-top: 22px;
        }


        .goal-progress {
          flex: 1;
          height: 20px;
          border-radius: 20px;
          background: #e9eef6;
          overflow: hidden;
        }


        .goal-progress-fill {
          height: 100%;
          border-radius: inherit;
          background: #05a779;
          transition: width 0.3s ease;
        }


        .goal-progress-row > strong {
          color: #40538b;
          font-size: 18px;
        }


        .goal-message {
          margin-top: 16px;
          min-height: 68px;
          border-radius: 12px;
          background: #e7faf3;
          display: flex;
          align-items: center;
          gap: 14px;
          padding: 12px 18px;
        }


        .plant-icon {
          font-size: 37px;
        }


        .goal-message strong {
          color: #006f59;
          font-size: 17px;
        }


        .goal-message p {
          margin: 3px 0 0;
          color: #155b50;
          font-size: 15px;
        }


        /* =====================================================
           SAVINGS
        ===================================================== */

        .savings-card {
          padding: 18px 24px;
        }


        .savings-card > p,
        .timeline-card > p {
          margin: 5px 0 14px;
          color: #52638d;
          font-size: 16px;
        }


        .savings-actions {
          display: flex;
          align-items: center;
          gap: 10px;
          flex-wrap: wrap;
        }


        .savings-actions > button:not(.add-button) {
          min-width: 105px;
          height: 45px;
          border: none;
          border-radius: 11px;
          background: #eef2fa;
          color: #344879;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
        }


        .savings-actions > button:hover {
          background: #e3f5ef;
          color: #008f70;
        }


        .custom-saving {
          height: 45px;
          min-width: 210px;
          border: 1px solid #d8e2ee;
          border-radius: 10px;
          display: flex;
          align-items: center;
          padding: 0 12px;
          color: #52638d;
        }


        .custom-saving input {
          width: 100%;
          border: none;
          outline: none;
          padding-left: 8px;
          font-size: 14px;
        }


        .add-button {
          height: 45px;
          padding: 0 22px;
          border: none;
          border-radius: 10px;
          background: #05a779;
          color: white;
          font-size: 15px;
          font-weight: 700;
          cursor: pointer;
        }


        /* =====================================================
           TIMELINE
        ===================================================== */

        .timeline-card {
          padding: 18px 24px 26px;
        }


        .timeline {
          position: relative;
          display: grid;
          grid-template-columns: repeat(5, 1fr);
          gap: 10px;
          margin-top: 32px;
        }


        .timeline-line {
          position: absolute;
          left: 9%;
          right: 9%;
          top: 15px;
          height: 3px;
          background: #dce5ef;
        }


        .timeline-item {
          position: relative;
          z-index: 2;
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          gap: 7px;
        }


        .timeline-circle {
          width: 30px;
          height: 30px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #05a779;
          color: white;
          font-size: 15px;
          font-weight: 700;
        }


        .timeline-circle.empty {
          background: #ffffff;
          border: 4px solid #dce4f0;
        }


        .timeline-item strong {
          color: #10165c;
          font-size: 14px;
          line-height: 1.25;
        }


        .timeline-item span {
          color: #52638d;
          font-size: 13px;
          line-height: 1.3;
        }


        /* =====================================================
           RIGHT COLUMN
        ===================================================== */

        .why-card {
          padding: 20px 22px;
          background: #f1f7ff;
        }


        .side-title,
        .motivation-title {
          display: flex;
          align-items: center;
          gap: 12px;
        }


        .side-title span,
        .motivation-title span {
          font-size: 31px;
        }


        .side-title h2,
        .motivation-title h2 {
          margin: 0;
          color: #10165c;
          font-size: 21px;
        }


        .why-card > p {
          color: #40538b;
          font-size: 15px;
          line-height: 1.5;
          margin: 14px 0 15px;
        }


        .why-card ul {
          list-style: none;
          margin: 0;
          padding: 0;
          display: flex;
          flex-direction: column;
          gap: 12px;
        }


        .why-card li {
          display: flex;
          align-items: center;
          gap: 10px;
          color: #344879;
          font-size: 14px;
        }


        .why-card li span {
          width: 22px;
          height: 22px;
          border-radius: 50%;
          background: #05a779;
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 12px;
          font-weight: 700;
          flex-shrink: 0;
        }


        /* =====================================================
           MOTIVATION
        ===================================================== */

        .motivation-card {
          padding: 20px 22px;
          background: #fff8e9;
        }


        .motivation-card blockquote {
          margin: 18px 0 7px 43px;
          color: #18245d;
          font-size: 18px;
          line-height: 1.45;
          font-weight: 600;
        }


        .motivation-author {
          display: block;
          margin-left: 43px;
          color: #40538b;
          font-size: 14px;
        }


        /* =====================================================
           HELP
        ===================================================== */

        .help-card {
          padding: 20px 22px;
          background: #f2f8ff;
        }


        .help-icon {
          font-size: 37px;
          margin-bottom: 8px;
        }


        .help-card h2 {
          margin: 0 0 8px;
          color: #10165c;
          font-size: 21px;
        }


        .help-card p {
          margin: 0 0 18px;
          color: #40538b;
          font-size: 15px;
          line-height: 1.45;
        }


        .ai-button {
          width: 100%;
          min-height: 46px;
          border: 1px solid #006cff;
          border-radius: 11px;
          background: white;
          color: #006cff;
          text-decoration: none;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 18px;
          font-size: 14px;
          font-weight: 700;
        }


        .ai-button span {
          font-size: 20px;
        }


        /* =====================================================
           TABLET
        ===================================================== */

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

          .goals-header {
            left: 0;
            right: 0;
            width: 100%;
            height: 64px;
            padding: 0 12px;
            gap: 8px;
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


          /* MAIN */

          .goals-main {
            margin-left: 0;
            width: 100%;
            max-width: 100%;
            padding: 76px 12px 24px;
          }


          /* HERO */

          .goals-hero {
            min-height: 220px;
            border-radius: 15px;
            display: block;
            position: relative;
          }


          .hero-copy {
            width: 100%;
            padding: 20px 18px;
            position: relative;
            z-index: 3;
          }


          .hero-label {
            font-size: 11px;
            letter-spacing: 2px;
          }


          .hero-copy h1 {
            font-size: 27px;
            max-width: 330px;
          }


          .hero-copy p {
            font-size: 13px;
            max-width: 340px;
          }


          .hero-image {
            width: 100%;
            height: 105px;
            bottom: 0;
            top: auto;
          }


          .hero-image-img {
            object-position: center bottom;
          }


          /* LAYOUT */

          .goals-layout {
            display: flex;
            flex-direction: column;
            gap: 12px;
          }


          .goals-left,
          .goals-right {
            width: 100%;
          }


          .goals-right {
            display: flex;
          }


          /* CURRENT GOAL */

          .my-goals-card,
          .completion-goal-card {
            padding: 15px;
          }

          .my-goals-header,
          .completion-goal-header,
          .savings-heading-row {
            align-items: flex-start;
          }

          .my-goals-header h2,
          .completion-goal-header h2 {
            font-size: 20px;
          }

          .new-goal-button {
            padding: 8px 10px;
            font-size: 11px;
          }

          .add-goal-box {
            grid-template-columns: 1fr;
          }

          .add-goal-box button {
            min-height: 42px;
          }

          .goal-list {
            grid-template-columns: 1fr;
          }

          .savings-heading-row {
            flex-direction: column;
          }

          .savings-balance {
            align-self: flex-start;
            font-size: 20px;
          }

          .completion-items {
            grid-template-columns: 1fr;
          }

          .completion-percent {
            min-width: 52px;
            height: 36px;
            font-size: 13px;
          }

          .current-goal-card {
            padding: 15px;
          }


          .card-title-row h2,
          .savings-card h2,
          .timeline-card h2 {
            font-size: 20px;
          }

          .current-goal-heading {
            flex-wrap: wrap;
            gap: 6px;
          }

          .active-goal-badge {
            font-size: 10px;
            padding: 4px 8px;
          }


          .edit-goal-button {
            padding: 8px 11px;
            font-size: 12px;
          }


          .goal-main {
            gap: 13px;
            margin-top: 14px;
            align-items: center;
          }


          .goal-image-box {
            width: 105px;
            height: 105px;
          }


          .goal-details h3 {
            font-size: 18px;
          }


          .goal-description {
            font-size: 12px;
            margin-bottom: 13px;
          }


          .goal-stats {
            grid-template-columns: 1fr;
            gap: 7px;
          }


          .goal-stats div {
            padding: 0;
            border-right: none;
          }


          .goal-stats span {
            display: inline;
            font-size: 11px;
            margin-right: 5px;
          }


          .goal-stats strong {
            font-size: 14px;
          }


          .goal-progress-row {
            gap: 10px;
            margin-top: 15px;
          }


          .goal-progress {
            height: 13px;
          }


          .goal-progress-row > strong {
            font-size: 13px;
          }


          .goal-message {
            min-height: 55px;
            padding: 8px 12px;
          }


          .plant-icon {
            font-size: 27px;
          }


          .goal-message strong {
            font-size: 13px;
          }


          .goal-message p {
            font-size: 11px;
          }


          /* SAVINGS */

          .savings-card {
            padding: 15px;
          }


          .savings-card > p,
          .timeline-card > p {
            font-size: 12px;
          }


          .savings-actions {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
          }


          .savings-actions > button:not(.add-button) {
            width: 100%;
            min-width: 0;
          }


          .custom-saving {
            min-width: 0;
            width: 100%;
          }


          .add-button {
            width: 100%;
          }


          /* TIMELINE */

          .timeline-card {
            padding: 15px;
            overflow-x: auto;
          }


          .timeline {
            min-width: 600px;
            margin-top: 25px;
          }


          /* RIGHT CARDS */

          .why-card,
          .motivation-card,
          .help-card {
            padding: 15px;
          }


          .side-title h2,
          .motivation-title h2,
          .help-card h2 {
            font-size: 18px;
          }


          .why-card > p,
          .help-card p {
            font-size: 12px;
          }


          .why-card li {
            font-size: 12px;
          }


          .motivation-card blockquote {
            margin-left: 0;
            font-size: 15px;
          }


          .motivation-author {
            margin-left: 0;
          }

        }


        /* =====================================================
           SMALL PHONES
        ===================================================== */

        @media (max-width: 380px) {

          .goals-main {
            padding-left: 10px;
            padding-right: 10px;
          }


          .hero-copy h1 {
            font-size: 24px;
          }


          .hero-copy p {
            font-size: 12px;
          }


          .goal-image-box {
            width: 90px;
            height: 90px;
          }


          .goal-details h3 {
            font-size: 16px;
          }


          .goal-description {
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