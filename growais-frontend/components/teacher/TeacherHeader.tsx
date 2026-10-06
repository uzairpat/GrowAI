
"use client";
import Link from "next/link";
import { useState } from "react";
import TeacherIcon from "./TeacherIcon";

export type TeacherUser = {
  id: number;
  role: string;
  username: string;
  email: string | null;
  full_name: string;
};

export default function TeacherHeader({ user }: { user: TeacherUser | null }) {
  const [open, setOpen] = useState(false);
  const firstName = user?.full_name?.split(" ")[0] || "Sarah";
  const initials = (user?.full_name || "Sarah").split(" ").map((p) => p[0]).slice(0, 2).join("").toUpperCase();

  return (
    <header className="teacher-header">
      <div className="teacher-search-box">
        <TeacherIcon name="search" size={25} />
        <input placeholder="Search students, classes, lessons..." aria-label="Search students, classes, lessons" />
      </div>
      <div className="teacher-header-actions">
        <button className="teacher-header-icon" type="button" aria-label="Notifications">
          <TeacherIcon name="bell" size={28} />
          <span className="teacher-notification-dot" />
        </button>
        <div className="teacher-header-divider" />
        <div className="teacher-profile-wrap">
          <button type="button" className="teacher-profile" aria-expanded={open} aria-haspopup="menu" onClick={() => setOpen((v) => !v)}>
            <span className="teacher-avatar">{initials || firstName.charAt(0)}</span>
            <span className="teacher-profile-copy"><strong>Ms. {firstName}</strong><small>Teacher</small></span>
            <TeacherIcon name="chevron" size={19} />
          </button>
          {open && (
            <div className="teacher-profile-menu" role="menu">
              <div className="teacher-profile-menu-user"><strong>{user?.full_name || "Ms. Sarah"}</strong><small>Teacher</small></div>
              <Link href="/teacher/profile" role="menuitem">Profile</Link>
              <Link href="/teacher/settings" role="menuitem">Settings</Link>
              <Link href="/teacher/help" role="menuitem">Help</Link>
              <button type="button" role="menuitem" onClick={() => { window.location.href = "/login"; }}>Log Out</button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
