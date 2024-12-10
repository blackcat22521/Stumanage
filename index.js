const express = require("express");
const bodyParser = require("body-parser");
const classRoutes = require("./routes/classRoutes");
const studentRoutes = require("./routes/studentRoutes");

const app = express();
const PORT = 3000;

app.use(bodyParser.json());

// Routes
app.use("/classes", classRoutes);
app.use("/students", studentRoutes);

// Start Server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}/classes`);
});
