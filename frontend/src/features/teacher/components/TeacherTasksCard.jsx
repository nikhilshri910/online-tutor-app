import { useState } from "react";
import Card from "../../shared/ui/Card";
import DataTable from "../../shared/ui/DataTable";
import Modal from "../../shared/ui/Modal";
import TeacherTaskAssignmentCard from "./TeacherTaskAssignmentCard";
import Button from "../../shared/ui/Button";

export default function TeacherTasksCard({ tasks, onCreateTask }) {
  const [open, setOpen] = useState(false);

  const columns = [
    { key: "courseTitle", label: "Course" },
    { key: "subject", label: "Subject" },
    { key: "title", label: "Task" },
    { key: "dueDate", label: "Due", render: (value) => (value ? new Date(value).toLocaleString() : "-") },
    { key: "assignedCount", label: "Assigned" },
    { key: "submittedCount", label: "Submitted" },
    { key: "pendingCount", label: "Pending" }
  ];

  return (
    <Card className="panel student-card">
      <div className="header" style={{ marginBottom: "0.6rem" }}>
        <h2>Assignments</h2>
        <div className="header-actions">
          <Button type="button" variant="secondary" onClick={() => setOpen(true)}>
            New Assignment
          </Button>
        </div>
      </div>
      <DataTable columns={columns} rows={tasks} emptyMessage="No assignments yet." />

      <Modal isOpen={open} title="New Assignment" onClose={() => setOpen(false)}>
        <TeacherTaskAssignmentCard
          inModal={true}
          courseOptions={tasks?.map((t) => ({ value: t.courseId, label: t.courseTitle })) || []}
          onCreateTask={async (payload) => {
            const result = await onCreateTask(payload);
            if (result.ok) {
              setOpen(false);
            }
            return result;
          }}
        />
      </Modal>
    </Card>
  );
}
