const express = require("express");
const feedbackRouter = express.Router();
const { verifyToken } = require("../middleware");
const mongoose = require("mongoose");

const feedbackSchema = mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  content: {
    type: String,
    required: true,
  },
  date: {
    type: Date,
    default: Date.now,
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5,
  },
});

const Feedback = mongoose.model("Feedback", feedbackSchema);

feedbackRouter.get("/", verifyToken, async (req, res) => {
  try {
    const result = await Feedback.find();
    res.status(200).json(result);
  } catch (error) {
    console.error("Error retrieving feedback:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

feedbackRouter.get("/:id", verifyToken, async (req, res) => {
  const feedbackID = req.params.id;
  if (!feedbackID) {
    return res.status(400).json({ message: "Feedback ID is required" });
  }
  try {
    const result = await Feedback.findById(feedbackID);
    if (!result) {
      return res.status(404).json({ message: "Feedback not found" });
    }
    res.status(200).json(result);
  } catch (error) {
    console.error("Error retrieving feedback:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

feedbackRouter.post("/add", verifyToken, async (req, res) => {
  const { title, content, rating } = req.body;
  if (!title || !content || !rating) {
    return res.status(400).json({ message: "All fields are required" });
  }
  try {
    const newFeedback = new Feedback({
      title,
      content,
      rating,
    });
    await newFeedback.save();
    res.status(201).json(newFeedback);
  } catch (error) {
    console.error("Error adding feedback:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

feedbackRouter.delete("/delete/:id", verifyToken, async (req, res) => {
  const feedbackID = req.params.id;
  if (!feedbackID) {
    return res.status(400).json({ message: "Feedback ID is required" });
  }
  try {
    const result = await Feedback.findByIdAndDelete(feedbackID);
    if (!result) {
      return res.status(404).json({ message: "Feedback not found" });
    }
    res.status(200).json({ message: "Feedback deleted successfully" });
  } catch (error) {
    console.error("Error deleting feedback:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = feedbackRouter;
