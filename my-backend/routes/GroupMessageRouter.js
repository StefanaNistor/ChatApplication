const express = require('express');
const groupMessageRouter = express.Router();
const { verifyToken } = require('../middleware');
const clientMongoDB = require('../dbConfig');
const mongoose = require('mongoose');

const groupMessage = mongoose.Schema({
    user_id: Number,
    group_id: Number,
    content: String,
    timestamp: Date
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


  // -- simulate delete group message but change the user id to 0
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

  module.exports = groupMessageRouter;