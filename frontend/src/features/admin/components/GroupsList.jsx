import Button from "../../shared/ui/Button";
import Card from "../../shared/ui/Card";

export default function GroupsList({ groups, title, onAddAllStudents }) {
  return (
    <Card className="admin-section panel">
      <h2>{title}</h2>
      {groups.length ? (
        <div className="simple-list">
          {groups.map((group) => (
            <div key={group.id} className="group-block">
              <div className="list-item">
                <span>
                  <strong>{group.name}</strong> - {group.studentCount} students
                </span>
                <Button type="button" variant="secondary" onClick={() => onAddAllStudents(group.id)}>
                  Add All Students
                </Button>
              </div>
              {group.description ? <p className="muted">{group.description}</p> : null}
              <p className="muted">Live Sessions: {group.sessions.length}</p>
              <p className="muted">Recordings: {group.recordings.length}</p>
            </div>
          ))}
        </div>
      ) : (
        <p className="muted">No groups found.</p>
      )}
    </Card>
  );
}
