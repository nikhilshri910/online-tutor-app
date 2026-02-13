import { useMemo, useState } from "react";
import Card from "../../shared/ui/Card";

export default function StudentLecturesCard({ previousLectures, subjects }) {
  const [selectedSubject, setSelectedSubject] = useState("all");

  const filteredLectures = useMemo(() => {
    if (selectedSubject === "all") {
      return previousLectures;
    }
    return previousLectures.filter((item) => item.subject === selectedSubject);
  }, [previousLectures, selectedSubject]);

  return (
    <Card className="panel student-card">
      <div className="list-item">
        <h2>Previous Lectures</h2>
        <label className="field-label" style={{ minWidth: "220px" }}>
          Subject
          <select value={selectedSubject} onChange={(event) => setSelectedSubject(event.target.value)}>
            <option value="all">All Subjects</option>
            {subjects.map((subject) => (
              <option key={subject} value={subject}>
                {subject}
              </option>
            ))}
          </select>
        </label>
      </div>

      {filteredLectures.length ? (
        <div className="course-grid">
          {filteredLectures.map((lecture) => (
            <div key={lecture.id} className="group-block">
              <p>
                <strong>{lecture.subject}</strong>
              </p>
              <p>{lecture.title}</p>
              <iframe
                title={`lecture-${lecture.id}`}
                src={lecture.embedUrl}
                width="100%"
                height="220"
                allow="autoplay; fullscreen; picture-in-picture"
                allowFullScreen
              />
            </div>
          ))}
        </div>
      ) : (
        <p className="muted">No previous lectures available for this subject.</p>
      )}
    </Card>
  );
}
