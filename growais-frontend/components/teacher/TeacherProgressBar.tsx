
export default function TeacherProgressBar({ value, tone = "green" }: { value:number; tone?:"green"|"blue" }) {
  const safe = Math.max(0, Math.min(100, value));
  return <div className="teacher-progress-track" aria-label={`${safe}% progress`}><div className={`teacher-progress-fill ${tone === "blue" ? "blue" : ""}`} style={{ width: `${safe}%` }} /></div>;
}
