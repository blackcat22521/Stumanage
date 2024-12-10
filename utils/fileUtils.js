const fs = require("fs");

const readData = (file) => {
  const data = fs.existsSync(file) ? fs.readFileSync(file, "utf8") : "[]";
  return JSON.parse(data);
};

const writeData = (file, data) => {
  fs.writeFileSync(file, JSON.stringify(data, null, 2));
};

module.exports = { readData, writeData };
