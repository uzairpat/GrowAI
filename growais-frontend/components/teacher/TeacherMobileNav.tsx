
"use client";
import Link from "next/link";
import { useState } from "react";
import { usePathname } from "next/navigation";
import TeacherIcon from "./TeacherIcon";

export default function TeacherMobileNav() {
  const pathname = usePathname();
  const [moreOpen, setMoreOpen] = useState(false);
  return (
    <>
      {moreOpen && (
        <div className="teacher-mobile-more-panel">
          <Link href="/teacher/results"><TeacherIcon name="results" size={19} /> Results</Link>
          <Link href="/teacher/students"><TeacherIcon name="students" size={19} /> Students</Link>
          <Link href="/teacher/settings"><TeacherIcon name="settings" size={19} /> Settings</Link>
          <Link href="/teacher/help"><TeacherIcon name="help" size={19} /> Help</Link>
          <button type="button" onClick={() => { window.location.href = "/login"; }}><TeacherIcon name="logout" size={19} /> Log Out</button>
        </div>
      )}
      <nav className="teacher-mobile-nav" aria-label="Teacher mobile navigation">
        <Link href="/teacher/dashboard" className={pathname === "/teacher/dashboard" ? "is-active" : ""}><TeacherIcon name="dashboard" size={24} /><span>Dashboard</span></Link>
        <Link href="/teacher/classes" className={pathname === "/teacher/classes" || pathname.startsWith("/teacher/classes/") ? "is-active" : ""}><TeacherIcon name="classes" size={24} /><span>Classes</span></Link>
        <Link href="/teacher/content" className={pathname === "/teacher/content" ? "is-active" : ""}><TeacherIcon name="content" size={24} /><span>Content</span></Link>
        <Link href="/teacher/progress" className={pathname === "/teacher/progress" ? "is-active" : ""}><TeacherIcon name="progress" size={24} /><span>Progress</span></Link>
        <button type="button" onClick={() => setMoreOpen((v) => !v)} aria-expanded={moreOpen}><span className="teacher-more-icon">☰</span><span>More</span></button>
      </nav>
    </>
  );
}
