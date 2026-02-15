import { useEffect, useState } from "react";
import { useNotification } from "../../shared/notifications/NotificationContext";
import LoadingState from "../../shared/ui/LoadingState";
import { useTeacherDashboardData } from "../hooks/useTeacherDashboardData";
import TeacherOverviewTiles from "../components/TeacherOverviewTiles";
import TeacherTasksCard from "../components/TeacherTasksCard";
import TeacherSubmissionsCard from "../components/TeacherSubmissionsCard";
import TeacherScheduleCard from "../components/TeacherScheduleCard";
import TeacherPreviousLecturesCard from "../components/TeacherPreviousLecturesCard";
import SideNav from "../../shared/ui/SideNav";

export default function TeacherPortalPage() {
  const notification = useNotification();
  const {
    stats,
    tasks,
    submissions,
    schedule,
    previousLectures,
    loading,
    error,
    createTask
  } = useTeacherDashboardData();

  const [active, setActive] = useState("overview");

  useEffect(() => {
    if (error) {
      notification.error(error);
    }
  }, [error, notification]);

  if (loading) {
    return <LoadingState label="Loading teacher dashboard..." />;
  }

  const SECTIONS = [
    { id: "overview", label: "Overview" },
    { id: "tasks", label: "Assignments" },
    { id: "submissions", label: "Student Submissions" },
    { id: "schedule", label: "Class Schedule" },
    { id: "lectures", label: "Previous Lectures" }
  ];

  return (
    <div className="teacher-console-layout">
      <aside className="card panel teacher-sidebar">
        <h3>Teacher</h3>
        <SideNav items={SECTIONS} activeId={active} onChange={setActive} />
      </aside>

      <main className="card panel teacher-main">
        {active === "overview" && <TeacherOverviewTiles stats={stats} />}

        {active === "tasks" && (
          <TeacherTasksCard tasks={tasks} onCreateTask={async (payload) => {
            const result = await createTask(payload);
            if (result.ok) {
              notification.success("Assignment created");
            }
            return result;
          }} />
        )}

        {active === "submissions" && <TeacherSubmissionsCard submissions={submissions} />}

        {active === "schedule" && <TeacherScheduleCard schedule={schedule} />}

        {active === "lectures" && <TeacherPreviousLecturesCard previousLectures={previousLectures} />}
      </main>
    </div>
  );
}
