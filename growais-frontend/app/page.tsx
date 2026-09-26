import Link from "next/link";

const features = [
  ["📖", "Interactive Lessons", "Learn key money concepts in a simple way."],
  ["📝", "Quizzes", "Test your knowledge and get instant feedback."],
  ["🎮", "Financial Scenarios", "Make decisions and see the consequences."],
  ["🎯", "Financial Goals", "Set and track your goals."],
  ["🏆", "Points & Badges", "Stay motivated as you learn."],
  ["🤖", "AI Learning Assistant", "Get explanations, hints and answers to your questions."],
];

export default function Home() {
  return (
    <main>
      <section className="hero-home">
        <div className="container hero-home-grid">
          <div className="hero-copy">
            <p className="eyebrow">FINANCIAL LEARNING FOR REAL LIFE</p>
            <h1>Learn Money Skills.<br /><span>Build Your Future.</span></h1>
            <p className="lead">
              GrowAIs is an interactive financial learning platform that helps
              secondary school students learn, practise and build better money
              habits for real life.
            </p>
            <div className="actions">
              <Link className="btn btn-primary" href="/signup">Get Started&nbsp; →</Link>
              <Link className="btn btn-outline" href="/login">Log In</Link>
            </div>
            <p className="tagline">LEARN&nbsp; · &nbsp;PRACTISE&nbsp; · &nbsp;IMPROVE</p>
          </div>

          <div className="hero-visual">
            <img className="hero-city" src="/assets/hero-city.png" alt="" />
            <div className="hero-progress">
              <strong>Small steps<br />today, big dreams<br />tomorrow.</strong>
              <div><span>📖</span> Lessons <i /></div>
              <div><span>📝</span> Quizzes <i /></div>
              <div><span>🎮</span> Scenarios <i /></div>
              <div><span>🎯</span> My Goals <i /></div>
            </div>
            <img className="hero-students" src="/assets/hero-students.png" alt="GrowAIs students" />
          </div>
        </div>
      </section>

      <section className="section center">
        <div className="container">
          <h2>What is GrowAIs?</h2>
          <p className="section-lead">
            GrowAIs helps students develop practical financial life skills
            through short lessons, quizzes, real-life scenarios, financial
            goals and an AI learning assistant.
          </p>
          <div className="feature-grid">
            {features.map(([icon, title, description]) => (
              <article className="feature" key={title}>
                <div className="icon">{icon}</div>
                <h3>{title}</h3>
                <p>{description}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="section audience">
        <div className="container">
          <h2 className="center">Who is GrowAIs for?</h2>
          <p className="section-lead center">Designed for students, teachers and schools.</p>
          <div className="audience-grid">
            <article className="audience-card c0">
              <img src="/assets/student-laptop.png" alt="" />
              <div>
                <h3>For Students</h3>
                <b>Learn and grow</b>
                <p>Learn practical financial skills, practise real-life scenarios, set goals and track progress.</p>
              </div>
              <Link href="/signup">Start Learning&nbsp; →</Link>
            </article>

            <article className="audience-card c1">
              <img src="/assets/teacher.png" alt="" />
              <div>
                <h3>For Teachers</h3>
                <b>Support your students</b>
                <p>Create and manage classes, assign learning content and view student progress.</p>
              </div>
              <Link href="/how-it-works">Learn More&nbsp; →</Link>
            </article>

            <article className="audience-card c2">
              <img src="/assets/hero-city.png" alt="" />
              <div>
                <h3>For Schools</h3>
                <b>Make an impact</b>
                <p>Provide structured financial education and track learning outcomes across your school.</p>
              </div>
              <Link href="/for-schools">Get in Touch&nbsp; →</Link>
            </article>
          </div>
        </div>
      </section>

      <section className="cta container">
        <img src="/assets/cta-landscape.png" alt="" />
        <div className="cta-content">
          <h2>Ready to start your financial learning journey?</h2>
          <p>Learn today. Build better money habits for tomorrow.</p>
          <Link className="btn btn-primary" href="/signup">Get Started&nbsp; →</Link>
        </div>
      </section>
    </main>
  );
}
