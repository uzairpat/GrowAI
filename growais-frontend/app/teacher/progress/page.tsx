"use client";

import { useMemo, useState, useEffect } from "react";
import TeacherShell from "../../../components/teacher/TeacherShell";
import TeacherIcon from "../../../components/teacher/TeacherIcon";
import { apiFetch } from "../../../lib/api";

type ProgressStudent = {
  id: number;
  initials: string;
  name: string;
  lessons: number;
  quizzes: number;
  scenarios: number;
  goals: number;
  overall: number;
  activity: string;
  tone: "green" | "blue" | "purple" | "orange";
  status: "Active" | "Inactive";
};

type ProgressClass = { id: number; name: string; status: "Active" | "Archived"; };

type ProgressPayload = {
  progressAvailable: boolean;
  classes: ProgressClass[];
  selectedClassId: number | null;
  selectedClassName?: string;
  students: ProgressStudent[];
  summary: { overall: number; lessons: number; quizzes: number; scenarios: number; goals: number; };
  changes: { overall: number; lessons: number; quizzes: number; scenarios: number; goals: number; };
  chart: { labels: string[]; lessons: number[]; quizzes: number[]; scenarios: number[]; goals: number[]; };
  insights: Array<{ tone: "green" | "orange" | "purple"; title: string; text: string; }>;
};

const points = (values: number[]) => {
  const safe = values.length > 1 ? values : [0, 0];
  const width = 520, height = 200, left = 42, top = 12;
  const innerW = width - left - 18, innerH = height - 36;
  return safe.map((value, index) => {
    const x = left + (innerW * index) / (safe.length - 1);
    const y = top + ((100 - Math.max(0, Math.min(100, value))) * innerH) / 100;
    return `${x},${y}`;
  }).join(" ");
};

function Metric({ icon, value, label, change, tone }: { icon: string; value: string; label: string; change: string; tone: "green" | "blue" | "purple" | "orange" | "gold" }) {
  return (
    <article className={`progress-metric ${tone}`}>
      <div className="progress-metric-icon">{icon}</div>
      <div><strong>{value}</strong><span>{label}</span><small>{change} <em>vs previous period</em></small></div>
    </article>
  );
}

function StudentBar({ value, tone }: { value: number; tone: string }) {
  return <span className="mini-bar"><span className={`mini-bar-fill ${tone}`} style={{ width: `${value}%` }} /></span>;
}

