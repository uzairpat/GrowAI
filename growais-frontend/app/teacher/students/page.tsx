"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import TeacherShell from "../../../components/teacher/TeacherShell";

type Student = {
  id: number;
  initials: string;
  name: string;
  className: string;
  progress: number;
  lastActivity: string;
  status: "Active" | "Needs Support" | "Inactive";
  tone: "green" | "blue" | "purple" | "orange";
};

const students: Student[] = [
  { id: 1, initials: "AW", name: "Alex Wong", className: "Class 1A", progress: 82, lastActivity: "Today", status: "Active", tone: "green" },
  { id: 2, initials: "EC", name: "Emily Chan", className: "Class 1A", progress: 74, lastActivity: "Today", status: "Active", tone: "blue" },
  { id: 3, initials: "DL", name: "Daniel Lee", className: "Class 1A", progress: 61, lastActivity: "Yesterday", status: "Active", tone: "purple" },
  { id: 4, initials: "SK", name: "Sarah Kim", className: "Class 1A", progress: 49, lastActivity: "2 days ago", status: "Needs Support", tone: "orange" },
  { id: 5, initials: "JL", name: "Jason Lam", className: "Class 2B", progress: 76, lastActivity: "3 days ago", status: "Active", tone: "blue" },
  { id: 6, initials: "CY", name: "Chloe Yip", className: "Class 2B", progress: 68, lastActivity: "3 days ago", status: "Active", tone: "green" },
  { id: 7, initials: "MK", name: "Marcus Kwan", className: "Class 2B", progress: 55, lastActivity: "4 days ago", status: "Needs Support", tone: "purple" },
  { id: 8, initials: "NT", name: "Natalie Tang", className: "Class 3A", progress: 47, lastActivity: "4 days ago", status: "Needs Support", tone: "orange" },
  { id: 9, initials: "RY", name: "Ryan Choi", className: "Class 3A", progress: 71, lastActivity: "5 days ago", status: "Active", tone: "green" },
  { id: 10, initials: "LT", name: "Linda Tse", className: "Class 3A", progress: 63, lastActivity: "5 days ago", status: "Active", tone: "blue" },
  { id: 11, initials: "JW", name: "Jason Wu", className: "Class 4B", progress: 58, lastActivity: "6 days ago", status: "Active", tone: "purple" },
  { id: 12, initials: "MH", name: "Mia Ho", className: "Class 4B", progress: 44, lastActivity: "1 week ago", status: "Inactive", tone: "orange" },
];

