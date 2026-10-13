
import { useEffect, useState } from "react";

function StudentList() {
  const [students, setStudents] = useState([]);

  useEffect(() => {
    fetch("https://skillswap-dt8c.onrender.com/api/students")
      .then((response) => response.json())
      .then((data) => setStudents(data))
      .catch((error) => console.error(error));
  }, []);

  return (
    <div>
      <h2>SkillSwap - All Students</h2>

      {students.length === 0 ? (
        <p>No students found.</p>
      ) : (
        students.map((student) => (
          <div key={student.id}>
            <h3>{student.name}</h3>
            <p>Email: {student.email}</p>
            <p>Can teach: {student.skillsToTeach}</p>
            <p>Wants to learn: {student.skillsToLearn}</p>
            <hr />
          </div>
        ))
      )}
    </div>
  );
}

export default StudentList;
