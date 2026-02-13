import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";

const NotificationContext = createContext(null);

function NotificationViewport({ notifications, onDismiss }) {
  return (
    <div className="notify-root" aria-live="polite" aria-atomic="true">
      {notifications.map((item) => (
        <div key={item.id} className={`notify-card notify-${item.type}`} role="status">
          <div className="notify-content">
            {item.title ? <p className="notify-title">{item.title}</p> : null}
            <p className="notify-message">{item.message}</p>
          </div>
          <button
            type="button"
            className="notify-close-btn"
            onClick={() => onDismiss(item.id)}
            aria-label="Dismiss notification"
          >
            x
          </button>
        </div>
      ))}
    </div>
  );
}

export function NotificationProvider({ children }) {
  const [notifications, setNotifications] = useState([]);
  const idRef = useRef(0);
  const timeoutMapRef = useRef(new Map());

  const dismiss = useCallback((id) => {
    const timeoutId = timeoutMapRef.current.get(id);
    if (timeoutId) {
      clearTimeout(timeoutId);
      timeoutMapRef.current.delete(id);
    }
    setNotifications((prev) => prev.filter((item) => item.id !== id));
  }, []);

  const notify = useCallback(
    ({ type = "info", title = "", message, duration = 3600 }) => {
      if (!message) {
        return;
      }

      const id = String(++idRef.current);
      setNotifications((prev) => [...prev, { id, type, title, message }]);

      if (duration > 0) {
        const timeoutId = setTimeout(() => {
          dismiss(id);
        }, duration);
        timeoutMapRef.current.set(id, timeoutId);
      }
    },
    [dismiss]
  );

  useEffect(() => {
    return () => {
      timeoutMapRef.current.forEach((timeoutId) => clearTimeout(timeoutId));
      timeoutMapRef.current.clear();
    };
  }, []);

  const value = useMemo(
    () => ({
      notify,
      success: (message, options = {}) => notify({ ...options, type: "success", message }),
      error: (message, options = {}) => notify({ ...options, type: "error", message }),
      warning: (message, options = {}) => notify({ ...options, type: "warning", message }),
      info: (message, options = {}) => notify({ ...options, type: "info", message }),
      dismiss
    }),
    [dismiss, notify]
  );

  return (
    <NotificationContext.Provider value={value}>
      {children}
      <NotificationViewport notifications={notifications} onDismiss={dismiss} />
    </NotificationContext.Provider>
  );
}

export function useNotification() {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error("useNotification must be used inside NotificationProvider");
  }

  return context;
}

