import { useEffect } from "react";
import { useNotification } from "../../shared/notifications/NotificationContext";
import LoadingState from "../../shared/ui/LoadingState";
import { useTeacherDashboardData } from "../hooks/useTeacherDashboardData";
import TeacherOverviewTiles from "../components/TeacherOverviewTiles";
import TeacherTaskAssignmentCard from "../components/TeacherTaskAssignmentCard";
import TeacherTasksCard from "../components/TeacherTasksCard";
import TeacherSubmissionsCard from "../components/TeacherSubmissionsCard";
import TeacherScheduleCard from "../components/TeacherScheduleCard";
import TeacherPreviousLecturesCard from "../components/TeacherPreviousLecturesCard";

export default function TeacherPortalPage() {
  const notification = useNotification();
  const {
    stats,
    tasks,
    submissions,
    schedule,
    previousLectures,
    courseOptions,
    loading,
    error,
    createTask
  } = useTeacherDashboardData();

  useEffect(() => {
    if (error) {
      notification.error(error);
    }
  }, [error, notification]);

  if (loading) {
    return <LoadingState label="Loading teacher dashboard..." />;
  }

  return (
    <div className="student-layout">
      <TeacherOverviewTiles stats={stats} />
      <TeacherTaskAssignmentCard
        courseOptions={courseOptions}
        onCreateTask={async (payload) => {
          const result = await createTask(payload);
          if (result.ok) {
            notification.success("Homework task assigned");
          }
          return result;
        }}
      />
      <TeacherTasksCard tasks={tasks} />
      <TeacherSubmissionsCard submissions={submissions} />
      <TeacherScheduleCard schedule={schedule} />
      <TeacherPreviousLecturesCard previousLectures={previousLectures} />
    </div>
  );
}
