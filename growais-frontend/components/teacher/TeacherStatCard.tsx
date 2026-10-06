
import TeacherIcon from "./TeacherIcon";

type Tone = "blue" | "green" | "purple" | "yellow";
type Icon = Parameters<typeof TeacherIcon>[0]["name"];

export default function TeacherStatCard({ label, value, sub, tone, icon }: { label:string; value:string; sub:string; tone:Tone; icon:Icon }) {
  return <div className={`teacher-stat-card ${tone}`}>
    <div className="teacher-stat-icon"><TeacherIcon name={icon} size={30} /></div>
    <div><div className="teacher-stat-label">{label}</div><div className="teacher-stat-value">{value}</div><div className="teacher-stat-sub">{sub}</div></div>
    <div className="teacher-stat-arrow"><TeacherIcon name="chevron" size={21}/></div>
  </div>;
}
