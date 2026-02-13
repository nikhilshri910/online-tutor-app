import { formatDateTime } from "../utils/dateUtils";
import { buttonClassName } from "../../shared/ui/Button";
import Card from "../../shared/ui/Card";

export default function CourseCard({ course }) {
  return (
    <Card className="panel">
      <h2>{course.title}</h2>
      <p>{course.description}</p>
      <p>
        <strong>Teacher:</strong> {course.teacherName}
      </p>

      <h3>Live Classes</h3>
      {course.liveSessions.length ? (
        course.liveSessions.map((session) => (
          <div key={session.id} className="item-row">
            <span>
              {session.topic}
              {session.startTime ? ` - ${formatDateTime(session.startTime)}` : ""}
            </span>
            <a
              href={session.zoomJoinUrl}
              target="_blank"
              rel="noreferrer"
              className={buttonClassName({ variant: "ghost" })}
            >
              Join Live Class
            </a>
          </div>
        ))
      ) : (
        <p className="muted">No live sessions yet.</p>
      )}

      <h3>Recorded Videos</h3>
      {course.recordings.length ? (
        course.recordings.map((recording) => (
          <div key={recording.id} className="recording">
            <p>{recording.title}</p>
            <iframe
              title={`${course.title}-${recording.id}`}
              src={recording.embedUrl}
              width="100%"
              height="240"
              allow="autoplay; fullscreen; picture-in-picture"
              allowFullScreen
            />
          </div>
        ))
      ) : (
        <p className="muted">No recordings yet.</p>
      )}
    </Card>
  );
}
