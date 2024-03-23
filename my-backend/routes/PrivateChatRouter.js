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

