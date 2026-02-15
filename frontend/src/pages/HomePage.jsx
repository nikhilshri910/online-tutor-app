import { useEffect, useMemo, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useNotification } from "../features/shared/notifications/NotificationContext";
import { DEFAULT_HOME_CONTENT } from "../features/site-content/defaultHomeContent";
import { fetchHomeContent } from "../features/site-content/contentService";

export default function HomePage() {
  const { isAuthenticated } = useAuth();
  const notification = useNotification();
  const [content, setContent] = useState(DEFAULT_HOME_CONTENT);
  const [form, setForm] = useState({
    fullName: "",
    phone: "",
    email: "",
    learnerStage: "",
    need: "",
    message: ""
  });

  useEffect(() => {
    let isMounted = true;

    async function loadContent() {
      try {
        const serverContent = await fetchHomeContent();
        if (isMounted && serverContent) {
          setContent(serverContent);
        }
      } catch (_error) {
        // Keep fallback content when API is unavailable.
      }
    }

    loadContent();
    return () => {
      isMounted = false;
    };
  }, []);

  const heroStats = useMemo(
    () => content?.hero?.stats || [],
    [content]
  );

  function setField(name, value) {
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  function handleSubmit(event) {
    event.preventDefault();

    if (!form.fullName || !form.phone || !form.need) {
      notification.warning("Please fill name, phone number, and learning need.");
      return;
    }

    notification.success("Thanks for your enquiry. Our team will call you shortly.");
    setForm({
      fullName: "",
      phone: "",
      email: "",
      learnerStage: "",
      need: "",
      message: ""
    });
  }

  const appTitle = content?.appMeta?.title || "Brainwave FZCO";
  const professionals = content?.professionals || [];
  const programs = content?.programs || [];
  const traditionalPoints = content?.comparison?.traditional || [];
  const flippedPoints = content?.comparison?.flipped || [];
  const problemPoints = content?.problemSolution?.problem || [];
  const solutionPoints = content?.problemSolution?.solution || [];
  const flipSteps = content?.flipSteps || [];
  const outcomes = content?.outcomes || [];
  const journeys = content?.journeys || [];
  const faqItems = content?.faq || [];

  return (
    <div className="page home-page">
      <section className="home-hero card">
        <div className="home-hero-grid">
          <div className="home-hero-content">
            <p className="home-kicker">{content?.hero?.kicker || "School & Career Guide Program"}</p>
            <h1 className="home-title">{content?.hero?.title || "Board success, competitive foundation, and future-ready skills."}</h1>
            <p className="muted home-subtitle">
              {content?.hero?.subtitle ||
                "At Brainwave FZCO, we support students with syllabus excellence, JEE/NEET and government exam foundation, Spoken English, and AI awareness from school years."}
            </p>
            <div className="home-actions">
              <a className="btn btn-primary" href="#enquiry">
                Book Free Video Counselling
              </a>
              <a className="btn btn-secondary" href="#programs">
                Explore Programs
              </a>
              {isAuthenticated ? (
                <a className="btn btn-ghost" href="/dashboard">
                  Open Dashboard
                </a>
              ) : null}
            </div>
          </div>

          <div className="home-hero-stats">
            {heroStats.map((stat) => (
              <article className="home-stat-card" key={stat.label}>
                <p className="home-stat-value">{stat.value}</p>
                <p className="muted">{stat.label}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="home-section card" id="programs">
        <div className="home-section-head">
          <h2>What students get</h2>
          <p className="muted">
            One integrated platform for school academics, career foundation, and skill development.
          </p>
        </div>
        <div className="home-program-grid">
          {programs.map((program) => (
            <article className="home-program-card" key={program.title}>
              <h3>{program.title}</h3>
              <p className="muted">{program.description}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="home-section card">
        <div className="home-section-head">
          <h2>Traditional vs Flipped Classroom</h2>
          <p className="muted">Why our flip method improves retention and confidence.</p>
        </div>
        <div className="home-compare-grid">
          <article className="home-compare-card home-compare-old">
            <h3>Traditional Classroom</h3>
            <ul className="home-compare-list">
              {traditionalPoints.map((point) => (
                <li key={point}>{point}</li>
              ))}
            </ul>
          </article>
          <article className="home-compare-card home-compare-new">
            <h3>Flipped Classroom by {appTitle}</h3>
            <ul className="home-compare-list">
              {flippedPoints.map((point) => (
                <li key={point}>{point}</li>
              ))}
            </ul>
          </article>
        </div>
      </section>

      <section className="home-section card">
        <div className="home-section-head">
          <h2>The Problem and The Solution</h2>
        </div>
        <div className="home-problem-solution-grid">
          <article className="home-ps-card">
            <h3>The Problem</h3>
            <ul className="home-compare-list">
              {problemPoints.map((point) => (
                <li key={point}>{point}</li>
              ))}
            </ul>
          </article>
          <article className="home-ps-card">
            <h3>The Solution</h3>
            <ul className="home-compare-list">
              {solutionPoints.map((point) => (
                <li key={point}>{point}</li>
              ))}
            </ul>
          </article>
        </div>
      </section>

      <section className="home-section card">
        <div className="home-section-head">
          <h2>Step by Step Flip Method</h2>
          <p className="muted">A practical flow that keeps students engaged and consistent.</p>
        </div>
        <div className="home-process-grid">
          {flipSteps.map((item) => (
            <article className="home-process-card" key={item.step}>
              <p className="home-process-step">{item.step}</p>
              <h3>{item.title}</h3>
              <p className="muted">{item.detail}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="home-section card" id="professionals">
        <div className="home-section-head">
          <h2>Our Professionals</h2>
          <p className="muted">Qualified educators focused on outcomes and confidence building.</p>
        </div>
        <div className="home-professional-grid">
          {professionals.map((item) => (
            <article className="home-professional-card" key={item.name}>
              <div className="home-professional-avatar" aria-hidden="true">
                {item.name.slice(0, 1)}
              </div>
              <div className="panel">
                <h3>{item.name}</h3>
                <p className="home-professional-role">{item.role}</p>
                <p className="muted">{item.focus}</p>
                <p className="home-professional-exp">{item.experience} experience</p>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="home-section card">
        <div className="home-section-head">
          <h2>Real Learning Outcomes</h2>
          <p className="muted">Parents trust us because our model converts effort into measurable results.</p>
        </div>
        <div className="home-outcome-grid">
          {outcomes.map((item) => (
            <article className="home-outcome-item" key={item}>
              {item}
            </article>
          ))}
        </div>
      </section>

      <section className="home-section card">
        <div className="home-section-head">
          <h2>Student Journey Snapshot</h2>
        </div>
        <div className="home-journey-grid">
          {journeys.map((item) => (
            <article className="home-journey-card" key={`${item.learner}-${item.classLevel}`}>
              <h3>
                {item.learner} - {item.classLevel}
              </h3>
              <p className="muted">
                Before: {item.beforeScore} | After: {item.afterScore}
              </p>
              <p className="home-professional-exp">Success formula: {item.formula}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="home-section card" id="enquiry">
        <div className="home-section-head">
          <h2>{content?.enquiry?.title || "Talk to a Mentor"}</h2>
          <p className="muted">
            {content?.enquiry?.subtitle ||
              "Take the first step toward your child's success. We will call you with a personalized guidance plan."}
          </p>
        </div>
        <form className="home-enquiry-form" onSubmit={handleSubmit}>
          <label className="field-label">
            Full Name
            <input
              type="text"
              value={form.fullName}
              onChange={(event) => setField("fullName", event.target.value)}
              placeholder="Parent or learner name"
              required
            />
          </label>
          <label className="field-label">
            Phone Number
            <input
              type="tel"
              value={form.phone}
              onChange={(event) => setField("phone", event.target.value)}
              placeholder="+91 98XXXXXXXX"
              required
            />
          </label>
          <label className="field-label">
            Email (optional)
            <input
              type="email"
              value={form.email}
              onChange={(event) => setField("email", event.target.value)}
              placeholder="name@example.com"
            />
          </label>
          <label className="field-label">
            Learner Stage
            <select
              value={form.learnerStage}
              onChange={(event) => setField("learnerStage", event.target.value)}
            >
              <option value="">Select class level</option>
              <option value="grade-1-5">Grade 1-5</option>
              <option value="grade-6-8">Grade 6-8</option>
              <option value="grade-9-10">Grade 9-10</option>
              <option value="grade-11-12">Grade 11-12</option>
              <option value="spoken-english">Spoken English</option>
            </select>
          </label>
          <label className="field-label">
            Learning Need
            <input
              type="text"
              value={form.need}
              onChange={(event) => setField("need", event.target.value)}
              placeholder="Maths support, exam prep, communication..."
              required
            />
          </label>
          <label className="field-label">
            Message
            <textarea
              value={form.message}
              onChange={(event) => setField("message", event.target.value)}
              placeholder="Tell us preferred timings, goals, or concerns."
            />
          </label>

          <button type="submit" className="btn btn-primary home-enquiry-submit">
            Submit Enquiry
          </button>
        </form>
      </section>

      <section className="home-section card">
        <div className="home-section-head">
          <h2>FAQ</h2>
        </div>
        <div className="home-faq-grid">
          {faqItems.map((item) => (
            <details className="home-faq-item" key={item.question}>
              <summary>{item.question}</summary>
              <p className="muted">{item.answer}</p>
            </details>
          ))}
        </div>
      </section>

      <section className="home-section card home-footer-note">
        {content?.footer?.summary ? <p>{content.footer.summary}</p> : null}
        {content?.footer?.note ? <p className="muted">{content.footer.note}</p> : null}
      </section>
    </div>
  );
}

