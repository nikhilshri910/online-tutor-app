import Card from "../../shared/ui/Card";
import DataTable from "../../shared/ui/DataTable";
import { buttonClassName } from "../../shared/ui/Button";

export default function TeacherScheduleCard({ schedule }) {
  const columns = [
    { key: "subject", label: "Course" },
    { key: "topic", label: "Topic" },
    {
      key: "startTime",
      label: "Starts At",
      render: (value) => (value ? new Date(value).toLocaleString() : "-")
    },
    {
      key: "joinUrl",
      label: "Join",
      render: (value) => (
        <a href={value} target="_blank" rel="noreferrer" className={buttonClassName({ variant: "ghost" })}>
          Join Class
        </a>
      )
    }
  ];

  return (
    <Card className="panel student-card">
      <h2>Class Schedule</h2>
      <DataTable columns={columns} rows={schedule} emptyMessage="No classes scheduled yet." />
    </Card>
  );
}
