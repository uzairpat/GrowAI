"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import TeacherShell from "../../../components/teacher/TeacherShell";

type ContentType = "Lesson" | "Quiz" | "Scenario";

type ContentItem = {
  id: number;
  title: string;
  type: ContentType;
  subject: string;
  grade: string;
  duration: string;
  description: string;
  image: string;
  tone: "green" | "purple" | "orange" | "blue";
};

const contentItems: ContentItem[] = [
  {
    id: 1,
    title: "Budgeting Basics",
    type: "Lesson",
    subject: "Finance",
    grade: "Grade 7–9",
    duration: "15 min",
    description: "Learn how to plan and manage your money effectively.",
    image: "/assets/teachers/content-budgeting-basics-piggy-bank.png",
    tone: "green",
  },
  {
    id: 2,
    title: "Saving for the Future",
    type: "Lesson",
    subject: "Finance",
    grade: "Grade 7–9",
    duration: "12 min",
    description: "Explore the importance of saving early.",
    image: "/assets/teachers/content-saving-for-the-future-sprout.png",
    tone: "green",
  },
  {
    id: 3,
    title: "Smart Spending Quiz",
    type: "Quiz",
    subject: "Finance",
    grade: "Grade 7–9",
    duration: "10 questions",
    description: "Test your knowledge on smart spending habits.",
    image: "/assets/teachers/content-smart-spending-cart.png",
    tone: "purple",
  },
  {
    id: 4,
    title: "Real Life Choices",
    type: "Scenario",
    subject: "Life Skills",
    grade: "Grade 8–10",
    duration: "20 min",
    description: "Make decisions and see the outcomes.",
    image: "/assets/teachers/content-real-life-choices-globe.png",
    tone: "blue",
  },
  {
    id: 5,
    title: "Needs vs Wants",
    type: "Lesson",
    subject: "Finance",
    grade: "Grade 6–8",
    duration: "10 min",
    description: "Understand the difference between needs and wants.",
    image: "/assets/teachers/content-smart-spending-cart.png",
    tone: "green",
  },
  {
    id: 6,
    title: "Budgeting Quiz",
    type: "Quiz",
    subject: "Finance",
    grade: "Grade 7–9",
    duration: "8 questions",
    description: "Test what you have learned about budgeting.",
    image: "/assets/teachers/content-budgeting-basics-piggy-bank.png",
    tone: "purple",
  },
  {
    id: 7,
    title: "Planning a Dream Home",
    type: "Scenario",
    subject: "Life Skills",
    grade: "Grade 8–10",
    duration: "15 min",
    description: "Make choices and manage your budget.",
    image: "/assets/teachers/content-saving-for-the-future-sprout.png",
    tone: "blue",
  },
  {
    id: 8,
    title: "Investing Basics",
    type: "Lesson",
    subject: "Finance",
    grade: "Grade 9–12",
    duration: "18 min",
    description: "Learn how investing can help your future.",
    image: "/assets/teachers/content-real-life-choices-globe.png",
    tone: "green",
  },
];

const recentlyAdded = [
  { title: "Investing Basics", meta: "Lesson · 2 days ago", color: "green" },
  { title: "Needs vs Wants Quiz", meta: "Quiz · 4 days ago", color: "purple" },
  { title: "Smart Spending", meta: "Scenario · 5 days ago", color: "orange" },
];

const subjects = [
  ["Finance", 18],
  ["Life Skills", 12],
  ["Digital Skills", 10],
  ["Health & Wellbeing", 8],
  ["Environment", 6],
  ["Career & Work", 6],
];

