const express = require('express');
const grupChatRouter = express.Router();
const db = require('../dbConfig');
const { verifyToken } = require('../middleware');
const axios = require('axios');

grupChatRouter.get('/',  verifyToken, async (req, res) => {
    db.query('SELECT * FROM groupchat', (err, result) => {
        if (err) {
            console.log('ERROR BACKEND')
            res.status(500).json({ message: "An error occurred" });
        } else {
            res.status(200).json(result.rows);
        }
    });
}
);

grupChatRouter.get("/:id", verifyToken, async (req, res) => {
    const userID = req.params.id;
    db.query(
        `SELECT * FROM groupchat, user_in_group 
        WHERE user_in_group.user_id = $1 AND user_in_group.group_id = groupchat.id`,
        [userID],
        (err, result) => {
            if (err) {
                console.log("ERROR BACKEND");
                res.status(500).json({ message: "An error occurred" });
            } else {
                res.status(200).json(result.rows);
            }
        }
    );
});
  
  grupChatRouter.get("/getGroup/:id", verifyToken, async (req, res) => {
    const groupId = req.params.id;
    if (!groupId) {
      return res.status(400).json({ message: "Group chat ID is required" });
    }
    try {
      const result = await db.query("SELECT * FROM groupchat WHERE id = $1", [groupId]);
      if (result.rows.length === 0) {
        return res.status(404).json({ message: "Group chat not found" });
      }
      res.status(200).json(result.rows[0]);
    } catch (err) {
      console.error("Error retrieving group chat:");
      res.status(500).json({ message: "An error occurred while retrieving group chat" });
    }
  });

  grupChatRouter.get("/members/:id", verifyToken, async (req, res) => {
    const groupID = req.params.id;
    db.query(
      `SELECT * FROM users, user_in_group WHERE user_in_group.group_id = $1 AND user_in_group.user_id = users.id`,
      [groupID],
      (err, result) => {
        if (err) {
          console.log("ERROR BACKEND");
          res.status(500).json({ message: "An error occurred" });
        } else {
          res.status(200).json(result.rows);
        }
      }
    );
  }); 


  grupChatRouter.post("/createGroup", verifyToken, async (req, res) => {
    const { name, description } = req.body;
    db.query("INSERT INTO groupchat (groupname, description) VALUES ($1, $2)", [name, description], (err, result) => {
      if (err) {
        console.error("Error creating group chat:", err);
        res.status(500).json({ message: "An error occurred while creating group chat" });
      } else {
        res.status(201).json({message: "Group chat created successfully"});
      }
    });
  });

  grupChatRouter.delete("/deleteGroup/:id", verifyToken, async (req, res) => {
    const groupID = req.params.id;
    if (!groupID) {
      return res.status(400).json({ message: "Group chat ID is required" });
    }

    // delete from mongo
    axios.delete(`http://localhost:7979/groupMessages/deleteByGroup/${groupID}`)
    .then((response) => {
      console.log("Group messages deleted successfully");
    })
    .catch((error) => {
      console.error("Error deleting group messages:", error);
    });


    db.query("DELETE FROM user_in_group WHERE group_id = $1", [groupID], (err, result) => {
      if (err) {
        console.error("Error deleting user in group:", err);
        res.status(500).json({ message: "An error occurred while deleting user in group" });
      } else {

        db.query("DELETE FROM groupchat WHERE id = $1", [groupID], (err, result) => {
          if (err) {
            console.error("Error deleting group chat:", err);
            res.status(500).json({ message: "An error occurred while deleting group chat" });
          } else {
            res.status(200).json({message: "Group chat deleted successfully"});
          }
        });

      }
    });
  });

    module.exports = grupChatRouter;
  
