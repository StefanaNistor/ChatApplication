const express = require('express');
const groupMessageRouter = express.Router();
const { verifyToken } = require('../middleware');
const clientMongoDB = require('../dbConfig');
const mongoose = require('mongoose');

const groupMessage = mongoose.Schema({
    user_id: Number,
    group_id: Number,
    content: String,
    timestamp: Date,
    is_edited: {
      type: Boolean,
      default: false,
    },
    is_deleted: {
      type: Boolean,
      default: false,
    },
  });

const GroupMessage = mongoose.model('GroupMessages', groupMessage);

groupMessageRouter.get('/', async (req, res) => {
    try {
        const result = await GroupMessage.find();
        res.status(200).json(result);
        
    } catch (error) {
      console.error("Error handling group messages:", error);
      res.status(500).json({ error: "EROARE BACKEND" });
    }
  });

groupMessageRouter.get('/getByGroup/:id', verifyToken, async (req, res) => {
    const groupID = req.params.id;
    if (!groupID || groupID === "undefined" || groupID === "null")  {
      return res.status(400).json({ message: "Group ID is required" });
    }
    try {
      const result = await GroupMessage.find({ group_id: groupID });
      res.status(200).json(result);
    } catch (error) {
      console.error("EROARE BACKEND");
      res.status(500).json({ error: "EROARE BACKEND" });
    }
  });

groupMessageRouter.post('/add', async (req, res) => {
    const { user_id, group_id, content, timestamp } = req.body;
    if (!user_id || !group_id || !content || !timestamp) {
      return res.status(400).json({ message: "All fields are required" });
    }
    try {
      const newGroupMessage = new GroupMessage({
        user_id,
        group_id,
        content,
        timestamp,
      });
      await newGroupMessage.save();
      res.status(201).json(newGroupMessage);
    } catch (error) {
      console.error("Error adding group message:", error);
      res.status(500).json({ error: "EROARE BACKEND" });
    }
  });


  
groupMessageRouter.delete('/deleteByUser/:id', async (req, res) => {
    const userId = req.params.id;
    if (!userId) {
      return res.status(400).json({ message: "User ID is required" });
    }
    try {
      const result = await GroupMessage.updateMany({ user_id: userId }, { user_id: 0 });
      res.status(200).json(result);
    } catch (error) {
      console.error("Error deleting group messages:", error);
      res.status(500).json({ error: "EROARE BACKEND" });
    }
  });

  groupMessageRouter.delete('/deleteByGroup/:id', async (req, res) => {
    const groupId = req.params.id;
    if (!groupId) {
      return res.status(400).json({ message: "Group ID is required" });
    }
    try {
      const result = await GroupMessage.deleteMany({ group_id: groupId });
      res.status(200).json(result);
    } catch (error) {
      console.error("Error deleting group messages:", error);
      res.status(500).json({ error: "EROARE BACKEND" });
    }
  });

  groupMessageRouter.delete('/deleteMsg/:id', async (req, res) => {
    const msgId = req.params.id;
    if (!msgId) {
      return res.status(400).json({ message: "Message ID is required" });
    }
    try {
      const result = await GroupMessage.findByIdAndUpdate(msgId, { is_deleted: true });
      res.status(200).json(result);
    } catch (error) {
      console.error("Error deleting group messages:", error);
      res.status(500).json({ error: "EROARE BACKEND" });
    }
  });

  groupMessageRouter.put('/editMsg/:id', async (req, res) => {
    const msgId = req.params.id;
    const { content } = req.body;
    if (!msgId || !content) {
      return res.status(400).json({ message: "Message ID and content are required" });
    }
    try {
      const result = await GroupMessage.findByIdAndUpdate(msgId, { content, is_edited: true });
      res.status(200).json(result);
    } catch (error) {
      console.error("Error editing group message:", error);
      res.status(500).json({ error: "EROARE BACKEND" });
    }
  });

  module.exports = groupMessageRouter;