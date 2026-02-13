export default function TeacherOverviewTiles({ stats }) {
  const items = [
    { key: "totalCourses", label: "Courses", value: stats.totalCourses },
    { key: "totalTasks", label: "Tasks", value: stats.totalTasks },
    { key: "pendingSubmissions", label: "Pending Submissions", value: stats.pendingSubmissions },
    { key: "scheduledClasses", label: "Scheduled Classes", value: stats.scheduledClasses }
  ];

  return (
    <div className="notification-tiles">
      {items.map((item) => (
        <div key={item.key} className="notification-tile">
          <span className="notification-tile-label">{item.label}</span>
          <span className="notification-tile-value">{item.value}</span>
        </div>
      ))}
    </div>
  );
}
