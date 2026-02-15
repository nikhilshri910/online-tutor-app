import { useState } from "react";
import Card from "../../shared/ui/Card";
import Button from "../../shared/ui/Button";

const initialForm = {
  courseId: "",
  subject: "",
  title: "",
  description: "",
  dueDate: ""
};

export default function TeacherTaskAssignmentCard({ courseOptions, onCreateTask, inModal = false }) {
  const [form, setForm] = useState(initialForm);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setSubmitting(true);

    const result = await onCreateTask({
      courseId: form.courseId,
      subject: form.subject,
      title: form.title,
      description: form.description,
      dueDate: form.dueDate || null
    });

    setSubmitting(false);

    if (!result.ok) {
      setError(result.message || "Failed to assign task");
      return;
    }

    setForm(initialForm);
  }

  return (
    <>
      {inModal ? (
        <>
          {/* Modal already renders a header/title; keep content to just the form. */}
          <form className="panel modal-form" onSubmit={handleSubmit}>
            <label className="field-label">
              Course
              <select
                value={form.courseId}
                onChange={(event) => setForm((prev) => ({ ...prev, courseId: event.target.value }))}
                required
              >
                <option value="">Select course</option>
                {courseOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>

            <label className="field-label">
              Subject
              <input
                value={form.subject}
                onChange={(event) => setForm((prev) => ({ ...prev, subject: event.target.value }))}
                required
              />
            </label>

            <label className="field-label">
              Title
              <input
                value={form.title}
                onChange={(event) => setForm((prev) => ({ ...prev, title: event.target.value }))}
                required
              />
            </label>

            <label className="field-label">
              Description
              <textarea
                value={form.description}
                onChange={(event) => setForm((prev) => ({ ...prev, description: event.target.value }))}
              />
            </label>

            <label className="field-label">
              Due Date
              <input
                type="datetime-local"
                value={form.dueDate}
                onChange={(event) => setForm((prev) => ({ ...prev, dueDate: event.target.value }))}
              />
            </label>

            {error ? <p className="error">{error}</p> : null}

            <Button type="submit" disabled={submitting}>
              {submitting ? "Creating..." : "Create Assignment"}
            </Button>
          </form>
        </>
      ) : (
        <Card className="panel">
          <h2>New Assignment</h2>
          <form className="panel" onSubmit={handleSubmit}>
            <label className="field-label">
              Course
              <select
                value={form.courseId}
                onChange={(event) => setForm((prev) => ({ ...prev, courseId: event.target.value }))}
                required
              >
                <option value="">Select course</option>
                {courseOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>

            <label className="field-label">
              Subject
              <input
                value={form.subject}
                onChange={(event) => setForm((prev) => ({ ...prev, subject: event.target.value }))}
                required
              />
            </label>

            <label className="field-label">
              Title
              <input
                value={form.title}
                onChange={(event) => setForm((prev) => ({ ...prev, title: event.target.value }))}
                required
              />
            </label>

            <label className="field-label">
              Description
              <textarea
                value={form.description}
                onChange={(event) => setForm((prev) => ({ ...prev, description: event.target.value }))}
              />
            </label>

            <label className="field-label">
              Due Date
              <input
                type="datetime-local"
                value={form.dueDate}
                onChange={(event) => setForm((prev) => ({ ...prev, dueDate: event.target.value }))}
              />
            </label>

            {error ? <p className="error">{error}</p> : null}

            <Button type="submit" disabled={submitting}>
              {submitting ? "Creating..." : "Create Assignment"}
            </Button>
          </form>
        </Card>
      )}
    </>
  );
}
