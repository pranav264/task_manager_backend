const mongodb = require("mongodb");
require("dotenv").config();

const url = process.env.MONGODB_ALT_URL;

const client = new mongodb.MongoClient(url);

const db = client.db('task_assignment_application_database');

module.exports = db;