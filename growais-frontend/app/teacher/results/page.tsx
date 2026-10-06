"use client";

import { useEffect, useMemo, useState } from "react";
import TeacherShell from "../../../components/teacher/TeacherShell";
import { apiFetch } from "../../../lib/api";

type ResultRow = {
  id: number;
  studentId: number;
  initials: string;
  name: string;
  content: string;
  contentId: number;
  score: number;
  attempts: number;
  time: string;
  status: "Passed" | "Needs Review";
  tone: "green" | "blue" | "purple" | "orange";
};

type ResultsPayload = {
  classes: { id: number; name: string; status: "Active" | "Archived" }[];
  selectedClassId: number;
  selectedClassName: string;
  tab: "quiz" | "scenario";
  options: { id: number; name: string }[];
  rows: ResultRow[];
  metrics: {
    averageScore: number;
    completionRate: number;
    passRate: number;
    totalAttempts: number;
  };
  changes: {
    averageScore: number;
    completionRate: number;
    passRate: number;
    totalAttempts: number;
  };
  chart: { label: string; value: number; tone: "green" | "blue" | "purple" | "orange" }[];
  insights: { tone: "green" | "purple" | "orange"; title: string; text: string }[];
  studentCount: number;
};

const toneColors: Record<ResultRow["tone"], string> = {
  green: "#0cad7d",
  blue: "#2f80ed",
  purple: "#7b4cf6",
  orange: "#f4a044",
};

function signedChange(value: number, suffix = "") {
  const sign = value >= 0 ? "↑" : "↓";
  return `${sign} ${Math.abs(value)}${suffix}`;
}

