const express = require("express");
const privateMessageRouter = express.Router();
const { verifyToken } = require("../middleware");
const clientMongoDB = require("../dbConfig");
const mongoose = require("mongoose");

const privateMsgSchema = mongoose.Schema({
  user_id: Number,
  chat_id: Number,
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

const PrivateMessage = mongoose.model("PrivateMessages", privateMsgSchema);

privateMessageRouter.get("/", async (req, res) => {
  try {
    const result = await PrivateMessage.find();
    res.status(200).json(result);
  } catch (error) {
    console.error("Error handling private messages:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

privateMessageRouter.get("/getByUser/:id", verifyToken, async (req, res) => {
  const userID = req.params.id;
  if (!userID) {
    return res.status(400).json({ message: "User ID is required" });
  }
  try {
    const result = await PrivateMessage.find({ user_id: userID });
    res.status(200).json(result);
  } catch (error) {
    console.error("Error handling private messages:", error);
    res.status(500).json({ error: "EROARE BACKEND" });
  }
});

privateMessageRouter.get("/getByCurrentUser/:id", verifyToken, async (req, res) => {
  const userID = req.params.id;
  if (!userID) {
    return res.status(400).json({ message: "User ID is required" });
  }
  try {
    const result = await PrivateMessage.find({ user_id: userID });
    res.status(200).json(result);
  } catch (error) {
    console.error("Error handling private messages:", error);
    res.status(500).json({ error: "EROARE BACKEND" });
  }
});



privateMessageRouter.post("/add", async (req, res) => {
  const { user_id, content, timestamp, chat_id } = req.body;
  if (!user_id || !content || !timestamp || !chat_id) {
    return res.status(400).json({ message: "All fields are required" });
  }
  try {
    const newPrivateMessage = new PrivateMessage({
      user_id,
      content,
      timestamp,
      chat_id,
    });
    await newPrivateMessage.save();
    res.status(201).json(newPrivateMessage);
  } catch (error) {
    console.error("Error adding private message:", error);
    res.status(500).json({ error: "EROARE BACKEND" });
  }
});

privateMessageRouter.get("/:id", verifyToken, async (req, res) => {
  const privateMessageID = req.params.id;
  if (!privateMessageID) {
    return res.status(400).json({ message: "Private message ID is required" });
  }
  try {
    const result = await PrivateMessage.findById(privateMessageID);
    if (!result) {
      return res.status(404).json({ message: "Private message not found" });
    }
    res.status(200).json(result);
  } catch (error) {
    console.error("Error retrieving private message:", error);
    res.status(500).json({ error: "EROARE BACKEND" });
  }
});


privateMessageRouter.get("/getByChat/:id", verifyToken, async (req, res) => {
  const chatID = req.params.id;
  if (!chatID) {
    return res.status(400).json({ message: "Chat ID is required" });
  }
  try {
    const result = await PrivateMessage.find({ chat_id: chatID });
    res.status(200).json(result);
  } catch (error) {
    console.error("Error handling private messages:", error);
    res.status(500).json({ error: "EROARE BACKEND" });
  }
});




privateMessageRouter.delete("/deleteMsg/:id", async (req, res) => {
  const privateMessageID = req.params.id;
  if (!privateMessageID) {
    return res.status(400).json({ message: "Private message ID is required" });
  }
  try {
    const result = await PrivateMessage.findByIdAndUpdate(privateMessageID, { is_deleted: true });
    res.status(200).json(result);
  } catch (error) {
    console.error("Error deleting private message:", error);
    res.status(500).json({ error: "EROARE BACKEND" });
  }
});

privateMessageRouter.delete("/deleteByUser/:id", async (req, res) => {
  const userID = req.params.id;
  if (!userID) {
    return res.status(400).json({ message: "User ID is required" });
  }
  try {
    const result = await PrivateMessage.deleteMany({ user_id: userID });
    res.status(200).json(result);
  } catch (error) {
    console.error("Error deleting private messages:", error);
    res.status(500).json({ error: "EROARE BACKEND" });
  }
});

privateMessageRouter.put("/edit/:id", async (req, res) => {
  const privateMessageID = req.params.id;
  const { content } = req.body;
  if (!privateMessageID || !content) {
    return res.status(400).json({ message: "Private message ID and content are required" });
  }
  try {
    const result = await PrivateMessage.findByIdAndUpdate(privateMessageID, { content, is_edited: true });
    res.status(200).json(result);
  } catch (error) {
    console.error("Error editing private message:", error);
    res.status(500).json({ error: "EROARE BACKEND" });
  }
});

module.exports = privateMessageRouter;
