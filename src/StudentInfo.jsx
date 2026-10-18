import "./App.css";

function StudentInfo({ currentUser, student }) {
  const subjects = student?.subjects || [];

  return (
    <section className="student-profile">
      <div className="profile-avatar" aria-hidden="true">
        {(student.name || "S").charAt(0).toUpperCase()}
      </div>
      <div className="profile-details">
        <p className="eyebrow">PARENT OVERVIEW</p>
        <h2>{student.name || "Student"}</h2>
        <p className="profile-meta">
          {student.grade ? `Class ${student.grade}` : "Class not provided"}
          {student.email || currentUser.email
            ? ` · ${student.email || currentUser.email}`
            : ""}
        </p>
        {subjects.length > 0 && (
          <ul className="subject-list" aria-label="Enrolled subjects">
            {subjects.map((subject, index) => (
              <li key={`${subject}-${index}`}>
                {subject.charAt(0).toUpperCase() + subject.slice(1)}
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}

export default StudentInfo;
