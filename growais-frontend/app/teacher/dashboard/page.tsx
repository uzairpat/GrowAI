
"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "../../../lib/api";

import Link from "next/link";
import TeacherIcon from "../../../components/teacher/TeacherIcon";
import TeacherStatCard from "../../../components/teacher/TeacherStatCard";
import TeacherSectionCard from "../../../components/teacher/TeacherSectionCard";
import TeacherProgressBar from "../../../components/teacher/TeacherProgressBar";

type DashboardClass = {
  id: number;
  name: string;
  students: number;
  progress: number;
  tone: "green" | "blue";
};

type DashboardActivity = {
  type: string;
  text: string;
  time: string;
};

type TeacherDashboardData = {
  user: {
    id: number;
    role: string;
    fullName?: string | null;
    username?: string | null;
    email?: string | null;
  };
  stats: {
    classes: number;
    totalStudents: number;
    assignedContent: number;
    averageCompletion: number;
  };
  classes: DashboardClass[];
  progress: {
    lessons: number;
    quizzes: number;
    scenarios: number;
    goals: number;
  };
  recentActivity: DashboardActivity[];
};

const emptyDashboard: TeacherDashboardData = {
  user: {
    id: 0,
    role: "teacher",
    fullName: "",
    username: "",
    email: ""
  },
  stats: {
    classes: 0,
    totalStudents: 0,
    assignedContent: 0,
    averageCompletion: 0
  },
  classes: [],
  progress: {
    lessons: 0,
    quizzes: 0,
    scenarios: 0,
    goals: 0
  },
  recentActivity: []
};

