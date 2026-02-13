import { useCallback, useMemo, useState } from "react";
import {
  addAllStudentsToAdminGroup,
  createAdminGroup,
  createAdminGroupRecording,
  createAdminGroupSession,
  createAdminUser,
  deleteAdminGroup,
  deleteAdminGroupRecording,
  deleteAdminGroupSession,
  deleteAdminUser,
  fetchAdminGroups,
  fetchAdminUsers,
  updateAdminGroup,
  updateAdminGroupRecording,
  updateAdminGroupSession,
  updateAdminUser
} from "../services/adminService";
import {
  initialGroupForm,
  initialRecordingForm,
  initialSessionForm,
  initialUserForm
} from "../config/adminForms";
import { ADMIN_MESSAGES } from "../config/adminConstants";

function getErrorMessage(error, fallback) {
  return error?.response?.data?.message || fallback;
}

function sanitizeFilePart(value) {
  return String(value || "user")
    .toLowerCase()
    .replace(/[^a-z0-9._-]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

function formatTimestampForFileName(date = new Date()) {
  const pad = (num) => String(num).padStart(2, "0");
  return [
    date.getFullYear(),
    pad(date.getMonth() + 1),
    pad(date.getDate()),
    "-",
    pad(date.getHours()),
    pad(date.getMinutes()),
    pad(date.getSeconds())
  ].join("");
}

function downloadCredentialsFile({ name, email, role, temporaryPassword, userId }) {
  if (!temporaryPassword) {
    return;
  }

  const issuedAt = new Date().toISOString();
  const fileContent = [
    "Brainwave FZCO - Temporary Login Credentials",
    "",
    `User ID: ${userId ?? "-"}`,
    `Name: ${name ?? "-"}`,
    `Email: ${email ?? "-"}`,
    `Role: ${role ?? "-"}`,
    `Temporary Password: ${temporaryPassword}`,
    `Issued At (UTC): ${issuedAt}`,
    "",
    "Important:",
    "- This is a temporary password created by admin.",
    "- User must change password at first login.",
    "- Share this file securely and delete it after use."
  ].join("\n");

  const blob = new Blob([fileContent], { type: "text/plain;charset=utf-8" });
  const fileSafeEmail = sanitizeFilePart(email || name || "user");
  const fileName = `temporary-credentials-${fileSafeEmail}-${formatTimestampForFileName()}.txt`;
  const blobUrl = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = blobUrl;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(blobUrl);
}

export function useAdminConsole() {
  const [users, setUsers] = useState([]);
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const [userForm, setUserForm] = useState(initialUserForm);
  const [groupForm, setGroupForm] = useState(initialGroupForm);
  const [sessionForm, setSessionForm] = useState(initialSessionForm);
  const [recordingForm, setRecordingForm] = useState(initialRecordingForm);

  const groupOptions = useMemo(
    () => groups.map((group) => ({ value: String(group.id), label: group.name })),
    [groups]
  );

  const groupRows = useMemo(
    () =>
      groups.map((group) => ({
        ...group,
        sessionCount: group.sessions?.length || 0,
        recordingCount: group.recordings?.length || 0
      })),
    [groups]
  );

  const sessionRows = useMemo(
    () =>
      groups.flatMap((group) =>
        (group.sessions || []).map((session) => ({
          id: session.id,
          sessionId: session.id,
          groupId: group.id,
          topic: session.topic,
          groupName: group.name,
          startTime: session.startTime,
          zoomJoinUrl: session.zoomJoinUrl
        }))
      ),
    [groups]
  );

  const recordingRows = useMemo(
    () =>
      groups.flatMap((group) =>
        (group.recordings || []).map((recording) => ({
          id: recording.id,
          recordingId: recording.id,
          groupId: group.id,
          title: recording.title,
          groupName: group.name,
          vimeoVideoId: recording.vimeoVideoId,
          embedUrl: recording.embedUrl
        }))
      ),
    [groups]
  );

  const loadAdminData = useCallback(async () => {
    try {
      setError("");
      const [usersData, groupsData] = await Promise.all([fetchAdminUsers(), fetchAdminGroups()]);
      setUsers(usersData);
      setGroups(groupsData);
    } catch (err) {
      setError(getErrorMessage(err, ADMIN_MESSAGES.loadError));
    } finally {
      setLoading(false);
    }
  }, []);

  const runAction = useCallback(
    async (action, successMessage) => {
      setError("");
      setMessage("");

      try {
        await action();
        setMessage(successMessage);
        await loadAdminData();
        return true;
      } catch (err) {
        setError(getErrorMessage(err, ADMIN_MESSAGES.genericActionError));
        return false;
      }
    },
    [loadAdminData]
  );

  const updateFormField = useCallback((setter) => {
    return (fieldName, value) => {
      setter((prev) => ({ ...prev, [fieldName]: value }));
    };
  }, []);

  const setFormValue = useCallback((setter) => {
    return (nextValue) => {
      setter(nextValue);
    };
  }, []);

  const createUser = useCallback(
    async (event) => {
      event.preventDefault();
      setError("");
      setMessage("");

      try {
        const response = await createAdminUser(userForm);
        const createdUser = response?.data?.user || {};
        setUserForm(initialUserForm);
        const temporaryPassword = response?.data?.temporaryPassword;
        downloadCredentialsFile({
          userId: createdUser.id,
          name: createdUser.name || userForm.name,
          email: createdUser.email || userForm.email,
          role: createdUser.role || userForm.role,
          temporaryPassword
        });
        setMessage(
          temporaryPassword
            ? `${ADMIN_MESSAGES.userCreated}. Credentials file downloaded.`
            : `${ADMIN_MESSAGES.userCreated}. Temporary password unavailable.`
        );
        await loadAdminData();
        return true;
      } catch (err) {
        setError(getErrorMessage(err, ADMIN_MESSAGES.genericActionError));
        return false;
      }
    },
    [loadAdminData, userForm]
  );

  const createGroup = useCallback(
    async (event) => {
      event.preventDefault();
      return runAction(async () => {
        await createAdminGroup(groupForm);
        setGroupForm(initialGroupForm);
      }, ADMIN_MESSAGES.groupCreated);
    },
    [runAction, groupForm]
  );

  const addAllStudents = useCallback(
    async (groupId) => {
      return runAction(async () => {
        await addAllStudentsToAdminGroup(groupId);
      }, ADMIN_MESSAGES.allStudentsAdded);
    },
    [runAction]
  );

  const createGroupSession = useCallback(
    async (event) => {
      event.preventDefault();
      return runAction(async () => {
        await createAdminGroupSession(Number(sessionForm.groupId), {
          topic: sessionForm.topic,
          zoomJoinUrl: sessionForm.zoomJoinUrl,
          startTime: sessionForm.startTime || null
        });
        setSessionForm(initialSessionForm);
      }, ADMIN_MESSAGES.sessionCreated);
    },
    [runAction, sessionForm]
  );

  const createGroupRecording = useCallback(
    async (event) => {
      event.preventDefault();
      return runAction(async () => {
        await createAdminGroupRecording(Number(recordingForm.groupId), {
          title: recordingForm.title,
          sourceVideoUrl: recordingForm.sourceVideoUrl
        });
        setRecordingForm(initialRecordingForm);
      }, ADMIN_MESSAGES.recordingCreated);
    },
    [runAction, recordingForm]
  );

  const updateUser = useCallback(
    async (userId, payload) => {
      return runAction(async () => {
        await updateAdminUser(userId, payload);
      }, "User updated successfully");
    },
    [runAction]
  );

  const deleteUser = useCallback(
    async (userId) => {
      return runAction(async () => {
        await deleteAdminUser(userId);
      }, "User deleted successfully");
    },
    [runAction]
  );

  const updateGroup = useCallback(
    async (groupId, payload) => {
      return runAction(async () => {
        await updateAdminGroup(groupId, payload);
      }, "Group updated successfully");
    },
    [runAction]
  );

  const deleteGroup = useCallback(
    async (groupId) => {
      return runAction(async () => {
        await deleteAdminGroup(groupId);
      }, "Group deleted successfully");
    },
    [runAction]
  );

  const updateGroupSession = useCallback(
    async (groupId, sessionId, payload) => {
      return runAction(async () => {
        await updateAdminGroupSession(groupId, sessionId, payload);
      }, "Group live session updated successfully");
    },
    [runAction]
  );

  const deleteGroupSession = useCallback(
    async (groupId, sessionId) => {
      return runAction(async () => {
        await deleteAdminGroupSession(groupId, sessionId);
      }, "Group live session deleted successfully");
    },
    [runAction]
  );

  const updateGroupRecording = useCallback(
    async (groupId, recordingId, payload) => {
      return runAction(async () => {
        await updateAdminGroupRecording(groupId, recordingId, payload);
      }, "Group recording updated successfully");
    },
    [runAction]
  );

  const deleteGroupRecording = useCallback(
    async (groupId, recordingId) => {
      return runAction(async () => {
        await deleteAdminGroupRecording(groupId, recordingId);
      }, "Group recording deleted successfully");
    },
    [runAction]
  );

  return {
    users,
    groups,
    groupRows,
    sessionRows,
    recordingRows,
    loading,
    error,
    message,
    groupOptions,
    loadAdminData,
    forms: {
      user: {
        value: userForm,
        setField: updateFormField(setUserForm),
        setValue: setFormValue(setUserForm),
        onSubmit: createUser
      },
      group: {
        value: groupForm,
        setField: updateFormField(setGroupForm),
        setValue: setFormValue(setGroupForm),
        onSubmit: createGroup
      },
      session: {
        value: sessionForm,
        setField: updateFormField(setSessionForm),
        setValue: setFormValue(setSessionForm),
        onSubmit: createGroupSession
      },
      recording: {
        value: recordingForm,
        setField: updateFormField(setRecordingForm),
        setValue: setFormValue(setRecordingForm),
        onSubmit: createGroupRecording
      }
    },
    actions: {
      addAllStudents,
      updateUser,
      deleteUser,
      updateGroup,
      deleteGroup,
      updateGroupSession,
      deleteGroupSession,
      updateGroupRecording,
      deleteGroupRecording
    }
  };
}
