const express = require("express");
const toDoRouter = express.Router();
const db = require("../dbConfig");
const { verifyToken } = require("../middleware");

toDoRouter.get("/:id", verifyToken, async (req, res) => {
  const userID = req.params.id;
  db.query(
    "SELECT * FROM todo_list WHERE user_id = $1",
    [userID],
    (err, result) => {
      if (!err) {
        res.status(200).json(result.rows);
      } else {
        res.status(500).json({ message: "ERROR BACKEND" });
      }
    }
  );
});

toDoRouter.post("/addToDo", verifyToken, async (req, res) => {
  const { title, content, flag_id, user_id, start_date, end_date } = req.body;
  db.query(
    "INSERT INTO todo_list (title, content, flag_id, user_id, start_date, end_date) VALUES ($1, $2, $3, $4, $5, $6)",
    [title, content, flag_id, user_id, start_date, end_date],
    (err, result) => {
      if (!err) {
        res.status(201).json({ message: "To Do added successfully" });
      } else {
        res.status(500).json({ message: "ERROR BACKEND" });
      }
    }
  );
});

toDoRouter.put('/updateToDo', verifyToken, async (req, res) => {
    const { title, content, flag_id, user_id, id, start_date, end_date} = req.body;
    db.query('UPDATE todo_list SET title = $1, content = $2, flag_id = $3, user_id = $4, start_date = $6, end_date = $7 WHERE id = $5', [title, content, flag_id, user_id, id, start_date, end_date], (err, result) => {
        if (!err) {
            res.status(200).json({ message: "To Do updated successfully" });
        } else {
            res.status(500).json({ message: "ERROR BACKEND" });
        }
    });
});

toDoRouter.delete('/deleteToDo/:id', verifyToken, async (req, res) => {
    const toDoID = req.params.id;
    db.query('DELETE FROM todo_list WHERE id = $1', [toDoID], (err, result) => {
        if (!err) {
            res.status(200).json({ message: "To Do deleted successfully" });
        } else {
            res.status(500).json({ message: "ERROR BACKEND" });
        }
    });
});

module.exports = toDoRouter;
