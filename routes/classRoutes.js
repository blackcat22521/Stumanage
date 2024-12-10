const express = require("express");
const path = require("path");
const { readData, writeData } = require("../utils/fileUtils");

const router = express.Router();
const CLASS_FILE = path.join(__dirname, "../data/class.json");
const STUDENT_FILE = path.join(__dirname, "../data/student.json");

let classes = readData(CLASS_FILE);
let students = readData(STUDENT_FILE);
let classId = classes.length ? Math.max(...classes.map((c) => c.ID)) + 1 : 1;

// Add Class
router.post("/", (req, res) => {
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
router.get("/", (req, res) => res.json(classes));

// Get Class by ID
router.get("/:id", (req, res) => {
  const cls = classes.find((c) => c.ID === Number(req.params.id));
  cls ? res.json(cls) : res.status(404).json({ error: "Class not found" });
});

// Update Class
router.put("/:id", (req, res) => {
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
router.delete("/:id", (req, res) => {
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

module.exports = router;
