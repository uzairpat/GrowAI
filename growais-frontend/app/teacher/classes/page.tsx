"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import TeacherShell from "../../../components/teacher/TeacherShell";
import TeacherIcon from "../../../components/teacher/TeacherIcon";
import { apiFetch } from "../../../lib/api";

type ApiClass = {
  id: string | number;
  name: string;
  students: number;
  progress: number;
  lastActivity: string;
  status: string;
  image?: string | null;
};

type ClassItem = ApiClass & {
  tone: "green" | "blue" | "purple" | "orange";
  image: string;
};

const classImages = [
  "/assets/teachers/class-1a-books.png",
  "/assets/teachers/class-2b-globe.png",
  "/assets/teachers/class-3a-calculator.png",
  "/assets/teachers/class-4b-lightbulb.png",
];

type Tab = "all" | "active" | "archived";
type SortMode = "updated" | "name" | "progress";

export default function TeacherClassesPage() {
  const [activeTab, setActiveTab] = useState<Tab>("all");
  const [search, setSearch] = useState("");
  const [sortMode, setSortMode] = useState<SortMode>("updated");
  const [classes, setClasses] = useState<ClassItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function loadClasses() {
      try {
        setLoading(true);
        setError("");

        const data = await apiFetch("/api/teacher/classes");
        const items: ApiClass[] = Array.isArray(data?.classes)
          ? data.classes
          : [];

        const mapped: ClassItem[] = items.map((item, index) => ({
          ...item,
          tone: (["green", "blue", "purple", "orange"] as const)[index % 4],
          image: item.image || classImages[index % classImages.length],
        }));

        if (!cancelled) {
          setClasses(mapped);
        }
      } catch (err) {
        console.error("Teacher classes API error:", err);

        if (!cancelled) {
          setError(
            err instanceof Error
              ? err.message
              : "Unable to load classes."
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadClasses();

    return () => {
      cancelled = true;
    };
  }, []);

  const activeCount = classes.filter(
    (item) => String(item.status).toLowerCase() === "active"
  ).length;

  const archivedCount = classes.filter(
    (item) => String(item.status).toLowerCase() === "archived"
  ).length;

  const totalStudents = classes.reduce(
    (sum, item) => sum + Number(item.students || 0),
    0
  );

  const averageProgress = classes.length
    ? Math.round(
        classes.reduce(
          (sum, item) => sum + Number(item.progress || 0),
          0
        ) / classes.length
      )
    : 0;

  const filteredClasses = useMemo(() => {
    const normalized = search.trim().toLowerCase();

    const visible = classes.filter((item) => {
      const status = String(item.status || "").toLowerCase();

      const tabMatch =
        activeTab === "all" ||
        (activeTab === "active" && status === "active") ||
        (activeTab === "archived" && status === "archived");

      const searchMatch =
        !normalized ||
        item.name.toLowerCase().includes(normalized);

      return tabMatch && searchMatch;
    });

    return [...visible].sort((a, b) => {
      if (sortMode === "name") return a.name.localeCompare(b.name);
      if (sortMode === "progress") return b.progress - a.progress;
      return b.progress - a.progress;
    });
  }, [classes, activeTab, search, sortMode]);

  return (
    <TeacherShell>
      <div className="teacher-classes-page-root">
        <div className="teacher-classes-shell">
          {loading && (
            <div className="classes-data-status is-loading">
              Loading your classes…
            </div>
          )}
          {error && !loading && (
            <div className="classes-data-status is-error">
              {error}
            </div>
          )}
          <section className="classes-hero" aria-labelledby="classes-title">
            <div className="classes-hero-copy">
              <h1 id="classes-title">My Classes</h1>
              <p>Manage your classes and track your students’ learning.</p>
            </div>

            <img
              src="/assets/teachers/teacher-classes-hero-side.png"
              alt="Teacher with a tablet beside a plant illustration"
              className="classes-hero-art"
            />
          </section>

          <section className="classes-overview" aria-label="Class overview">
            <div className="classes-overview-card blue">
              <div className="classes-overview-icon">
                <TeacherIcon name="classes" size={34} />
              </div>
              <div>
                <strong>{activeCount}</strong>
                <span>Active Classes</span>
              </div>
            </div>

            <div className="classes-overview-card green">
              <div className="classes-overview-icon">
                <TeacherIcon name="students" size={34} />
              </div>
              <div>
                <strong>{totalStudents}</strong>
                <span>Total Students</span>
              </div>
            </div>

            <div className="classes-overview-card purple">
              <div className="classes-overview-icon">
                <TeacherIcon name="progress" size={34} />
              </div>
              <div>
                <strong>{averageProgress}%</strong>
                <span>Average Progress Across Classes</span>
              </div>
            </div>

            <button className="create-class-button" type="button">
              <TeacherIcon name="plus" size={26} />
              <span>Create Class</span>
            </button>
          </section>

          <section className="classes-toolbar" aria-label="Class filters">
            <div className="class-tabs" role="tablist" aria-label="Class status">
              <button
                type="button"
                role="tab"
                aria-selected={activeTab === "all"}
                className={activeTab === "all" ? "is-active" : ""}
                onClick={() => setActiveTab("all")}
              >
                All Classes ({classes.length})
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={activeTab === "active"}
                className={activeTab === "active" ? "is-active" : ""}
                onClick={() => setActiveTab("active")}
              >
                Active ({activeCount})
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={activeTab === "archived"}
                className={activeTab === "archived" ? "is-active" : ""}
                onClick={() => setActiveTab("archived")}
              >
                Archived ({archivedCount})
              </button>
            </div>

            <div className="class-tools">
              <label className="class-search">
                <TeacherIcon name="search" size={24} />
                <input
                  type="search"
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search classes..."
                  aria-label="Search classes"
                />
              </label>

              <label className="class-sort">
                <span>Sort by:</span>
                <select
                  value={sortMode}
                  onChange={(event) => setSortMode(event.target.value as SortMode)}
                  aria-label="Sort classes"
                >
                  <option value="updated">Recently Updated</option>
                  <option value="name">Class Name</option>
                  <option value="progress">Progress</option>
                </select>
              </label>
            </div>
          </section>

          <section className="class-grid" aria-label="Classes">
            {filteredClasses.map((item) => (
              <ClassCard key={item.id} item={item} />
            ))}
          </section>

          {filteredClasses.length === 0 && (
            <section className="empty-classes">
              <TeacherIcon name="classes" size={36} />
              <h2>No classes found</h2>
              <p>Try a different search or filter.</p>
            </section>
          )}

          <footer className="teacher-page-footer">
            <span>© 2026 GrowAIs. All rights reserved.</span>
            <nav aria-label="Footer links">
              <a href="#">Privacy</a>
              <a href="#">Terms</a>
              <a href="#">Support</a>
            </nav>
          </footer>
        </div>
      </div>

      <style jsx global>{`
.classes-data-status {
  margin: 0 0 12px;
  padding: 9px 12px;
  border-radius: 10px;
  font-size: 12px;
  border: 1px solid #dfe7f1;
}
.classes-data-status.is-loading {
  color: #526992;
  background: #eef6ff;
}
.classes-data-status.is-error {
  color: #a74736;
  background: #fff1ee;
  border-color: #f3d3cb;
}
.teacher-classes-page-root {
  width: 100%;
  max-width: none;
  min-width: 0;
  padding: 20px 18px 28px;
  margin: 0;
  box-sizing: border-box;
}

/*
  TeacherShell already reserves the sidebar. The current route is receiving
  one additional left offset from the surrounding teacher layout, which is
  why the page starts roughly one sidebar-width too far to the right.
  Cancel that extra offset only for this page.
*/
@media (min-width: 1051px) {
  .teacher-classes-page-root {
    width: calc(100% + 280px);
    margin-left: -280px;
    margin-top: -155px;
  }
}

@media (min-width: 701px) and (max-width: 1050px) {
  .teacher-classes-page-root {
    width: calc(100% + 230px);
    margin-left: -230px;
    margin-top: -120px;
  }
}

.teacher-classes-shell {
  width: 100%;
  max-width: none;
  min-width: 0;
  margin: 0;
  box-sizing: border-box;
}

        .classes-hero {
          position: relative;
          min-height: 190px;
          overflow: hidden;
          border-radius: 18px;
          background: #e7f8f2;
          display: flex;
          align-items: center;
          padding: 30px 28px;
        }

        .classes-hero-copy {
          position: relative;
          z-index: 2;
          max-width: 56%;
        }

        .classes-hero-copy h1 {
          margin: 0 0 8px;
          color: #10165f;
          font-size: 43px;
          line-height: 1.02;
          letter-spacing: -1.6px;
        }

        .classes-hero-copy p {
          margin: 0;
          color: #344a80;
          font-size: 20px;
          line-height: 1.35;
        }

        .classes-hero-art {
          position: absolute;
          inset: 0 0 0 auto;
          width: 53%;
          height: 100%;
          object-fit: cover;
          object-position: right center;
        }

        .classes-overview {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr)) minmax(200px, .72fr);
          gap: 16px;
          margin-top: 16px;
        }

        .classes-overview-card {
          min-height: 100px;
          border-radius: 15px;
          padding: 16px;
          display: flex;
          align-items: center;
          gap: 16px;
          border: 1px solid rgba(222, 231, 242, .7);
        }

        .classes-overview-card.blue { background: #edf5ff; }
        .classes-overview-card.green { background: #ecfaf4; }
        .classes-overview-card.purple { background: #f5efff; }

        .classes-overview-icon {
          width: 60px;
          height: 60px;
          border-radius: 14px;
          display: grid;
          place-items: center;
          flex: 0 0 60px;
        }

        .blue .classes-overview-icon { background: #dcecff; color: #187cff; }
        .green .classes-overview-icon { background: #daf5e7; color: #0ba878; }
        .purple .classes-overview-icon { background: #eadcff; color: #7d3aed; }

        .classes-overview-card strong {
          display: block;
          color: #10165f;
          font-size: 30px;
          line-height: 1;
          font-weight: 800;
        }

        .classes-overview-card span {
          display: block;
          margin-top: 6px;
          color: #3d507f;
          font-size: 14px;
          line-height: 1.25;
        }

        .create-class-button {
          border: 0;
          border-radius: 14px;
          background: #08a97a;
          color: #fff;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          padding: 0 20px;
          font-size: 18px;
          font-weight: 800;
          cursor: pointer;
          box-shadow: 0 9px 20px rgba(8,169,122,.15);
        }

        .create-class-button:hover { background: #078f68; }

        .classes-toolbar {
          margin-top: 20px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 16px;
        }

        .class-tabs {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .class-tabs button {
          border: 0;
          border-radius: 13px;
          min-height: 46px;
          padding: 0 24px;
          background: #f2f5fa;
          color: #50608a;
          font: 600 16px/1.1 Inter, ui-sans-serif, system-ui, sans-serif;
          cursor: pointer;
        }

        .class-tabs button.is-active {
          background: #08a97a;
          color: #fff;
        }

        .class-tools {
          display: flex;
          align-items: center;
          gap: 14px;
        }

        .class-search,
        .class-sort {
          min-height: 46px;
          border: 1px solid #dce6f2;
          border-radius: 11px;
          background: #fff;
          display: flex;
          align-items: center;
        }

        .class-search {
          width: 340px;
          padding: 0 14px;
          gap: 10px;
          color: #50628e;
        }

        .class-search input {
          width: 100%;
          border: 0;
          outline: 0;
          background: transparent;
          color: #24366e;
          font-size: 15px;
        }

        .class-sort {
          padding: 0 12px 0 15px;
          gap: 5px;
          color: #667292;
        }

        .class-sort span { font-size: 14px; }

        .class-sort select {
          border: 0;
          outline: 0;
          background: transparent;
          color: #263a72;
          font-size: 15px;
          padding-right: 3px;
        }

        .class-grid {
          margin-top: 16px;
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
        }

        .class-grid > .class-card {
          min-width: 0;
          width: 100%;
        }


        .class-card {
          border: 1px solid #dfe8f4;
          border-radius: 16px;
          background: #fff;
          padding: 18px;
          display: grid;
          grid-template-columns: 106px 1fr;
          gap: 18px;
          min-height: 210px;
        }

        .class-card-image {
          width: 102px;
          height: 102px;
          border-radius: 12px;
          display: grid;
          place-items: center;
          overflow: hidden;
        }

        .class-card-image.green { background: #e8fbf3; }
        .class-card-image.blue { background: #e9f3ff; }
        .class-card-image.purple { background: #f2ebff; }
        .class-card-image.orange { background: #fff2e2; }

        .class-card-image img {
          display: block;
          width: 86%;
          height: 86%;
          max-width: 100%;
          max-height: 100%;
          object-fit: contain;
          object-position: center;
        }

        .class-card-body { min-width: 0; }

        .class-card-top {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 12px;
        }

        .class-card-top h2 {
          margin: 0;
          color: #10165f;
          font-size: 25px;
          line-height: 1.05;
          letter-spacing: -.5px;
        }

        .class-card-menu {
          border: 0;
          background: transparent;
          color: #23356e;
          font-size: 24px;
          cursor: pointer;
          line-height: 1;
        }

        .class-meta {
          margin-top: 8px;
          display: flex;
          flex-wrap: wrap;
          align-items: center;
          gap: 14px;
          color: #334a80;
          font-size: 14px;
        }

        .class-students {
          display: inline-flex;
          align-items: center;
          gap: 7px;
        }

        .class-status {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 7px 11px;
          border-radius: 999px;
          background: #e2f8ef;
          color: #06996f;
          font-weight: 700;
        }

        .class-status-dot {
          width: 9px;
          height: 9px;
          border-radius: 50%;
          background: #11ae7d;
        }

        .class-progress-label {
          margin-top: 14px;
          color: #3f4f7e;
          font-size: 14px;
        }

        .class-progress-row {
          margin-top: 6px;
          display: grid;
          grid-template-columns: 1fr 46px;
          align-items: center;
          gap: 12px;
        }

        .class-progress-track {
          height: 13px;
          border-radius: 999px;
          background: #e4eaf3;
          overflow: hidden;
        }

        .class-progress-fill {
          height: 100%;
          border-radius: inherit;
        }

        .class-progress-fill.green { background: #0ca67a; }
        .class-progress-fill.blue { background: #2180ff; }
        .class-progress-fill.purple { background: #7a4bee; }
        .class-progress-fill.orange { background: #ff8d2a; }

        .class-progress-value {
          text-align: right;
          color: #1e3170;
          font-size: 17px;
          font-weight: 700;
        }

        .class-card-footer {
          margin-top: 14px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
        }

        .class-last-activity {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          color: #59698e;
          font-size: 13px;
        }

        .class-view-link {
          min-height: 42px;
          padding: 0 20px;
          border: 1px solid #08a97a;
          border-radius: 11px;
          color: #078966;
          display: inline-flex;
          align-items: center;
          gap: 8px;
          text-decoration: none;
          font-weight: 800;
        }

        .class-view-link:hover {
          background: #effbf7;
        }

        .empty-classes {
          margin-top: 16px;
          border: 1px dashed #cbd9ea;
          border-radius: 16px;
          padding: 44px 20px;
          text-align: center;
          color: #6b7899;
          background: #fff;
        }

        .empty-classes h2 {
          margin: 10px 0 4px;
          color: #17215f;
        }

        .empty-classes p { margin: 0; }

        .teacher-page-footer {
          margin-top: 28px;
          border-top: 1px solid #e6ecf4;
          padding: 22px 0 18px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          color: #5b6a91;
          font-size: 13px;
        }

        .teacher-page-footer nav {
          display: flex;
          gap: 22px;
        }

        .teacher-page-footer a {
          color: #42537e;
          text-decoration: none;
        }

        .teacher-page-footer a:hover { text-decoration: underline; }

        @media (max-width: 1050px) {
          .classes-overview {
            grid-template-columns: repeat(2, minmax(0,1fr));
          }

          .create-class-button { min-height: 96px; }
          .classes-toolbar { flex-direction: column; align-items: stretch; }
          .class-tools { justify-content: stretch; }
          .class-search { flex: 1; width: auto; }
          .class-grid { grid-template-columns: 1fr; }
        }

        @media (max-width: 700px) {
          .teacher-classes-page-root {
            width: 100%;
            margin-left: 0;
            padding: 12px 12px 0;
          }

          .classes-hero {
            min-height: 202px;
            padding: 24px 20px;
            align-items: flex-start;
          }

          .classes-hero-copy {
            max-width: 46%;
            padding-top: 7px;
            z-index: 3;
          }

          .classes-hero-copy h1 {
            font-size: 31px;
            letter-spacing: -.8px;
          }

          .classes-hero-copy p {
            font-size: 16px;
            line-height: 1.35;
          }

          .classes-hero-art {
            width: 54%;
            object-position: right center;
          }

          .classes-overview {
            grid-template-columns: repeat(3, 1fr);
            gap: 10px;
          }

          .classes-overview-card {
            min-height: 112px;
            padding: 12px 9px;
            flex-direction: column;
            align-items: flex-start;
            gap: 8px;
          }

          .classes-overview-icon {
            width: 48px;
            height: 48px;
            flex-basis: 48px;
          }

          .classes-overview-card strong { font-size: 25px; }
          .classes-overview-card span { font-size: 12px; }

          .create-class-button {
            grid-column: 1 / -1;
            min-height: 58px;
            font-size: 17px;
          }

          .class-tabs {
            display: grid;
            grid-template-columns: repeat(3,1fr);
            gap: 8px;
          }

          .class-tabs button {
            min-height: 48px;
            padding: 0 7px;
            font-size: 14px;
          }

          .class-tools {
            width: 100%;
            display: grid;
            grid-template-columns: 1fr 52px;
          }

          .class-search {
            width: 100%;
          }

          .class-sort {
            width: 52px;
            justify-content: center;
            padding: 0;
          }

          .class-sort span,
          .class-sort select {
            position: absolute;
            width: 1px;
            height: 1px;
            overflow: hidden;
            clip: rect(0,0,0,0);
            white-space: nowrap;
          }

          .class-sort::before {
            content: "☷";
            color: #3d4f7e;
            font-size: 21px;
          }

          .class-card {
            grid-template-columns: 112px minmax(0, 1fr);
            min-height: 184px;
            padding: 14px;
            gap: 14px;
            overflow: hidden;
          }

          .class-card-image {
            width: 112px;
            height: 112px;
          }

          .class-card-top h2 {
            font-size: 23px;
          }

          .class-meta {
            gap: 7px;
            margin-top: 7px;
          }

          .class-status {
            padding: 5px 8px;
          }

          .class-progress-label {
            margin-top: 11px;
          }

          .class-progress-row {
            grid-template-columns: 1fr 42px;
          }

          .class-card-footer {
            margin-top: 10px;
          }

          .class-last-activity {
            font-size: 12px;
          }

          .class-view-link {
            display: none;
          }

          .class-card-menu {
            font-size: 22px;
          }

          .teacher-page-footer {
            display: none;
          }
        }
      `}</style>
    </TeacherShell>
  );
}

function ClassCard({ item }: { item: ClassItem }) {
  return (
    <article className="class-card">
      <div className={`class-card-image ${item.tone}`}>
        <img src={item.image} alt="" />
      </div>

      <div className="class-card-body">
        <div className="class-card-top">
          <h2>{item.name}</h2>
          <button
            className="class-card-menu"
            type="button"
            aria-label={`${item.name} options`}
          >
            ⋮
          </button>
        </div>

        <div className="class-meta">
          <span className="class-students">
            <TeacherIcon name="students" size={21} />
            {item.students} Students
          </span>
          <span className="class-status">
            <span className="class-status-dot" />
            {item.status}
          </span>
        </div>

        <div className="class-progress-label">Average Progress</div>

        <div className="class-progress-row">
          <div className="class-progress-track">
            <div
              className={`class-progress-fill ${item.tone}`}
              style={{ width: `${item.progress}%` }}
            />
          </div>
          <div className="class-progress-value">{item.progress}%</div>
        </div>

        <div className="class-card-footer">
          <span className="class-last-activity">
            <TeacherIcon name="clock" size={18} />
            Last activity: {item.lastActivity}
          </span>

          <Link
            href={`/teacher/classes/${item.id}`}
            className="class-view-link"
          >
            View Class
            <TeacherIcon name="chevron" size={18} />
          </Link>
        </div>
      </div>
    </article>
  );
}
