import { useMemo, useState } from "react";
import Card from "../../shared/ui/Card";
import Button from "../../shared/ui/Button";
import DataTable from "../../shared/ui/DataTable";

function formatType(value) {
  if (!value) return "General";
  return value
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

export default function StudentNotificationsCard({ notifications, onMarkRead }) {
  const [activeFilter, setActiveFilter] = useState("all");

  const summary = useMemo(() => {
    const total = notifications.length;
    const unread = notifications.filter((item) => !item.isRead).length;
    const liveClass = notifications.filter((item) => item.type?.includes("live")).length;
    const homework = notifications.filter((item) => item.type === "homework").length;

    return {
      total,
      unread,
      liveClass,
      homework
    };
  }, [notifications]);

  const rows = useMemo(() => {
    let list = notifications;

    if (activeFilter === "unread") {
      list = list.filter((item) => !item.isRead);
    } else if (activeFilter === "live") {
      list = list.filter((item) => item.type?.includes("live"));
    } else if (activeFilter === "homework") {
      list = list.filter((item) => item.type === "homework");
    }

    return list.map((item) => ({
      ...item,
      typeLabel: formatType(item.type),
      statusLabel: item.isRead ? "Read" : "Unread",
      dateLabel: item.createdAt ? new Date(item.createdAt).toLocaleString() : "-"
    }));
  }, [activeFilter, notifications]);

  const columns = [
    { key: "typeLabel", label: "Type" },
    { key: "message", label: "Notification" },
    { key: "dateLabel", label: "Time" },
    {
      key: "statusLabel",
      label: "Status",
      render: (value, row) => (
        <span className={row.isRead ? "status-badge status-read" : "status-badge status-unread"}>{value}</span>
      )
    }
  ];

  return (
    <Card className="panel student-card">
      <div className="list-item">
        <h2>Notification Center</h2>
        <div className="table-actions">
          <Button variant={activeFilter === "all" ? "primary" : "secondary"} onClick={() => setActiveFilter("all")}>
            All
          </Button>
          <Button
            variant={activeFilter === "unread" ? "primary" : "secondary"}
            onClick={() => setActiveFilter("unread")}
          >
            Unread
          </Button>
          <Button variant={activeFilter === "live" ? "primary" : "secondary"} onClick={() => setActiveFilter("live")}>
            Live Class
          </Button>
          <Button
            variant={activeFilter === "homework" ? "primary" : "secondary"}
            onClick={() => setActiveFilter("homework")}
          >
            Homework
          </Button>
        </div>
      </div>

      <div className="notification-tiles">
        <button type="button" className="notification-tile" onClick={() => setActiveFilter("all")}>
          <span className="notification-tile-label">Total</span>
          <span className="notification-tile-value">{summary.total}</span>
        </button>
        <button type="button" className="notification-tile" onClick={() => setActiveFilter("unread")}>
          <span className="notification-tile-label">Unread</span>
          <span className="notification-tile-value">{summary.unread}</span>
        </button>
        <button type="button" className="notification-tile" onClick={() => setActiveFilter("live")}>
          <span className="notification-tile-label">Live Class</span>
          <span className="notification-tile-value">{summary.liveClass}</span>
        </button>
        <button type="button" className="notification-tile" onClick={() => setActiveFilter("homework")}>
          <span className="notification-tile-label">Homework</span>
          <span className="notification-tile-value">{summary.homework}</span>
        </button>
      </div>

      <DataTable
        columns={columns}
        rows={rows}
        emptyMessage="No notifications for this filter."
        rowActions={(row) =>
          !row.isRead
            ? [
                {
                  label: "Mark Read",
                  variant: "secondary",
                  onClick: () => onMarkRead(row.id)
                }
              ]
            : []
        }
      />
    </Card>
  );
}
