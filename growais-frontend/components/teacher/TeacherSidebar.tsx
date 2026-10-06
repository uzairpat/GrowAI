
"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import TeacherIcon from "./TeacherIcon";

const primaryNav = [
  ["Dashboard", "/teacher/dashboard", "dashboard"],
  ["My Classes", "/teacher/classes", "classes"],
  ["Content Library", "/teacher/content", "content"],
  ["Assign Content", "/teacher/assign-content", "assign"],
  ["Students", "/teacher/students", "students"],
  ["Progress", "/teacher/progress", "progress"],
  ["Results", "/teacher/results", "results"],
] as const;

const secondaryNav = [
  ["Notifications", "#", "bell"],
  ["Settings", "/teacher/settings", "settings"],
  ["Help", "/teacher/help", "help"],
] as const;

export default function TeacherSidebar() {
  const pathname = usePathname();

  return (
    <aside className="teacher-sidebar">
      <div className="teacher-logo-area">
        <Link href="/teacher/dashboard" className="teacher-logo-link" aria-label="GrowAIs teacher dashboard">
          <img src="/assets/logo.png" alt="GrowAIs" className="teacher-logo" />
        </Link>
      </div>
      <nav className="teacher-nav" aria-label="Teacher navigation">
        {primaryNav.map(([label, href, icon]) => (
          <Link key={label} href={href} className={`teacher-nav-item ${pathname === href || (href !== "/teacher/dashboard" && pathname.startsWith(`${href}/`)) ? "is-active" : ""}`}>
            <TeacherIcon name={icon} size={23} /><span>{label}</span>
          </Link>
        ))}
      </nav>
      <div className="teacher-nav-divider" />
      <nav className="teacher-nav teacher-nav-secondary" aria-label="Secondary navigation">
        {secondaryNav.map(([label, href, icon]) => (
          <Link key={label} href={href} className="teacher-nav-item"><TeacherIcon name={icon} size={23} /><span>{label}</span></Link>
        ))}
        <button type="button" className="teacher-nav-item teacher-nav-button" onClick={() => { window.location.href = "/login"; }}>
          <TeacherIcon name="logout" size={23} /><span>Log Out</span>
        </button>
      </nav>
      <div className="teacher-sidebar-promo" aria-hidden="true">
        <div className="teacher-sidebar-copy"><strong>Empower</strong><strong>Students.</strong><strong>Brighter Futures.</strong></div>
        <img src="/assets/teachers/teacher-dashboard-scene-and-plant.png" alt="" />
      </div>
    </aside>
  );
}
