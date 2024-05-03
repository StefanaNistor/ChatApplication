const express = require("express");
const toDoRouter = express.Router();
const db = require("../dbConfig");
const { verifyToken } = require("../middleware");

// const redis = require('ioredis');
// const client = new redis(); 

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

//ALL IN ONE UPDATE FUNCTION
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

//SEPEARTED UPDATE FUNCTIONS
//update flag
toDoRouter.put('/updateFlag', verifyToken, async (req, res) => {
    const { flag_id, id } = req.body;
    db.query('UPDATE todo_list SET flag_id = $1 WHERE id = $2', [flag_id, id], (err, result) => {
        if (!err) {
            res.status(200).json({ message: "Flag updated successfully" });
        } else {
            res.status(500).json({ message: "ERROR BACKEND" });
        }
    });
});

//update title 
toDoRouter.put('/updateTitle', verifyToken, async (req, res) => {
    const { title, id } = req.body;
    db.query('UPDATE todo_list SET title = $1 WHERE id = $2', [title, id], (err, result) => {
        if (!err) {
            res.status(200).json({ message: "Title updated successfully" });
        } else {
            res.status(500).json({ message: "ERROR BACKEND" });
        }
    });
});

//update content
toDoRouter.put('/updateContent', verifyToken, async (req, res) => {
    const { content, id } = req.body;
    db.query('UPDATE todo_list SET content = $1 WHERE id = $2', [content, id], (err, result) => {
        if (!err) {
            res.status(200).json({ message: "Content updated successfully" });
        } else {
            res.status(500).json({ message: "ERROR BACKEND" });
        }
    });
});

//update start date
toDoRouter.put('/updateStartDate', verifyToken, async (req, res) => {
    const { start_date, id } = req.body;
    db.query('UPDATE todo_list SET start_date = $1 WHERE id = $2', [start_date, id], (err, result) => {
        if (!err) {
            res.status(200).json({ message: "Start date updated successfully" });
        } else {
            res.status(500).json({ message: "ERROR BACKEND" });
        }
    });
});

//update end date
toDoRouter.put('/updateEndDate', verifyToken, async (req, res) => {
    const { end_date, id } = req.body;
    db.query('UPDATE todo_list SET end_date = $1 WHERE id = $2', [end_date, id], (err, result) => {
        if (!err) {
            res.status(200).json({ message: "End date updated successfully" });
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

toDoRouter.get('/', verifyToken, async (req, res) => {
    db.query('SELECT * FROM todo_list', (err, result) => {
        if (!err) {
            res.status(200).json(result.rows);
        } else {
            res.status(500).json({ message: "ERROR BACKEND" });
        }
    });
});
module.exports = toDoRouter;
