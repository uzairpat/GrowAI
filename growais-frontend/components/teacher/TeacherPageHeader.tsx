import type { ReactNode } from "react";

export default function TeacherPageHeader({ eyebrow, title, description, action }: { eyebrow?:string; title:string; description?:string; action?:ReactNode }) {
  return <div className="teacher-page-header">
    <div><div className="teacher-page-header-eyebrow">{eyebrow}</div><h1>{title}</h1>{description && <p>{description}</p>}</div>
    {action}
  </div>;
}
