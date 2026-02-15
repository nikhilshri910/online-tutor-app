import { useEffect } from "react";
import { useAuth } from "../../../context/AuthContext";
import DashboardHeader from "../components/DashboardHeader";
import CourseGrid from "../components/CourseGrid";
import { useDashboardData } from "../hooks/useDashboardData";
import AdminDashboardCard from "../components/AdminDashboardCard";
import { useNotification } from "../../shared/notifications/NotificationContext";
import LoadingState from "../../shared/ui/LoadingState";
import StudentPortalPage from "../../student/pages/StudentPortalPage";
import TeacherPortalPage from "../../teacher/pages/TeacherPortalPage";

export default function DashboardFeaturePage() {
  const { user, logout } = useAuth();
  const notification = useNotification();
  const isAdmin = user?.role === "admin" || user?.role === "super_admin";
  const isStudent = user?.role === "student";
  const isTeacher = user?.role === "teacher";
  const { courses, loading, error } = useDashboardData({ enabled: !isAdmin && !isStudent && !isTeacher });

  useEffect(() => {
    if (error) {
      notification.error(error);
    }
  }, [error, notification]);

  return (
    <div className="page">
      <DashboardHeader user={user} onLogout={logout} />

      {isAdmin ? (
        <AdminDashboardCard showContentEditor={user?.role === "super_admin"} />
      ) : isStudent ? (
        <StudentPortalPage />
      ) : (
        <>
          {loading ? <LoadingState label="Loading courses..." /> : null}
          {isTeacher ? <TeacherPortalPage /> : <CourseGrid courses={courses} />}
        </>
      )}
    </div>
  );
}
