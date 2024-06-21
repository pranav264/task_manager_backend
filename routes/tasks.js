const router = require("express").Router();
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");
const Projects = require("../models/projects");
const bcrypt = require("bcrypt");
const Users = require("../models/users");
const Tasks = require("../models/tasks");
const { tasks } = require("../collections");
const { ObjectId } = require("mongodb");
require("dotenv").config();

const url = process.env.MONGODB_URL;

// Create a task
router.post("/create", async (req, res) => {
  try {
    const username = req.body.username;
    const projectId = req.body.projectId;
    const taskName = req.body.taskName;
    const token = req.headers.authorization;

    const jwt_secret_key = process.env.JWT_SECRET;
    const decoded_token = jwt.verify(token, jwt_secret_key);

    if (decoded_token.username === username) {
      await mongoose.connect(url);
      const user = await Users.findOne({ username: username });
      const task = await Tasks.findOne({
        name: taskName,
        projectId: projectId,
        createdBy: user._id.toString(),
      });
      if (task === null) {
        await Tasks.create({
          name: taskName,
          projectId: projectId,
          createdBy: user._id.toString(),
          status: "Not started",
          users: [{_id: user._id.toString(), name: user.username}],
        });

        res.status(res.statusCode).json({ message: "Task created" });
      } else {
        res.status(res.statusCode).json({ message: "Task already exists" });
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

// Get all tasks in a project
router.get("/getAllTasks/:username/:projectId", async (req, res) => {
  try {
    const username = req.params.username;
    const projectId = req.params.projectId;
    const token = req.headers.authorization;

    const jwt_secret_key = process.env.JWT_SECRET;
    const decoded_token = jwt.verify(token, jwt_secret_key);

    if (decoded_token.username === username) {
      await mongoose.connect(url);
      const user = await Users.findOne({ username: username })
      const tasks = await Tasks.find({ projectId: projectId, users: user._id.toString() });
      res.status(res.statusCode).json(tasks);
    }
  } catch (error) {
    res
      .status(res.statusCode)
      .json({ message: "Please Try Again", error: error });
  } finally {
    await mongoose.disconnect();
  }
});

// Edit task name
router.post('/editName', async (req, res) => {
  try {
    const username = req.body.username;
    const taskId = req.body.taskId;
    const taskNewName = req.body.taskNewName;
    const token = req.headers.authorization;

    const jwt_secret_key = process.env.JWT_SECRET;
    const decoded_token = jwt.verify(token, jwt_secret_key);

    if (decoded_token.username === username) {
      await mongoose.connect(url);
      const user = await Users.findOne({ username: username });
      const task = await Tasks.findById(taskId);
      if(task.createdBy === user._id.toString()) {
        await Tasks.findByIdAndUpdate(taskId, {
          $set: {
            name: taskNewName
          }
        })
        
        res.status(res.statusCode).json({ message: "Task name updated" })
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

// Update task status
router.post('/editStatus', async (req, res) => {
  try {
    const username = req.body.username;
    const taskId = req.body.taskId;
    const taskStatus = req.body.taskStatus;
    const token = req.headers.authorization;

    const jwt_secret_key = process.env.JWT_SECRET;
    const decoded_token = jwt.verify(token, jwt_secret_key);

    if (decoded_token.username === username) {
      await mongoose.connect(url);
      await Tasks.findByIdAndUpdate(taskId, {
        $set: {
          status: taskStatus
        }
      })

      res.status(res.statusCode).json({ message: "Task Status updated" })
    }
  } catch (error) {
    res
      .status(res.statusCode)
      .json({ message: "Please Try Again", error: error });
  } finally {
    await mongoose.disconnect();
  }
})

// Remove users from task
router.post('/removeUsers', async (req, res) => {
  try {
    const username = req.body.username;
    const taskId = req.body.taskId;
    const users = req.body.users;
    const token = req.headers.authorization;

    const jwt_secret_key = process.env.JWT_SECRET;
    const decoded_token = jwt.verify(token, jwt_secret_key);

    if (decoded_token.username === username) {
      await mongoose.connect(url);
      const user = await Users.findOne({ username: username });
      const task = await tasks.findOne({ _id: new ObjectId(taskId) });
      if(task.createdBy === user._id.toString()) {
        let userIds = [];
        users.forEach((user) => {
          userIds.push(user._id);
        })

        let users_ = [];
        task.users.forEach((user, index) => {
          if(!userIds.includes(user._id)) {
            users_.push(user);
          }
        })
        await Tasks.findByIdAndUpdate(taskId, {
          $set: {
            users: users_
          }
        })

        res.status(res.statusCode).json({ message: "Users removed" });
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

// Add Users to a task
router.post('/addUsers', async (req, res) => {
  try {
    const username = req.body.username;
    const taskId = req.body.taskId;
    const users = req.body.users;
    const token = req.headers.authorization;

    const jwt_secret_key = process.env.JWT_SECRET;
    const decoded_token = jwt.verify(token, jwt_secret_key);

    if (decoded_token.username === username) {
      await mongoose.connect(url);
      const user = await Users.findOne({ username: username });
      const task = await Tasks.findById(taskId);
      if(task.createdBy === user._id.toString()) {
        task.users.forEach((user) => {
          users.forEach((user_, index) => {
            if(user_._id === user._id) {
              users.splice(index, 1);
            }
          })
        })
        await Tasks.findByIdAndUpdate(taskId, {
          $push: {
            users: { $each: [...users] }
          }
        })

        res.status(res.statusCode).json({ message: "Users added" });
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

// Delete a task
router.delete('/deleteTask/:username/:taskId', async (req, res) => {
  try {
    const username = req.params.username;
    const taskId = req.params.taskId;
    const token = req.headers.authorization;

    const jwt_secret_key = process.env.JWT_SECRET;
    const decoded_token = jwt.verify(token, jwt_secret_key);

    if (decoded_token.username === username) {
      await mongoose.connect(url);
      const user = await Users.findOne({ username: username });
      const task = await Tasks.findById(taskId);
      if(task.createdBy === user._id.toString()) {
        await Tasks.findByIdAndDelete(taskId);

        res.status(res.statusCode).json({ message: "Task deleted" });
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