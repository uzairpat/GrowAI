"use client";

type IconName =
  | "dashboard" | "classes" | "content" | "assign" | "students" | "progress" | "results"
  | "bell" | "settings" | "help" | "logout" | "search" | "chevron" | "plus"
  | "clock" | "check" | "document" | "game" | "person" | "bolt";

export default function TeacherIcon({ name, size = 22 }: { name: IconName; size?: number }) {
  const common = {
    width: size, height: size, viewBox: "0 0 24 24", fill: "none",
    stroke: "currentColor", strokeWidth: 1.9,
    strokeLinecap: "round" as const, strokeLinejoin: "round" as const,
    "aria-hidden": true,
  };
  switch (name) {
    case "dashboard": return <svg {...common}><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>;
    case "classes": return <svg {...common}><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/></svg>;
    case "content": return <svg {...common}><path d="M4 4.5A2.5 2.5 0 0 1 6.5 2H20v18H6.5A2.5 2.5 0 0 1 4 17.5z"/><path d="M4 4.5V18a2 2 0 0 0 2 2M8 6h8M8 10h8M8 14h6"/></svg>;
    case "assign": return <svg {...common}><rect x="5" y="3" width="14" height="18" rx="2"/><path d="M9 3.5h6M9 8h6M9 12h6M9 16h4"/></svg>;
    case "students": return <svg {...common}><circle cx="9" cy="8" r="3"/><circle cx="17" cy="9" r="2.5"/><path d="M3.5 20a5.5 5.5 0 0 1 11 0M14 19a4.5 4.5 0 0 1 7 0"/></svg>;
    case "progress": return <svg {...common}><path d="M4 20V10M10 20V4M16 20v-7M22 20V7"/></svg>;
    case "results": return <svg {...common}><rect x="4" y="3" width="16" height="18" rx="2"/><path d="M8 8h8M8 12h8M8 16h5"/></svg>;
    case "bell": return <svg {...common}><path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9"/><path d="M10 21h4"/></svg>;
    case "settings": return <svg {...common}><path d="M12 15.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7z"/><path d="M19.4 15a1.7 1.7 0 0 0 .34 1.88l.06.06-1.41 1.41-.06-.06a1.7 1.7 0 0 0-1.88-.34 1.7 1.7 0 0 0-1.03 1.56V19.6h-2v-.09a1.7 1.7 0 0 0-1.03-1.56 1.7 1.7 0 0 0-1.88.34l-.06.06-1.41-1.41.06-.06A1.7 1.7 0 0 0 9.48 15a1.7 1.7 0 0 0-1.56-1.03H7.8v-2h.12A1.7 1.7 0 0 0 9.48 11a1.7 1.7 0 0 0-.34-1.88l-.06-.06 1.41-1.41.06.06a1.7 1.7 0 0 0 1.88.34 1.7 1.7 0 0 0 1.03-1.56V6.4h2v.09a1.7 1.7 0 0 0 1.03 1.56 1.7 1.7 0 0 0 1.88-.34l.06-.06 1.41 1.41-.06.06A1.7 1.7 0 0 0 19.4 11a1.7 1.7 0 0 0 1.56 1.03h.12v2h-.12A1.7 1.7 0 0 0 19.4 15z"/></svg>;
    case "help": return <svg {...common}><circle cx="12" cy="12" r="9"/><path d="M9.6 9a2.4 2.4 0 1 1 4.1 1.7c-.9.9-1.7 1.2-1.7 2.8"/><path d="M12 17h.01"/></svg>;
    case "logout": return <svg {...common}><path d="M10 17l5-5-5-5M15 12H3"/><path d="M13 5V3h8v18h-8v-2"/></svg>;
    case "search": return <svg {...common}><circle cx="11" cy="11" r="6.5"/><path d="M16 16l5 5"/></svg>;
    case "chevron": return <svg {...common}><path d="m9 6 6 6-6 6"/></svg>;
    case "plus": return <svg {...common}><path d="M12 5v14M5 12h14"/></svg>;
    case "clock": return <svg {...common}><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>;
    case "check": return <svg {...common}><path d="m5 12 4 4L19 6"/></svg>;
    case "document": return <svg {...common}><path d="M5 3h10l4 4v14H5z"/><path d="M15 3v5h5M8 12h8M8 16h5"/></svg>;
    case "game": return <svg {...common}><path d="M8 8h8M10 12v4M8 14h4M17 13h.01M20 13h.01"/><path d="M7 6h10a4 4 0 0 1 3.7 5.5l-1.4 3.3A3 3 0 0 1 16.5 17H7.5a3 3 0 0 1-2.8-2.2l-1.4-3.3A4 4 0 0 1 7 6z"/></svg>;
    case "person": return <svg {...common}><circle cx="12" cy="8" r="3"/><path d="M5 20a7 7 0 0 1 14 0"/></svg>;
    case "bolt": return <svg {...common}><path d="M13 2 4 14h6l-1 8 9-12h-6z"/></svg>;
    default: return null;
  }
}
