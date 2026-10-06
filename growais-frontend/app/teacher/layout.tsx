import type { ReactNode } from "react";
import TeacherShell from "../../components/teacher/TeacherShell";

export default function TeacherLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return <TeacherShell>{children}</TeacherShell>;
}