export default function TeacherStudentProgressPage() {
  const [classId, setClassId] = useState("");
  const [classes, setClasses] = useState<ProgressClass[]>([]);
  const [contentType, setContentType] = useState("All Content");
  const [period, setPeriod] = useState("Last 30 Days");
  const [search, setSearch] = useState("");
  const [payload, setPayload] = useState<ProgressPayload | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    async function loadProgress() {
      try {
        setLoading(true);
        setError("");
        const query = new URLSearchParams();
        if (classId) query.set("classId", classId);
        if (contentType !== "All Content") query.set("contentType", contentType);
        query.set("period", period);
        const endpoint = `/api/teacher/progress?${query.toString()}`;
        const data = await apiFetch(endpoint);
        if (cancelled) return;
        setPayload(data);
        setClasses(Array.isArray(data?.classes) ? data.classes : []);
        if (!classId && data?.selectedClassId != null) setClassId(String(data.selectedClassId));
      } catch (err) {
        console.error("Teacher progress API error:", err);
        if (!cancelled) setError(err instanceof Error ? err.message : "Unable to load teacher progress.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    loadProgress();
    return () => { cancelled = true; };
  }, [classId, contentType, period]);

  const students = payload?.students || [];
  const visibleStudents = useMemo(() => {
    const q = search.trim().toLowerCase();
    return q ? students.filter((student) => student.name.toLowerCase().includes(q)) : students;
  }, [students, search]);

  const summary = payload?.summary || { overall: 0, lessons: 0, quizzes: 0, scenarios: 0, goals: 0 };
  const changes = payload?.changes || { overall: 0, lessons: 0, quizzes: 0, scenarios: 0, goals: 0 };
  const chart = payload?.chart || { labels: ["—","—","—","—","—"], lessons:[0,0,0,0,0], quizzes:[0,0,0,0,0], scenarios:[0,0,0,0,0], goals:[0,0,0,0,0] };

  return (
    <TeacherShell>
      <main className="progress-page-root">
        {(loading || error) && (
          <div className={`progress-data-status ${error ? "is-error" : "is-loading"}`}>
            {error || "Loading teacher progress…"}
          </div>
        )}
        <section className="progress-hero">
          <div className="progress-hero-copy">
            <h1>Student Progress</h1>
            <p>Track learning progress across your classes.</p>
          </div>
          <img src="/assets/teachers/teacher-student-progress-hero.png" alt="Teacher reviewing student progress" className="progress-hero-image" />
        </section>

        <section className="progress-filters" aria-label="Progress filters">
          <label>
            <span>Class</span>
            <select value={classId} onChange={(e) => setClassId(e.target.value)} disabled={loading || classes.length === 0}>
              {classes.length === 0 ? <option value="">No classes available</option> : classes.map((item) => <option key={item.id} value={String(item.id)}>{item.name}</option>)}
            </select>
          </label>
          <label>
            <span>Content Type</span>
            <select value={contentType} onChange={(e) => setContentType(e.target.value)}>
              <option>All Content</option>
              <option>Lessons</option>
              <option>Quizzes</option>
              <option>Scenarios</option>
              <option>Goals</option>
            </select>
          </label>
          <label>
            <span>Time Period</span>
            <select value={period} onChange={(e) => setPeriod(e.target.value)}>
              <option>Last 30 Days</option>
              <option>Last 7 Days</option>
              <option>Last 90 Days</option>
              <option>This Year</option>
            </select>
          </label>
          <button className="export-button" type="button">⇩ <span>Export</span>⌄</button>
        </section>

        <section className="metric-grid" aria-label="Progress summary">
          {!loading && !error && payload && !payload.progressAvailable && (
            <div className="progress-source-note">No progress activity was recorded for the selected class and time period yet.</div>
          )}
          <article className="progress-metric green overall-metric">
            <div className="donut-small" style={{ background: `conic-gradient(#0ca67a ${summary.overall}%, #d9e4ef 0)` }}><span>{summary.overall}%</span></div>
            <div><strong>Overall Progress</strong><small>{changes.overall >= 0 ? "↑" : "↓"} {Math.abs(changes.overall)}% <em>vs previous period</em></small></div>
          </article>
          <Metric icon="▣" value={`${summary.lessons}%`} label="Lessons" change={`${changes.lessons >= 0 ? "↑" : "↓"} ${Math.abs(changes.lessons)}%`} tone="blue" />
          <Metric icon="☰" value={`${summary.quizzes}%`} label="Quizzes" change={`${changes.quizzes >= 0 ? "↑" : "↓"} ${Math.abs(changes.quizzes)}%`} tone="purple" />
          <Metric icon="🎮" value={`${summary.scenarios}%`} label="Scenarios" change={`${changes.scenarios >= 0 ? "↑" : "↓"} ${Math.abs(changes.scenarios)}%`} tone="orange" />
          <Metric icon="◎" value={`${summary.goals}%`} label="Goals" change={`${changes.goals >= 0 ? "↑" : "↓"} ${Math.abs(changes.goals)}%`} tone="gold" />
        </section>

        <section className="progress-main-grid">
          <section className="students-panel">
            <div className="panel-header">
              <div className="panel-title"><span className="panel-title-icon">👥</span><h2>Students ({students.length})</h2></div>
              <a href="#students" className="view-all">View All →</a>
            </div>

            <div className="student-tools">
              <label className="student-search"><TeacherIcon name="search" size={19} /><input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search students..." /></label>
            </div>

            <div className="student-table-wrap">
              <table className="student-table">
                <thead>
                  <tr>
                    <th>#</th><th>Student Name</th><th>Lessons</th><th>Quizzes</th><th>Scenarios</th><th>Goals</th><th>Overall</th><th>Last Activity</th><th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {visibleStudents.map((student, index) => (
                    <tr key={student.id}>
                      <td>{index + 1}</td>
                      <td><span className={`avatar ${student.tone}`}>{student.initials}</span>{student.name}</td>
                      <td><div className="percent-cell"><StudentBar value={student.lessons} tone="green" /><span>{student.lessons}%</span></div></td>
                      <td><div className="percent-cell"><StudentBar value={student.quizzes} tone="blue" /><span>{student.quizzes}%</span></div></td>
                      <td><div className="percent-cell"><StudentBar value={student.scenarios} tone="purple" /><span>{student.scenarios}%</span></div></td>
                      <td><div className="percent-cell"><StudentBar value={student.goals} tone="orange" /><span>{student.goals}%</span></div></td>
                      <td className="overall-value">{student.overall}%</td>
                      <td>{student.activity}</td>
                      <td><button className="view-student-button" type="button">View</button><button className="more-button" type="button">•••</button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="pagination-row">
              <span>Showing 1–{Math.min(10, visibleStudents.length)} of {students.length} students</span>
              <div><button disabled>‹</button><button className="active">1</button><button>2</button><button>3</button><button>›</button></div>
            </div>
          </section>

          <aside className="progress-side-column">
            <section className="chart-panel">
              <div className="panel-header"><div className="panel-title"><span className="panel-title-icon">▥</span><h2>Class Progress Overview</h2></div><span className="panel-chevron">›</span></div>
              <div className="chart-legend">
                <span><i className="legend lessons" />Lessons</span>
                <span><i className="legend quizzes" />Quizzes</span>
                <span><i className="legend scenarios" />Scenarios</span>
                <span><i className="legend goals" />Goals</span>
              </div>
              <svg viewBox="0 0 520 200" className="progress-chart" role="img" aria-label="Class progress line chart">
                {[0,25,50,75,100].map((label, i) => <g key={label}><line x1="42" x2="500" y1={24 + i * 34} y2={24 + i * 34} stroke="#e7edf5" strokeWidth="1" /><text x="6" y={28 + i * 34} fontSize="12" fill="#66779a">{100-label}%</text></g>)}
                <polyline points={points(chart.lessons)} fill="none" stroke="#0ca67a" strokeWidth="3" />
                <polyline points={points(chart.quizzes)} fill="none" stroke="#2a82ff" strokeWidth="3" />
                <polyline points={points(chart.scenarios)} fill="none" stroke="#7a49ee" strokeWidth="3" />
                <polyline points={points(chart.goals)} fill="none" stroke="#f6b319" strokeWidth="3" />
                {chart.labels.slice(0, 5).map((label, index) => (<text key={`${label}-${index}`} x={[42,165,288,410,468][index]} y="196" fontSize="12" fill="#66779a">{label}</text>))}
              </svg>
            </section>

            <section className="insight-panel">
              <div className="panel-header"><div className="panel-title"><span className="panel-title-icon">💡</span><h2>Key Insights</h2></div><a href="#insights" className="view-all">View Details →</a></div>
              {(payload?.insights || []).map((insight, index) => (
                <div className="insight-item" key={`${insight.title}-${index}`}>
                  <span className={`insight-icon ${insight.tone}`}>{insight.tone === "purple" ? "★" : "⌂"}</span>
                  <div><strong>{insight.title}</strong><p>{insight.text}</p></div>
                </div>
              ))}
            </section>

            <section className="quick-panel">
              <div className="panel-header"><div className="panel-title"><span className="panel-title-icon">⚡</span><h2>Quick Actions</h2></div></div>
              <div className="quick-actions-grid">
                <a href={classId ? `/teacher/classes/${classId}` : "/teacher/classes"} className="quick-action blue"><span>👥</span><div><strong>View Class Details</strong><small>See all class information</small></div></a>
                <a href="/teacher/assign-content" className="quick-action purple"><span>▤</span><div><strong>Assign Content</strong><small>Give new lessons, quizzes or scenarios</small></div></a>
              </div>
            </section>
          </aside>
        </section>

        <style jsx global>{`
          .progress-data-status{margin:0 0 12px;padding:9px 12px;border-radius:10px;border:1px solid #dfe7f1;font-size:12px}.progress-data-status.is-loading{background:#eef6ff;color:#526992}.progress-data-status.is-error{background:#fff1ee;border-color:#f3d3cb;color:#a74736}.progress-source-note{grid-column:1/-1;padding:10px 12px;border-radius:10px;background:#fff7e3;border:1px solid #f1dfb0;color:#7d5b13;font-size:12px}.progress-page-root{width:calc(100% + 280px);max-width:none;margin-left:-280px;margin-top:-155px;padding:18px 18px 28px;color:#132060;}
          .progress-hero{position:relative;min-height:140px;border-radius:16px;background:#e8f8f3;overflow:hidden;display:flex;align-items:center;padding:22px 24px;margin-bottom:14px;}
          .progress-hero-copy{position:relative;z-index:2;max-width:58%;}.progress-hero h1{margin:0 0 8px;font-size:42px;line-height:1;color:#11165d;letter-spacing:-1.5px;}.progress-hero p{margin:0;font-size:19px;color:#405486;}.progress-hero-image{position:absolute;right:0;bottom:-6px;height:132%;width:46%;max-width:none;object-fit:contain;object-position:right bottom;}
          .progress-filters{display:grid;grid-template-columns:1fr 1fr 1fr 140px;gap:14px;align-items:end;margin-bottom:14px;}.progress-filters label{display:flex;flex-direction:column;gap:6px;font-size:13px;color:#50618c;}.progress-filters select{height:46px;border:1px solid #dbe5f1;border-radius:10px;background:#fff;color:#23366f;padding:0 12px;font-size:15px;outline:none;}.export-button{height:46px;border:1px solid #dbe5f1;border-radius:10px;background:#fff;color:#23366f;font-weight:700;cursor:pointer;}
          .metric-grid{display:grid;grid-template-columns:1.15fr repeat(4,1fr);gap:14px;margin-bottom:14px;}.progress-metric{min-height:102px;border:1px solid rgba(222,231,242,.75);border-radius:14px;padding:15px;display:flex;align-items:center;gap:14px;background:#fff;}.progress-metric.green{background:#ecfaf4}.progress-metric.blue{background:#edf5ff}.progress-metric.purple{background:#f4efff}.progress-metric.orange{background:#fff3e8}.progress-metric.gold{background:#fff7e3}.progress-metric-icon{width:54px;height:54px;border-radius:13px;display:grid;place-items:center;background:#dcecff;font-size:28px;}.progress-metric.green .progress-metric-icon{background:#d9f5e8}.progress-metric.purple .progress-metric-icon{background:#e7dbff}.progress-metric.orange .progress-metric-icon{background:#ffe4cb}.progress-metric.gold .progress-metric-icon{background:#fff0c8}.progress-metric strong{display:block;font-size:28px;line-height:1;color:#12195e}.progress-metric span{display:block;color:#385082;font-size:14px;margin-top:5px}.progress-metric small{display:block;color:#0ba878;font-weight:800;margin-top:4px;font-size:12px}.progress-metric small em{font-style:normal;color:#4d618f;font-weight:500}.overall-metric{justify-content:flex-start}.donut-small{width:72px;height:72px;border-radius:50%;background:conic-gradient(#0ca67a 68%,#d9e4ef 0);display:grid;place-items:center;position:relative;flex:0 0 72px}.donut-small:after{content:"";position:absolute;inset:8px;border-radius:50%;background:#ecfaf4}.donut-small span{position:relative;z-index:1;font-size:18px;font-weight:800;}
          .progress-main-grid{display:grid;grid-template-columns:minmax(0,1.85fr) minmax(360px,.8fr);gap:14px;}.students-panel,.chart-panel,.insight-panel,.quick-panel{background:#fff;border:1px solid #dfe8f3;border-radius:14px;box-shadow:0 5px 16px rgba(30,56,100,.03);}.students-panel{overflow:hidden;}.panel-header{display:flex;align-items:center;justify-content:space-between;gap:12px;padding:16px 18px 12px}.panel-title{display:flex;align-items:center;gap:10px}.panel-title-icon{font-size:24px}.panel-title h2{margin:0;font-size:19px;color:#12195e}.view-all{color:#0877ff;font-weight:700;text-decoration:none;font-size:13px}.panel-chevron{font-size:28px;color:#3c4f7d}
          .student-tools{padding:0 18px 12px;display:flex;justify-content:flex-end}.student-search{width:320px;height:40px;border:1px solid #dbe5f1;border-radius:9px;display:flex;align-items:center;gap:8px;padding:0 12px;color:#66789f}.student-search input{border:0;outline:0;width:100%;font-size:13px;color:#26376d;background:transparent}.student-table-wrap{overflow:auto}.student-table{width:100%;min-width:980px;border-collapse:collapse;font-size:12px}.student-table th{background:#f3f7fb;color:#53658e;font-weight:700;text-align:left;padding:9px 10px}.student-table td{padding:8px 10px;border-top:1px solid #edf1f6;color:#33497f;vertical-align:middle}.student-table td:nth-child(2){white-space:nowrap}.avatar{display:inline-grid;place-items:center;width:30px;height:30px;border-radius:50%;margin-right:7px;font-weight:800;font-size:11px}.avatar.green{background:#d8f4e8;color:#14986f}.avatar.blue{background:#dcecff;color:#1b72da}.avatar.purple{background:#e6dcff;color:#7546e8}.avatar.orange{background:#ffe6d2;color:#eb7c22}.percent-cell{display:flex;align-items:center;gap:6px;min-width:86px}.mini-bar{display:inline-block;width:48px;height:8px;background:#e5ebf3;border-radius:999px;overflow:hidden}.mini-bar-fill{display:block;height:100%;border-radius:999px}.mini-bar-fill.green{background:#0ca67a}.mini-bar-fill.blue{background:#2a82ff}.mini-bar-fill.purple{background:#7a49ee}.mini-bar-fill.orange{background:#ff9b27}.overall-value{font-weight:800;color:#1f3170}.view-student-button,.more-button{border:0;border-radius:8px;background:#edf5ff;color:#1975f4;padding:7px 15px;font-weight:700;cursor:pointer}.more-button{margin-left:4px;background:transparent;color:#53668f;padding:5px 7px}.pagination-row{display:flex;justify-content:space-between;align-items:center;padding:12px 18px;color:#66779b;font-size:12px;border-top:1px solid #e9eef5}.pagination-row button{width:32px;height:32px;border:1px solid #dbe5ef;border-radius:8px;background:#fff;color:#435682;margin-left:6px;cursor:pointer}.pagination-row button.active{background:#0ca67a;color:#fff;border-color:#0ca67a}.pagination-row button:disabled{opacity:.45}
          .progress-side-column{display:flex;flex-direction:column;gap:14px}.chart-panel{padding-bottom:12px}.chart-legend{display:flex;flex-wrap:wrap;gap:10px;padding:0 18px 6px;color:#52648d;font-size:11px}.chart-legend span{display:flex;align-items:center;gap:5px}.legend{width:10px;height:10px;border-radius:50%;display:inline-block}.legend.lessons{background:#0ca67a}.legend.quizzes{background:#2a82ff}.legend.scenarios{background:#7a49ee}.legend.goals{background:#f6b319}.progress-chart{width:100%;height:auto;padding:0 8px}.insight-panel{padding-bottom:8px}.insight-item{display:flex;gap:10px;padding:8px 18px}.insight-icon{width:34px;height:34px;border-radius:10px;display:grid;place-items:center;flex:0 0 34px}.insight-icon.green{background:#e1f6ed;color:#0ca67a}.insight-icon.orange{background:#fff0df;color:#ef8b23}.insight-icon.purple{background:#efe7ff;color:#7849ea}.insight-item strong{display:block;font-size:12px;color:#1b2a62}.insight-item p{margin:3px 0 0;font-size:11px;color:#66779b}.quick-panel{padding-bottom:12px}.quick-actions-grid{display:grid;grid-template-columns:1fr 1fr;gap:10px;padding:0 12px 12px}.quick-action{display:flex;gap:9px;padding:10px;border-radius:10px;text-decoration:none;border:1px solid transparent}.quick-action.blue{background:#edf5ff}.quick-action.purple{background:#f3edff}.quick-action>span{font-size:22px}.quick-action strong{display:block;color:#13205c;font-size:11px}.quick-action small{display:block;color:#60729b;font-size:10px;margin-top:2px}
          @media (max-width:1200px){.progress-page-root{width:calc(100% + 280px);margin-left:-280px;margin-top:-145px}.progress-hero-image{width:48%;height:128%}.metric-grid{grid-template-columns:repeat(3,1fr)}.overall-metric{grid-column:span 1}.progress-main-grid{grid-template-columns:1fr}.progress-side-column{display:grid;grid-template-columns:1fr 1fr}.quick-panel{grid-column:1/-1}}
          @media (max-width:700px){.progress-page-root{width:100%;margin-left:0;margin-top:0;padding:10px 12px 84px}.progress-hero{min-height:144px;padding:18px 16px;margin-bottom:10px}.progress-hero-copy{max-width:57%}.progress-hero h1{font-size:31px;letter-spacing:-.8px}.progress-hero p{font-size:16px;line-height:1.3}.progress-hero-image{width:53%;height:115%;right:-6px;bottom:-4px;object-fit:contain;object-position:right bottom}.progress-filters{grid-template-columns:1fr 1fr;gap:8px;margin-bottom:10px}.progress-filters label{gap:4px;font-size:11px}.progress-filters select{height:42px;font-size:13px}.export-button{display:none}.metric-grid{grid-template-columns:1fr 1fr;gap:8px}.progress-metric{min-height:108px;padding:10px;gap:9px}.progress-metric strong{font-size:24px}.progress-metric span{font-size:13px}.progress-metric small{font-size:11px}.progress-metric-icon{width:48px;height:48px;flex-basis:48px;font-size:24px}.overall-metric{grid-column:span 2}.donut-small{width:62px;height:62px;flex-basis:62px}.progress-main-grid{display:flex;flex-direction:column;gap:10px}.students-panel{order:1}.progress-side-column{order:2;display:flex;flex-direction:column;gap:10px}.student-tools{justify-content:stretch}.student-search{width:100%}.student-table{min-width:730px}.student-table th:nth-child(4),.student-table td:nth-child(4),.student-table th:nth-child(5),.student-table td:nth-child(5),.student-table th:nth-child(6),.student-table td:nth-child(6),.student-table th:nth-child(7),.student-table td:nth-child(7),.student-table th:nth-child(8),.student-table td:nth-child(8),.student-table th:nth-child(9),.student-table td:nth-child(9){display:none}.panel-header{padding:12px 12px 8px}.panel-title h2{font-size:18px}.chart-legend{justify-content:center;padding:0 12px 6px}.insight-item{padding:8px 12px}.quick-actions-grid{grid-template-columns:1fr 1fr}.pagination-row{padding:10px 12px}.pagination-row span{font-size:11px}}
        `}</style>
      </main>
    </TeacherShell>
  );
}
