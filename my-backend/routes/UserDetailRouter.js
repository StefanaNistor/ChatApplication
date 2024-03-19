const express = require('express');
const userDetailsRouter = express.Router();
const db = require('../dbConfig');
const { verifyToken } = require('../middleware');

userDetailsRouter.get('/:id', verifyToken, async (req, res) => {
    const userID = req.params.id;
    db.query('SELECT * FROM user_details WHERE user_id = $1', [userID], (err, result) => {
        if (err) {
            console.log('ERROR BACKEND')
            res.status(500).json({ message: "An error occurred" });
        } else {
            // console.log('User details:', result.rows)
            res.status(200).json(result.rows);
        }
    });
});

// ------------------- ADD details -------------------

userDetailsRouter.post('/addPhone', verifyToken, async (req, res) => {
    const { phone, userID } = req.body;
    db.query('INSERT INTO user_details (phone, user_id) VALUES ($1, $2)', [phone, userID], (err, result) => {
        if (err) {
            res.status(500).json({ message: "An error occurred" });
        } else {
            res.status(201).json({ message: "Phone added successfully" });
        }
    });
});

userDetailsRouter.post('/addHobby', verifyToken, async (req, res) => {
    const { hobby, userID } = req.body;
    db.query('INSERT INTO user_details (hobby, user_id) VALUES ($1, $2)', [hobby, userID], (err, result) => {
        if (err) {
            res.status(500).json({ message: "An error occurred" });
        } else {
            res.status(201).json({ message: "Hobby added successfully" });
        }
    });
});

userDetailsRouter.post('/addAbout', verifyToken, async (req, res) => {
    const { about, userID } = req.body;
    db.query('INSERT INTO user_details (about, user_id) VALUES ($1, $2)', [about, userID], (err, result) => {
        if (err) {
            res.status(500).json({ message: "An error occurred" });
        } else {
            res.status(201).json({ message: "About added successfully" });
        }
    });
});

userDetailsRouter.post('/addDateOfBirth', verifyToken, async (req, res) => {
    const { dateOfBirth, userID } = req.body;
    db.query('INSERT INTO user_details (date_of_birth, user_id) VALUES ($1, $2)', [dateOfBirth, userID], (err, result) => {
        if (err) {
            res.status(500).json({ message: "An error occurred" });
        } else {
            res.status(201).json({ message: "Date of birth added successfully" });
        }
    });
});

// ------------------- EDIT details -------------------

userDetailsRouter.put('/updatePhone', verifyToken, async (req, res) => {
    const { phone, userID } = req.body;
    db.query('UPDATE user_details SET phone = $1 WHERE user_id = $2', [phone, userID], (err, result) => {
        if (err) {
            res.status(500).json({ message: "An error occurred" });
        } else {
            res.status(200).json({ message: "Phone updated successfully" });
        }
    });
});

userDetailsRouter.put('/updateHobby', verifyToken, async (req, res) => {
    const { hobby, userID } = req.body;
    db.query('UPDATE user_details SET hobby = $1 WHERE user_id = $2', [hobby, userID], (err, result) => {
        if (err) {
            res.status(500).json({ message: "An error occurred" });
        } else {
            res.status(200).json({ message: "Hobby updated successfully" });
        }
    });
});

userDetailsRouter.put('/updateAbout', verifyToken, async (req, res) => {
    const { about, userID } = req.body;
    db.query('UPDATE user_details SET about = $1 WHERE user_id = $2', [about, userID], (err, result) => {
        if (err) {
            res.status(500).json({ message: "An error occurred" });
        } else {
            res.status(200).json({ message: "About updated successfully" });
        }
    });
});

userDetailsRouter.put('/updateDateOfBirth', verifyToken, async (req, res) => {
    const { dateOfBirth, userID } = req.body;
    db.query('UPDATE user_details SET date_of_birth = $1 WHERE user_id = $2', [dateOfBirth, userID], (err, result) => {
        if (err) {
            res.status(500).json({ message: "An error occurred" });
        } else {
            res.status(200).json({ message: "Date of birth updated successfully" });
        }
    });
});

//------------------- DELETE details -------------------

userDetailsRouter.delete('/deletePhone', verifyToken, async (req, res) => {
    const { userID } = req.body;
    db.query('UPDATE user_details SET phone = $1 WHERE user_id = $2', [null, userID], (err, result) => {
        if (err) {
            res.status(500).json({ message: "An error occurred" });
        } else {
            res.status(200).json({ message: "Phone deleted successfully" });
        }
    });
});

userDetailsRouter.delete('/deleteHobby', verifyToken, async (req, res) => {
    const { userID } = req.body;
    db.query('UPDATE user_details SET hobby = $1 WHERE user_id = $2', [null, userID], (err, result) => {
        if (err) {
            res.status(500).json({ message: "An error occurred" });
        } else {
            res.status(200).json({ message: "Hobby deleted successfully" });
        }
    });
});

userDetailsRouter.delete('/deleteAbout', verifyToken, async (req, res) => {
    const { userID } = req.body;
    db.query('UPDATE user_details SET about = $1 WHERE user_id = $2', [null, userID], (err, result) => {
        if (err) {
            res.status(500).json({ message: "An error occurred" });
        } else {
            res.status(200).json({ message: "About deleted successfully" });
        }
    });
});

userDetailsRouter.delete('/deleteDateOfBirth', verifyToken, async (req, res) => {
    const { userID } = req.body;
    db.query('UPDATE user_details SET date_of_birth = $1 WHERE user_id = $2', [null, userID], (err, result) => {
        if (err) {
            res.status(500).json({ message: "An error occurred" });
        } else {
            res.status(200).json({ message: "Date of birth deleted successfully" });
        }
    });
});

module.exports = userDetailsRouter;