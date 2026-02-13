import Card from "../../shared/ui/Card";
import DataTable from "../../shared/ui/DataTable";

export default function TeacherSubmissionsCard({ submissions }) {
  const columns = [
    { key: "courseTitle", label: "Course" },
    { key: "subject", label: "Subject" },
    { key: "taskTitle", label: "Task" },
    { key: "student", label: "Student", render: (_value, row) => row.student?.name || "-" },
    { key: "status", label: "Status" },
    {
      key: "submittedAt",
      label: "Submitted At",
      render: (value) => (value ? new Date(value).toLocaleString() : "-")
    },
    {
      key: "submissionText",
      label: "Submission",
      render: (value) => value || "-"
    }
  ];

  return (
    <Card className="panel student-card">
      <h2>Student Submissions</h2>
      <DataTable columns={columns} rows={submissions} emptyMessage="No submissions yet." />
    </Card>
  );
}
