"use client";

import { useEffect, useState, type ReactNode } from "react";
import { usePathname, useRouter } from "next/navigation";
import { apiFetch } from "../../lib/api";

type AuthUser = {
  id: number;
  name?: string | null;
  username?: string | null;
  email?: string | null;
  role?: string | null;
};

type AuthMeResponse = {
  user?: AuthUser;
};

type Props = {
  children: ReactNode;
};

export default function TeacherRouteGuard({ children }: Props) {
  const router = useRouter();
  const pathname = usePathname();

  const [status, setStatus] = useState<"checking" | "allowed" | "redirecting">(
    "checking"
  );

  useEffect(() => {
    let cancelled = false;

    async function checkTeacherSession() {
      try {
        const data = (await apiFetch("/api/auth/me")) as AuthMeResponse;
        const user = data?.user;

        if (cancelled) return;

        if (!user) {
          setStatus("redirecting");
          router.replace(`/login?next=${encodeURIComponent(pathname || "/teacher/dashboard")}`);
          return;
        }

        const role = user.role;

        if (role === "teacher" || role === "school_admin") {
          setStatus("allowed");
          return;
        }

        // A logged-in student/admin must not enter the teacher portal.
        if (role === "student") {
          setStatus("redirecting");
          router.replace("/student/dashboard");
          return;
        }

        if (role === "platform_admin") {
          setStatus("redirecting");
          router.replace("/admin/dashboard");
          return;
        }

        setStatus("redirecting");
        router.replace("/login");
      } catch {
        if (cancelled) return;

        setStatus("redirecting");
        router.replace(`/login?next=${encodeURIComponent(pathname || "/teacher/dashboard")}`);
      }
    }

    checkTeacherSession();

    return () => {
      cancelled = true;
    };
  }, [pathname, router]);

  if (status !== "allowed") {
    return (
      <main
        style={{
          minHeight: "100vh",
          display: "grid",
          placeItems: "center",
          background: "#f8fbff",
          color: "#18245f",
          fontFamily: "inherit",
        }}
      >
        <div
          style={{
            padding: "20px 24px",
            border: "1px solid #dfe7f1",
            borderRadius: 14,
            background: "#fff",
            textAlign: "center",
            boxShadow: "0 8px 30px rgba(34, 60, 100, 0.08)",
          }}
        >
          <strong>Checking teacher access…</strong>
          <p style={{ margin: "8px 0 0", color: "#70809d", fontSize: 14 }}>
            Please wait.
          </p>
        </div>
      </main>
    );
  }

  return <>{children}</>;
}