export default function TeacherStudentsPage() {
  const [search, setSearch] = useState("");
  const [classFilter, setClassFilter] = useState("All Classes");
  const [statusFilter, setStatusFilter] = useState("All Status");
  const [sort, setSort] = useState("Name A–Z");

  const filteredStudents = useMemo(() => {
    const query = search.trim().toLowerCase();

    const result = students.filter((student) => {
      const matchesSearch =
        !query ||
        student.name.toLowerCase().includes(query) ||
        student.className.toLowerCase().includes(query);

      const matchesClass =
        classFilter === "All Classes" || student.className === classFilter;

      const matchesStatus =
        statusFilter === "All Status" || student.status === statusFilter;

      return matchesSearch && matchesClass && matchesStatus;
    });

    if (sort === "Progress") {
      result.sort((a, b) => b.progress - a.progress);
    } else if (sort === "Last Activity") {
      result.sort((a, b) => a.lastActivity.localeCompare(b.lastActivity));
    } else {
      result.sort((a, b) => a.name.localeCompare(b.name));
    }

    return result;
  }, [search, classFilter, statusFilter, sort]);

  const totalStudents = students.length;
  const activeStudents = students.filter((s) => s.status === "Active").length;
  const supportStudents = students.filter((s) => s.status === "Needs Support").length;
  const averageProgress = Math.round(
    students.reduce((sum, student) => sum + student.progress, 0) / students.length
  );

  return (
    <TeacherShell>
      <main className="teacher-students-page">
        <div className="students-page-content">
          <section className="page-hero">
            <div className="page-hero-copy">
              <span className="eyebrow">STUDENT MANAGEMENT</span>
              <h1>Students</h1>
              <p>View your students, monitor progress, and support their learning.</p>
            </div>

            <div className="hero-image-wrap">
              <img
                src="/assets/teachers/teacher-student-progress-hero.png"
                alt="Teacher supporting student learning"
                className="hero-image"
              />
            </div>
          </section>

          <section className="stat-grid">
            <article className="stat-card stat-blue">
              <div className="stat-icon">👥</div>
              <div>
                <strong>{totalStudents}</strong>
                <span>Total Students</span>
                <small>Across all classes</small>
              </div>
            </article>

            <article className="stat-card stat-green">
              <div className="stat-icon">✓</div>
              <div>
                <strong>{activeStudents}</strong>
                <span>Active Students</span>
                <small>Currently learning</small>
              </div>
            </article>

            <article className="stat-card stat-purple">
              <div className="stat-icon">▥</div>
              <div>
                <strong>{averageProgress}%</strong>
                <span>Average Progress</span>
                <small>Across all students</small>
              </div>
            </article>

            <article className="stat-card stat-orange">
              <div className="stat-icon">!</div>
              <div>
                <strong>{supportStudents}</strong>
                <span>Need Support</span>
                <small>Below 60% progress</small>
              </div>
            </article>
          </section>

          <section className="toolbar-card">
            <div className="toolbar-row">
              <label className="search-control">
                <span>⌕</span>
                <input
                  type="search"
                  placeholder="Search students..."
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                />
              </label>

              <select value={classFilter} onChange={(event) => setClassFilter(event.target.value)}>
                <option>All Classes</option>
                <option>Class 1A</option>
                <option>Class 2B</option>
                <option>Class 3A</option>
                <option>Class 4B</option>
              </select>

              <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}>
                <option>All Status</option>
                <option>Active</option>
                <option>Needs Support</option>
                <option>Inactive</option>
              </select>

              <select value={sort} onChange={(event) => setSort(event.target.value)}>
                <option>Name A–Z</option>
                <option>Progress</option>
                <option>Last Activity</option>
              </select>
            </div>
          </section>

          <section className="content-grid">
            <article className="students-card">
              <div className="section-header">
                <div>
                  <h2>All Students</h2>
                  <p>{filteredStudents.length} students shown</p>
                </div>
                <button className="outline-btn" type="button">Export</button>
              </div>

              <div className="table-wrap">
                <table className="students-table">
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Student</th>
                      <th>Class</th>
                      <th>Progress</th>
                      <th>Last Activity</th>
                      <th>Status</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredStudents.map((student, index) => (
                      <tr key={student.id}>
                        <td>{index + 1}</td>
                        <td>
                          <div className="student-name-cell">
                            <span className={`avatar avatar-${student.tone}`}>{student.initials}</span>
                            <div>
                              <strong>{student.name}</strong>
                              <small>{student.name.toLowerCase().replace(" ", ".")}@growais.edu</small>
                            </div>
                          </div>
                        </td>
                        <td>{student.className}</td>
                        <td>
                          <div className="progress-cell">
                            <span>{student.progress}%</span>
                            <div className="progress-track">
                              <div
                                className={`progress-fill fill-${student.tone}`}
                                style={{ width: `${student.progress}%` }}
                              />
                            </div>
                          </div>
                        </td>
                        <td>{student.lastActivity}</td>
                        <td>
                          <span
                            className={`status-pill ${
                              student.status === "Active"
                                ? "status-active"
                                : student.status === "Needs Support"
                                ? "status-support"
                                : "status-inactive"
                            }`}
                          >
                            <i />
                            {student.status}
                          </span>
                        </td>
                        <td>
                          <Link href="/teacher/students" className="view-btn">View</Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {filteredStudents.length === 0 && (
                <div className="empty-state">
                  <strong>No students found</strong>
                  <span>Try changing your search or filters.</span>
                </div>
              )}
            </article>

            <aside className="side-column">
              <article className="side-card">
                <div className="side-header">
                  <h2>Student Overview</h2>
                  <Link href="/teacher/progress">View Details →</Link>
                </div>

                <div className="donut-wrap">
                  <div className="donut">
                    <div className="donut-inner">
                      <strong>{averageProgress}%</strong>
                      <span>Average</span>
                    </div>
                  </div>

                  <div className="legend-list">
                    <div><i className="legend-green" /> High Progress <strong>4</strong></div>
                    <div><i className="legend-blue" /> On Track <strong>4</strong></div>
                    <div><i className="legend-orange" /> Need Support <strong>{supportStudents}</strong></div>
                    <div><i className="legend-gray" /> Inactive <strong>1</strong></div>
                  </div>
                </div>
              </article>

              <article className="side-card">
                <div className="side-header">
                  <h2>Needs Attention</h2>
                  <span className="count-badge">{supportStudents}</span>
                </div>

                <div className="attention-list">
                  {students
                    .filter((student) => student.status === "Needs Support")
                    .slice(0, 4)
                    .map((student) => (
                      <div className="attention-row" key={student.id}>
                        <span className={`avatar small avatar-${student.tone}`}>{student.initials}</span>
                        <div>
                          <strong>{student.name}</strong>
                          <span>{student.className} · {student.progress}% progress</span>
                        </div>
                        <button type="button">›</button>
                      </div>
                    ))}
                </div>
              </article>

              <article className="side-card quick-actions">
                <h2>Quick Actions</h2>
                <button type="button">
                  <span className="action-icon blue">👥</span>
                  <span><strong>View Class</strong><small>Manage a class roster</small></span>
                  <b>›</b>
                </button>
                <button type="button">
                  <span className="action-icon green">▥</span>
                  <span><strong>View Progress</strong><small>Track student learning</small></span>
                  <b>›</b>
                </button>
                <button type="button">
                  <span className="action-icon purple">▤</span>
                  <span><strong>View Results</strong><small>Review performance</small></span>
                  <b>›</b>
                </button>
              </article>
            </aside>
          </section>
        </div>
      </main>

      <style jsx>{`
        .teacher-students-page {
          width: 100%;
          margin: 0;
          padding: 0;
          background: #f8fbff;
        }

        /* Removes the shell's large empty offsets on desktop while preserving
           the same right edge and keeping mobile flow unchanged. */
        .students-page-content {
          width: calc(100% + 270px);
          margin: 0;
          padding: 0 16px 32px;
          box-sizing: border-box;
          position: relative;
          left: -270px;
          top: -150px;
        }

        .page-hero {
          min-height: 150px;
          border-radius: 14px;
          background: linear-gradient(90deg, #e8faf4 0%, #eefcf9 100%);
          display: flex;
          align-items: stretch;
          justify-content: space-between;
          padding: 0 24px 0 28px;
          box-sizing: border-box;
          overflow: hidden;
          position: relative;
        }

        .page-hero-copy {
          min-width: 0;
          display: flex;
          flex-direction: column;
          justify-content: center;
          position: relative;
          z-index: 2;
        }

        .eyebrow {
          display: block;
          color: #0ca878;
          letter-spacing: .18em;
          font-size: 11px;
          font-weight: 800;
          margin-bottom: 6px;
        }

        .page-hero h1 {
          margin: 0;
          color: #111c68;
          font-size: 34px;
          font-weight: 800;
          line-height: 1;
        }

        .page-hero p {
          margin: 9px 0 0;
          color: #49608c;
          font-size: 16px;
        }

        .hero-image-wrap {
          width: 38%;
          height: 100%;
          min-width: 250px;
          display: flex;
          align-items: flex-end;
          justify-content: flex-end;
          position: relative;
        }

        .hero-image-wrap::before {
          content: "";
          position: absolute;
          width: 270px;
          height: 140px;
          right: 36px;
          bottom: -52px;
          border-radius: 50%;
          background: rgba(194, 242, 222, .58);
        }

        .hero-image {
          position: relative;
          z-index: 2;
          height: 145px;
          width: auto;
          max-width: 100%;
          object-fit: contain;
          object-position: right bottom;
          display: block;
        }

        .stat-grid {
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: 12px;
          margin: 12px 0;
        }

        .stat-card {
          min-height: 98px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          gap: 14px;
          padding: 14px;
          border: 1px solid rgba(218, 227, 239, .7);
        }

        .stat-blue { background: #edf5ff; }
        .stat-green { background: #eaf9f2; }
        .stat-purple { background: #f2ecff; }
        .stat-orange { background: #fff2e3; }

        .stat-icon {
          width: 50px;
          height: 50px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: rgba(255, 255, 255, .5);
          font-size: 24px;
          flex-shrink: 0;
        }

        .stat-card strong {
          display: block;
          font-size: 27px;
          color: #122064;
          line-height: 1;
        }

        .stat-card span {
          display: block;
          color: #415785;
          font-size: 13px;
          margin-top: 4px;
        }

        .stat-card small {
          display: block;
          color: #70819f;
          font-size: 11px;
          margin-top: 3px;
        }

        .toolbar-card {
          background: #fff;
          border: 1px solid #dfe7f1;
          border-radius: 12px;
          padding: 12px;
          margin-bottom: 12px;
        }

        .toolbar-row {
          display: grid;
          grid-template-columns: minmax(260px, 1.8fr) 1fr 1fr 1fr;
          gap: 10px;
        }

        .search-control,
        .toolbar-row select {
          height: 42px;
          border: 1px solid #d7e0eb;
          border-radius: 9px;
          background: #fff;
          box-sizing: border-box;
        }

        .search-control {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 0 11px;
        }

        .search-control span {
          color: #50678f;
          font-size: 18px;
        }

        .search-control input {
          border: 0;
          outline: 0;
          width: 100%;
          background: transparent;
          color: #2d4373;
          font-size: 13px;
        }

        .toolbar-row select {
          padding: 0 11px;
          color: #30477a;
          font-size: 13px;
          outline: none;
        }

        .content-grid {
          display: grid;
          grid-template-columns: minmax(0, 1.7fr) minmax(300px, .7fr);
          gap: 12px;
          align-items: start;
        }

        .students-card,
        .side-card {
          background: #fff;
          border: 1px solid #dfe7f1;
          border-radius: 12px;
          box-sizing: border-box;
        }

        .students-card { overflow: hidden; }

        .section-header,
        .side-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
        }

        .section-header { padding: 16px 18px 12px; }

        .section-header h2,
        .side-header h2,
        .quick-actions h2 {
          margin: 0;
          color: #172361;
          font-size: 18px;
        }

        .section-header p {
          margin: 4px 0 0;
          color: #7483a0;
          font-size: 11px;
        }

        .outline-btn {
          border: 1px solid #0ca978;
          background: #fff;
          color: #0a966e;
          border-radius: 8px;
          min-height: 36px;
          padding: 0 13px;
          font-weight: 700;
          cursor: pointer;
        }

        .table-wrap { overflow-x: auto; }

        .students-table {
          width: 100%;
          min-width: 760px;
          border-collapse: collapse;
        }

        .students-table th {
          background: #edf3fa;
          color: #56698f;
          font-size: 11px;
          text-align: left;
          padding: 9px 10px;
          white-space: nowrap;
        }

        .students-table td {
          border-bottom: 1px solid #edf1f6;
          color: #334a7e;
          font-size: 12px;
          padding: 9px 10px;
          white-space: nowrap;
        }

        .student-name-cell {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .student-name-cell > div {
          display: flex;
          flex-direction: column;
          gap: 2px;
        }

        .student-name-cell strong {
          color: #203368;
          font-size: 12px;
        }

        .student-name-cell small {
          color: #7b88a4;
          font-size: 9px;
        }

        .avatar {
          width: 30px;
          height: 30px;
          border-radius: 50%;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          font-size: 10px;
          font-weight: 800;
          color: #294172;
          flex-shrink: 0;
        }

        .avatar.small {
          width: 28px;
          height: 28px;
        }

        .avatar-green { background: #daf3e6; }
        .avatar-blue { background: #dcecff; }
        .avatar-purple { background: #e9dcff; }
        .avatar-orange { background: #ffe7d2; }

        .progress-cell {
          display: grid;
          grid-template-columns: 36px 90px;
          gap: 8px;
          align-items: center;
        }

        .progress-cell > span {
          font-weight: 700;
          color: #263970;
        }

        .progress-track {
          width: 90px;
          height: 8px;
          border-radius: 999px;
          background: #e4ebf3;
          overflow: hidden;
        }

        .progress-fill { height: 100%; border-radius: inherit; }
        .fill-green { background: #0ca978; }
        .fill-blue { background: #2e83f4; }
        .fill-purple { background: #7b49f3; }
        .fill-orange { background: #ff922d; }

        .status-pill {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          border-radius: 999px;
          padding: 5px 8px;
          font-size: 10px;
          font-weight: 700;
        }

        .status-pill i {
          width: 7px;
          height: 7px;
          border-radius: 50%;
          background: currentColor;
        }

        .status-active { background: #e0f7ee; color: #0a9b72; }
        .status-support { background: #fff0db; color: #e98513; }
        .status-inactive { background: #eef1f4; color: #697791; }

        .view-btn {
          text-decoration: none;
          background: #edf5ff;
          color: #1878e7;
          border-radius: 8px;
          padding: 6px 11px;
          font-size: 11px;
          font-weight: 700;
        }

        .side-column {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .side-card { padding: 14px; }

        .side-header a {
          color: #1379e9;
          text-decoration: none;
          font-size: 11px;
          font-weight: 700;
        }

        .count-badge {
          min-width: 25px;
          height: 25px;
          padding: 0 8px;
          border-radius: 999px;
          background: #fff0dc;
          color: #e98613;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          font-size: 11px;
          font-weight: 800;
        }

        .donut-wrap {
          display: flex;
          align-items: center;
          gap: 18px;
          margin-top: 14px;
        }

        .donut {
          width: 116px;
          height: 116px;
          border-radius: 50%;
          background: conic-gradient(#0ca978 0 68%, #dfe6ef 68% 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .donut-inner {
          width: 82px;
          height: 82px;
          border-radius: 50%;
          background: #fff;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
        }

        .donut-inner strong {
          color: #1a2b69;
          font-size: 22px;
        }

        .donut-inner span {
          color: #68799b;
          font-size: 10px;
          margin-top: 2px;
        }

        .legend-list {
          display: flex;
          flex-direction: column;
          gap: 11px;
          width: 100%;
        }

        .legend-list div {
          display: grid;
          grid-template-columns: 9px 1fr auto;
          gap: 7px;
          align-items: center;
          color: #55688f;
          font-size: 10px;
        }

        .legend-list strong { color: #23366f; }

        .legend-list i {
          width: 9px;
          height: 9px;
          border-radius: 50%;
        }

        .legend-green { background: #0ca978; }
        .legend-blue { background: #2e83f4; }
        .legend-orange { background: #ff9b27; }
        .legend-gray { background: #aab5c6; }

        .attention-list {
          display: flex;
          flex-direction: column;
          margin-top: 9px;
        }

        .attention-row {
          display: grid;
          grid-template-columns: 28px 1fr 14px;
          gap: 9px;
          align-items: center;
          padding: 9px 0;
          border-top: 1px solid #edf1f6;
        }

        .attention-row strong {
          display: block;
          color: #2b3c70;
          font-size: 11px;
        }

        .attention-row span {
          display: block;
          color: #7b88a2;
          font-size: 9px;
          margin-top: 2px;
        }

        .attention-row button {
          border: 0;
          background: transparent;
          color: #2c70da;
          font-size: 18px;
          cursor: pointer;
        }

        .quick-actions {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .quick-actions h2 { margin-bottom: 2px; }

        .quick-actions button {
          min-height: 56px;
          border: 1px solid #e3e9f1;
          border-radius: 9px;
          background: #f6f9ff;
          display: grid;
          grid-template-columns: 36px 1fr 12px;
          gap: 9px;
          align-items: center;
          text-align: left;
          padding: 8px;
          cursor: pointer;
        }

        .action-icon {
          width: 34px;
          height: 34px;
          border-radius: 9px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .action-icon.blue { background: #e0efff; }
        .action-icon.green { background: #e4f8ef; }
        .action-icon.purple { background: #eee4ff; }

        .quick-actions strong {
          display: block;
          color: #24366b;
          font-size: 11px;
        }

        .quick-actions small {
          display: block;
          color: #70809d;
          font-size: 9px;
          margin-top: 2px;
        }

        .quick-actions b {
          color: #2b74e3;
          font-size: 17px;
        }

        .empty-state {
          min-height: 160px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 5px;
          color: #70809f;
        }

        .empty-state strong { color: #203368; }

        @media (max-width: 1180px) {
          .students-page-content {
            width: 100%;
            left: 0;
            top: 0;
          }

          .content-grid { grid-template-columns: 1fr; }

          .side-column {
            display: grid;
            grid-template-columns: 1fr 1fr;
          }

          .quick-actions { grid-column: 1 / -1; }
        }

        @media (max-width: 900px) {
          .stat-grid { grid-template-columns: 1fr 1fr; }

          .toolbar-row { grid-template-columns: 1fr 1fr; }
        }

        @media (max-width: 700px) {
          .students-page-content {
            width: 100%;
            left: 0;
            top: 0;
            padding: 0 12px 78px;
          }

          .page-hero {
            min-height: 150px;
            padding: 16px;
          }

          .page-hero h1 { font-size: 27px; }

          .page-hero p {
            font-size: 14px;
            max-width: 230px;
          }

          .hero-image-wrap {
            width: 42%;
            min-width: 145px;
          }

          .hero-image {
            height: 132px;
            max-width: 100%;
          }

          .stat-grid {
            grid-template-columns: 1fr 1fr;
            gap: 8px;
          }

          .stat-card {
            min-height: 84px;
            padding: 10px;
            gap: 9px;
          }

          .stat-icon {
            width: 40px;
            height: 40px;
            border-radius: 9px;
            font-size: 19px;
          }

          .stat-card strong { font-size: 22px; }
          .stat-card span { font-size: 11px; }
          .stat-card small { font-size: 9px; }

          .toolbar-row { grid-template-columns: 1fr; }

          .side-column { display: flex; }

          .students-table { min-width: 760px; }

          .donut-wrap { flex-direction: row; }
        }
      `}</style>
    </TeacherShell>
  );
}
