import { useCallback, useEffect, useMemo, useState } from "react";
import {
  fetchStudentPortal,
  markStudentNotificationRead,
  submitStudentHomework
} from "../services/studentService";

function getErrorMessage(error, fallback) {
  return error?.response?.data?.message || fallback;
}

export function useStudentPortalData() {
  const [data, setData] = useState({
    tasks: [],
    schedule: [],
    previousLectures: [],
    notifications: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    try {
      setError("");
      const response = await fetchStudentPortal();
      setData(response);
    } catch (err) {
      setError(getErrorMessage(err, "Failed to load student portal"));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const subjects = useMemo(() => {
    const values = Array.from(new Set(data.previousLectures.map((item) => item.subject))).filter(Boolean);
    return values.sort((a, b) => a.localeCompare(b));
  }, [data.previousLectures]);

  const submitHomework = useCallback(
    async (assignmentId, submissionText) => {
      try {
        await submitStudentHomework(assignmentId, { submissionText });
        await load();
        return { ok: true };
      } catch (err) {
        return { ok: false, message: getErrorMessage(err, "Failed to submit homework") };
      }
    },
    [load]
  );

  const markRead = useCallback(
    async (notificationId) => {
      try {
        await markStudentNotificationRead(notificationId);
        setData((prev) => ({
          ...prev,
          notifications: prev.notifications.map((item) =>
            item.id === notificationId ? { ...item, isRead: true } : item
          )
        }));
      } catch (_err) {
        // Ignore non-critical notification update failure.
      }
    },
    []
  );

  return {
    ...data,
    subjects,
    loading,
    error,
    submitHomework,
    markRead,
    refresh: load
  };
}
