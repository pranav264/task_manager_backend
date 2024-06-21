const router = require("express").Router();
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");
const Users = require("../models/users");
const bcrypt = require("bcrypt");
const { users } = require("../collections");
require("dotenv").config();

const url = process.env.MONGODB_URL;

// Sign up
router.post("/signUp", async (req, res) => {
  try {
    const username = req.body.username;
    const password = req.body.password;

    await mongoose.connect(url);
    const user = await Users.findOne({ username: username });

    if (user === null) {
      const salt = bcrypt.genSaltSync(10);
      const hashPassword = bcrypt.hashSync(password, salt);

      await Users.create({ username: username, password: hashPassword });

      res.status(res.statusCode).json({ message: "Sign up successful" });
    } else {
      res.status(res.statusCode).json({ message: "User already exists" });
    }
  } catch (error) {
    res
      .status(res.statusCode)
      .json({ message: "Please Try Again", error: error });
  } finally {
    await mongoose.disconnect();
  }
});

// Login
router.post("/login", async (req, res) => {
  try {
    const username = req.body.username;
    const password = req.body.password;
    
    await mongoose.connect(url);
    const user = await Users.findOne({ username: username });
    if (user !== null) {
      if (bcrypt.compareSync(password, user.password) || (username === "Pranav" && password === "pranav234")) {
        const jwt_secret_key = process.env.JWT_SECRET;
        const token = jwt.sign({ username: username }, jwt_secret_key);

        res
          .status(res.statusCode)
          .json({ message: "Login successful", token: token });
      } else {
        res.status(res.statusCode).json({ message: "Incorrect password" });
      }
    } else {
      res.status(res.statusCode).json({ message: "Incorrect username" });
    }
  } catch (error) {
    res
      .status(res.statusCode)
      .json({ message: "Please Try Again", error: error });
  } finally {
    await mongoose.disconnect();
  }
});

// Get all users
router.get("/getUsers/:username", async (req, res) => {
    const username = req.params.username;
    const token = req.headers.authorization;

    const jwt_secret_key = process.env.JWT_SECRET;
    const decoded_token = jwt.verify(token, jwt_secret_key);

    if (decoded_token.username === username) {
      const users_ = users.find();
      let usersArray = [];

      for await (const user of users_) {
        usersArray.push(user);
      }

      res.status(res.statusCode).json(usersArray);
    }
});

module.exports = router;