import { useCallback, useEffect, useState } from "react";
import { fetchMyCourses } from "../services/dashboardService";

const dashboardMessages = {
  loadFailed: "Failed to load courses"
};

function getErrorMessage(error) {
  return error?.response?.data?.message || dashboardMessages.loadFailed;
}

export function useDashboardData({ enabled = true } = {}) {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(enabled);
  const [error, setError] = useState("");

  const loadCourses = useCallback(async () => {
    if (!enabled) {
      setCourses([]);
      setLoading(false);
      setError("");
      return;
    }

    try {
      setError("");
      const courseRows = await fetchMyCourses();
      setCourses(courseRows);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [enabled]);

  useEffect(() => {
    loadCourses();
  }, [loadCourses]);

  return {
    courses,
    loading,
    error,
    refresh: loadCourses
  };
}
