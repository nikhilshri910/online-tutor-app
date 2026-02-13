function formatDate(value) {
  if (!value) {
    return "-";
  }

  return new Date(value).toLocaleString();
}

export const ADMIN_SECTIONS = [
  {
    id: "users",
    label: "Users",
    title: "User Management",
    description: "Manage platform users and roles.",
    createLabel: "Create User",
    modalForm: "user",
    emptyMessage: "No users found.",
    tableColumns: [
      { key: "name", label: "Name" },
      { key: "email", label: "Email" },
      { key: "role", label: "Role" },
      { key: "created_at", label: "Created", render: (value) => formatDate(value) }
    ]
  },
  {
    id: "groups",
    label: "Groups",
    title: "Group Management",
    description: "Create groups and onboard students.",
    createLabel: "Create Group",
    modalForm: "group",
    emptyMessage: "No groups found.",
    tableColumns: [
      { key: "name", label: "Group" },
      { key: "description", label: "Description" },
      { key: "studentCount", label: "Students" },
      { key: "sessionCount", label: "Sessions" },
      { key: "recordingCount", label: "Recordings" }
    ]
  },
  {
    id: "sessions",
    label: "Live Sessions",
    title: "Live Session Management",
    description: "Assign Zoom sessions to student groups.",
    createLabel: "Create Session",
    modalForm: "session",
    emptyMessage: "No sessions found.",
    tableColumns: [
      { key: "topic", label: "Topic" },
      { key: "groupName", label: "Group" },
      { key: "startTime", label: "Start Time", render: (value) => formatDate(value) },
      { key: "zoomJoinUrl", label: "Zoom Link" }
    ]
  },
  {
    id: "recordings",
    label: "Recordings",
    title: "Recording Management",
    description: "Assign Vimeo recordings to student groups.",
    createLabel: "Create Recording",
    modalForm: "recording",
    emptyMessage: "No recordings found.",
    tableColumns: [
      { key: "title", label: "Title" },
      { key: "groupName", label: "Group" },
      { key: "vimeoVideoId", label: "Vimeo ID" },
      { key: "embedUrl", label: "Embed URL" }
    ]
  }
];
