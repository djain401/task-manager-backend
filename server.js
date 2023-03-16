"use strict";

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();
// import route handlers

const app = express();
app.use(cors());
// fetch post req.body fields as JSON
app.use(express.json());

const PORT = process.env.PORT || 3010;
app.listen(PORT, () => {
  console.log("Express, Mongoose API listening port: ", PORT);
});

/***
 * Database stuff
 * collection products is in test
 */

mongoose.connect("mongodb://localhost:27017/Task_Manager", {
  //useNewUrlParser: true,
  //strictQuery: false
});

// create a schema
const userSchema = new mongoose.Schema({
  userName: String,
});

const taskSchema = new mongoose.Schema({
  taskName: String,
  dueDate: Date,
  status: String,
  description: String,
  priorityLevel: Number,
  assignedUser: String,
});

const userModel = mongoose.model("users", userSchema);
const taskModel = mongoose.model("tasks", taskSchema);

const getUsersFromDB = (req, res) => {
  userModel.find({}, function (error, usersArray) {
    if (error) {
      console.error("DB error: " + error);
    } else {
      res.status(200).send(usersArray);
    }
  });
};

const getTasksFromDB = (req, res) => {
  taskModel.find({}, function (error, tasksArray) {
    if (error) {
      console.error("DB error: " + error);
    } else {
      res.status(200).send(tasksArray);
    }
  });
};

const addNewUser = async (req, res) => {
  const { userName } = req.body;

  let newUser = await userModel.create({
    userName,
  });
  // send all new makeup products to client
  // including one just added.
  userModel.find({}, function (error, usersArray) {
    if (error) {
      console.error("DB error: " + error);
    } else {
      res.status(200).send(usersArray);
    }
  });
};

const addNewTask = async (req, res) => {
  const {
    taskName,
    dueDate,
    status,
    description,
    priorityLevel,
    assignedUser,
  } = req.body;

  let newTask = await taskModel.create({
    taskName,
    dueDate,
    status,
    description,
    priorityLevel,
    assignedUser,
  });

  // send all new makeup products to client
  // including one just added.
  taskModel.find({}, function (error, tasksArray) {
    if (error) {
      console.error("DB error: " + error);
    } else {
      res.status(200).send(tasksArray);
    }
  });
};

const updateTask = async (req, res) => {
  const {
    taskName,
    dueDate,
    status,
    description,
    priorityLevel,
    assignedUser,
  } = req.body;

  const newTask = {
    taskName,
    dueDate,
    status,
    description,
    priorityLevel,
    assignedUser,
  };

  // id of makeup to update
  const id = req.params.id;

  try {
    const updatedTask = await taskModel.findByIdAndUpdate(id, newTask, {
      new: true,
      overwrite: true,
    });

    // send all tasks back

    let taskArray = await taskModel.find({});
    res.status(200).json({
      message: "Successfully updated task",
      taskArray,
    });
  } catch (err) {
    res.json({
      message: `${err} - MongoDB update problem`,
    });
  }
};

const deleteTask = async (req, res) => {
  const id = req.params.id;

  try {
    await taskModel.findByIdAndDelete(id);
    // send all tasks back
    let taskArray = await taskModel.find({});
    res.status(200).json({
      message: "Successfully deleted.",
      taskArray,
    });
  } catch (err) {
    res.json({
      message: `${err} - MongoDB delete issue`,
    });
  }
};

// localhost:3000/tasks endpoint -
app.get("/users", getUsersFromDB);

// create a user
app.post("/users", addNewUser);

// get all tasks from mongodb
app.get("/task", getTasksFromDB);

// create a task
app.post("/task", addNewTask);

// update a makeup product
app.put("/task/:id", updateTask);

// delete a makeup product
app.delete("/task/:id", deleteTask);
