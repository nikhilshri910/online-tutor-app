import { useState } from "react";
import Card from "../../shared/ui/Card";
import DataTable from "../../shared/ui/DataTable";
import Button from "../../shared/ui/Button";
import Modal from "../../shared/ui/Modal";

export default function StudentTasksCard({ tasks, onSubmitTask }) {
  const [activeTask, setActiveTask] = useState(null);
  const [submissionText, setSubmissionText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");

  const columns = [
    { key: "subject", label: "Subject" },
    { key: "title", label: "Task" },
    { key: "courseTitle", label: "Course" },
    { key: "dueDate", label: "Due", render: (value) => (value ? new Date(value).toLocaleString() : "-") },
    { key: "status", label: "Status" }
  ];

  async function submitAssignment(event) {
    event.preventDefault();
    if (!activeTask) return;

    setSubmitError("");
    setSubmitting(true);

    const result = await onSubmitTask(activeTask.assignmentId, submissionText);
    setSubmitting(false);

    if (!result.ok) {
      setSubmitError(result.message || "Failed to submit task");
      return;
    }

    setActiveTask(null);
    setSubmissionText("");
  }

  return (
    <Card className="panel student-card">
      <h2>Homework Tasks</h2>
      <DataTable
        columns={columns}
        rows={tasks}
        emptyMessage="No homework assigned yet."
        rowActions={(row) => [
          {
            label: row.status === "submitted" ? "Resubmit" : "Submit",
            variant: "primary",
            onClick: () => {
              setActiveTask(row);
              setSubmissionText(row.submissionText || "");
            }
          }
        ]}
      />

      <Modal
        isOpen={Boolean(activeTask)}
        title={activeTask ? `Submit: ${activeTask.title}` : "Submit homework"}
        onClose={() => setActiveTask(null)}
      >
        <form className="panel modal-form" onSubmit={submitAssignment}>
          <label className="field-label">
            Submission
            <textarea
              value={submissionText}
              onChange={(event) => setSubmissionText(event.target.value)}
              required
              placeholder="Write your homework answer here..."
            />
          </label>

          {submitError ? <p className="error">{submitError}</p> : null}

          <Button type="submit" disabled={submitting}>
            {submitting ? "Submitting..." : "Submit Homework"}
          </Button>
        </form>
      </Modal>
    </Card>
  );
}
