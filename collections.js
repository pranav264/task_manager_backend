const db = require("./db");

const users = db.collection("users");
const projects = db.collection("projects");
const tasks = db.collection("tasks");

module.exports = { users, projects, tasks };