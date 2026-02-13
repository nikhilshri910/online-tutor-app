import { useMemo, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { APP_META } from "../config/appMeta";
import { useNotification } from "../features/shared/notifications/NotificationContext";

const professionals = [
  {
    name: "Subhranil Maity",
    role: "Academic Mentor - Science",
    experience: "9+ years",
    focus: "Class 9-12 | WB, CBSE, ICSE"
  },
  {
    name: "Anwesha Singha",
    role: "Foundation Faculty - Maths",
    experience: "8+ years",
    focus: "JEE/NEET Foundation | Class 7-10"
  },
  {
    name: "Riya Sen",
    role: "Communication & AI Skills Coach",
    experience: "7+ years",
    focus: "Spoken English | AI Readiness"
  }
];

const programs = [
  {
    title: "Syllabus-Oriented Learning",
    description:
      "Complete curriculum coverage for Classes 7-12 across WB Board, CBSE, and ICSE in English and Bengali."
  },
  {
    title: "JEE & NEET Foundation",
    description:
      "Early concept building for students targeting engineering and medical careers from school level."
  },
  {
    title: "Government Exam Readiness",
    description:
      "UPSC and public-service foundation through strong secondary-level concepts and disciplined prep."
  },
  {
    title: "Spoken English & AI Skills",
    description:
      "Communication confidence plus AI literacy so students are future-ready in academics and career."
  }
];

const flipSteps = [
  {
    step: "01",
    title: "Video Learning Before Class",
    detail:
      "Students watch short chapter-wise videos first, so they enter live sessions with context and questions."
  },
  {
    step: "02",
    title: "Live Q&A Focused Class",
    detail:
      "Teachers spend live time on doubt solving, exam patterns, and deeper understanding instead of one-way lecturing."
  },
  {
    step: "03",
    title: "Smart Notes + Practice",
    detail:
      "Printed/digital smart notes and guided practice help students revise quickly and retain more."
  },
  {
    step: "04",
    title: "Daily Tests + Monthly Mocks",
    detail:
      "Regular assessments track improvement and identify exactly where mentor intervention is needed."
  }
];

const faqItems = [
  {
    question: "Can students learn in Bengali and English?",
    answer:
      "Yes. We support bilingual learning so students can grasp concepts in the language they are most comfortable with."
  },
  {
    question: "Which boards and classes do you support?",
    answer:
      "We support learners from Class 7 to 12 for WB Board, CBSE, and ICSE with board-aligned learning plans."
  },
  {
    question: "Do you provide JEE/NEET and UPSC foundation support?",
    answer:
      "Yes. We provide early foundation tracks that run alongside school syllabus to build long-term competitive readiness."
  },
  {
    question: "How do parents track progress?",
    answer:
      "Parents receive periodic updates through test performance, mentor feedback, and clear academic action points."
  }
];

export default function HomePage() {
  const { isAuthenticated } = useAuth();
  const notification = useNotification();
  const [form, setForm] = useState({
    fullName: "",
    phone: "",
    email: "",
    learnerStage: "",
    need: "",
    message: ""
  });

  const heroStats = useMemo(
    () => [
      { label: "Active learners", value: "1,500+" },
      { label: "Expert educators", value: "60+" },
      { label: "Parent trust score", value: "4.8/5" }
    ],
    []
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

  return (
    <div className="page home-page">
      <section className="home-hero card">
        <div className="home-hero-grid">
          <div className="home-hero-content">
            <p className="home-kicker">School & Career Guide Program</p>
            <h1 className="home-title">Board success, competitive foundation, and future-ready skills.</h1>
            <p className="muted home-subtitle">
              At {APP_META.title}, we support students with syllabus excellence, JEE/NEET and
              government exam foundation, Spoken English, and AI awareness from school years.
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
              <li>No prior preparation before class</li>
              <li>Live class feels heavy and rushed</li>
              <li>Doubts appear later without support</li>
              <li>Learning fades quickly over time</li>
            </ul>
          </article>
          <article className="home-compare-card home-compare-new">
            <h3>Flipped Classroom by {APP_META.title}</h3>
            <ul className="home-compare-list">
              <li>Video learning before live class</li>
              <li>Live sessions focused on doubt solving</li>
              <li>Daily tests and mentor feedback</li>
              <li>Recordings + notes for long-term retention</li>
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
              <li>Zero preparation before class topics</li>
              <li>Limited classroom time to absorb everything</li>
              <li>Unresolved doubts after class</li>
              <li>Subjects become harder with each chapter</li>
            </ul>
          </article>
          <article className="home-ps-card">
            <h3>The Solution</h3>
            <ul className="home-compare-list">
              <li>Pre-learning through animated lessons</li>
              <li>Real-time doubt clarification in class</li>
              <li>Daily mock tests to track growth</li>
              <li>Mentor support for struggling students</li>
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
          <article className="home-outcome-item">Learn on mobile, tablet, laptop, and smart TV setup.</article>
          <article className="home-outcome-item">Visual content + live classes + notes + daily and monthly tests.</article>
          <article className="home-outcome-item">Aligned support for WB Bengali/English medium, CBSE, and ICSE.</article>
          <article className="home-outcome-item">Strong base for school results and competitive future pathways.</article>
        </div>
      </section>

      <section className="home-section card">
        <div className="home-section-head">
          <h2>Student Journey Snapshot</h2>
        </div>
        <div className="home-journey-grid">
          <article className="home-journey-card">
            <h3>Abir Mondal - Class IX</h3>
            <p className="muted">Before: 33% | After: 82%</p>
            <p className="home-professional-exp">Success formula: Smart Notes + Mock Tests</p>
          </article>
          <article className="home-journey-card">
            <h3>Riya Sen - Class VII</h3>
            <p className="muted">Before: 42% | After: 78%</p>
            <p className="home-professional-exp">Success formula: Pre-learning + Live Doubt Sessions</p>
          </article>
        </div>
      </section>

      <section className="home-section card" id="enquiry">
        <div className="home-section-head">
          <h2>Talk to a Mentor</h2>
          <p className="muted">
            Take the first step toward your child&apos;s success. We will call you with a
            personalized guidance plan.
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
        <p>
          <strong>{APP_META.title}</strong> supports students from Class 7-12 with board-aligned,
          bilingual, and future-ready learning.
        </p>
        <p className="muted">
          FZCO refers to a Free Zone Company registered in the UAE.
        </p>
      </section>
    </div>
  );
}

