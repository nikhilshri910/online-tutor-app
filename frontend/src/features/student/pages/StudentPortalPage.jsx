import { useEffect, useMemo, useRef } from "react";
import { useNotification } from "../../shared/notifications/NotificationContext";
import LoadingState from "../../shared/ui/LoadingState";
import { useStudentPortalData } from "../hooks/useStudentPortalData";
import StudentNotificationsCard from "../components/StudentNotificationsCard";
import StudentTasksCard from "../components/StudentTasksCard";
import StudentScheduleCard from "../components/StudentScheduleCard";
import StudentLecturesCard from "../components/StudentLecturesCard";

export default function StudentPortalPage() {
  const notification = useNotification();
  const remindedClassIdsRef = useRef(new Set());
  const {
    tasks,
    schedule,
    previousLectures,
    notifications,
    subjects,
    loading,
    error,
    submitHomework,
    markRead
  } = useStudentPortalData();

  const upcomingClassReminders = useMemo(() => {
    const now = Date.now();

    return schedule
      .filter((item) => item.startTime)
      .map((item) => {
        const startMs = new Date(item.startTime).getTime();
        const diffMinutes = Math.round((startMs - now) / (1000 * 60));
        return { ...item, diffMinutes };
      })
      .filter((item) => item.diffMinutes <= 15 && item.diffMinutes >= -5);
  }, [schedule]);

  useEffect(() => {
    if (error) {
      notification.error(error);
    }
  }, [error, notification]);

  useEffect(() => {
    for (const item of upcomingClassReminders) {
      if (remindedClassIdsRef.current.has(item.id)) {
        continue;
      }

      const when =
        item.diffMinutes <= 0
          ? "Your class is starting now."
          : `Reminder: your class starts in ${item.diffMinutes} minute(s).`;

      notification.warning(`${when} ${item.subject} - ${item.topic}`);
      remindedClassIdsRef.current.add(item.id);
    }
  }, [notification, upcomingClassReminders]);

  if (loading) {
    return <LoadingState label="Loading student portal..." />;
  }

  return (
    <div className="student-layout">
      <StudentNotificationsCard notifications={notifications} onMarkRead={markRead} />
      <StudentTasksCard tasks={tasks} onSubmitTask={submitHomework} />
      <StudentScheduleCard schedule={schedule} />
      <StudentLecturesCard previousLectures={previousLectures} subjects={subjects} />
    </div>
  );
}