export default function TeacherContentLibraryPage() {
  const [tab, setTab] = useState<"All Content" | ContentType>("All Content");
  const [search, setSearch] = useState("");
  const [type, setType] = useState("All Types");
  const [subject, setSubject] = useState("All Subjects");
  const [grade, setGrade] = useState("All Grades");
  const [sort, setSort] = useState("Latest");

  const filtered = useMemo(() => {
    return contentItems.filter((item) => {
      const matchesTab = tab === "All Content" || item.type === tab;
      const matchesSearch =
        !search.trim() ||
        [item.title, item.description, item.subject, item.type]
          .join(" ")
          .toLowerCase()
          .includes(search.toLowerCase().trim());
      const matchesType = type === "All Types" || item.type === type;
      const matchesSubject = subject === "All Subjects" || item.subject === subject;
      const matchesGrade = grade === "All Grades" || item.grade === grade;
      return matchesTab && matchesSearch && matchesType && matchesSubject && matchesGrade;
    });
  }, [tab, search, type, subject, grade]);

  const ordered = useMemo(() => {
    const list = [...filtered];
    if (sort === "A–Z") {
      list.sort((a, b) => a.title.localeCompare(b.title));
    }
    if (sort === "Type") {
      list.sort((a, b) => a.type.localeCompare(b.type));
    }
    return list;
  }, [filtered, sort]);

  return (
    <TeacherShell>
      <main className="teacher-content-page">
        <div className="content-library-page">
          <section className="content-hero">
            <div className="content-hero-copy">
              <h1>Content Library</h1>
              <p>Explore and manage lessons, quizzes and scenarios for your classes.</p>
            </div>

            <div className="content-hero-art">
              <img
                src="/assets/teachers/content-library-teacher-hero.png"
                alt="Teacher using a tablet"
              />
              <div className="hero-art-card hero-video">▶</div>
              <div className="hero-art-card hero-checks">✓<br />✓</div>
              <div className="hero-art-card hero-game">✚</div>
            </div>
          </section>

          <section className="content-toolbar">
            <div className="content-tabs" role="tablist">
              {(["All Content", "Lesson", "Quiz", "Scenario"] as const).map((item) => {
                const label = item === "Lesson" ? "Lessons" : item === "Quiz" ? "Quizzes" : item === "Scenario" ? "Scenarios" : item;
                return (
                  <button
                    key={item}
                    type="button"
                    className={tab === item ? "active" : ""}
                    onClick={() => setTab(item)}
                  >
                    {label}
                  </button>
                );
              })}
            </div>

            <button className="add-content-button" type="button">
              <span>＋</span> Add Content
            </button>
          </section>

          <section className="filters-row">
            <label className="search-box">
              <span>⌕</span>
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search content..."
              />
            </label>

            <select value={type} onChange={(e) => setType(e.target.value)}>
              <option>All Types</option>
              <option>Lesson</option>
              <option>Quiz</option>
              <option>Scenario</option>
            </select>

            <select value={subject} onChange={(e) => setSubject(e.target.value)}>
              <option>All Subjects</option>
              <option>Finance</option>
              <option>Life Skills</option>
              <option>Digital Skills</option>
            </select>

            <select value={grade} onChange={(e) => setGrade(e.target.value)}>
              <option>All Grades</option>
              <option>Grade 6–8</option>
              <option>Grade 7–9</option>
              <option>Grade 8–10</option>
              <option>Grade 9–12</option>
            </select>

            <label className="sort-control">
              <span>Sort by</span>
              <select value={sort} onChange={(e) => setSort(e.target.value)}>
                <option>Latest</option>
                <option>A–Z</option>
                <option>Type</option>
              </select>
            </label>
          </section>

          <section className="content-main-grid">
            <div className="content-grid">
              {ordered.map((item) => (
                <article className="content-card" key={item.id}>
                  <div className={`content-card-image ${item.tone}`}>
                    <img src={item.image} alt="" />
                    <span className={`type-pill ${item.tone}`}>{item.type}</span>
                    <span className="duration-pill">{item.duration}</span>
                  </div>

                  <div className="content-card-body">
                    <h2>{item.title}</h2>
                    <p>{item.description}</p>

                    <div className="card-footer">
                      <span>{item.subject}</span>
                      <span>{item.grade}</span>
                      <button type="button" aria-label={`More actions for ${item.title}`}>⋮</button>
                    </div>
                  </div>
                </article>
              ))}

              {ordered.length === 0 && (
                <div className="empty-state">
                  <strong>No content found</strong>
                  <p>Try changing your search or filters.</p>
                </div>
              )}
            </div>

            <aside className="content-sidebar">
              <article className="side-panel">
                <div className="side-panel-head">
                  <h2>Content Overview</h2>
                  <a href="#overview">View All →</a>
                </div>

                <div className="overview-grid">
                  <div className="overview-item blue">
                    <strong>24</strong>
                    <span>Lessons</span>
                  </div>
                  <div className="overview-item purple">
                    <strong>18</strong>
                    <span>Quizzes</span>
                  </div>
                  <div className="overview-item orange">
                    <strong>12</strong>
                    <span>Scenarios</span>
                  </div>
                  <div className="overview-item green">
                    <strong>54</strong>
                    <span>Total Content</span>
                  </div>
                </div>
              </article>

              <article className="side-panel">
                <div className="side-panel-head">
                  <h2>Recently Added</h2>
                  <a href="#recent">View All →</a>
                </div>

                <div className="recent-list">
                  {recentlyAdded.map((item) => (
                    <div className="recent-row" key={item.title}>
                      <span className={`recent-icon ${item.color}`}>
                        {item.color === "green" ? "🌱" : item.color === "purple" ? "▤" : "🎮"}
                      </span>
                      <div>
                        <strong>{item.title}</strong>
                        <span>{item.meta}</span>
                      </div>
                      <button type="button">⋮</button>
                    </div>
                  ))}
                </div>
              </article>

              <article className="side-panel">
                <div className="side-panel-head">
                  <h2>Popular Subjects</h2>
                  <a href="#subjects">View All →</a>
                </div>

                <div className="subject-list">
                  {subjects.map(([name, count]) => (
                    <div className="subject-row" key={name}>
                      <span>{name}</span>
                      <strong>{count as number}</strong>
                      <b>›</b>
                    </div>
                  ))}
                </div>
              </article>

              <article className="side-panel quick-panel">
                <h2>Quick Actions</h2>
                <div className="quick-grid">
                  <button type="button">＋<span>Add Lesson</span></button>
                  <button type="button">▤<span>Add Quiz</span></button>
                  <button type="button">🎮<span>Add Scenario</span></button>
                  <button type="button">↥<span>Import Content</span></button>
                </div>
              </article>
            </aside>
          </section>

          <div className="content-pagination">
            <span>Showing {Math.min(ordered.length, 8)} of 54 content items</span>
            <div>
              <button type="button">‹</button>
              <button type="button" className="current">1</button>
              <button type="button">2</button>
              <button type="button">3</button>
              <button type="button">4</button>
              <button type="button">5</button>
              <button type="button">›</button>
            </div>
          </div>
        </div>
      </main>

      <style jsx>{`
        .teacher-content-page {
          width: calc(100% + 280px);
          margin-left: -280px;
          margin-top: -160px;
        }

        .content-library-page {
          width: 100%;
          box-sizing: border-box;
          padding: 14px 16px 32px;
          background: #f8fbff;
        }

        .content-hero {
          min-height: 154px;
          border-radius: 14px;
          overflow: hidden;
          background: linear-gradient(90deg, #e8faf5 0%, #effcf9 100%);
          display: flex;
          align-items: stretch;
          justify-content: space-between;
          position: relative;
        }

        .content-hero-copy {
          max-width: 57%;
          padding: 24px 24px;
          z-index: 2;
          display: flex;
          justify-content: center;
          flex-direction: column;
        }

        .content-hero-copy h1 {
          margin: 0;
          color: #111c6b;
          font-size: 34px;
          line-height: 1;
          font-weight: 800;
        }

        .content-hero-copy p {
          margin: 10px 0 0;
          color: #40578c;
          font-size: 17px;
          line-height: 1.35;
          max-width: 580px;
        }

        .content-hero-art {
          position: relative;
          width: 48%;
          min-height: 154px;
          display: flex;
          align-items: flex-end;
          justify-content: flex-end;
          overflow: hidden;
        }

        .content-hero-art::before {
          content: "";
          position: absolute;
          width: 310px;
          height: 190px;
          border-radius: 50%;
          background: rgba(181, 241, 221, 0.45);
          right: 40px;
          bottom: -58px;
        }

        .content-hero-art img {
          position: relative;
          z-index: 2;
          height: 188px;
          width: auto;
          max-width: 88%;
          object-fit: contain;
          object-position: bottom right;
          display: block;
          margin-right: 36px;
          margin-bottom: -8px;
        }

        .hero-art-card {
          position: absolute;
          z-index: 3;
          width: 46px;
          height: 46px;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 800;
          box-shadow: 0 8px 18px rgba(46, 91, 121, 0.12);
        }

        .hero-video {
          right: 18%;
          top: 22px;
          background: #dff8ec;
          color: #0cae7d;
        }

        .hero-checks {
          right: 7%;
          top: 45px;
          background: #efe5ff;
          color: #7d45e9;
          line-height: 1.1;
        }

        .hero-game {
          right: 21%;
          bottom: 12px;
          background: #fff1dc;
          color: #f08b16;
        }

        .content-toolbar {
          margin-top: 8px;
          display: flex;
          justify-content: space-between;
          align-items: end;
          gap: 12px;
          border-bottom: 1px solid #e2e9f1;
        }

        .content-tabs {
          display: flex;
          gap: 6px;
        }

        .content-tabs button {
          border: none;
          background: transparent;
          color: #4e628e;
          padding: 10px 24px 11px;
          font-size: 13px;
          font-weight: 700;
          border-bottom: 3px solid transparent;
          cursor: pointer;
        }

        .content-tabs button.active {
          color: #0ca778;
          border-bottom-color: #0ca778;
        }

        .add-content-button {
          border: none;
          border-radius: 9px;
          background: #0cac7a;
          color: white;
          min-height: 38px;
          padding: 0 16px;
          font-size: 13px;
          font-weight: 800;
          cursor: pointer;
          margin-bottom: 8px;
        }

        .filters-row {
          display: grid;
          grid-template-columns: minmax(220px, 1.3fr) minmax(145px, .8fr) minmax(145px, .8fr) minmax(145px, .8fr) minmax(145px, .8fr);
          gap: 10px;
          align-items: end;
          margin: 12px 0;
        }

        .filters-row select,
        .search-box {
          height: 38px;
          border: 1px solid #d7e0ec;
          border-radius: 8px;
          background: #fff;
          box-sizing: border-box;
        }

        .filters-row select {
          width: 100%;
          padding: 0 10px;
          color: #274073;
          font-size: 12px;
          outline: none;
        }

        .search-box {
          display: flex;
          align-items: center;
          gap: 7px;
          padding: 0 11px;
        }

        .search-box span {
          color: #4d6690;
          font-size: 18px;
        }

        .search-box input {
          width: 100%;
          border: 0;
          outline: 0;
          font-size: 12px;
          color: #2d4375;
          background: transparent;
        }

        .sort-control {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .sort-control span {
          font-size: 10px;
          color: #6b7d9d;
          font-weight: 700;
        }

        .content-main-grid {
          display: grid;
          grid-template-columns: minmax(0, 1fr) 310px;
          gap: 14px;
          align-items: start;
        }

        .content-grid {
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: 12px;
        }

        .content-card {
          background: #fff;
          border: 1px solid #dde6f0;
          border-radius: 11px;
          overflow: hidden;
          min-width: 0;
        }

        .content-card-image {
          height: 138px;
          margin: 8px 8px 0;
          border-radius: 9px;
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
        }

        .content-card-image.green { background: #eafaf2; }
        .content-card-image.purple { background: #f0ebff; }
        .content-card-image.orange { background: #fff0df; }
        .content-card-image.blue { background: #e6f3ff; }

        .content-card-image img {
          width: 78%;
          height: 78%;
          object-fit: contain;
          display: block;
        }

        .type-pill,
        .duration-pill {
          position: absolute;
          bottom: 8px;
          border-radius: 999px;
          font-size: 9px;
          font-weight: 800;
          padding: 4px 8px;
        }

        .type-pill {
          left: 8px;
          color: #fff;
        }

        .type-pill.green { background: #0dac7a; }
        .type-pill.purple { background: #7b43f1; }
        .type-pill.orange { background: #f28a18; }
        .type-pill.blue { background: #1d86e6; }

        .duration-pill {
          right: 8px;
          color: #536888;
          background: #eef2f6;
        }

        .content-card-body {
          padding: 10px 11px 12px;
        }

        .content-card-body h2 {
          margin: 0;
          color: #142264;
          font-size: 14px;
          line-height: 1.15;
        }

        .content-card-body p {
          margin: 7px 0 9px;
          color: #60749a;
          font-size: 11px;
          line-height: 1.35;
          min-height: 31px;
        }

        .card-footer {
          display: flex;
          gap: 5px;
          align-items: center;
        }

        .card-footer span {
          background: #f0f5fb;
          color: #49618b;
          border-radius: 999px;
          padding: 5px 7px;
          font-size: 9px;
          white-space: nowrap;
        }

        .card-footer button {
          margin-left: auto;
          border: 0;
          background: transparent;
          color: #2e477d;
          font-size: 18px;
          cursor: pointer;
        }

        .content-sidebar {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .side-panel {
          background: #fff;
          border: 1px solid #dde6f0;
          border-radius: 11px;
          padding: 13px;
        }

        .side-panel-head {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 8px;
          margin-bottom: 10px;
        }

        .side-panel h2 {
          margin: 0;
          color: #182765;
          font-size: 14px;
        }

        .side-panel-head a {
          color: #1179e9;
          font-size: 10px;
          font-weight: 700;
          text-decoration: none;
        }

        .overview-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 7px;
        }

        .overview-item {
          min-height: 65px;
          border-radius: 9px;
          padding: 10px;
          box-sizing: border-box;
        }

        .overview-item.blue { background: #eaf3ff; }
        .overview-item.purple { background: #f1ebff; }
        .overview-item.orange { background: #fff1e1; }
        .overview-item.green { background: #eaf9f1; }

        .overview-item strong {
          display: block;
          color: #1a2a69;
          font-size: 17px;
          line-height: 1;
        }

        .overview-item span {
          color: #60749b;
          font-size: 10px;
          margin-top: 4px;
          display: block;
        }

        .recent-list,
        .subject-list {
          display: flex;
          flex-direction: column;
        }

        .recent-row {
          display: grid;
          grid-template-columns: 34px 1fr 12px;
          gap: 8px;
          align-items: center;
          padding: 7px 0;
          border-top: 1px solid #edf1f6;
        }

        .recent-row:first-child {
          border-top: 0;
        }

        .recent-icon {
          width: 34px;
          height: 34px;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 14px;
        }

        .recent-icon.green { background: #e3f8ed; }
        .recent-icon.purple { background: #efe5ff; }
        .recent-icon.orange { background: #fff0de; }

        .recent-row strong {
          display: block;
          color: #26386f;
          font-size: 10px;
        }

        .recent-row span {
          display: block;
          color: #7b8aa7;
          font-size: 9px;
          margin-top: 2px;
        }

        .recent-row button {
          border: 0;
          background: transparent;
          color: #31497d;
        }

        .subject-row {
          display: grid;
          grid-template-columns: 1fr auto 10px;
          align-items: center;
          gap: 6px;
          border-top: 1px solid #edf1f6;
          padding: 8px 0;
          color: #415887;
          font-size: 10px;
        }

        .subject-row:first-child {
          border-top: 0;
        }

        .subject-row strong {
          color: #2a3c70;
          font-size: 10px;
        }

        .subject-row b {
          color: #2b75de;
          font-size: 14px;
        }

        .quick-panel h2 {
          margin-bottom: 9px;
        }

        .quick-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 8px;
        }

        .quick-grid button {
          min-height: 54px;
          border: 1px solid #e2e9f2;
          border-radius: 8px;
          background: #f6f9ff;
          color: #24376d;
          cursor: pointer;
          font-size: 18px;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 7px;
        }

        .quick-grid button span {
          font-size: 10px;
          font-weight: 800;
        }

        .content-pagination {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding-top: 12px;
          color: #6a7c9e;
          font-size: 11px;
        }

        .content-pagination > div {
          display: flex;
          gap: 5px;
        }

        .content-pagination button {
          width: 31px;
          height: 31px;
          border: 1px solid #dae3ee;
          background: #fff;
          border-radius: 7px;
          color: #48618d;
          cursor: pointer;
        }

        .content-pagination button.current {
          background: #0cab79;
          color: #fff;
          border-color: #0cab79;
        }

        .empty-state {
          grid-column: 1 / -1;
          border: 1px dashed #cfd9e6;
          background: #fff;
          border-radius: 12px;
          min-height: 180px;
          display: grid;
          place-items: center;
          align-content: center;
          color: #536889;
        }

        .empty-state strong {
          color: #192969;
        }

        .empty-state p {
          margin: 6px 0 0;
        }

        @media (max-width: 1250px) {
          .content-main-grid {
            grid-template-columns: 1fr;
          }

          .content-sidebar {
            display: grid;
            grid-template-columns: 1fr 1fr;
          }

          .quick-panel {
            grid-column: 1 / -1;
          }
        }

        @media (max-width: 980px) {
          .filters-row {
            grid-template-columns: 1fr 1fr;
          }

          .content-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }

          .content-hero-art img {
            margin-right: 18px;
          }

          .hero-art-card {
            display: none;
          }
        }

        @media (max-width: 760px) {
          .teacher-content-page {
            width: 100%;
            margin-left: 0;
            margin-top: 0;
          }

          .content-library-page {
            padding: 12px 12px 78px;
          }

          .content-hero {
            min-height: 176px;
          }

          .content-hero-copy {
            width: 58%;
            max-width: none;
            padding: 18px 15px;
          }

          .content-hero-copy h1 {
            font-size: 26px;
          }

          .content-hero-copy p {
            font-size: 14px;
          }

          .content-hero-art {
            width: 47%;
            min-height: 176px;
          }

          .content-hero-art img {
            height: 150px;
            max-width: 100%;
            margin-right: 0;
            margin-bottom: -4px;
          }

          .content-toolbar {
            align-items: stretch;
            flex-direction: column;
            gap: 7px;
          }

          .content-tabs {
            overflow-x: auto;
            white-space: nowrap;
          }

          .content-tabs button {
            flex: 1;
            min-width: 80px;
            padding: 9px 10px 10px;
          }

          .add-content-button {
            width: 100%;
            margin-bottom: 0;
          }

          .filters-row {
            grid-template-columns: 1fr;
          }

          .content-grid {
            grid-template-columns: 1fr 1fr;
            gap: 8px;
          }

          .content-card-image {
            height: 115px;
            margin: 6px 6px 0;
          }

          .content-card-body {
            padding: 9px 9px 10px;
          }

          .content-card-body h2 {
            font-size: 12px;
          }

          .content-card-body p {
            font-size: 10px;
            min-height: 37px;
          }

          .card-footer {
            flex-wrap: wrap;
          }

          .card-footer span {
            font-size: 8px;
            padding: 4px 6px;
          }

          .content-sidebar {
            display: flex;
          }

          .content-pagination {
            flex-direction: column;
            align-items: flex-start;
            gap: 9px;
          }
        }

        @media (max-width: 500px) {
          .content-grid {
            grid-template-columns: 1fr;
          }

          .content-card-image {
            height: 140px;
          }

          .content-card-body h2 {
            font-size: 14px;
          }
        }
      `}</style>
    </TeacherShell>
  );
}
