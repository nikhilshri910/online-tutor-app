import { Link } from "react-router-dom";
import Card from "../../shared/ui/Card";
import { buttonClassName } from "../../shared/ui/Button";

export default function AdminDashboardCard({ showContentEditor = false }) {
  return (
    <Card className="panel">
      <h2>Admin Workspace</h2>
      <p className="muted">
        Course consumption is for students/teachers. Use Admin Console for user management, groups, live sessions, and recordings.
      </p>
      <div className="header-actions">
        <Link to="/admin" className={buttonClassName({ variant: "primary" })}>
          Go To Admin Console
        </Link>
        {showContentEditor ? (
          <Link to="/content-admin" className={buttonClassName({ variant: "secondary" })}>
            Edit Home Content
          </Link>
        ) : null}
      </div>
    </Card>
  );
}


