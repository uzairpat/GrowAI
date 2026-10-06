import type { ReactNode } from "react";

import TeacherIcon from "./TeacherIcon";

type Icon = Parameters<typeof TeacherIcon>[0]["name"];

export default function TeacherSectionCard({ title, icon, action, children }: { title:string; icon:Icon; action?:ReactNode; children:ReactNode }) {
  return <section className="teacher-card">
    <div className="teacher-card-title">
      <div className="teacher-card-title-left"><TeacherIcon name={icon} size={26}/><h2>{title}</h2></div>
      {action}
    </div>
    {children}
  </section>;
}
