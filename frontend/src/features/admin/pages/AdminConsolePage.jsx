import { useEffect, useMemo, useState } from "react";
import FormRenderer from "../components/FormRenderer";
import { useAdminConsole } from "../hooks/useAdminConsole";
import {
  groupFormFields,
  recordingFormFields,
  sessionFormFields,
  userFormFields
} from "../config/adminForms";
import { resolveFields } from "../utils/resolveFields";
import { ADMIN_SECTIONS } from "../config/adminConsoleConfig";
import SideNav from "../../shared/ui/SideNav";
import Card from "../../shared/ui/Card";
import Button from "../../shared/ui/Button";
import DataTable from "../../shared/ui/DataTable";
import Modal from "../../shared/ui/Modal";
import { useNotification } from "../../shared/notifications/NotificationContext";
import LoadingState from "../../shared/ui/LoadingState";

const FORM_CONFIGS = {
  user: { fields: userFormFields, submitLabel: "Create User" },
  group: { fields: groupFormFields, submitLabel: "Create Group" },
  session: { fields: sessionFormFields, submitLabel: "Create Session" },
  recording: { fields: recordingFormFields, submitLabel: "Create Recording" }
};

function getRowsBySection(sectionId, data) {
  if (sectionId === "users") {
    return data.users;
  }

  if (sectionId === "groups") {
    return data.groupRows;
  }

  if (sectionId === "sessions") {
    return data.sessionRows;
  }

  return data.recordingRows;
}

function toDateTimeLocal(value) {
  if (!value) {
    return "";
  }

  const date = new Date(value);
  const tzOffsetMs = date.getTimezoneOffset() * 60 * 1000;
  const local = new Date(date.getTime() - tzOffsetMs);
  return local.toISOString().slice(0, 16);
}

