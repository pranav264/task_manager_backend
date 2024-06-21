const router = require("express").Router();
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");
const Projects = require("../models/projects");
const bcrypt = require("bcrypt");
const Users = require("../models/users");
const Tasks = require("../models/tasks");
const db = require("../db");
const { projects } = require("../collections");
const { ObjectId } = require("mongodb");
require("dotenv").config();

const url = process.env.MONGODB_URL;

// Create a project
router.post("/create", async (req, res) => {
  try {
    const username = req.body.username;
    const projectName = req.body.projectName;
    const token = req.headers.authorization;

    const jwt_secret_key = process.env.JWT_SECRET;
    const decoded_token = jwt.verify(token, jwt_secret_key);

    if (decoded_token.username === username) {
      await mongoose.connect(url);
      const user = await Users.findOne({ username: username });
      const project = await Projects.findOne({
        name: projectName,
        createdBy: user._id.toString(),
      });
      if (project === null) {
        await Projects.create({
          name: projectName,
          createdBy: user._id.toString(),
          users: [user._id.toString()],
        });

        res.status(res.statusCode).json({ message: "Project created" });
      } else {
        res.status(res.statusCode).json({ message: "Project already exists" });
      }
    }
  } catch (error) {
    res
      .status(res.statusCode)
      .json({ message: "Please Try Again", error: error });
  } finally {
    await mongoose.disconnect();
  }
});

// Get all projects by username
router.get("/getAllProjects/:username", async (req, res) => {
  const username = req.params.username;
  const token = req.headers.authorization;

  const jwt_secret_key = process.env.JWT_SECRET;
  const decoded_token = jwt.verify(token, jwt_secret_key);

    await mongoose.connect(url);
    const user = await Users.findOne({ username: username });
    const projects = await Projects.find({ createdBy: user._id.toString() });
    const projectsAsUser = await Projects.find({ users: user._id.toString() });
    const projects_array = [];
    const project_ids = [];
    projects.forEach((project) => {
      project_ids.push(project._id.toString());
      projects_array.push({
        _id: project._id.toString(),
        name: project.name,
      });
    });

    projectsAsUser.forEach((project) => {
      if(!project_ids.includes(project._id.toString())) {
        projects_array.push({
          _id: project._id.toString(),
          name: project.name,
        });
      }
    });

    await mongoose.disconnect();
    res.status(res.statusCode).json(projects_array);
});

// Get single project by projectId
router.get("/getSingleProject/:username/:projectId", async (req, res) => {
    const username = req.params.username;
    const projectId = req.params.projectId;
    const token = req.headers.authorization;
    
    const jwt_secret_key = process.env.JWT_SECRET;
    const decoded_token = jwt.verify(token, jwt_secret_key);
    
    if (decoded_token.username === username) {
      await mongoose.connect(url);

      const project = await projects.findOne({ _id: new ObjectId(projectId) });

      await mongoose.disconnect();
      
      res.status(res.statusCode).json(project);
    }
});

// Edit project name
router.post("/editName", async (req, res) => {
  try {
    const username = req.body.username;
    const projectId = req.body.projectId;
    const projectNewName = req.body.projectNewName;
    const token = req.headers.authorization;

    const jwt_secret_key = process.env.JWT_SECRET;
    const decoded_token = jwt.verify(token, jwt_secret_key);

    if (decoded_token.username === username) {
      await mongoose.connect(url);
      const user = await Users.findOne({ username: username });
      const project = await Projects.findById(projectId);
      if(project.createdBy === user._id.toString()) {
        await Projects.findByIdAndUpdate(projectId, {
          $set: {
            name: projectNewName,
          },
        });
        
        res.status(res.statusCode).json({ message: "Project updated" });
      }
      else {
        res.status(res.statusCode).json({ message: "Access Denied" });
      }
    }
  } catch (error) {
    res
      .status(res.statusCode)
      .json({ message: "Please Try Again", error: error });
  } finally {
    await mongoose.disconnect();
  }
});

router.delete('/deleteProject/:username/:projectId', async (req, res) => {
  try {
    const username = req.params.username;
    const projectId = req.params.projectId;
    const token = req.headers.authorization;

    const jwt_secret_key = process.env.JWT_SECRET;
    const decoded_token = jwt.verify(token, jwt_secret_key);

    if (decoded_token.username === username) {
      await mongoose.connect(url);
      const user = await Users.findOne({ username: username });
      const project = await Projects.findById(projectId);
      if(project.createdBy === user._id.toString()) {
        const tasks = await Tasks.find({ projectId: projectId });
        for (const task of tasks) {
          await Tasks.findByIdAndDelete(task._id.toString());
        }
        await Projects.findByIdAndDelete(projectId);

        res.status(res.statusCode).json({ message: "Project deleted" });
      }
      else {
        res.status(res.statusCode).json({ message: "Access Denied" });
      }
    }
  } catch (error) {
    res
      .status(res.statusCode)
      .json({ message: "Please Try Again", error: error });
  } finally {
    await mongoose.disconnect();
  }
})

module.exports = router;