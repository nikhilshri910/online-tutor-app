import { useCallback, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../../context/AuthContext";
import { useNotification } from "../../shared/notifications/NotificationContext";
import { loginInitialValues, loginMessages } from "../config/loginForm";

function getErrorMessage(error) {
  return error?.response?.data?.message || loginMessages.failed;
}

export function useLoginForm() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const notification = useNotification();

  const [form, setForm] = useState(loginInitialValues);
  const [submitting, setSubmitting] = useState(false);

  const setField = useCallback((name, value) => {
    setForm((prev) => ({ ...prev, [name]: value }));
  }, []);

  const submit = useCallback(
    async (event) => {
      event.preventDefault();

      if (!form.email || !form.password) {
        notification.warning("Please enter email and password.");
        return;
      }

      setSubmitting(true);

      try {
        await login(form.email, form.password);
        navigate("/dashboard");
      } catch (err) {
        notification.error(getErrorMessage(err));
      } finally {
        setSubmitting(false);
      }
    },
    [form.email, form.password, login, navigate, notification]
  );

  return {
    form,
    setField,
    submitting,
    submit
  };
}