export default function AdminConsolePage() {
  const [activeSectionId, setActiveSectionId] = useState(ADMIN_SECTIONS[0].id);
  const [modalState, setModalState] = useState({ formKey: null, mode: "create", row: null });
  const notification = useNotification();

  const {
    users,
    groupRows,
    sessionRows,
    recordingRows,
    loading,
    error,
    message,
    groupOptions,
    loadAdminData,
    forms,
    actions
  } = useAdminConsole();

  useEffect(() => {
    loadAdminData();
  }, [loadAdminData]);

  const activeSection = useMemo(
    () => ADMIN_SECTIONS.find((section) => section.id === activeSectionId) || ADMIN_SECTIONS[0],
    [activeSectionId]
  );

  const selectContext = { groupOptions };

  const rows = getRowsBySection(activeSection.id, {
    users,
    groupRows,
    sessionRows,
    recordingRows
  });

  const modalFormKey = modalState.formKey || activeSection.modalForm;
  const modalConfig = modalFormKey ? FORM_CONFIGS[modalFormKey] : null;
  const formRef = modalFormKey ? forms[modalFormKey] : null;

  const resolvedFields = useMemo(() => {
    if (!modalConfig) {
      return [];
    }

    const fields = resolveFields(modalConfig.fields, selectContext);

    if (modalState.mode === "edit" && modalFormKey === "user") {
      return fields.map((field) => (field.name === "password" ? { ...field, required: false } : field));
    }

    if (modalState.mode === "edit" && modalFormKey === "recording") {
      return fields.map((field) =>
        field.name === "sourceVideoUrl"
          ? { ...field, required: false, label: "New Source Video URL (optional)" }
          : field
      );
    }

    return fields;
  }, [modalConfig, modalState.mode, modalFormKey, selectContext]);

  useEffect(() => {
    if (message) {
      notification.success(message);
    }
  }, [message, notification]);

  useEffect(() => {
    if (error) {
      notification.error(error);
    }
  }, [error, notification]);

  function openCreateModal() {
    if (!activeSection.modalForm) {
      return;
    }

    setModalState({ formKey: activeSection.modalForm, mode: "create", row: null });
  }

  function openEditModal(sectionId, row) {
    if (sectionId === "users") {
      forms.user.setValue({
        name: row.name || "",
        email: row.email || "",
        password: "",
        role: row.role || "student"
      });
      setModalState({ formKey: "user", mode: "edit", row });
      return;
    }

    if (sectionId === "groups") {
      forms.group.setValue({
        name: row.name || "",
        description: row.description || "",
        includeAllStudents: false
      });
      setModalState({ formKey: "group", mode: "edit", row });
      return;
    }

    if (sectionId === "sessions") {
      forms.session.setValue({
        groupId: String(row.groupId),
        topic: row.topic || "",
        zoomJoinUrl: row.zoomJoinUrl || "",
        startTime: toDateTimeLocal(row.startTime)
      });
      setModalState({ formKey: "session", mode: "edit", row });
      return;
    }

    forms.recording.setValue({
      groupId: String(row.groupId),
      title: row.title || "",
      sourceVideoUrl: ""
    });
    setModalState({ formKey: "recording", mode: "edit", row });
  }

  async function handleDelete(sectionId, row) {
    const ok = window.confirm("Are you sure you want to delete this item?");
    if (!ok) {
      return;
    }

    if (sectionId === "users") {
      await actions.deleteUser(row.id);
      return;
    }

    if (sectionId === "groups") {
      await actions.deleteGroup(row.id);
      return;
    }

    if (sectionId === "sessions") {
      await actions.deleteGroupSession(row.groupId, row.sessionId);
      return;
    }

    await actions.deleteGroupRecording(row.groupId, row.recordingId);
  }

  async function handleModalSubmit(event) {
    if (!formRef || !modalConfig) {
      return;
    }

    if (modalState.mode === "create") {
      const success = await formRef.onSubmit(event);
      if (success) {
        setModalState({ formKey: null, mode: "create", row: null });
      }
      return;
    }

    event.preventDefault();
    const row = modalState.row;

    if (!row) {
      return;
    }

    let success = false;

    if (modalFormKey === "user") {
      const payload = {
        name: formRef.value.name,
        email: formRef.value.email,
        role: formRef.value.role
      };

      if (formRef.value.password) {
        payload.password = formRef.value.password;
      }

      success = await actions.updateUser(row.id, payload);
    } else if (modalFormKey === "group") {
      success = await actions.updateGroup(row.id, {
        name: formRef.value.name,
        description: formRef.value.description
      });
    } else if (modalFormKey === "session") {
      success = await actions.updateGroupSession(row.groupId, row.sessionId, {
        topic: formRef.value.topic,
        zoomJoinUrl: formRef.value.zoomJoinUrl,
        startTime: formRef.value.startTime || null
      });
    } else if (modalFormKey === "recording") {
      const payload = {
        title: formRef.value.title
      };

      if (formRef.value.sourceVideoUrl) {
        payload.sourceVideoUrl = formRef.value.sourceVideoUrl;
      }

      success = await actions.updateGroupRecording(row.groupId, row.recordingId, payload);
    }

    if (success) {
      setModalState({ formKey: null, mode: "create", row: null });
    }
  }

  const rowActions = (row) => {
    const actionsList = [
      {
        label: "Edit",
        variant: "secondary",
        onClick: () => openEditModal(activeSection.id, row)
      },
      {
        label: "Delete",
        variant: "ghost",
        onClick: () => handleDelete(activeSection.id, row)
      }
    ];

    if (activeSection.id === "groups") {
      actionsList.unshift({
        label: "Add All Students",
        variant: "secondary",
        onClick: () => actions.addAllStudents(row.id)
      });
    }

    return actionsList;
  };

  const modalTitle =
    modalState.mode === "edit"
      ? `Edit ${activeSection.createLabel?.replace("Create ", "") || "Item"}`
      : activeSection.createLabel || "Create";

  return (
    <div className="page">
      <header className="header">
        <div>
          <h1>Admin Console</h1>
          <p>Manage users, groups, sessions, and recordings from one place.</p>
        </div>
      </header>

      {loading ? <LoadingState label="Loading admin data..." /> : null}

      <div className="admin-layout">
        <Card className="panel admin-sidebar-card">
          <h3>Sections</h3>
          <SideNav items={ADMIN_SECTIONS} activeId={activeSection.id} onChange={setActiveSectionId} />
        </Card>

        <Card className="panel admin-content-card">
          <div className="admin-content-header">
            <div>
              <h2>{activeSection.title}</h2>
              <p className="muted">{activeSection.description}</p>
            </div>
            {activeSection.createLabel ? <Button onClick={openCreateModal}>{activeSection.createLabel}</Button> : null}
          </div>

          <DataTable
            columns={activeSection.tableColumns}
            rows={rows}
            emptyMessage={activeSection.emptyMessage}
            rowActions={rowActions}
          />
        </Card>
      </div>

      <Modal
        isOpen={Boolean(modalState.formKey && modalConfig && formRef)}
        title={modalTitle}
        onClose={() => setModalState({ formKey: null, mode: "create", row: null })}
      >
        {modalConfig && formRef ? (
          <FormRenderer
            title={modalTitle}
            showTitle={false}
            fields={resolvedFields}
            value={formRef.value}
            onChange={formRef.setField}
            onSubmit={handleModalSubmit}
            submitLabel={modalState.mode === "edit" ? "Update" : modalConfig.submitLabel}
            className="panel modal-form"
          />
        ) : null}
      </Modal>
    </div>
  );
}
