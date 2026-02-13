import { useMemo, useState } from "react";
import Card from "../../shared/ui/Card";

export default function TeacherPreviousLecturesCard({ previousLectures }) {
  const [subject, setSubject] = useState("all");

  const subjects = useMemo(
    () => Array.from(new Set(previousLectures.map((item) => item.subject))).filter(Boolean),
    [previousLectures]
  );

  const rows = useMemo(() => {
    if (subject === "all") {
      return previousLectures;
    }
    return previousLectures.filter((item) => item.subject === subject);
  }, [previousLectures, subject]);

  return (
    <Card className="panel student-card">
      <div className="list-item">
        <h2>Previous Lectures (Subject-wise)</h2>
        <label className="field-label" style={{ minWidth: "220px" }}>
          Subject
          <select value={subject} onChange={(event) => setSubject(event.target.value)}>
            <option value="all">All Subjects</option>
            {subjects.map((value) => (
              <option key={value} value={value}>
                {value}
              </option>
            ))}
          </select>
        </label>
      </div>

      {rows.length ? (
        <div className="course-grid">
          {rows.map((item) => (
            <div key={item.id} className="group-block">
              <p>
                <strong>{item.subject}</strong>
              </p>
              <p>{item.title}</p>
              <iframe
                title={`teacher-lecture-${item.id}`}
                src={item.embedUrl}
                width="100%"
                height="220"
                allow="autoplay; fullscreen; picture-in-picture"
                allowFullScreen
              />
            </div>
          ))}
        </div>
      ) : (
        <p className="muted">No previous lectures available for selected subject.</p>
      )}
    </Card>
  );
}
