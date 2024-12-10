const express = require("express");
const bodyParser = require("body-parser");
const fs = require("fs");
const path = require("path");

const app = express();
const PORT = 3000;

app.use(bodyParser.json());

// File Paths
const CLASS_FILE = path.join(__dirname, "data", "class.json");
const STUDENT_FILE = path.join(__dirname, "data", "student.json");

const readData = (file) => {
  const data = fs.existsSync(file) ? fs.readFileSync(file) : "[]";
  return JSON.parse(data);
};

const writeData = (file, data) => {
  fs.writeFileSync(file, JSON.stringify(data, null, 2));
};

let studentId = 1;
let classId = 1;
let students = readData(STUDENT_FILE);
let classes = readData(CLASS_FILE);
if (students.length) studentId = Math.max(...students.map((s) => s.ID)) + 1;
if (classes.length) classId = Math.max(...classes.map((c) => c.ID)) + 1;

/* ------------------- API for Class Management ------------------- */

// Add Class
app.post("/classes", (req, res) => {
  const { ClassName } = req.body;

  if (!ClassName)
    return res.status(400).json({ error: "ClassName is required" });
  if (classes.some((cls) => cls.ClassName === ClassName))
    return res.status(400).json({ error: "ClassName must be unique" });

  const newClass = { ID: classId++, ClassName };
  classes.push(newClass);
  writeData(CLASS_FILE, classes);
  res.status(201).json(newClass);
});

// Get All Classes
app.get("/classes", (req, res) => res.json(classes));

// Get Class by ID
app.get("/classes/:id", (req, res) => {
  const cls = classes.find((c) => c.ID === Number(req.params.id));
  cls ? res.json(cls) : res.status(404).json({ error: "Class not found" });
});

// Update Class
app.put("/classes/:id", (req, res) => {
  const { id } = req.params;
  const { ClassName } = req.body;

  const cls = classes.find((c) => c.ID === Number(id));
  if (!cls) return res.status(404).json({ error: "Class not found" });

  if (ClassName) {
    if (classes.some((c) => c.ClassName === ClassName && c.ID !== cls.ID)) {
      return res.status(400).json({ error: "ClassName must be unique" });
    }
    const oldClassName = cls.ClassName;
    cls.ClassName = ClassName;

    students.forEach((s) => {
      if (s.Class === oldClassName) {
        s.Class = ClassName;
      }
    });
    writeData(CLASS_FILE, classes);
    writeData(STUDENT_FILE, students);
  }

  res.json(cls);
});

// Delete Class
app.delete("/classes/:id", (req, res) => {
  const classId = Number(req.params.id);
  const cls = classes.find((c) => c.ID === classId);

  if (!cls) return res.status(404).json({ error: "Class not found" });
  if (students.some((s) => s.Class === cls.ClassName))
    return res
      .status(400)
      .json({ error: "Cannot delete class with students enrolled" });

  classes = classes.filter((c) => c.ID !== classId);
  writeData(CLASS_FILE, classes);
  res.json({ message: "Class deleted successfully" });
});

/* ------------------- API for Student Management ------------------- */

// Add Student
app.post("/students", (req, res) => {
  const { Name, Class } = req.body;

  if (!Name || !Class)
    return res.status(400).json({ error: "Name and Class are required" });

  if (!classes.some((c) => c.ClassName === Class))
    return res.status(404).json({ error: "Class does not exist" });

  if (students.some((s) => s.Name === Name))
    return res.status(400).json({ error: "Student Name must be unique" });

  const newStudent = { ID: studentId++, Name, Class };
  students.push(newStudent);
  writeData(STUDENT_FILE, students);
  res.status(201).json(newStudent);
});

// Get All Students
app.get("/students", (req, res) => res.json(students));
// Get Student by ID
app.get("/students/:id", (req, res) => {
  const student = students.find((s) => s.ID === Number(req.params.id));
  student
    ? res.json(student)
    : res.status(404).json({ error: "Student not found" });
});
// Get All Students by Class Name
app.get("/students/class/:className", (req, res) => {
  const { className } = req.params;

  if (!classes.some((cls) => cls.ClassName === className)) {
    return res.status(404).json({ error: "Class not found" });
  }

  const result = students.filter((s) => s.Class === className);

  if (result.length === 0) {
    return res.status(404).json({ error: "No students found in this class" });
  }

  res.json(result);
});
// Search Students by Name (LIKE)
app.get("/students/search/:name", (req, res) => {
  const { name } = req.params;

  const result = students.filter((s) =>
    s.Name.toLowerCase().includes(name.toLowerCase())
  );

  if (result.length === 0) {
    return res
      .status(404)
      .json({ error: "No students found with the given name" });
  }

  res.json(result);
});

// Update Student
app.put("/students/:id", (req, res) => {
  const student = students.find((s) => s.ID === Number(req.params.id));
  if (!student) return res.status(404).json({ error: "Student not found" });

  const { Name, Class } = req.body;
  if (Name && students.some((s) => s.Name === Name && s.ID !== student.ID))
    return res.status(400).json({ error: "Student Name must be unique" });

  if (Class && !classes.some((c) => c.ClassName === Class))
    return res.status(404).json({ error: "Class does not exist" });

  if (Name) student.Name = Name;
  if (Class) student.Class = Class;

  writeData(STUDENT_FILE, students);
  res.json(student);
});

// Delete Student
app.delete("/students/:id", (req, res) => {
  const studentId = Number(req.params.id);
  if (!students.some((s) => s.ID === studentId))
    return res.status(404).json({ error: "Student not found" });

  students = students.filter((s) => s.ID !== studentId);
  writeData(STUDENT_FILE, students);
  res.json({ message: "Student deleted successfully" });
});

/* ------------------- Start Server ------------------- */
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
