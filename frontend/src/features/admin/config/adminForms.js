import { USER_ROLE_OPTIONS } from "./adminConstants";

export const initialUserForm = {
  name: "",
  email: "",
  role: "student"
};

export const initialGroupForm = {
  name: "",
  description: "",
  includeAllStudents: true
};

export const initialSessionForm = {
  groupId: "",
  topic: "",
  zoomJoinUrl: "",
  startTime: ""
};

export const initialRecordingForm = {
  groupId: "",
  title: "",
  sourceVideoUrl: ""
};

export const userFormFields = [
  { name: "name", label: "Name", type: "text", required: true },
  { name: "email", label: "Email", type: "email", required: true },
  { name: "role", label: "Role", type: "select", options: USER_ROLE_OPTIONS, required: true }
];

export const groupFormFields = [
  { name: "name", label: "Group Name", type: "text", required: true },
  { name: "description", label: "Description", type: "textarea" },
  {
    name: "includeAllStudents",
    label: "Add all existing students to this group",
    type: "checkbox"
  }
];

export const sessionFormFields = [
  {
    name: "groupId",
    label: "Group",
    type: "select",
    required: true,
    optionsKey: "groupOptions",
    placeholderOption: "Select group"
  },
  { name: "topic", label: "Topic", type: "text", required: true },
  { name: "zoomJoinUrl", label: "Zoom Join URL", type: "text", required: true },
  { name: "startTime", label: "Start Time (optional)", type: "datetime-local" }
];

export const recordingFormFields = [
  {
    name: "groupId",
    label: "Group",
    type: "select",
    required: true,
    optionsKey: "groupOptions",
    placeholderOption: "Select group"
  },
  { name: "title", label: "Recording Title", type: "text", required: true },
  {
    name: "sourceVideoUrl",
    label: "Source Video URL (public URL for Vimeo pull upload)",
    type: "text",
    required: true
  }
];
