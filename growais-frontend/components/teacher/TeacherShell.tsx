"use client";
import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import { apiFetch } from "../../lib/api";
import TeacherHeader, { TeacherUser } from "./TeacherHeader";
import TeacherSidebar from "./TeacherSidebar";
import TeacherMobileNav from "./TeacherMobileNav";

export default function TeacherShell({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<TeacherUser | null>(null);
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const data = await apiFetch("/api/auth/me");
        if (!cancelled && data?.user) setUser(data.user);
      } catch {
        if (!cancelled) setUser(null);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  return (
    <>
      <div className="teacher-app-shell">
        <TeacherSidebar />
        <TeacherHeader user={user} />
        <main className="teacher-main">{children}</main>
        <TeacherMobileNav />
      </div>
      <style jsx global>{`
        :root {
          --teacher-navy: #131a63;
          --teacher-text: #253878;
          --teacher-muted: #7280a5;
          --teacher-border: #e4ebf5;
          --teacher-green: #08a97a;
          --teacher-blue: #1976ff;
          --teacher-purple: #7c3aed;
          --teacher-yellow: #f8b21b;
        }

        * { box-sizing: border-box; }

        body { margin: 0; background: #f8fbff; color: var(--teacher-navy); }

        .teacher-app-shell { min-height: 100vh; }
        .teacher-sidebar {
          position: fixed; inset: 0 auto 0 0; width: 280px; height: 100vh;
          background: #fff; border-right: 1px solid var(--teacher-border);
          display: flex; flex-direction: column; z-index: 100;
          overflow-y: auto; overflow-x: hidden; scrollbar-width: thin;
        }
        .teacher-logo-area { height: 88px; flex: 0 0 88px; display:flex; align-items:center; padding: 12px 25px; border-bottom:1px solid #eef2f7; }
        .teacher-logo-link { display:flex; align-items:center; width:100%; }
        .teacher-logo { width:205px; height:auto; display:block; }
        .teacher-nav { padding: 18px 17px 8px; }
        .teacher-nav-secondary { padding-top: 14px; }
        .teacher-nav-item {
          width:100%; min-height:52px; margin-bottom:6px; padding:0 20px; border:0; border-radius:12px;
          display:flex; align-items:center; gap:18px; text-decoration:none; color:#4c5b82; background:transparent;
          font:600 16px/1.15 Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
          cursor:pointer;
        }
        .teacher-nav-item:hover { background:#f0faf7; color:#0a9d76; }
        .teacher-nav-item.is-active { background:#dff6ee; color:#008f70; }
        .teacher-nav-button { text-align:left; }
        .teacher-nav-divider { height:1px; background:#e6ebf2; margin:6px 24px; }
        .teacher-sidebar-promo { margin-top:auto; position:relative; min-height:145px; overflow:hidden; padding:0 18px 18px 28px; display:flex; align-items:flex-end; }
        .teacher-sidebar-copy { position:relative; z-index:2; display:flex; flex-direction:column; color:var(--teacher-navy); font-size:15px; line-height:1.25; }
        .teacher-sidebar-promo img { position:absolute; right:-18px; bottom:-18px; width:145px; height:145px; object-fit:cover; object-position: right bottom; opacity:.95; }

        .teacher-header {
          position:fixed; left:280px; right:0; top:0; height:88px; background:#fff;
          border-bottom:1px solid var(--teacher-border); display:flex; align-items:center; justify-content:space-between;
          padding:0 32px; z-index:90;
        }
        .teacher-search-box { width:min(530px,52vw); height:48px; display:flex; align-items:center; gap:12px; padding:0 18px; background:#f3f6fb; border-radius:12px; color:#53658c; }
        .teacher-search-box input { width:100%; border:0; outline:0; background:transparent; color:var(--teacher-text); font-size:15px; }
        .teacher-search-box input::placeholder { color:#7b89aa; }
        .teacher-header-actions { display:flex; align-items:center; gap:20px; }
        .teacher-header-icon { position:relative; width:40px; height:40px; padding:0; border:0; background:transparent; color:#3b4f7b; cursor:pointer; display:grid; place-items:center; }
        .teacher-notification-dot { position:absolute; top:5px; right:1px; width:9px; height:9px; border-radius:50%; background:#f34d4d; border:2px solid #fff; }
        .teacher-header-divider { width:1px; height:42px; background:#e4eaf2; }
        .teacher-profile-wrap { position:relative; }
        .teacher-profile { border:0; background:transparent; display:flex; align-items:center; gap:12px; cursor:pointer; padding:4px; color:inherit; }
        .teacher-avatar { width:46px; height:46px; border-radius:50%; background:#08a97a; color:#fff; display:grid; place-items:center; font-weight:800; font-size:17px; }
        .teacher-profile-copy { display:flex; flex-direction:column; align-items:flex-start; gap:2px; }
        .teacher-profile-copy strong { color:var(--teacher-navy); font-size:16px; }
        .teacher-profile-copy small { color:var(--teacher-text); font-size:13px; }
        .teacher-profile-menu { position:absolute; top:calc(100% + 10px); right:0; width:205px; background:#fff; border:1px solid #e2e8f1; border-radius:14px; padding:8px; box-shadow:0 16px 34px rgba(24,45,90,.12); }
        .teacher-profile-menu-user { display:flex; flex-direction:column; gap:2px; padding:10px 12px 12px; border-bottom:1px solid #edf1f5; margin-bottom:5px; }
        .teacher-profile-menu-user strong { font-size:14px; color:var(--teacher-navy); }
        .teacher-profile-menu-user small { font-size:12px; color:#7380a1; }
        .teacher-profile-menu a, .teacher-profile-menu button { display:flex; align-items:center; width:100%; min-height:40px; border:0; border-radius:9px; padding:0 12px; background:transparent; color:var(--teacher-text); text-decoration:none; font:500 14px/1.1 Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; cursor:pointer; text-align:left; }
        .teacher-profile-menu a:hover, .teacher-profile-menu button:hover { background:#f0faf7; }

        .teacher-main { margin-left:280px; padding-top:88px; min-height:100vh; }
        .teacher-page { padding:20px 18px 28px; }
        .teacher-dashboard { max-width: 1400px; margin:0 auto; }

        .teacher-hero { position:relative; min-height:178px; border-radius:18px; overflow:hidden; background:#e6f8f1; padding:30px 28px; display:flex; align-items:center; }
        .teacher-hero-copy { position:relative; z-index:2; max-width:60%; }
        .teacher-hero-copy h1 { margin:0 0 6px; color:#11165f; font-size:44px; line-height:1.05; letter-spacing:-1.5px; }
        .teacher-hero-copy p { margin:0; color:#334a80; font-size:20px; }
        .teacher-hero-art { position:absolute; top:0; right:0; width:55%; height:100%; object-fit:contain; object-position:right center; }
        .teacher-hero-overlay { position:absolute; inset:0; background:linear-gradient(90deg, rgba(230,248,241,.95) 0%, rgba(230,248,241,.76) 43%, rgba(230,248,241,.15) 71%, rgba(230,248,241,0) 100%); z-index:1; }

        .teacher-stat-grid { display:grid; grid-template-columns:repeat(4, minmax(0,1fr)); gap:16px; margin-top:16px; }
        .teacher-stat-card { border-radius:16px; min-height:116px; padding:16px; display:grid; grid-template-columns:56px 1fr 20px; align-items:center; gap:12px; border:1px solid rgba(220,229,241,.55); }
        .teacher-stat-icon { width:56px; height:56px; border-radius:14px; display:grid; place-items:center; }
        .teacher-stat-card.blue { background:#edf5ff; } .teacher-stat-card.blue .teacher-stat-icon { background:#dcecff; color:#187cff; }
        .teacher-stat-card.green { background:#ecfaf4; } .teacher-stat-card.green .teacher-stat-icon { background:#dbf5e7; color:#0aa878; }
        .teacher-stat-card.purple { background:#f5efff; } .teacher-stat-card.purple .teacher-stat-icon { background:#eadcff; color:#8038ea; }
        .teacher-stat-card.yellow { background:#fff8e8; } .teacher-stat-card.yellow .teacher-stat-icon { background:#ffefc7; color:#f3a917; }
        .teacher-stat-label { font-weight:700; color:#11165f; font-size:14px; }
        .teacher-stat-value { margin-top:6px; color:#10155f; font-size:29px; font-weight:800; line-height:1; }
        .teacher-stat-sub { margin-top:6px; color:#445786; font-size:13px; }
        .teacher-stat-arrow { color:#2a76e8; }

        .teacher-grid-2 { display:grid; grid-template-columns:1.08fr .92fr; gap:16px; margin-top:16px; }
        .teacher-card { border:1px solid #e0e8f3; border-radius:17px; background:#fff; padding:18px 20px; }
        .teacher-card-title { display:flex; align-items:center; justify-content:space-between; gap:12px; margin-bottom:14px; }
        .teacher-card-title-left { display:flex; align-items:center; gap:12px; }
        .teacher-card-title h2 { margin:0; color:#11165f; font-size:20px; }
        .teacher-card-link { color:#0f70e8; font-weight:700; text-decoration:underline; font-size:14px; }

        .teacher-class-table { width:100%; border-collapse:collapse; }
        .teacher-class-table th, .teacher-class-table td { padding:9px 10px; border-bottom:1px solid #edf1f6; text-align:left; font-size:13px; }
        .teacher-class-table th { background:#f4f7fb; color:#40517e; font-weight:700; }
        .teacher-class-table td { color:#22366f; }
        .teacher-class-table td:first-child { font-weight:800; color:#142064; }
        .teacher-progress-cell { display:flex; align-items:center; gap:10px; }
        .teacher-progress-track { flex:1; max-width:155px; height:10px; background:#e6edf6; border-radius:999px; overflow:hidden; }
        .teacher-progress-fill { height:100%; border-radius:999px; background:#12ae7d; }
        .teacher-progress-fill.blue { background:#2180ff; }
        .teacher-view-btn { border:0; background:#eef6ff; color:#1675ea; border-radius:11px; padding:7px 14px; font-weight:700; cursor:pointer; }

        .teacher-progress-panel { display:grid; grid-template-columns:1fr 1fr; align-items:center; gap:20px; min-height:225px; }
        .teacher-donut { width:196px; height:196px; border-radius:50%; background:conic-gradient(#08a97a 0 64%, #dce4ef 64% 100%); display:grid; place-items:center; position:relative; margin:auto; }
        .teacher-donut::after { content:""; width:132px; height:132px; border-radius:50%; background:#fff; position:absolute; }
        .teacher-donut-center { position:relative; z-index:2; text-align:center; color:#11165f; }
        .teacher-donut-center strong { display:block; font-size:28px; }
        .teacher-donut-center span { color:#50608a; font-size:13px; }
        .teacher-breakdown { display:flex; flex-direction:column; gap:12px; }
        .teacher-breakdown-row { display:flex; align-items:center; justify-content:space-between; border-bottom:1px solid #edf1f6; padding-bottom:10px; color:#2a3c73; font-size:13px; }
        .teacher-breakdown-label { display:flex; align-items:center; gap:9px; }
        .teacher-dot { width:10px; height:10px; border-radius:50%; background:#0aa878; } .teacher-dot.blue{background:#2180ff}.teacher-dot.purple{background:#7c3aed}.teacher-dot.yellow{background:#f4ae15}

        .teacher-bottom-grid { display:grid; grid-template-columns:1.02fr .98fr; gap:16px; margin-top:16px; }
        .teacher-activity-list { display:flex; flex-direction:column; }
        .teacher-activity-row { display:grid; grid-template-columns:40px 1fr auto; gap:12px; align-items:center; padding:10px 0; border-bottom:1px solid #edf1f6; }
        .teacher-activity-icon { width:34px; height:34px; border-radius:11px; display:grid; place-items:center; }
        .teacher-activity-icon.green{background:#e3f7ee;color:#10a97d}.teacher-activity-icon.blue{background:#e6f1ff;color:#2580f6}.teacher-activity-icon.purple{background:#efe7ff;color:#7b3be7}.teacher-activity-icon.orange{background:#fff0db;color:#f28a18}
        .teacher-activity-text { color:#2a3c73; font-size:13px; }
        .teacher-activity-time { color:#7d89a6; font-size:12px; white-space:nowrap; }
        .teacher-quick-grid { display:grid; grid-template-columns:1fr 1fr; gap:12px; }
        .teacher-quick-card { min-height:88px; border-radius:14px; padding:14px; display:grid; grid-template-columns:46px 1fr 20px; align-items:center; gap:10px; text-decoration:none; }
        .teacher-quick-card.green{background:#eaf9f1}.teacher-quick-card.blue{background:#edf5ff}.teacher-quick-card.purple{background:#f5efff}.teacher-quick-card.orange{background:#fff1e5}
        .teacher-quick-icon { width:46px; height:46px; border-radius:13px; display:grid; place-items:center; background:#fff; }
        .teacher-quick-card.green .teacher-quick-icon{color:#0aa878}.teacher-quick-card.blue .teacher-quick-icon{color:#2180ff}.teacher-quick-card.purple .teacher-quick-icon{color:#7c3aed}.teacher-quick-card.orange .teacher-quick-icon{color:#f08a18}
        .teacher-quick-card strong { color:#13205f; font-size:14px; }
        .teacher-quick-card span { display:block; margin-top:5px; color:#53628a; font-size:12px; }
        .teacher-quick-arrow { color:#1876ff; }

        .teacher-mobile-more-panel {
          display:none;
        }

        .teacher-mobile-nav { display:none; }

        @media (max-width: 1050px) {
          .teacher-sidebar { width:230px; }
          .teacher-header { left:230px; }
          .teacher-main { margin-left:230px; }
          .teacher-stat-grid { grid-template-columns:repeat(2,1fr); }
          .teacher-grid-2,.teacher-bottom-grid { grid-template-columns:1fr; }
        }

        @media (max-width: 700px) {
          .teacher-sidebar { display:none; }
          .teacher-header { position:fixed; left:0; right:0; height:64px; padding:0 12px; }
          .teacher-search-box { flex:1; width:auto; min-width:0; height:42px; padding:0 10px; gap:7px; }
          .teacher-search-box input { font-size:11px; }
          .teacher-header-actions { gap:8px; }
          .teacher-header-icon, .teacher-header-divider, .teacher-profile-copy { display:none; }
          .teacher-profile { padding:0; }
          .teacher-avatar { width:38px; height:38px; font-size:14px; }
          .teacher-profile svg { display:none; }
          .teacher-profile-menu { position:fixed; top:70px; right:10px; width:195px; }
          .teacher-main { margin-left:0; padding-top:64px; padding-bottom:84px; }
          .teacher-page { padding:12px; }
          .teacher-hero { min-height:182px; padding:22px 20px; }
          .teacher-hero-copy { max-width:56%; }
          .teacher-hero-copy h1 { font-size:29px; line-height:1.04; letter-spacing:-.7px; }
          .teacher-hero-copy p { font-size:15px; line-height:1.35; }
          .teacher-hero-art { object-position:72% center; }
          .teacher-hero-overlay { background:linear-gradient(90deg, rgba(230,248,241,.97) 0%, rgba(230,248,241,.82) 51%, rgba(230,248,241,.16) 86%, rgba(230,248,241,0) 100%); }
          .teacher-stat-grid { grid-template-columns:1fr 1fr; gap:10px; }
          .teacher-stat-card { min-height:103px; grid-template-columns:44px 1fr; padding:12px; }
          .teacher-stat-icon { width:44px; height:44px; border-radius:12px; }
          .teacher-stat-arrow { display:none; }
          .teacher-stat-value { font-size:24px; }
          .teacher-stat-label { font-size:12px; }
          .teacher-stat-sub { font-size:11px; }
          .teacher-card { padding:15px; }
          .teacher-card-title h2 { font-size:19px; }
          .teacher-class-table th:nth-child(2), .teacher-class-table td:nth-child(2) { display:none; }
          .teacher-class-table th, .teacher-class-table td { padding:9px 7px; font-size:12px; }
          .teacher-progress-track { max-width:110px; }
          .teacher-progress-panel { grid-template-columns:1fr; gap:10px; }
          .teacher-donut { width:170px; height:170px; }
          .teacher-donut::after { width:114px; height:114px; }
          .teacher-activity-row { grid-template-columns:38px 1fr auto; }
          .teacher-activity-text { font-size:12px; }
          .teacher-activity-time { font-size:11px; }
          .teacher-quick-grid { grid-template-columns:1fr 1fr; gap:10px; }
          .teacher-quick-card { min-height:94px; grid-template-columns:38px 1fr; padding:11px; }
          .teacher-quick-card .teacher-quick-arrow { display:none; }
          .teacher-quick-icon { width:38px; height:38px; border-radius:11px; }
          .teacher-quick-card strong { font-size:12px; }
          .teacher-quick-card span { font-size:10px; line-height:1.25; }
          .teacher-mobile-more-panel {
            position:fixed;
            right:10px;
            bottom:80px;
            width:210px;
            background:#fff;
            border:1px solid #e0e7f1;
            border-radius:14px;
            box-shadow:0 14px 32px rgba(31,55,92,.15);
            padding:8px;
            z-index:3100;
          }
          .teacher-mobile-more-panel a, .teacher-mobile-more-panel button {
            width:100%; min-height:42px; display:flex; align-items:center; gap:10px;
            border:0; background:transparent; color:#263b74; text-decoration:none;
            border-radius:9px; padding:0 11px; font:600 13px/1 Inter, ui-sans-serif, system-ui, sans-serif;
            cursor:pointer; text-align:left;
          }
          .teacher-mobile-more-panel a:hover, .teacher-mobile-more-panel button:hover { background:#f0faf7; color:#008f70; }

          .teacher-mobile-nav { position:fixed; left:0; right:0; bottom:0; height:72px; background:#fff; border-top:1px solid #dfe7f1; display:grid; grid-template-columns:repeat(5,1fr); z-index:3000; padding:6px 4px 4px; box-shadow:0 -7px 20px rgba(37,61,100,.08); }
          .teacher-mobile-nav a, .teacher-mobile-nav button { border:0; background:transparent; text-decoration:none; color:#495a82; display:flex; flex-direction:column; align-items:center; justify-content:center; gap:4px; font:600 10px/1 Inter, ui-sans-serif, system-ui, sans-serif; }
          .teacher-mobile-nav a.is-active { color:#08a97a; background:#e1f7ef; border-radius:12px; }
          .teacher-more-icon { font-size:23px; line-height:1; }
        }
      `}</style>
    </>
  );
}
