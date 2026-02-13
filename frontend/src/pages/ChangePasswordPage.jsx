import { useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useNotification } from "../features/shared/notifications/NotificationContext";
import Card from "../features/shared/ui/Card";
import Button from "../features/shared/ui/Button";

function getErrorMessage(error) {
  return error?.response?.data?.message || "Failed to change password";
}

export default function ChangePasswordPage() {
  const navigate = useNavigate();
  const notification = useNotification();
  const { user, changePassword } = useAuth();
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);

  if (!user?.mustChangePassword) {
    return <Navigate to="/dashboard" replace />;
  }

  async function handleSubmit(event) {
    event.preventDefault();

    if (!newPassword || !confirmPassword) {
      notification.warning("Please fill all fields.");
      return;
    }

    if (newPassword.length < 8) {
      notification.warning("New password must be at least 8 characters.");
      return;
    }

    if (newPassword !== confirmPassword) {
      notification.warning("New password and confirm password must match.");
      return;
    }

    setSubmitting(true);

    try {
      await changePassword("", newPassword);
      notification.success("Password changed successfully.");
      navigate("/dashboard", { replace: true });
    } catch (error) {
      notification.error(getErrorMessage(error));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="page-center">
      <Card as="form" className="panel password-change-card" onSubmit={handleSubmit}>
        <h2>Change Temporary Password</h2>
        <p className="muted">
          This account was created with a temporary password. Set a new password to continue.
        </p>

        <label className="field-label">
          New Password
          <input
            type="password"
            value={newPassword}
            onChange={(event) => setNewPassword(event.target.value)}
            minLength={8}
            required
          />
        </label>

        <label className="field-label">
          Confirm New Password
          <input
            type="password"
            value={confirmPassword}
            onChange={(event) => setConfirmPassword(event.target.value)}
            minLength={8}
            required
          />
        </label>

        <Button type="submit" disabled={submitting}>
          {submitting ? "Updating..." : "Update Password"}
        </Button>
      </Card>
    </div>
  );
}

