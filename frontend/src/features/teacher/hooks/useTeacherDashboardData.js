import { useCallback, useEffect, useMemo, useState } from "react";
import { assignHomeworkTask, fetchTeacherDashboard } from "../services/teacherService";

function getErrorMessage(error, fallback) {
  return error?.response?.data?.message || fallback;
}

export function useTeacherDashboardData() {
  const [data, setData] = useState({
    stats: {
      totalCourses: 0,
      totalTasks: 0,
      pendingSubmissions: 0,
      submittedAssignments: 0,
      scheduledClasses: 0
    },
    courses: [],
    tasks: [],
    submissions: [],
    schedule: [],
    previousLectures: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    try {
      setError("");
      const response = await fetchTeacherDashboard();
      setData(response);
    } catch (err) {
      setError(getErrorMessage(err, "Failed to load teacher dashboard"));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const courseOptions = useMemo(
    () => data.courses.map((item) => ({ value: String(item.id), label: item.title })),
    [data.courses]
  );

  const createTask = useCallback(
    async (payload) => {
      try {
        await assignHomeworkTask(Number(payload.courseId), payload);
        await load();
        return { ok: true };
      } catch (err) {
        return { ok: false, message: getErrorMessage(err, "Failed to assign task") };
      }
    },
    [load]
  );

  return {
    ...data,
    courseOptions,
    loading,
    error,
    createTask,
    refresh: load
  };
}