export default function TeacherDashboardPage() {
  const [dashboard, setDashboard] = useState<TeacherDashboardData>(emptyDashboard);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function loadDashboard() {
      try {
        setLoading(true);
        setError("");

        const data = await apiFetch("/api/teacher/dashboard");

        if (!cancelled) {
          setDashboard(data);
        }
      } catch (err) {
        console.error("Teacher dashboard API error:", err);
        if (!cancelled) {
          setError("Unable to load teacher dashboard.");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadDashboard();

    return () => {
      cancelled = true;
    };
  }, []);

  const teacherName =
    dashboard.user.fullName?.trim() ||
    dashboard.user.username?.trim() ||
    "Teacher";

  const classes = dashboard.classes.map((item, index) => ({
    ...item,
    tone: (index % 2 === 0 ? "green" : "blue") as "green" | "blue"
  }));

  return <div className="teacher-page"><div className="teacher-dashboard">
      {loading && (
        <div style={{
          marginBottom: 12,
          padding: "8px 12px",
          borderRadius: 10,
          background: "#eef7ff",
          color: "#58709a",
          fontSize: 12
        }}>
          Loading dashboard data…
        </div>
      )}
    <section className="teacher-hero">
      <div className="teacher-hero-overlay" />
      <div className="teacher-hero-copy"><h1>Good Morning, {teacherName}! 👋</h1><p>Here’s what’s happening with your classes today.</p></div>
      <img className="teacher-hero-art" src="/assets/teachers/teacher-dashboard-character.png" alt="Teacher using a tablet" />
    </section>

    <section className="teacher-stat-grid" aria-label="Teacher overview">
      <TeacherStatCard label="My Classes" value={String(dashboard.stats.classes)} sub="Active classes" tone="blue" icon="classes" />
      <TeacherStatCard label="Total Students" value={String(dashboard.stats.totalStudents)} sub="Across all classes" tone="green" icon="students" />
      <TeacherStatCard label="Assigned Content" value={String(dashboard.stats.assignedContent)} sub="Lessons, quizzes, scenarios" tone="purple" icon="content" />
      <TeacherStatCard label="Average Completion" value={`${dashboard.stats.averageCompletion}%`} sub="Across all classes" tone="yellow" icon="results" />
    </section>

    <section className="teacher-grid-2">
      <TeacherSectionCard title="My Classes" icon="classes" action={<Link href="/teacher/classes" className="teacher-card-link">View All →</Link>}>
        <div style={{overflowX:"auto"}}><table className="teacher-class-table"><thead><tr><th>Class Name</th><th>Students</th><th>Progress</th><th>Actions</th></tr></thead><tbody>{classes.map((item)=><tr key={item.id}><td>{item.name}</td><td>{item.students}</td><td><div className="teacher-progress-cell"><span>{item.progress}%</span><TeacherProgressBar value={item.progress} tone={item.tone}/></div></td><td><Link href={`/teacher/classes/${item.id}`} className="teacher-view-btn">View</Link></td></tr>)}</tbody></table></div>
      </TeacherSectionCard>

      <TeacherSectionCard title="Overall Student Progress" icon="progress" action={<Link href="/teacher/progress" className="teacher-card-link">View Details →</Link>}>
        <div className="teacher-progress-panel"><div
          className="teacher-donut"
          style={{
            background:
              dashboard.stats.averageCompletion > 0
                ? `conic-gradient(#0ca978 0 ${dashboard.stats.averageCompletion}%, #dfe6ef ${dashboard.stats.averageCompletion}% 100%)`
                : "#dfe6ef"
          }}
        ><div className="teacher-donut-center"><strong>{dashboard.stats.averageCompletion}%</strong><span>Average<br/>Completion</span></div></div><div className="teacher-breakdown"><div className="teacher-breakdown-row"><span className="teacher-breakdown-label"><i className="teacher-dot"/>Lessons</span><strong>{dashboard.progress.lessons}%</strong></div><div className="teacher-breakdown-row"><span className="teacher-breakdown-label"><i className="teacher-dot blue"/>Quizzes</span><strong>{dashboard.progress.quizzes}%</strong></div><div className="teacher-breakdown-row"><span className="teacher-breakdown-label"><i className="teacher-dot purple"/>Scenarios</span><strong>{dashboard.progress.scenarios}%</strong></div><div className="teacher-breakdown-row"><span className="teacher-breakdown-label"><i className="teacher-dot yellow"/>Goals</span><strong>{dashboard.progress.goals}%</strong></div></div></div>
      </TeacherSectionCard>
    </section>

    <section className="teacher-bottom-grid">
      <TeacherSectionCard title="Recent Activity" icon="clock" action={<a className="teacher-card-link" href="#">View All →</a>}>
        <div className="teacher-activity-list">
          {dashboard.recentActivity.length > 0 ? (
            dashboard.recentActivity.map((activity, index) => (
              <div className="teacher-activity-row" key={`${activity.type}-${activity.time}-${index}`}>
                <div className={`teacher-activity-icon ${index % 4 === 0 ? "green" : index % 4 === 1 ? "blue" : index % 4 === 2 ? "purple" : "orange"}`}>
                  <TeacherIcon
                    name={
                      activity.type.toLowerCase().includes("quiz")
                        ? "content"
                        : activity.type.toLowerCase().includes("scenario")
                        ? "game"
                        : activity.type.toLowerCase().includes("assignment")
                        ? "content"
                        : index % 2 === 0
                        ? "check"
                        : "person"
                    }
                    size={19}
                  />
                </div>
                <div className="teacher-activity-text">{activity.text}</div>
                <div className="teacher-activity-time">{activity.time}</div>
              </div>
            ))
          ) : (
            <div className="teacher-activity-row">
              <div className="teacher-activity-text">
                {loading ? "Loading recent activity…" : "No recent activity yet."}
              </div>
            </div>
          )}
        </div>
      </TeacherSectionCard>

      <TeacherSectionCard title="Quick Actions" icon="bolt">
        <div className="teacher-quick-grid"><Link href="/teacher/assign-content" className="teacher-quick-card green"><div className="teacher-quick-icon"><TeacherIcon name="plus" size={28}/></div><div><strong>Assign Content</strong><span>Lessons, quizzes, scenarios</span></div><span className="teacher-quick-arrow"><TeacherIcon name="chevron" size={20}/></span></Link><Link href="/teacher/classes" className="teacher-quick-card blue"><div className="teacher-quick-icon"><TeacherIcon name="students" size={28}/></div><div><strong>View Classes</strong><span>Manage your classes</span></div><span className="teacher-quick-arrow"><TeacherIcon name="chevron" size={20}/></span></Link><Link href="/teacher/results" className="teacher-quick-card purple"><div className="teacher-quick-icon"><TeacherIcon name="results" size={28}/></div><div><strong>View Results</strong><span>Quiz & scenario results</span></div><span className="teacher-quick-arrow"><TeacherIcon name="chevron" size={20}/></span></Link><Link href="/teacher/students" className="teacher-quick-card orange"><div className="teacher-quick-icon"><TeacherIcon name="person" size={28}/></div><div><strong>Manage Students</strong><span>View and support students</span></div><span className="teacher-quick-arrow"><TeacherIcon name="chevron" size={20}/></span></Link></div>
      </TeacherSectionCard>
    </section>
  </div></div>;
}
