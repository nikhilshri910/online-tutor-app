import Card from "../../shared/ui/Card";
import DataTable from "../../shared/ui/DataTable";

export default function TeacherTasksCard({ tasks }) {
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
      <h2>Assigned Tasks</h2>
      <DataTable columns={columns} rows={tasks} emptyMessage="No tasks assigned yet." />
    </Card>
  );
}
