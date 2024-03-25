const express = require('express');
const privateChatRouter = express.Router();
const { verifyToken } = require('../middleware');
const db = require('../dbConfig');

privateChatRouter.get('/', verifyToken, async (req, res) => {
    try {
        const result = await db.query('SELECT * FROM privatechats');
        res.status(200).json(result.rows);
    } catch (error) {
        console.error('Error getting private chats:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

privateChatRouter.post('/create', verifyToken, async (req, res) => {
    const { user1_id, user2_id } = req.body;
    if (!user1_id || !user2_id) {
        return res.status(400).json({ message: 'User IDs are required' });
    }
    try {
        const existingChat = await db.query('SELECT * FROM privatechats WHERE (user1_id = $1 AND user2_id = $2) OR (user1_id = $2 AND user2_id = $1)', [user1_id, user2_id]);
        if (existingChat.rows.length > 0) {
            return res.status(409).json({ message: 'Private chat already exists' });
        }
        const result = await db.query('INSERT INTO privatechats (user1_id, user2_id) VALUES ($1, $2) RETURNING *', [user1_id, user2_id]);
        res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error('Error creating private chat:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

privateChatRouter.get('/checkExistence/:user1_id/:user2_id', verifyToken, async (req, res) => {
    const { user1_id, user2_id } = req.params;
    if (!user1_id || !user2_id) {
        return res.status(400).json({ message: 'User IDs are required' });
    }
    try {
        const existingChat = await db.query('SELECT * FROM privatechats WHERE (user1_id = $1 AND user2_id = $2) OR (user1_id = $2 AND user2_id = $1)', [user1_id, user2_id]);
        if (existingChat.rows.length > 0) {
            return res.status(200).json({ exists: true });
        } else {
            return res.status(200).json({ exists: false });
        }
    } catch (error) {
        console.error('Error checking private chat existence:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});


privateChatRouter.get('/getChatListByCurrentUser/:id', verifyToken, async (req, res) => {
    const userID = req.params.id;
    if (!userID) {
        return res.status(400).json({ message: 'User ID is required' });
    }
    try {
        const result = await db.query('SELECT * FROM privatechats WHERE user1_id = $1 OR user2_id= $1', [userID]);
        res.status(200).json(result.rows);
    } catch (error) {
        console.error('Error getting private chats:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});


privateChatRouter.get('/getByCurrentUser/:chatID', verifyToken, async (req, res) => {
    const chatID = req.params.chatID;
    if (!chatID) {
        return res.status(400).json({ message: 'Chast ID is required' });
    }
    try {
        const result = await db.query('SELECT * FROM privatechats WHERE chat_id = $1', [chatID]);
        res.status(200).json(result.rows);
    } catch (error) {
        console.error('Error getting private chats:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

module.exports = privateChatRouter;

