"use client";

import { useEffect, useMemo, useState } from "react";
import type { CSSProperties } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import TeacherShell from "../../../../components/teacher/TeacherShell";
import TeacherIcon from "../../../../components/teacher/TeacherIcon";
import { apiFetch } from "../../../../lib/api";

type ClassDetails = {
  id: string | number;
  name: string;
  students: number;
  academicYear: string;
  progress: number;
  lessonCompletion: number;
  quizAverage: number;
  scenarioCompletion: number;
  description: string;
  createdOn: string;
  image: string;
  status: "Active" | "Archived";
};

type StudentRow = {
  id: number;
  initials: string;
  name: string;
  progress: number;
  activity: string;
  tone: "green" | "blue" | "purple" | "orange";
  status: "Active" | "Inactive";
};

const fallbackClassImages = [
  "/assets/teachers/class-1a-books.png",
  "/assets/teachers/class-2b-globe.png",
  "/assets/teachers/class-3a-calculator.png",
  "/assets/teachers/class-4b-lightbulb.png",
];

function fallbackImageForClass(classId: string) {
  const id = Number(classId);
  return Number.isInteger(id) && id >= 1 && id <= fallbackClassImages.length
    ? fallbackClassImages[id - 1]
    : fallbackClassImages[0];
}

export default function TeacherClassDetailsPage() {
  const params = useParams<{ classId: string }>();
  const classId = params?.classId ?? "";

  const [classInfo, setClassInfo] = useState<ClassDetails | null>(null);
  const [studentRows, setStudentRows] = useState<StudentRow[]>([]);
  const [activeTab, setActiveTab] = useState<
    "overview" | "students" | "assigned" | "progress" | "results"
  >("overview");
  const [studentSearch, setStudentSearch] = useState("");
  const [sortBy, setSortBy] = useState<"name" | "progress">("name");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function loadClassDetails() {
      if (!classId) {
        setError("Class ID is missing.");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError("");

        const data = await apiFetch(
          `/api/teacher/classes/${encodeURIComponent(classId)}`
        );

        if (cancelled) return;

        setClassInfo(data?.class ?? null);
        setStudentRows(Array.isArray(data?.students) ? data.students : []);
      } catch (err) {
        console.error("Teacher class details API error:", err);

        if (!cancelled) {
          setError(
            err instanceof Error
              ? err.message
              : "Unable to load class details."
          );
          setClassInfo(null);
          setStudentRows([]);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void loadClassDetails();

    return () => {
      cancelled = true;
    };
  }, [classId]);

  const displayClass: ClassDetails = classInfo ?? {
    id: classId,
    name: loading ? "Loading..." : "Class",
    students: studentRows.length,
    academicYear: "—",
    progress: 0,
    lessonCompletion: 0,
    quizAverage: 0,
    scenarioCompletion: 0,
    description: loading
      ? "Loading class information..."
      : "Unable to load class information.",
    createdOn: "—",
    image: fallbackImageForClass(classId),
    status: "Active",
  };

  const visibleStudents = useMemo(() => {
    const query = studentSearch.trim().toLowerCase();

    const filtered = query
      ? studentRows.filter((student) =>
          student.name.toLowerCase().includes(query)
        )
      : [...studentRows];

    return filtered.sort((a, b) =>
      sortBy === "progress"
        ? b.progress - a.progress
        : a.name.localeCompare(b.name)
    );
  }, [studentRows, studentSearch, sortBy]);

  return (
    <TeacherShell>
      <div className="class-details-root">
        <div className="class-details-page">
          {(loading || error) && (
            <div className={`class-data-status ${error ? "is-error" : "is-loading"}`}>
              {error || "Loading class details…"}
            </div>
          )}
          <Link href="/teacher/classes" className="back-link">
            <TeacherIcon name="chevron" size={18} />
            <span>Back to My Classes</span>
          </Link>

          <section className="class-details-hero">
            <div className="class-details-hero-main">
              <div className="class-details-image-wrap">
                <img src={displayClass.image} alt="" className="class-details-image" />
              </div>

              <div className="class-details-heading">
                <div className="class-name-row">
                  <h1>{displayClass.name}</h1>
                  <span className={`active-pill ${displayClass.status === "Archived" ? "is-archived" : ""}`}><span /> {displayClass.status}</span>
                </div>

                <div className="class-heading-line">
                  <TeacherIcon name="students" size={22} />
                  <span>{displayClass.students} Students</span>
                </div>

                <div className="class-heading-line">
                  <TeacherIcon name="document" size={20} />
                  <span>Academic Year {displayClass.academicYear}</span>
                </div>

                <p>{displayClass.description}</p>
              </div>
            </div>

            <div className="hero-note">Better<br />money habits<br />brighter<br />tomorrow!<span>⌣</span></div>

            <div className="class-details-actions">
              <Link href="/teacher/assign-content" className="primary-action">
                <TeacherIcon name="content" size={21} />
                <span>Assign Content</span>
                <TeacherIcon name="chevron" size={18} />
              </Link>
              <button type="button" className="secondary-action">
                <TeacherIcon name="document" size={20} />
                <span>Edit Class</span>
              </button>
              <button type="button" className="more-action" aria-label="More class actions">•••</button>
            </div>
          </section>

          <nav className="class-tabs" aria-label="Class sections">
            {[
              ["overview", "Overview"],
              ["students", "Students"],
              ["assigned", "Assigned Content"],
              ["progress", "Progress"],
              ["results", "Results"],
            ].map(([value, label]) => (
              <button
                type="button"
                key={value}
                className={activeTab === value ? "is-active" : ""}
                onClick={() => setActiveTab(value as typeof activeTab)}
              >
                {label}
              </button>
            ))}
          </nav>

          {activeTab === "overview" ? (
            <>
              <section className="performance-cards">
                <div className="performance-card mint">
                  <div className="progress-ring" style={{ "--progress": `${displayClass.progress * 3.6}deg` } as CSSProperties}>
                    <div className="progress-ring-inner">{displayClass.progress}%</div>
                  </div>
                  <div>
                    <h2>Overall Progress</h2>
                    <p><strong>—</strong> Progress data not available yet</p>
                  </div>
                </div>

                <MetricCard icon="content" value={`${displayClass.lessonCompletion}%`} label="Lesson Completion" change="—" tone="blue" />
                <MetricCard icon="results" value={`${displayClass.quizAverage}%`} label="Quiz Average" change="—" tone="purple" />
                <MetricCard icon="game" value={`${displayClass.scenarioCompletion}%`} label="Scenario Completion" change="—" tone="orange" />
              </section>

              <section className="class-details-content-grid">
                <section className="students-card">
                  <div className="section-head">
                    <h2><TeacherIcon name="students" size={27} /> Students ({displayClass.students})</h2>
                    <div className="section-tools">
                      <label className="student-search">
                        <TeacherIcon name="search" size={20} />
                        <input
                          value={studentSearch}
                          onChange={(e) => setStudentSearch(e.target.value)}
                          placeholder="Search students..."
                          aria-label="Search students"
                        />
                      </label>
                      <select aria-label="Sort students" value={sortBy} onChange={(e) => setSortBy(e.target.value as "name" | "progress")}>
                        <option value="name">Sort by: Name (A–Z)</option>
                        <option value="progress">Sort by: Progress</option>
                      </select>
                    </div>
                  </div>

                  <div className="student-table-wrap">
                    <table className="student-table">
                      <thead>
                        <tr>
                          <th>#</th>
                          <th>Student Name</th>
                          <th>Progress</th>
                          <th>Last Activity</th>
                          <th>Status</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {visibleStudents.map((student, index) => (
                          <tr key={student.name}>
                            <td>{index + 1}</td>
                            <td>
                              <div className={`student-avatar ${student.tone}`}>{student.initials}</div>
                              <span>{student.name}</span>
                            </td>
                            <td>
                              <div className="table-progress">
                                <div className="table-progress-track"><span className={student.tone} style={{ width: `${student.progress}%` }} /></div>
                                <b>{student.progress}%</b>
                              </div>
                            </td>
                            <td>{student.activity}</td>
                            <td><span className={`table-active ${student.status === "Inactive" ? "is-inactive" : ""}`}><span /> {student.status}</span></td>
                            <td>
                              <div className="action-cell">
                                <button type="button">View</button>
                                <button type="button" aria-label={`${student.name} more actions`}>•••</button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>


                  <div className="mobile-student-list" aria-label="Students mobile list">
                    {visibleStudents.slice(0, 5).map((student) => (
                      <div className="student-mobile-row" key={`mobile-${student.name}`}>
                        <div className={`student-avatar ${student.tone}`}>{student.initials}</div>
                        <div className="student-mobile-name">
                          <strong>{student.name}</strong>
                          <span>{student.progress}%</span>
                        </div>
                        <span className={`table-active ${student.status === "Inactive" ? "is-inactive" : ""}`}><span /> {student.status}</span>
                        <TeacherIcon name="chevron" size={18} />
                      </div>
                    ))}
                  </div>

                  <div className="students-pagination">
                    <span>Showing {Math.min(visibleStudents.length, 8)} of {displayClass.students} students</span>
                    <div>
                      <button type="button">‹</button>
                      <button type="button" className="current">1</button>
                      <button type="button">2</button>
                      <button type="button">3</button>
                      <button type="button">›</button>
                    </div>
                  </div>
                </section>

                <aside className="class-side-column">
                  <section className="info-card">
                    <div className="info-card-title"><h3><TeacherIcon name="help" size={22} /> Class Information</h3><button type="button">Edit</button></div>
                    <dl>
                      <div><dt>Class Name</dt><dd>{displayClass.name}</dd></div>
                      <div><dt>Academic Year</dt><dd>{displayClass.academicYear}</dd></div>
                      <div><dt>Total Students</dt><dd>{displayClass.students}</dd></div>
                      <div><dt>Status</dt><dd><span className={`table-active ${displayClass.status === "Archived" ? "is-inactive" : ""}`}><span /> {displayClass.status}</span></dd></div>
                      <div><dt>Created On</dt><dd>{displayClass.createdOn}</dd></div>
                      <div><dt>Description</dt><dd>{displayClass.description}</dd></div>
                    </dl>
                  </section>

                  <section className="quick-card">
                    <h3><TeacherIcon name="settings" size={22} /> Quick Actions</h3>
                    <QuickAction icon="content" title="Assign Content" subtitle="Lessons, quizzes, scenarios" href="/teacher/assign-content" />
                    <QuickAction icon="progress" title="View Student Progress" subtitle="Track individual progress" />
                    <QuickAction icon="results" title="View Results" subtitle="Quiz & scenario results" />
                    <QuickAction icon="settings" title="Manage Class" subtitle="Edit class details" />
                  </section>
                </aside>
              </section>
            </>
          ) : (
            <section className="placeholder-panel">
              <TeacherIcon name="classes" size={36} />
              <h2>{tabLabel(activeTab)}</h2>
              <p>This section is ready for the next Teacher Flow page build.</p>
            </section>
          )}
        </div>
      </div>

      <style jsx global>{`
        .class-data-status { margin:0 0 12px; padding:9px 12px; border-radius:10px; border:1px solid #dfe7f1; font-size:12px; }
        .class-data-status.is-loading { background:#eef6ff; color:#526992; }
        .class-data-status.is-error { background:#fff1ee; border-color:#f3d3cb; color:#a74736; }
        .active-pill.is-archived { background:#f1f3f7; color:#66718a; }
        .active-pill.is-archived span { background:#9ba6b8; }
        .table-active.is-inactive { background:#f1f3f7; color:#6e7890; }
        .table-active.is-inactive span { background:#9ba6b8; }
        .class-details-root { width:100%; }
        .class-details-page { width:100%; padding:0 18px 28px; margin-top:-145px; }
        .back-link { display:inline-flex; align-items:center; gap:7px; color:#3d5487; text-decoration:none; font-size:16px; margin-bottom:14px; }
        .back-link:hover { color:#0aa779; }

        .class-details-hero { position:relative; min-height:140px; border-radius:16px; background:#e7f8f2; overflow:hidden; display:flex; justify-content:space-between; align-items:center; padding:16px 18px; }
        .class-details-hero-main { display:flex; align-items:center; gap:18px; min-width:0; }
        .class-details-image-wrap { width:122px; height:110px; border-radius:12px; background:#daf5e9; display:grid; place-items:center; flex:0 0 122px; overflow:hidden; }
        .class-details-image { width:88%; height:88%; object-fit:contain; display:block; }
        .class-details-heading { min-width:0; }
        .class-name-row { display:flex; align-items:center; gap:15px; flex-wrap:wrap; }
        .class-name-row h1 { margin:0; color:#10165f; font-size:34px; letter-spacing:-1px; line-height:1; }
        .active-pill { display:inline-flex; align-items:center; gap:7px; padding:7px 12px; border-radius:999px; background:#dff8ed; color:#07986f; font-weight:700; font-size:14px; }
        .active-pill span,.table-active span { width:9px; height:9px; border-radius:50%; background:#0aae7c; display:inline-block; }
        .class-heading-line { display:flex; align-items:center; gap:9px; color:#31477b; font-size:16px; margin-top:8px; }
        .class-details-heading p { margin:8px 0 0; color:#3f527f; font-size:14px; }
        .hero-note { margin:0 18px; color:#2c4d77; font-size:18px; line-height:1.08; transform:rotate(-8deg); text-align:center; }
        .hero-note span { display:block; font-size:30px; margin-top:-6px; }
        .class-details-actions { display:flex; align-items:center; gap:10px; flex:0 0 auto; }
        .primary-action,.secondary-action,.more-action { min-height:50px; border-radius:11px; display:inline-flex; align-items:center; justify-content:center; gap:10px; padding:0 18px; font:700 16px/1 Inter,system-ui,sans-serif; cursor:pointer; text-decoration:none; }
        .primary-action { background:#08a97a; color:#fff; }
        .secondary-action { background:#fff; border:1px solid #cfe0ed; color:#324a7e; }
        .more-action { width:52px; background:#fff; border:1px solid #d7e3f0; color:#314474; }
        .primary-action:hover { background:#078e69; }
        .secondary-action:hover,.more-action:hover { background:#f8fbff; }

        .class-tabs { margin-top:12px; border-bottom:1px solid #d9e5f0; display:flex; gap:10px; }
        .class-tabs button { border:0; background:#f3f6fb; color:#41547f; min-height:42px; padding:0 24px; border-radius:9px 9px 0 0; font:600 14px/1 Inter,system-ui,sans-serif; cursor:pointer; }
        .class-tabs button.is-active { background:#fff; color:#07986f; box-shadow:inset 0 -3px #08a97a; }

        .performance-cards { display:grid; grid-template-columns:repeat(4,minmax(0,1fr)); gap:14px; margin-top:14px; }
        .performance-card,.metric-card { min-height:112px; border-radius:14px; padding:14px 18px; display:flex; align-items:center; gap:16px; border:1px solid rgba(222,231,242,.75); }
        .performance-card.mint { background:#ebfaf4; }
        .metric-card.blue { background:#edf5ff; }
        .metric-card.purple { background:#f4efff; }
        .metric-card.orange { background:#fff3e6; }
        .metric-icon { width:56px; height:56px; border-radius:13px; display:grid; place-items:center; flex:0 0 56px; }
        .metric-card.blue .metric-icon { background:#dcecff; color:#1c80ff; }
        .metric-card.purple .metric-icon { background:#e8dcff; color:#7c3aed; }
        .metric-card.orange .metric-icon { background:#ffe7ce; color:#f58a20; }
        .performance-card h2,.metric-card h2 { margin:0; color:#11185e; font-size:18px; }
        .performance-card p,.metric-card p { margin:6px 0 0; color:#42537e; font-size:14px; }
        .performance-card p strong,.metric-card p strong { color:#0aa779; }
        .progress-ring { width:78px; height:78px; border-radius:50%; background:conic-gradient(#08a97a var(--progress), #dbe8ed 0); display:grid; place-items:center; position:relative; flex:0 0 78px; }
        .progress-ring:after { content:""; position:absolute; inset:9px; border-radius:50%; background:#ebfaf4; }
        .progress-ring-inner { position:relative; z-index:1; color:#17215f; font-weight:800; font-size:18px; }

        .class-details-content-grid { display:grid; grid-template-columns:minmax(0,2.15fr) minmax(300px,.85fr); gap:14px; margin-top:14px; }
        .students-card,.info-card,.quick-card { border:1px solid #dfe7f1; border-radius:14px; background:#fff; }
        .students-card { overflow:hidden; }
        .section-head { display:flex; align-items:center; justify-content:space-between; gap:14px; padding:14px 16px 10px; }
        .section-head h2 { margin:0; color:#11185e; font-size:21px; display:flex; align-items:center; gap:10px; }
        .section-tools { display:flex; gap:10px; }
        .student-search { width:260px; min-height:40px; border:1px solid #d9e5ef; border-radius:9px; display:flex; align-items:center; gap:8px; padding:0 12px; color:#5d6e92; }
        .student-search input { width:100%; border:0; outline:0; background:transparent; font-size:13px; color:#23356e; }
        .section-tools select { min-height:40px; border:1px solid #d9e5ef; border-radius:9px; background:#fff; color:#304474; padding:0 10px; }
        .student-table-wrap { overflow-x:auto; }
        .student-table { width:100%; border-collapse:collapse; font-size:13px; }
        .student-table th { background:#f1f5fb; color:#334a7d; font-weight:700; text-align:left; padding:8px 10px; white-space:nowrap; }
        .student-table td { padding:8px 10px; border-bottom:1px solid #e8eef5; color:#304474; white-space:nowrap; }
        .student-table td:nth-child(2) { display:flex; align-items:center; gap:9px; }
        .student-avatar { width:32px; height:32px; border-radius:50%; display:grid; place-items:center; font-weight:800; }
        .student-avatar.green { background:#d9f5e8; color:#0aa779; }.student-avatar.blue { background:#dcecff; color:#157cf7; }.student-avatar.purple { background:#e7dcff; color:#6e42e8; }.student-avatar.orange { background:#ffe6cf; color:#ec7d17; }
        .table-progress { display:flex; align-items:center; gap:8px; min-width:150px; }.table-progress-track { height:10px; width:110px; border-radius:99px; overflow:hidden; background:#dfe7f0; }.table-progress-track span { height:100%; display:block; border-radius:inherit; }.table-progress-track span.green { background:#0ca67a; }.table-progress-track span.blue { background:#2180ff; }.table-progress-track span.purple { background:#7a4bee; }.table-progress-track span.orange { background:#ff8d2a; }.table-progress b { color:#1d3170; }
        .table-active { display:inline-flex; align-items:center; gap:6px; color:#06996f; font-weight:700; background:#e2f8ef; padding:6px 10px; border-radius:999px; }
        .action-cell { display:flex; align-items:center; gap:10px; }.action-cell button { min-height:32px; padding:0 14px; border:0; border-radius:9px; color:#1b7adf; background:#edf6ff; cursor:pointer; }.action-cell button:last-child { padding:0 4px; background:transparent; color:#304474; }
        .students-pagination { display:flex; justify-content:space-between; align-items:center; padding:11px 16px 14px; color:#607095; font-size:13px; }.students-pagination div { display:flex; gap:6px; }.students-pagination button { width:34px; height:34px; border:1px solid #d9e4ef; background:#fff; border-radius:8px; color:#3a4e7e; cursor:pointer; }.students-pagination button.current { background:#08a97a; color:#fff; border-color:#08a97a; }

        .class-side-column { display:flex; flex-direction:column; gap:14px; }
        .info-card { padding:14px 15px; }
        .info-card-title { display:flex; justify-content:space-between; align-items:center; gap:10px; }.info-card-title h3,.quick-card h3 { margin:0; color:#17205f; font-size:17px; display:flex; align-items:center; gap:9px; }.info-card-title button { border:0; background:transparent; color:#2083e8; text-decoration:underline; cursor:pointer; }
        .info-card dl { margin:13px 0 0; }.info-card dl div { display:grid; grid-template-columns:112px 1fr; gap:10px; margin-top:9px; }.info-card dt { color:#667498; }.info-card dd { margin:0; color:#1f3370; font-weight:600; line-height:1.3; }
        .quick-card { background:#ecfaf4; padding:14px 15px; }.quick-action { display:flex; align-items:center; gap:10px; padding:9px 0; text-decoration:none; color:inherit; border-bottom:1px solid rgba(12,169,122,.10); }.quick-action:last-child { border-bottom:0; }.quick-action-icon { width:38px; height:38px; border-radius:10px; display:grid; place-items:center; background:#dcf6e9; color:#0aa779; flex:0 0 38px; }.quick-action:nth-of-type(3) .quick-action-icon { background:#e3ebff; color:#267af0; }.quick-action:nth-of-type(4) .quick-action-icon { background:#eee5ff; color:#7a4bee; }.quick-action:nth-of-type(5) .quick-action-icon { background:#ffe9d6; color:#f2851c; }.quick-action-text { min-width:0; flex:1; }.quick-action-title { color:#17215f; font-weight:800; font-size:14px; }.quick-action-sub { color:#5f6f95; font-size:12px; margin-top:2px; }.quick-action-chevron { color:#0aa779; }
        .placeholder-panel { margin-top:14px; min-height:350px; border:1px solid #dfe7f1; border-radius:14px; display:flex; flex-direction:column; align-items:center; justify-content:center; color:#5e6c91; background:#fff; }.placeholder-panel h2 { margin:10px 0 5px; color:#17205f; }.placeholder-panel p { margin:0; }

        @media (max-width: 1200px) {
          .class-details-hero { padding:15px; }
          .hero-note { display:none; }
          .class-details-actions { gap:8px; }
          .primary-action span,.secondary-action span { display:none; }
          .primary-action,.secondary-action { width:50px; padding:0; }
          .class-details-content-grid { grid-template-columns:1fr; }
          .class-side-column { display:grid; grid-template-columns:1fr 1fr; }
        }

        @media (max-width: 700px) {
          .class-details-page { padding:10px 12px 86px; margin-top:0; }
          .back-link { margin-bottom:10px; font-size:14px; }
          .class-details-hero { display:block; padding:12px; min-height:0; }
          .class-details-hero-main { align-items:flex-start; gap:12px; }
          .class-details-image-wrap { width:118px; height:118px; flex-basis:118px; }
          .class-details-heading { padding-top:2px; }
          .class-name-row { gap:8px; }
          .class-name-row h1 { font-size:25px; }
          .active-pill { font-size:12px; padding:5px 9px; }
          .class-heading-line { font-size:13px; margin-top:7px; }
          .class-details-heading p { font-size:12px; line-height:1.35; margin-top:7px; }
          .class-details-actions { display:grid; grid-template-columns:1fr 1fr 54px; margin-top:10px; gap:8px; }
          .primary-action,.secondary-action { width:auto; min-height:52px; padding:0 12px; }
          .primary-action span,.secondary-action span { display:inline; }
          .primary-action svg,.secondary-action svg { display:none; }
          .more-action { width:54px; }
          .class-tabs { overflow:auto; gap:7px; scrollbar-width:none; }
          .class-tabs::-webkit-scrollbar { display:none; }
          .class-tabs button { flex:0 0 auto; min-height:44px; padding:0 16px; font-size:13px; }
          .performance-cards { grid-template-columns:1fr 1fr; gap:10px; }
          .performance-card,.metric-card { min-height:118px; padding:12px; gap:10px; }
          .performance-card { flex-direction:column; align-items:flex-start; justify-content:center; }
          .progress-ring { width:58px; height:58px; flex-basis:58px; }.progress-ring:after { inset:7px; }.progress-ring-inner { font-size:14px; }
          .performance-card h2,.metric-card h2 { font-size:16px; }.performance-card p,.metric-card p { font-size:12px; }
          .metric-icon { width:52px; height:52px; flex-basis:52px; }
          .class-details-content-grid { display:block; }
          .section-head { padding:12px; align-items:flex-start; }.section-head h2 { font-size:19px; }
          .section-tools { display:none; }
          .students-card { overflow:hidden; }
          .student-table-wrap { display:none; }
          .students-card:after { content:""; display:block; }
          .mobile-student-list { display:block; }
          .student-mobile-row { display:grid; grid-template-columns:34px 1fr auto 22px; gap:8px; align-items:center; padding:10px 12px; border-top:1px solid #e9eef5; }
          .student-mobile-name { min-width:0; display:flex; flex-direction:column; gap:2px; }
          .student-mobile-name strong { color:#17215f; font-size:14px; }
          .student-mobile-name span { color:#54658c; font-size:12px; }
          .students-pagination { display:none; }
          .class-side-column { display:grid; grid-template-columns:1fr; margin-top:12px; }
          .info-card,.quick-card { border-radius:13px; }
          .info-card dl div { grid-template-columns:105px 1fr; font-size:13px; }
          .class-details-hero + .class-tabs { margin-top:10px; }
        }

        @media (min-width: 701px) {
          .mobile-student-list { display:none; }
        }
      `}</style>
    </TeacherShell>
  );
}

type TeacherIconName = Parameters<typeof TeacherIcon>[0]["name"];

function MetricCard({ icon, value, label, change, tone }: { icon: TeacherIconName; value: string; label: string; change: string; tone: "blue" | "purple" | "orange" }) {
  return (
    <div className={`metric-card ${tone}`}>
      <div className="metric-icon"><TeacherIcon name={icon} size={32} /></div>
      <div>
        <h2>{value}</h2>
        <p>{label}</p>
        <p><strong>↑ {change}</strong> from last month</p>
      </div>
    </div>
  );
}

function QuickAction({ icon, title, subtitle, href }: { icon: TeacherIconName; title: string; subtitle: string; href?: string }) {
  const content = (
    <>
      <div className="quick-action-icon"><TeacherIcon name={icon} size={20} /></div>
      <div className="quick-action-text">
        <div className="quick-action-title">{title}</div>
        <div className="quick-action-sub">{subtitle}</div>
      </div>
      <TeacherIcon name="chevron" size={17} />
    </>
  );
  return href ? <Link href={href} className="quick-action">{content}</Link> : <button className="quick-action" type="button">{content}</button>;
}

function tabLabel(tab: string) {
  const labels: Record<string,string> = { students: "Students", assigned: "Assigned Content", progress: "Progress", results: "Results" };
  return labels[tab] || "Overview";
}
