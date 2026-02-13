import Card from "../../shared/ui/Card";

export default function UsersList({ users, title }) {
  return (
    <Card className="admin-section panel">
      <h2>{title}</h2>
      {users.length ? (
        <div className="simple-list">
          {users.map((user) => (
            <div key={user.id} className="list-item">
              <span>
                {user.name} ({user.role}) - {user.email}
              </span>
            </div>
          ))}
        </div>
      ) : (
        <p className="muted">No users found.</p>
      )}
    </Card>
  );
}
