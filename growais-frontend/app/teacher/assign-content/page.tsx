"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import TeacherShell from "../../../components/teacher/TeacherShell";
import TeacherIcon from "../../../components/teacher/TeacherIcon";
import { apiFetch } from "../../../lib/api";

type ClassItem = {
  id: string;
  name: string;
  students: number;
  image: string;
};

type ContentItem = {
  id: string;
  title: string;
  description: string;
  module: string;
  image: string;
};

const steps = [
  { number: 1, label: "Select Class" },
  { number: 2, label: "Choose Content" },
  { number: 3, label: "Set Details" },
  { number: 4, label: "Review & Assign" },
];

export default function TeacherAssignContentPage() {
  const [classes, setClasses] = useState<ClassItem[]>([]);
  const [lessons, setLessons] = useState<ContentItem[]>([]);
  const [quizzes, setQuizzes] = useState<ContentItem[]>([]);
  const [scenarios, setScenarios] = useState<ContentItem[]>([]);

  const [selectedClass, setSelectedClass] = useState("");
  const [contentType, setContentType] =
    useState<"lessons" | "quizzes" | "scenarios">("lessons");
  const [selectedContent, setSelectedContent] = useState<string[]>([]);
  const [classSearch, setClassSearch] = useState("");
  const [instructions, setInstructions] = useState(
    "Please complete this lesson before our next class. Try your best!"
  );
  const [dueDate, setDueDate] = useState("");
  const [makeVisible, setMakeVisible] = useState(true);
  const [sendNotification, setSendNotification] = useState(false);
  const [activeStep, setActiveStep] = useState(1);
  const [assigned, setAssigned] = useState(false);
  const [loading, setLoading] = useState(true);
  const [assigning, setAssigning] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function loadAssignContent() {
      try {
        setLoading(true);
        setError("");

        const data = await apiFetch("/api/teacher/assign-content");

        if (cancelled) return;

        setClasses(Array.isArray(data?.classes) ? data.classes : []);
        setLessons(Array.isArray(data?.lessons) ? data.lessons : []);
        setQuizzes(Array.isArray(data?.quizzes) ? data.quizzes : []);
        setScenarios(Array.isArray(data?.scenarios) ? data.scenarios : []);

        if (data?.classes?.length) {
          setSelectedClass(String(data.classes[0].id));
        }

        if (data?.lessons?.length) {
          setSelectedContent([String(data.lessons[0].id)]);
        }

        const defaultDueDate = new Date();
        defaultDueDate.setDate(defaultDueDate.getDate() + 7);
        setDueDate(defaultDueDate.toISOString().slice(0, 10));
      } catch (err) {
        console.error("Teacher assign content load error:", err);
        if (!cancelled) {
          setError(
            err instanceof Error
              ? err.message
              : "Unable to load classes and content."
          );
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadAssignContent();

    return () => {
      cancelled = true;
    };
  }, []);

  const visibleClasses = useMemo(() => {
    const query = classSearch.trim().toLowerCase();
    if (!query) return classes;
    return classes.filter((item) => item.name.toLowerCase().includes(query));
  }, [classSearch, classes]);

  const contentItems =
    contentType === "lessons"
      ? lessons
      : contentType === "quizzes"
        ? quizzes
        : scenarios;

  const selectedItem =
    contentItems.find((item) => selectedContent.includes(item.id)) ??
    contentItems[0];

  const selectedClassData =
    classes.find((item) => item.id === selectedClass) ?? classes[0];

  function toggleContent(id: string) {
    setSelectedContent((current) =>
      current.includes(id)
        ? current.filter((item) => item !== id)
        : [...current, id]
    );
    setAssigned(false);
    setActiveStep(2);
  }

  function changeContentType(
    nextType: "lessons" | "quizzes" | "scenarios"
  ) {
    setContentType(nextType);
    setSelectedContent([]);
    setAssigned(false);
    setActiveStep(2);
  }

  async function assignContent() {
    if (!selectedClass) {
      setError("Please select a class.");
      return;
    }

    if (!selectedContent.length) {
      setError("Please select at least one lesson, quiz, or scenario.");
      return;
    }

    try {
      setAssigning(true);
      setError("");

      await apiFetch("/api/teacher/assign-content", {
        method: "POST",
        body: JSON.stringify({
          classId: selectedClass,
          contentType,
          contentIds: selectedContent,
          dueDate: dueDate || null,
          instructions,
          makeVisible,
          sendNotification,
        }),
      });

      setAssigned(true);
      setActiveStep(4);
    } catch (err) {
      console.error("Teacher assign content error:", err);
      setError(
        err instanceof Error ? err.message : "Unable to assign content."
      );
      setAssigned(false);
    } finally {
      setAssigning(false);
    }
  }

  const formattedDueDate = dueDate
    ? new Date(`${dueDate}T00:00:00`).toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      })
    : "Select due date";

  return (
    <TeacherShell>
      <div className="assign-content-page">
        {(loading || error) && (
          <div className={`assign-data-status ${error ? "is-error" : "is-loading"}`}>
            {error || "Loading classes and learning content…"}
          </div>
        )}
        <section className="assign-hero">
          <div className="assign-hero-copy">
            <h1>Assign Content</h1>
            <p>Choose learning content for your students.</p>
          </div>
          <img
            src="/assets/teachers/assign-content-teacher-hero.png"
            alt="Teacher with a tablet"
            className="assign-hero-art"
          />
        </section>

        <section className="assign-stepper" aria-label="Assignment steps">
          {steps.map((step, index) => (
            <div className="assign-step-wrap" key={step.number}>
              <button
                type="button"
                className={`assign-step ${activeStep >= step.number ? "is-active" : ""}`}
                onClick={() => setActiveStep(step.number)}
              >
                <span className="assign-step-number">{step.number}</span>
                <span className="assign-step-label">{step.label}</span>
              </button>
              {index < steps.length - 1 && <span className={`assign-step-line ${activeStep > step.number ? "is-active" : ""}`} />}
            </div>
          ))}
        </section>

        <div className="assign-grid">
          <section className="assign-card select-class-card">
            <div className="assign-card-heading">
              <span className="assign-number green">1</span>
              <div>
                <h2>Select Class</h2>
                <p>Choose the class or group of students.</p>
              </div>
            </div>

            <label className="assign-search">
              <TeacherIcon name="search" size={22} />
              <input
                value={classSearch}
                onChange={(event) => setClassSearch(event.target.value)}
                placeholder="Search classes..."
                aria-label="Search classes"
              />
            </label>

            <div className="class-choice-list">
              {visibleClasses.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  className={`class-choice ${selectedClass === item.id ? "is-selected" : ""}`}
                  onClick={() => {
                    setSelectedClass(item.id);
                    setActiveStep(1);
                  }}
                >
                  <span className={`choice-radio ${selectedClass === item.id ? "is-selected" : ""}`}>
                    {selectedClass === item.id && <TeacherIcon name="check" size={16} />}
                  </span>
                  <span className="class-choice-image">
                    <img src={item.image} alt="" />
                  </span>
                  <span className="class-choice-copy">
                    <strong>{item.name}</strong>
                    <small>{item.students} Students</small>
                  </span>
                </button>
              ))}
            </div>
          </section>

          <section className="assign-card choose-content-card">
            <div className="assign-card-heading">
              <span className="assign-number green">2</span>
              <div>
                <h2>Choose Content</h2>
                <p>Select lessons, quizzes or scenarios to assign.</p>
              </div>
            </div>

            <div className="content-tabs" role="tablist">
              <button type="button" className={contentType === "lessons" ? "is-active" : ""} onClick={() => changeContentType("lessons")}>Lessons ({lessons.length})</button>
              <button type="button" className={contentType === "quizzes" ? "is-active" : ""} onClick={() => changeContentType("quizzes")}>Quizzes ({quizzes.length})</button>
              <button type="button" className={contentType === "scenarios" ? "is-active" : ""} onClick={() => changeContentType("scenarios")}>Scenarios ({scenarios.length})</button>
            </div>

            <div className="content-list">
              {contentItems.map((item) => (
                <label className={`content-row ${selectedContent.includes(item.id) ? "is-selected" : ""}`} key={item.id}>
                  <input
                    type="checkbox"
                    checked={selectedContent.includes(item.id)}
                    onChange={() => {
                      toggleContent(item.id);
                      setActiveStep(2);
                    }}
                  />
                  <span className="custom-checkbox">
                    {selectedContent.includes(item.id) && <TeacherIcon name="check" size={15} />}
                  </span>
                  <span className="content-image">
                    <img src={item.image} alt="" />
                  </span>
                  <span className="content-copy">
                    <strong>{item.title}</strong>
                    <small>{item.description}</small>
                  </span>
                  <span className="module-pill">{item.module}</span>
                </label>
              ))}
            </div>

            <div className="content-selection-footer">
              <span>{selectedContent.length} {selectedContent.length === 1 ? (contentType === "lessons" ? "lesson" : contentType === "quizzes" ? "quiz" : "scenario") : "items"} selected</span>
              <button type="button" onClick={() => { setSelectedContent([]); setAssigned(false); }}>Clear Selection</button>
            </div>
          </section>

          <div className="assign-right-column">
            <section className="assign-card details-card">
              <div className="assign-card-heading">
                <span className="assign-number blue">3</span>
                <div>
                  <h2>Set Details</h2>
                  <p>Add assignment details for your students.</p>
                </div>
              </div>

              <label className="field-label" htmlFor="due-date">Due Date</label>
              <div className="date-field">
                <TeacherIcon name="clock" size={20} />
                <input id="due-date" type="date" value={dueDate} onChange={(event) => setDueDate(event.target.value)} />
              </div>

              <div className="field-label instruction-label">
                <span>Instructions (Optional)</span>
                <span className="instruction-count">{instructions.length}/500</span>
              </div>
              <textarea
                value={instructions}
                maxLength={500}
                onChange={(event) => setInstructions(event.target.value)}
                placeholder="Add instructions for your students..."
              />

              <div className="settings-label">Assignment Settings</div>
              <label className="check-setting">
                <input type="checkbox" checked={makeVisible} onChange={(event) => setMakeVisible(event.target.checked)} />
                <span className="custom-checkbox small">{makeVisible && <TeacherIcon name="check" size={13} />}</span>
                <span>Make visible to students immediately</span>
              </label>
              <label className="check-setting">
                <input type="checkbox" checked={sendNotification} onChange={(event) => setSendNotification(event.target.checked)} />
                <span className="custom-checkbox small">{sendNotification && <TeacherIcon name="check" size={13} />}</span>
                <span>Send notification to students</span>
              </label>
            </section>

            <section className="review-card">
              <div className="assign-card-heading">
                <span className="assign-number green">4</span>
                <div>
                  <h2>Review & Assign</h2>
                  <p>Review your selection before assigning.</p>
                </div>
              </div>

              <div className="review-summary">
                <div className="review-item">
                  <span className="review-image">
                    <img src={selectedItem?.image ?? "/assets/teachers/assign-content-coins.png"} alt="" />
                  </span>
                  <span>
                    <strong>{selectedItem?.title ?? "Budgeting Basics"}</strong>
                    <small>{contentType === "lessons" ? "Lesson" : contentType === "quizzes" ? "Quiz" : "Scenario"} • {selectedItem?.module ?? "Module 1"}</small>
                  </span>
                </div>
                <div className="review-divider" />
                <div className="review-item simple">
                  <TeacherIcon name="classes" size={28} />
                  <span>
                    <strong>{selectedClassData?.name ?? "Select a class"}</strong>
                    <small>{selectedClassData?.students ?? 0} Students</small>
                  </span>
                </div>
                <div className="review-divider" />
                <div className="review-item simple">
                  <TeacherIcon name="clock" size={26} />
                  <span>
                    <strong>Due</strong>
                    <small>{formattedDueDate}</small>
                  </span>
                </div>
              </div>

              <div className="review-actions">
                <button type="button" className="cancel-button" onClick={() => { setSelectedContent([]); setAssigned(false); }}>Cancel</button>
                <button type="button" className="assign-button" onClick={assignContent} disabled={assigning || loading}>
                  <span>{assigning ? "Assigning…" : assigned ? "Assigned" : "Assign Content"}</span>
                  <TeacherIcon name="chevron" size={19} />
                </button>
              </div>
            </section>
          </div>
        </div>

        {assigned && (
          <div className="assignment-toast" role="status">
            <TeacherIcon name="check" size={18} /> Content assigned to {selectedClassData?.name ?? "Select a class"}.
          </div>
        )}
      </div>

      <style jsx global>{`
        .assign-data-status { margin:0 0 12px; padding:9px 12px; border-radius:10px; border:1px solid #dfe7f1; font-size:12px; }
        .assign-data-status.is-loading { background:#eef6ff; color:#526992; }
        .assign-data-status.is-error { background:#fff1ee; border-color:#f3d3cb; color:#a74736; }
        .assign-button:disabled { opacity:.65; cursor:not-allowed; }
        .assign-content-page {
          width: calc(100% + 240px);
          margin-left: -240px;
          margin-top: -145px;
          padding: 16px 18px 28px;
          position: relative;
          box-sizing: border-box;
        }

        .assign-hero {
          position: relative;
          min-height: 158px;
          border-radius: 16px;
          overflow: hidden;
          background: #e8f8f2;
          display: flex;
          align-items: center;
          padding: 26px 28px;
        }
        .assign-hero-copy { position: relative; z-index: 2; max-width: 55%; }
        .assign-hero-copy h1 { margin:0 0 5px; color:#11155f; font-size:40px; line-height:1.05; letter-spacing:-1.2px; }
        .assign-hero-copy p { margin:0; color:#344a80; font-size:20px; }
        .assign-hero-art { position:absolute; right:0; bottom:0; width:39%; height:100%; object-fit:contain; object-position:right bottom; }

        .assign-stepper { display:flex; align-items:center; padding: 8px 28px 16px; }
        .assign-step-wrap { display:flex; align-items:center; flex:1; min-width:0; }
        .assign-step { min-width:100px; border:0; background:transparent; display:flex; flex-direction:column; align-items:center; gap:5px; color:#3d5082; cursor:pointer; padding:0; }
        .assign-step-number { width:38px; height:38px; border-radius:50%; display:grid; place-items:center; background:#e7edf6; color:#465881; font-weight:800; font-size:16px; }
        .assign-step.is-active .assign-step-number { background:#08a97a; color:#fff; }
        .assign-step-label { font-size:14px; font-weight:700; white-space:nowrap; }
        .assign-step.is-active .assign-step-label { color:#079b72; }
        .assign-step-line { flex:1; height:4px; background:#dfe6ef; border-radius:999px; margin: -19px 4px 0; }
        .assign-step-line.is-active { background:linear-gradient(90deg,#08a97a,#8fe3cd); }

        .assign-grid { display:grid; grid-template-columns: minmax(250px,1fr) minmax(360px,1.35fr) minmax(300px,1fr); gap:14px; align-items:start; }
        .assign-card, .review-card { background:#fff; border:1px solid #e0e8f3; border-radius:15px; padding:17px; }
        .assign-card { min-width:0; }
        .assign-card-heading { display:flex; align-items:flex-start; gap:12px; margin-bottom:13px; }
        .assign-card-heading h2 { margin:0; color:#11155f; font-size:20px; line-height:1.1; }
        .assign-card-heading p { margin:5px 0 0; color:#53628b; font-size:13px; line-height:1.3; }
        .assign-number { width:37px; height:37px; border-radius:50%; display:grid; place-items:center; flex:0 0 37px; color:#fff; font-weight:800; }
        .assign-number.green { background:#08a97a; } .assign-number.blue { background:#4b5c86; }

        .assign-search { height:44px; border:1px solid #dbe6f2; border-radius:10px; display:flex; align-items:center; gap:9px; padding:0 12px; color:#597096; }
        .assign-search input { width:100%; border:0; outline:0; background:transparent; color:#23366f; font-size:14px; }
        .class-choice-list { margin-top:9px; display:flex; flex-direction:column; gap:7px; }
        .class-choice { width:100%; min-height:72px; border:1px solid #e4eaf3; border-radius:11px; background:#fff; display:grid; grid-template-columns:24px 52px 1fr; align-items:center; gap:9px; text-align:left; padding:7px 10px; cursor:pointer; color:#1b2f6b; }
        .class-choice.is-selected { background:#e8faf3; border-color:#d2f0e3; }
        .choice-radio { width:21px; height:21px; border:2px solid #cbd8ea; border-radius:50%; display:grid; place-items:center; color:#fff; }
        .choice-radio.is-selected { border-color:#08a97a; background:#08a97a; }
        .class-choice-image { width:52px; height:52px; border-radius:10px; display:grid; place-items:center; background:#eef6ff; overflow:hidden; }
        .class-choice-image img { width:84%; height:84%; object-fit:contain; }
        .class-choice-copy strong { display:block; font-size:15px; color:#172161; }
        .class-choice-copy small { display:block; margin-top:3px; font-size:13px; color:#51618a; }

        .content-tabs { display:grid; grid-template-columns:repeat(3,1fr); gap:8px; margin-bottom:8px; }
        .content-tabs button { border:0; border-radius:9px; background:#f2f5fa; color:#4a5b83; min-height:40px; cursor:pointer; font-weight:700; font-size:14px; }
        .content-tabs button.is-active { background:#08a97a; color:#fff; }
        .content-list { display:flex; flex-direction:column; }
        .content-row { display:grid; grid-template-columns:20px 42px 1fr auto; gap:9px; align-items:center; min-height:57px; border-bottom:1px solid #edf1f6; padding:6px 5px; cursor:pointer; position:relative; }
        .content-row.is-selected { background:#eaf9f2; border-radius:10px; border-bottom-color:transparent; }
        .content-row input { position:absolute; opacity:0; pointer-events:none; }
        .custom-checkbox { width:20px; height:20px; border:2px solid #c9d8ea; border-radius:5px; display:grid; place-items:center; color:#fff; background:#fff; }
        .custom-checkbox.small { width:19px; height:19px; }
        .content-row.is-selected .custom-checkbox, .check-setting input:checked + .custom-checkbox { background:#08a97a; border-color:#08a97a; }
        .content-image { width:42px; height:42px; border-radius:9px; background:#f4f7fb; display:grid; place-items:center; overflow:hidden; }
        .content-image img { width:84%; height:84%; object-fit:contain; }
        .content-copy strong { display:block; color:#17215f; font-size:14px; }
        .content-copy small { display:block; margin-top:3px; color:#53638b; font-size:11px; }
        .module-pill { border-radius:999px; padding:6px 9px; background:#e4f0ff; color:#2277e9; font-size:11px; font-weight:700; white-space:nowrap; }
        .content-selection-footer { padding-top:10px; display:flex; align-items:center; justify-content:space-between; color:#53638b; font-size:13px; }
        .content-selection-footer button { border:0; background:transparent; color:#006ae6; text-decoration:underline; cursor:pointer; font-weight:600; }

        .assign-right-column { display:flex; flex-direction:column; gap:12px; }
        .field-label { display:flex; align-items:center; justify-content:space-between; color:#334878; font-size:14px; font-weight:600; margin:11px 0 7px; }
        .date-field { min-height:45px; border:1px solid #dbe5f1; border-radius:9px; padding:0 12px; display:flex; align-items:center; gap:10px; color:#40547f; }
        .date-field input { width:100%; border:0; outline:0; background:transparent; color:#253a72; font-size:14px; }
        .instruction-label { margin-top:13px; }
        .instruction-count { font-size:11px; font-weight:500; }
        .details-card textarea { width:100%; min-height:90px; resize:vertical; border:1px solid #dbe5f1; border-radius:9px; padding:11px 12px; outline:none; color:#25386f; font:14px/1.45 Inter, ui-sans-serif, system-ui, sans-serif; }
        .settings-label { color:#334878; font-size:14px; font-weight:700; margin:13px 0 8px; }
        .check-setting { display:flex; align-items:center; gap:9px; color:#364b7c; font-size:13px; margin:8px 0; cursor:pointer; }
        .check-setting input { position:absolute; opacity:0; pointer-events:none; }

        .review-card { background:#e9faf4; border-color:#d5f1e5; }
        .review-summary { display:grid; grid-template-columns:1.2fr 1px 1fr 1px .9fr; gap:10px; align-items:center; margin:13px 0; }
        .review-divider { width:1px; height:45px; background:#cfe7dd; }
        .review-item { display:flex; align-items:center; gap:9px; min-width:0; }
        .review-item.simple { color:#40547e; }
        .review-item > svg { flex:0 0 auto; color:#42577f; }
        .review-item strong { display:block; color:#18205f; font-size:12px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
        .review-item small { display:block; margin-top:3px; color:#5a6a8d; font-size:10px; }
        .review-image { width:40px; height:40px; border-radius:8px; background:#d8f5e8; display:grid; place-items:center; flex:0 0 40px; overflow:hidden; }
        .review-image img { width:84%; height:84%; object-fit:contain; }
        .review-actions { display:grid; grid-template-columns:1fr 2fr; gap:12px; }
        .cancel-button, .assign-button { min-height:46px; border-radius:10px; font-weight:800; font-size:14px; cursor:pointer; }
        .cancel-button { background:#fff; border:1px solid #08a97a; color:#2f4c7b; }
        .assign-button { border:0; background:#08a97a; color:#fff; display:flex; align-items:center; justify-content:center; gap:8px; }

        .assignment-toast { position:fixed; right:24px; bottom:24px; z-index:500; background:#08a97a; color:#fff; border-radius:12px; padding:12px 15px; display:flex; align-items:center; gap:8px; box-shadow:0 12px 28px rgba(8,169,122,.25); font-weight:700; }

        @media (max-width: 1200px) {
          .assign-grid { grid-template-columns:1fr 1.2fr; }
          .assign-right-column { grid-column:1 / -1; display:grid; grid-template-columns:1fr 1fr; }
          .assign-hero-art { width:42%; object-fit:contain; object-position:right bottom; }
        }

        @media (max-width: 700px) {
          .assign-content-page { width:100%; margin-left:0; margin-top:0; padding:12px 12px 0; }
          .assign-hero { min-height:150px; padding:21px 18px; }
          .assign-hero-copy { max-width:57%; }
          .assign-hero-copy h1 { font-size:28px; letter-spacing:-.7px; }
          .assign-hero-copy p { font-size:15px; line-height:1.35; }
          .assign-hero-art { width:56%; height:100%; object-fit:contain; object-position:right bottom; }

          .assign-stepper { padding:10px 2px 14px; }
          .assign-step-label { font-size:11px; }
          .assign-step-number { width:34px; height:34px; font-size:14px; }
          .assign-step-line { margin-top:-17px; height:3px; }
          .assign-step { min-width:68px; }

          .assign-grid { grid-template-columns:1fr; gap:10px; }
          .assign-right-column { grid-column:auto; display:flex; flex-direction:column; gap:10px; }
          .assign-card { padding:13px; border-radius:13px; }
          .assign-card-heading { gap:9px; }
          .assign-card-heading h2 { font-size:19px; }
          .assign-card-heading p { font-size:12px; }
          .assign-number { width:34px; height:34px; flex-basis:34px; }
          .class-choice { min-height:66px; grid-template-columns:22px 48px 1fr; }
          .class-choice-image { width:48px; height:48px; }
          .content-row { grid-template-columns:20px 40px 1fr auto; min-height:58px; }
          .content-image { width:40px; height:40px; }
          .content-copy strong { font-size:13px; }
          .content-copy small { font-size:10px; }
          .module-pill { padding:5px 7px; font-size:10px; }
          .review-summary { grid-template-columns:1fr 1px 1fr 1px .9fr; gap:7px; }
          .review-item strong { font-size:10px; }
          .review-item small { font-size:9px; }
          .review-image { width:34px; height:34px; flex-basis:34px; }
          .review-actions { grid-template-columns:1fr 1.65fr; }
          .assignment-toast { left:12px; right:12px; bottom:75px; justify-content:center; font-size:12px; }
        }
      `}</style>
    </TeacherShell>
  );
}
