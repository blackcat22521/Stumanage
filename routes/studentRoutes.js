const express = require("express");
const path = require("path");
const { readData, writeData } = require("../utils/fileUtils");

const router = express.Router();
const STUDENT_FILE = path.join(__dirname, "../data/student.json");
const CLASS_FILE = path.join(__dirname, "../data/class.json");

let students = readData(STUDENT_FILE);
let classes = readData(CLASS_FILE);
let studentId = students.length
  ? Math.max(...students.map((s) => s.ID)) + 1
  : 1;

// Add Student
router.post("/", (req, res) => {
  const { Name, Class } = req.body;

  if (!Name || !Class)
    return res.status(400).json({ error: "Name and Class are required" });
  if (!classes.some((cls) => cls.ClassName === Class))
    return res.status(404).json({ error: "Class does not exist" });
  if (students.some((s) => s.Name === Name))
    return res.status(400).json({ error: "Student Name must be unique" });

  const newStudent = { ID: studentId++, Name, Class };
  students.push(newStudent);
  writeData(STUDENT_FILE, students);
  res.status(201).json(newStudent);
});

// Get All Students
router.get("/", (req, res) => res.json(students));

// Get Student by ID
router.get("/:id", (req, res) => {
  const student = students.find((s) => s.ID === Number(req.params.id));
  student
    ? res.json(student)
    : res.status(404).json({ error: "Student not found" });
});

// Get All Students by Class Name
router.get("/class/:className", (req, res) => {
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
router.get("/search/:name", (req, res) => {
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
router.put("/:id", (req, res) => {
  const student = students.find((s) => s.ID === Number(req.params.id));
  if (!student) return res.status(404).json({ error: "Student not found" });

  const { Name, Class } = req.body;
  if (Name && students.some((s) => s.Name === Name && s.ID !== student.ID))
    return res.status(400).json({ error: "Student Name must be unique" });

  if (Class && !classes.some((cls) => cls.ClassName === Class))
    return res.status(404).json({ error: "Class does not exist" });

  if (Name) student.Name = Name;
  if (Class) student.Class = Class;

  writeData(STUDENT_FILE, students);
  res.json(student);
});

// Delete Student
router.delete("/:id", (req, res) => {
  const studentId = Number(req.params.id);
  if (!students.some((s) => s.ID === studentId))
    return res.status(404).json({ error: "Student not found" });

  students = students.filter((s) => s.ID !== studentId);
  writeData(STUDENT_FILE, students);
  res.json({ message: "Student deleted successfully" });
});

module.exports = router;
