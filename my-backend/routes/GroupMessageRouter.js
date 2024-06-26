const express = require('express');
const groupMessageRouter = express.Router();
const { verifyToken } = require('../middleware');
const clientMongoDB = require('../dbConfig');
const mongoose = require('mongoose');
const axios = require('axios');

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
    fileName: String,
  imageName: String,
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
    const { user_id, group_id, content, timestamp, fileName, imageName } = req.body;
    if (!user_id || !group_id || !content || !timestamp) {
      return res.status(400).json({ message: "All fields are required" });
    }
    try {
      const newGroupMessage = new GroupMessage({
        user_id,
        group_id,
        content,
        timestamp,
        fileName,
        imageName,
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

  groupMessageRouter.delete('/deleteMsg/:userID/:timestamp/:groupID', async (req, res) => {
    const userID = req.params.userID;
    const timestamp = req.params.timestamp;
    const groupID = req.params.groupID;
    if (!userID || !timestamp || !groupID) {
      return res.status(400).json({ message: "User ID, timestamp and group ID are required" });
    }
    try {
      
      const result = await GroupMessage.findOneAndUpdate({ user_id: userID, timestamp, group_id: groupID }, { is_deleted: true });

      // cloud deletion
      const message = await GroupMessage.findOne({ user_id: userID, timestamp, group_id: groupID });
      if (!message) {
        return res.status(404).json({ message: "Message not found" });
      }
      const msgId = message._id;

      if(message.fileName){
        axios.delete(`http://localhost:7979/photos/deleteMessageAttachment/${message.fileName}`)
        await GroupMessage.findByIdAndUpdate(msgId, { fileName: "" });
      }
      if(message.imageName){
        axios.delete(`http://localhost:7979/photos/deleteMessageAttachment/${message.imageName}`)
        await GroupMessage.findByIdAndUpdate(msgId, { imageName: "" })
      }


      res.status(200).json(result);
    } catch (error) {
      console.error("Error deleting group messages:", error);
      res.status(500).json({ error: "EROARE BACKEND" });
    }
  });

  groupMessageRouter.put('/editMsg/:chatID/:timestamp', async (req, res) => {
    const chatID = req.params.chatID;
    const timestamp = req.params.timestamp;
    const newContent = req.body.content;
    if (!chatID || !timestamp || !newContent) {
      return res.status(400).json({ message: "Chat ID, timestamp and new content are required" });
    }
    try {
      const result = await GroupMessage.findOneAndUpdate({ group_id: chatID, timestamp }, { content: newContent, is_edited: true });
      res.status(200).json(result);
    } catch (error) {
      console.error("Error editing group message:", error);
      res.status(500).json({ error: "EROARE BACKEND" });
    }
  });

  module.exports = groupMessageRouter;