export default function TeacherResultsPage() {
  const [tab, setTab] = useState<"quiz" | "scenario">("quiz");
  const [classId, setClassId] = useState("");
  const [contentId, setContentId] = useState("");
  const [period, setPeriod] = useState("Last 30 Days");
  const [query, setQuery] = useState("");
  const [payload, setPayload] = useState<ResultsPayload | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function loadResults() {
      if (!classId) return;

      try {
        setLoading(true);
        setError("");
        setPayload(null);

        const params = new URLSearchParams({
          classId,
          tab,
          period,
        });

        if (contentId) params.set("contentId", contentId);

        const data = await apiFetch(`/api/teacher/results?${params.toString()}`);

        if (cancelled) return;

        setPayload(data);

        if (!contentId) {
          setContentId("");
        }
      } catch (err) {
        console.error("Teacher results API error:", err);
        if (!cancelled) {
          setError(
            err instanceof Error ? err.message : "Unable to load teacher results."
          );
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadResults();
    return () => {
      cancelled = true;
    };
  }, [classId, tab, period, contentId]);

  useEffect(() => {
    async function loadInitialClasses() {
      try {
        const data = await apiFetch("/api/teacher/classes");
        const availableClasses = Array.isArray(data?.classes) ? data.classes : [];

        if (availableClasses.length > 0) {
          setClassId(String(availableClasses[0].id));
        } else {
          setLoading(false);
        }
      } catch (err) {
        console.error("Teacher results initial class load error:", err);
        setError(
          err instanceof Error ? err.message : "Unable to load teacher classes."
        );
        setLoading(false);
      }
    }

    if (!classId) {
      loadInitialClasses();
    }
  }, [classId]);

  const rows = payload?.rows || [];
  const visibleRows = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return rows;

    return rows.filter((row) =>
      [row.name, row.content, row.status]
        .some((value) => value.toLowerCase().includes(q))
    );
  }, [rows, query]);

  const metric = payload?.metrics || {
    averageScore: 0,
    completionRate: 0,
    passRate: 0,
    totalAttempts: 0,
  };

  const changes = payload?.changes || {
    averageScore: 0,
    completionRate: 0,
    passRate: 0,
    totalAttempts: 0,
  };

  const chart = payload?.chart || [];
  const options = payload?.options || [];

  const exportResults = () => {
    const header = [
      "#",
      "Student Name",
      tab === "quiz" ? "Quiz" : "Scenario",
      "Score",
      "Attempts",
      "Time Taken",
      "Status",
    ];

    const csv = [
      header.join(","),
      ...visibleRows.map((row, index) =>
        [
          index + 1,
          `"${row.name}"`,
          `"${row.content}"`,
          `${row.score}%`,
          row.attempts,
          `"${row.time}"`,
          `"${row.status}"`,
        ].join(",")
      ),
    ].join("\n");

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `growais-${tab}-results.csv`;
    anchor.click();
    URL.revokeObjectURL(url);
  };

  return (
    <TeacherShell>
      <main className="teacher-results-root">
        <div className="teacher-results-page">
          {loading && (
            <div className="results-data-status is-loading">
              Loading live {tab} results…
            </div>
          )}
          {error && (
            <div className="results-data-status is-error">
              {error}
            </div>
          )}

          <section className="results-hero">
            <div className="results-hero-copy">
              <h1>Results</h1>
              <p>Review your students’ quiz and scenario performance.</p>
            </div>
            <div className="results-hero-visual">
              <div className="hero-leaf hero-leaf-left" />
              <img
                src="/assets/teachers/teacher-results-hero.png"
                alt="Teacher reviewing student results"
              />
            </div>
          </section>

          <nav className="results-tabs" aria-label="Result type">
            <button
              type="button"
              className={tab === "quiz" ? "is-active" : ""}
              onClick={() => {
                setTab("quiz");
                setContentId("");
                setPayload(null);
              }}
            >
              Quiz Results
            </button>
            <button
              type="button"
              className={tab === "scenario" ? "is-active" : ""}
              onClick={() => {
                setTab("scenario");
                setContentId("");
                setPayload(null);
              }}
            >
              Scenario Results
            </button>
          </nav>

          <section className="results-filters">
            <label>
              <span>Class</span>
              <select
                value={classId}
                onChange={(e) => {
                  setClassId(e.target.value);
                  setContentId("");
                }}
                disabled={!payload && loading}
              >
                {(payload?.classes || []).map((item) => (
                  <option key={item.id} value={String(item.id)}>
                    {item.name}
                  </option>
                ))}
              </select>
            </label>

            <label>
              <span>{tab === "quiz" ? "Quiz" : "Scenario"}</span>
              <select
                value={contentId}
                onChange={(e) => setContentId(e.target.value)}
              >
                <option value="">
                  {tab === "quiz" ? "All Quizzes" : "All Scenarios"}
                </option>
                {options.map((item) => (
                  <option key={item.id} value={String(item.id)}>
                    {item.name}
                  </option>
                ))}
              </select>
            </label>

            <label>
              <span>Time Period</span>
              <select value={period} onChange={(e) => {
                setPeriod(e.target.value);
                setContentId("");
              }}>
                <option>Last 30 Days</option>
                <option>Last 7 Days</option>
                <option>Last 90 Days</option>
              </select>
            </label>

            <button className="export-button" type="button" onClick={exportResults}>
              <span>⇩</span>
              <span>Export</span>
              <span className="export-chevron">⌄</span>
            </button>
          </section>

          <section className="results-metrics">
            <article className="metric-card metric-green">
              <div className="metric-icon">🏆</div>
              <div>
                <strong>{metric.averageScore}%</strong>
                <span>Average Score</span>
                <small>{signedChange(changes.averageScore)} from previous period</small>
              </div>
            </article>

            <article className="metric-card metric-purple">
              <div className="metric-icon">👥</div>
              <div>
                <strong>{metric.completionRate}%</strong>
                <span>Completion Rate</span>
                <small>{signedChange(changes.completionRate)} from previous period</small>
              </div>
            </article>

            <article className="metric-card metric-blue">
              <div className="metric-icon">✓</div>
              <div>
                <strong>{metric.passRate}%</strong>
                <span>Pass Rate</span>
                <small>{signedChange(changes.passRate)} from previous period</small>
              </div>
            </article>

            <article className="metric-card metric-orange">
              <div className="metric-icon">⟳</div>
              <div>
                <strong>{metric.totalAttempts}</strong>
                <span>Total Attempts</span>
                <small>{signedChange(changes.totalAttempts)} from previous period</small>
              </div>
            </article>
          </section>

          <section className="results-grid">
            <article className="students-results-card">
              <div className="card-header">
                <div className="card-title">
                  <span className="card-title-icon">▤</span>
                  <h2>Student Results ({visibleRows.length})</h2>
                </div>
                <div className="student-search">
                  <span>⌕</span>
                  <input
                    type="search"
                    placeholder="Search students..."
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                  />
                </div>
              </div>

              <div className="results-table-wrap">
                <table className="results-table">
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Student Name</th>
                      <th>{tab === "quiz" ? "Quiz" : "Scenario"}</th>
                      <th>Score</th>
                      <th>Attempts</th>
                      <th className="time-col">Time Taken</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {visibleRows.map((row, index) => (
                      <tr key={row.id}>
                        <td>{index + 1}</td>
                        <td>
                          <div className="student-cell">
                            <span
                              className={`avatar avatar-${row.tone}`}
                            >
                              {row.initials}
                            </span>
                            <span>{row.name}</span>
                          </div>
                        </td>
                        <td>{row.content}</td>
                        <td className="score-cell">{row.score}%</td>
                        <td>{row.attempts}</td>
                        <td className="time-col">{row.time}</td>
                        <td>
                          <span
                            className={`status-pill ${
                              row.status === "Passed"
                                ? "status-passed"
                                : "status-review"
                            }`}
                          >
                            <span className="status-dot" />
                            {row.status}
                          </span>
                        </td>
                        <td>
                          <button
                            type="button"
                            className="view-button"
                            onClick={() => {
                              window.alert(
                                `${row.name}\n${row.content}: ${row.score}%\n${row.attempts} attempt(s)`
                              );
                            }}
                          >
                            View
                          </button>
                        </td>
                      </tr>
                    ))}
                    {!loading && visibleRows.length === 0 && (
                      <tr>
                        <td colSpan={8} style={{ padding: "28px", textAlign: "center" }}>
                          No results found for the selected filters.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              <div className="results-pagination">
                <span>
                  Showing {visibleRows.length} of {payload?.studentCount || 0} students
                </span>
                <div className="pagination-buttons">
                  <button type="button" aria-label="Previous">‹</button>
                  <button type="button" className="current">1</button>
                  <button type="button" aria-label="Next">›</button>
                </div>
              </div>
            </article>

            <aside className="results-side">
              <article className="side-card performance-card">
                <div className="side-card-title">
                  <span>▥</span>
                  <h2>{tab === "quiz" ? "Quiz" : "Scenario"} Performance Overview</h2>
                </div>

                <div className="chart-legend">
                  <span><i className="dot green" />Lessons</span>
                  <span><i className="dot blue" />Quizzes</span>
                  <span><i className="dot purple" />Scenarios</span>
                  <span><i className="dot orange" />Goals</span>
                </div>

                <div className="bar-chart">
                  <div className="chart-y">
                    <span>100%</span>
                    <span>75%</span>
                    <span>50%</span>
                    <span>25%</span>
                    <span>0%</span>
                  </div>
                  <div className="chart-bars">
                    {chart.length === 0 ? (
                      <div style={{ gridColumn: "1 / -1", display: "grid", placeItems: "center", color: "#6a7b9d", fontSize: 12 }}>
                        No scored results
                      </div>
                    ) : (
                      chart.slice(0, 3).map((bar, index) => (
                        <div className="bar-group" key={`${bar.label}-${index}`}>
                          <div
                            className="bar-value"
                            style={{
                              height: `${Math.max(bar.value, 2)}%`,
                              background: toneColors[bar.tone],
                            }}
                          >
                            <span>{bar.value}%</span>
                          </div>
                          <small>{bar.label}</small>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </article>

              <article className="side-card insights-card">
                <div className="side-card-title side-card-title-between">
                  <div className="side-title-left">
                    <span>💡</span>
                    <h2>Key Insights</h2>
                  </div>
                  <a href="/teacher/progress">View Details →</a>
                </div>

                <div className="insight-list">
                  {(payload?.insights || []).map((item) => (
                    <div className="insight-row" key={item.title}>
                      <span className={`insight-icon insight-${item.tone}`}>
                        {item.tone === "purple" ? "👥" : item.tone === "orange" ? "↗" : "▥"}
                      </span>
                      <div>
                        <strong>{item.title}</strong>
                        <p>{item.text}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </article>

              <article className="side-card quick-actions-card">
                <div className="side-card-title">
                  <span>⚡</span>
                  <h2>Quick Actions</h2>
                </div>

                <div className="quick-action-grid">
                  <a className="quick-action" href="/teacher/assign-content">
                    <span className="quick-action-icon purple-action">▤</span>
                    <span>
                      <strong>Assign Quiz</strong>
                      <small>Send a new quiz to your class</small>
                    </span>
                    <b>›</b>
                  </a>

                  <a className="quick-action" href="/teacher/progress">
                    <span className="quick-action-icon blue-action">▥</span>
                    <span>
                      <strong>View Student Progress</strong>
                      <small>See detailed progress</small>
                    </span>
                    <b>›</b>
                  </a>
                </div>
              </article>
            </aside>
          </section>
        </div>
      </main>

      <style jsx>{`

        .results-data-status {
          margin: 0 0 12px;
          padding: 9px 12px;
          border-radius: 10px;
          border: 1px solid #dfe7f1;
          font-size: 12px;
        }
        .results-data-status.is-loading {
          background: #eef6ff;
          color: #526992;
        }
        .results-data-status.is-error {
          background: #fff1ee;
          border-color: #f3d3cb;
          color: #a74736;
        }
        .teacher-results-root {
          width: 100%;
        }

        .teacher-results-root {
          width: calc(100% + 280px);
          max-width: none;
          margin-left: -280px;
          margin-top: -155px;
        }

        .teacher-results-page {
          width: 100%;
          padding: 18px 18px 34px;
          box-sizing: border-box;
          background: #f8fbff;
        }

        .results-hero {
          position: relative;
          height: 140px;
          border-radius: 14px;
          overflow: hidden;
          background: linear-gradient(90deg, #e8faf4 0%, #effdf8 100%);
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 22px;
          box-sizing: border-box;
        }

        .results-hero-copy {
          position: relative;
          z-index: 2;
          max-width: 60%;
        }

        .results-hero-copy h1 {
          margin: 0;
          color: #121a63;
          font-size: 36px;
          line-height: 1.05;
          font-weight: 800;
        }

        .results-hero-copy p {
          margin: 10px 0 0;
          color: #3a528c;
          font-size: 18px;
          line-height: 1.35;
        }

        .results-hero-visual {
          position: relative;
          width: 42%;
          height: 100%;
          display: flex;
          align-items: flex-end;
          justify-content: flex-end;
        }

        .results-hero-visual img {
          height: 160px;
          width: auto;
          max-width: 100%;
          object-fit: contain;
          object-position: bottom right;
          display: block;
          position: relative;
          z-index: 2;
          transform: translateY(4px);
        }

        .hero-leaf {
          position: absolute;
          width: 180px;
          height: 110px;
          border-radius: 52% 48% 45% 55%;
          right: 18px;
          bottom: -22px;
          background: rgba(193, 245, 225, 0.55);
          transform: rotate(-6deg);
        }

        .hero-leaf-left {
          right: 120px;
          bottom: -18px;
          width: 150px;
          height: 95px;
          opacity: 0.7;
        }

        .results-tabs {
          display: flex;
          gap: 24px;
          border-bottom: 1px solid #dfe8f2;
          margin-top: 0;
        }

        .results-tabs button {
          border: none;
          background: transparent;
          padding: 13px 22px 11px;
          color: #54678f;
          font-size: 15px;
          font-weight: 600;
          cursor: pointer;
          border-bottom: 3px solid transparent;
        }

        .results-tabs button.is-active {
          color: #0aa978;
          border-bottom-color: #0aa978;
        }

        .results-filters {
          display: grid;
          grid-template-columns: minmax(190px, 1fr) minmax(210px, 1.08fr) minmax(190px, 0.9fr) 160px;
          gap: 16px;
          align-items: end;
          margin: 14px 0;
        }

        .results-filters label {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .results-filters label span {
          color: #556a94;
          font-size: 13px;
          font-weight: 600;
        }

        .results-filters select {
          width: 100%;
          height: 46px;
          border: 1px solid #d7e0ec;
          border-radius: 10px;
          padding: 0 13px;
          font-size: 14px;
          color: #1b2a68;
          background: #ffffff;
          outline: none;
        }

        .export-button {
          height: 46px;
          border: 1px solid #d7e0ec;
          background: #ffffff;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          font-size: 14px;
          font-weight: 700;
          color: #233b74;
          cursor: pointer;
        }

        .export-chevron {
          margin-left: auto;
          margin-right: 10px;
          color: #3f5688;
        }

        .results-metrics {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 12px;
          margin-bottom: 14px;
        }

        .metric-card {
          min-height: 98px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          gap: 16px;
          padding: 14px 16px;
          box-sizing: border-box;
          border: 1px solid rgba(210, 220, 236, 0.55);
        }

        .metric-green { background: #ebfaf4; }
        .metric-purple { background: #f2ecff; }
        .metric-blue { background: #edf5ff; }
        .metric-orange { background: #fff4e9; }

        .metric-icon {
          width: 52px;
          height: 52px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 26px;
          flex-shrink: 0;
          background: rgba(255, 255, 255, 0.4);
        }

        .metric-card strong {
          display: block;
          color: #0f1e68;
          font-size: 27px;
          line-height: 1;
          margin-bottom: 5px;
        }

        .metric-card span {
          display: block;
          color: #3f5688;
          font-size: 14px;
        }

        .metric-card small {
          display: block;
          margin-top: 4px;
          color: #0ca878;
          font-size: 12px;
          font-weight: 600;
        }

        .results-grid {
          display: grid;
          grid-template-columns: minmax(0, 1.62fr) minmax(330px, 0.72fr);
          gap: 14px;
          align-items: start;
        }

        .students-results-card,
        .side-card {
          background: #ffffff;
          border: 1px solid #dfe7f0;
          border-radius: 12px;
          box-sizing: border-box;
        }

        .students-results-card {
          overflow: hidden;
        }

        .card-header {
          padding: 14px 18px 10px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
        }

        .card-title {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .card-title h2,
        .side-card-title h2 {
          margin: 0;
          color: #132064;
          font-size: 17px;
        }

        .card-title-icon {
          color: #405789;
          font-size: 22px;
        }

        .student-search {
          width: 230px;
          height: 36px;
          border: 1px solid #d7e0ec;
          border-radius: 9px;
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 0 10px;
          box-sizing: border-box;
        }

        .student-search span {
          color: #49628e;
          font-size: 18px;
        }

        .student-search input {
          border: none;
          outline: none;
          background: transparent;
          width: 100%;
          font-size: 13px;
          color: #23336f;
        }

        .results-table-wrap {
          overflow-x: auto;
        }

        .results-table {
          width: 100%;
          border-collapse: collapse;
          min-width: 760px;
        }

        .results-table thead th {
          background: #edf3fa;
          color: #4b618c;
          font-size: 12px;
          font-weight: 700;
          text-align: left;
          padding: 9px 10px;
          white-space: nowrap;
        }

        .results-table tbody td {
          border-bottom: 1px solid #edf1f6;
          padding: 8px 10px;
          color: #30477c;
          font-size: 12px;
          white-space: nowrap;
        }

        .student-cell {
          display: flex;
          align-items: center;
          gap: 8px;
          min-width: 130px;
        }

        .avatar {
          width: 30px;
          height: 30px;
          border-radius: 50%;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          font-weight: 800;
          font-size: 11px;
          color: #1f356e;
          flex-shrink: 0;
        }

        .avatar-green { background: #ddf5e8; }
        .avatar-blue { background: #dcecff; }
        .avatar-purple { background: #e9dcff; }
        .avatar-orange { background: #ffe7d2; }

        .score-cell {
          font-weight: 700;
          color: #162668 !important;
        }

        .status-pill {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          border-radius: 999px;
          padding: 5px 9px;
          font-size: 11px;
          font-weight: 700;
        }

        .status-passed {
          background: #e1f7ee;
          color: #0b9b75;
        }

        .status-review {
          background: #fff0dd;
          color: #e6840a;
        }

        .status-dot {
          width: 7px;
          height: 7px;
          border-radius: 50%;
          background: currentColor;
        }

        .view-button {
          border: none;
          background: #edf5ff;
          color: #1474ea;
          border-radius: 8px;
          padding: 6px 12px;
          font-size: 12px;
          font-weight: 700;
          cursor: pointer;
        }

        .results-pagination {
          padding: 12px 18px 14px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          color: #62759b;
          font-size: 12px;
        }

        .pagination-buttons {
          display: flex;
          gap: 5px;
        }

        .pagination-buttons button {
          width: 34px;
          height: 34px;
          border: 1px solid #d9e2ef;
          background: #ffffff;
          color: #3d5486;
          border-radius: 8px;
          cursor: pointer;
        }

        .pagination-buttons button.current {
          background: #0ba97a;
          color: #ffffff;
          border-color: #0ba97a;
        }

        .results-side {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .side-card {
          padding: 14px;
        }

        .side-card-title {
          display: flex;
          align-items: center;
          gap: 9px;
          margin-bottom: 10px;
          color: #21356d;
        }

        .side-card-title > span {
          font-size: 19px;
        }

        .side-card-title-between {
          justify-content: space-between;
        }

        .side-title-left {
          display: flex;
          align-items: center;
          gap: 9px;
        }

        .side-card-title a {
          color: #1079ef;
          text-decoration: underline;
          font-size: 12px;
          font-weight: 700;
        }

        .chart-legend {
          display: flex;
          flex-wrap: wrap;
          gap: 10px;
          color: #60749a;
          font-size: 10px;
          margin-bottom: 10px;
        }

        .chart-legend span {
          display: flex;
          align-items: center;
          gap: 4px;
        }

        .dot {
          width: 9px;
          height: 9px;
          border-radius: 50%;
          display: inline-block;
        }

        .dot.green { background: #0cad7d; }
        .dot.blue { background: #2f80ed; }
        .dot.purple { background: #7b4cf6; }
        .dot.orange { background: #f4b014; }

        .bar-chart {
          display: grid;
          grid-template-columns: 30px 1fr;
          gap: 7px;
          height: 145px;
          align-items: stretch;
        }

        .chart-y {
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          color: #7183a5;
          font-size: 9px;
          padding: 2px 0 16px;
        }

        .chart-bars {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          align-items: end;
          gap: 14px;
          border-left: 1px solid #dfe6f0;
          border-bottom: 1px solid #dfe6f0;
          padding: 8px 12px 0;
        }

        .bar-group {
          height: 100%;
          display: flex;
          flex-direction: column;
          justify-content: flex-end;
          align-items: center;
          gap: 6px;
        }

        .bar-value {
          width: 62px;
          max-width: 80%;
          min-height: 25px;
          border-radius: 5px 5px 0 0;
          position: relative;
        }

        .bar-value span {
          position: absolute;
          top: -17px;
          left: 50%;
          transform: translateX(-50%);
          font-size: 11px;
          font-weight: 800;
          color: #2c4175;
        }

        .bar-group small {
          text-align: center;
          color: #4d628d;
          font-size: 9px;
          line-height: 1.1;
          max-width: 76px;
        }

        .insight-list {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .insight-row {
          display: flex;
          gap: 9px;
          align-items: flex-start;
        }

        .insight-icon {
          width: 32px;
          height: 32px;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          font-size: 16px;
        }

        .insight-green { background: #e4f8ef; color: #0a9c73; }
        .insight-purple { background: #ede2ff; color: #7b42f6; }
        .insight-orange { background: #ffecd7; color: #f08416; }

        .insight-row strong {
          display: block;
          color: #223568;
          font-size: 12px;
        }

        .insight-row p {
          margin: 2px 0 0;
          color: #61739a;
          font-size: 10px;
          line-height: 1.35;
        }

        .quick-action-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 9px;
        }

        .quick-action {
          min-height: 78px;
          border-radius: 10px;
          background: #f4f8ff;
          border: 1px solid #e4eaf4;
          padding: 10px;
          display: grid;
          grid-template-columns: 32px 1fr 12px;
          gap: 8px;
          align-items: center;
          text-decoration: none;
          color: inherit;
        }

        .quick-action-icon {
          width: 32px;
          height: 32px;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 16px;
        }

        .purple-action { background: #efe5ff; color: #7a46f5; }
        .blue-action { background: #e2efff; color: #1f7be6; }

        .quick-action strong {
          display: block;
          color: #1d326a;
          font-size: 11px;
        }

        .quick-action small {
          display: block;
          margin-top: 3px;
          color: #63759b;
          font-size: 9px;
          line-height: 1.2;
        }

        .quick-action b {
          color: #286fe5;
          font-size: 18px;
        }

        @media (max-width: 1200px) {
          .teacher-results-root {
            width: calc(100% + 280px);
            margin-left: -280px;
            margin-top: -145px;
          }

          .results-filters {
            grid-template-columns: 1fr 1fr;
          }

          .results-grid {
            grid-template-columns: 1fr;
          }

          .results-side {
            display: grid;
            grid-template-columns: 1fr 1fr;
          }

          .quick-actions-card {
            grid-column: 1 / -1;
          }
        }

        @media (max-width: 760px) {
          .teacher-results-root {
            width: 100%;
            margin-left: 0;
            margin-top: 0;
          }

          .teacher-results-page {
            padding: 12px 12px 78px;
          }

          .results-hero {
            height: 156px;
            padding: 14px 16px;
          }

          .results-hero-copy {
            max-width: 58%;
            align-self: flex-start;
            padding-top: 3px;
          }

          .results-hero-copy h1 {
            font-size: 26px;
          }

          .results-hero-copy p {
            font-size: 15px;
            line-height: 1.28;
            margin-top: 7px;
          }

          .results-hero-visual {
            width: 52%;
            align-items: flex-end;
          }

          .results-hero-visual img {
            height: 132px;
            max-width: 100%;
            object-position: bottom right;
            transform: translateY(2px);
          }

          .results-tabs {
            gap: 6px;
            overflow-x: auto;
          }

          .results-tabs button {
            flex: 1;
            min-width: 0;
            padding: 11px 10px;
            font-size: 13px;
          }

          .results-filters {
            grid-template-columns: 1fr;
            gap: 9px;
            margin-bottom: 10px;
          }

          .results-filters select,
          .export-button {
            height: 42px;
          }

          .results-metrics {
            grid-template-columns: 1fr 1fr;
            gap: 8px;
          }

          .metric-card {
            min-height: 86px;
            gap: 10px;
            padding: 10px;
          }

          .metric-icon {
            width: 42px;
            height: 42px;
            border-radius: 10px;
            font-size: 21px;
          }

          .metric-card strong {
            font-size: 23px;
          }

          .metric-card span {
            font-size: 12px;
          }

          .metric-card small {
            font-size: 10px;
          }

          .results-grid {
            display: flex;
            flex-direction: column;
          }

          .card-header {
            display: block;
            padding-bottom: 8px;
          }

          .student-search {
            width: 100%;
            margin-top: 9px;
            height: 40px;
          }

          .results-table {
            min-width: 740px;
          }

          .results-pagination {
            flex-direction: column;
            gap: 10px;
            align-items: flex-start;
          }

          .results-side {
            display: flex;
            flex-direction: column;
          }

          .quick-action-grid {
            grid-template-columns: 1fr 1fr;
          }

          .performance-card,
          .insights-card,
          .quick-actions-card {
            width: 100%;
          }

          .bar-chart {
            height: 150px;
          }

          .bar-value {
            width: 48px;
          }
        }
      `}</style>
    </TeacherShell>
  );
}
