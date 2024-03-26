const express = require('express');
const userRouter = express.Router();
const db = require('../dbConfig');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { verifyToken } = require('../middleware');
const axios = require('axios');
const { Pool } = require('pg');
const dbConfig = require('../dbConfig');

// ---------------- HASHING PASSWORDS ----------------
db.query('SELECT id, password FROM users', (err, result) => {
    result.rows.forEach(user => {
        const userID = user.id;
        const password = user.password;
        const isHashed = password.startsWith("$2");
        if (!isHashed) {
            const mySalt = bcrypt.genSaltSync(10);
            const myHash = bcrypt.hashSync(password, mySalt);
            db.query('UPDATE users SET password = $1 WHERE id = $2', [myHash, userID], (err, result) => {
                if (err) {
                    console.log(err);
                }
            });
        }
    });
});


// ---------------- LOGIN ----------------
userRouter.post('/login', async (req, res) => {
    const { username, password, email } = req.body;
    db.query('SELECT * FROM users WHERE username = $1 AND email = $2', [username, email], (err, result) => {
        if (err) {
            res.status(500).json({ message: "An error occurred" });
        } else if (result.rows.length === 0) {
            res.status(401).json({ message: "Invalid user and email" });
        }
        else {
            const user = result.rows[0];
            const isPasswordValid = bcrypt.compareSync(password, user.password);
            if (isPasswordValid) {
                const id = user.id;
                const token = jwt.sign({id},'secretkeyStefana', { expiresIn: '1h' })
                const userData = {
                    id: user.id,
                    username: user.username,
                    email: user.email,
                    isAdmin: user.isadmin,
                }
                res.status(200).json({ auth: true, token: token, userData: userData});
                
            } else {
                res.status(401).json({ message: "Invalid credentials" });
            }
        }
    });
});

// -- create user
userRouter.post('/create', async (req, res) => {
    const { username, password, email, isAdmin } = req.body;
    const hashedPassword = bcrypt.hashSync(password, 10);
    db.query('INSERT INTO users (username, password, email, isadmin) VALUES ($1, $2, $3, $4) RETURNING id', [username, hashedPassword, email, isAdmin], (err, result) => {
        if (err) {
            res.status(500).json({ message: "An error occurred" });
        } else {
            res.status(201).json({ message: "User created", id: result.rows[0].id });
        }
    });
});

userRouter.get('/allUsers/:id', verifyToken, async (req, res) => {
    const id = req.params.id;
    db.query('SELECT * FROM users WHERE id != $1', [id], (err, result) => {
        if (err) {
            res.status(500).json({ message: "An error occurred" });
        } else {
            res.status(200).json(result.rows);
        }
    });
});

userRouter.get('/all', verifyToken, async (req, res) => {
    db.query('SELECT * FROM users', (err, result) => {
        if (err) {
            res.status(500).json({ message: "An error occurred" });
           
        } else {
            res.status(200).json(result.rows);
            console.log(result.rows);
        }
    });
});

userRouter.get('/:id', verifyToken, async (req, res) => {
    const id = req.params.id;
    db.query('SELECT * FROM users WHERE id = $1', [id], (err, result) => {
        if (err) {
            res.status(500).json({ message: "An error occurred" });
        } else if (result.rows.length === 0) {
            res.status(404).json({ message: "User not found" });
        } else {
            res.status(200).json(result.rows[0]);
        }
    });
});

userRouter.get('/username/:id',  verifyToken, async (req, res) => {
    const id = req.params.id;
    db.query('SELECT username FROM users WHERE id = $1', [id], (err, result) => {
        if (err) {
            res.status(500).json({ message: "An error occurred" });
        } else if (result.rows.length === 0) {
            res.status(404).json({ message: "User not found" });
        } else {
            res.status(200).json(result.rows[0]);
        }
    });
});


// update username
userRouter.put('/updateUsername/:id', verifyToken, async (req, res) => {
    const id = req.params.id;
    const { username } = req.body;
    db.query('UPDATE users SET username = $1 WHERE id = $2', [username, id], (err, result) => {
        if (err) {
            res.status(500).json({ message: "An error occurred" });
        } else {
            res.status(200).json({ message: "Username updated" });
        }
    });
});

// update email
userRouter.put('/updateEmail/:id', verifyToken, async (req, res) => {
    const id = req.params.id;
    const { email } = req.body;
    db.query('UPDATE users SET email = $1 WHERE id = $2', [email, id], (err, result) => {
        if (err) {
            res.status(500).json({ message: "An error occurred" });
        } else {
            res.status(200).json({ message: "Email updated" });
        }
    });
});

// update password
userRouter.put('/updatePassword/:id', verifyToken, async (req, res) => {
    const id = req.params.id;
    const { password } = req.body;
    const hashedPassword = bcrypt.hashSync(password, 10);
    db.query('UPDATE users SET password = $1 WHERE id = $2', [hashedPassword, id], (err, result) => {
        if (err) {
            res.status(500).json({ message: "An error occurred" });
        } else {
            res.status(200).json({ message: "Password updated" });
        }
    });
});

//update isAdmin
userRouter.put('/updateIsAdmin/:id', verifyToken, async (req, res) => {
    const id = req.params.id;
    const { isAdmin } = req.body;
    if(isAdmin === true){
        db.query('UPDATE users SET isadmin = $1 WHERE id = $2', [true, id], (err, result) => {
            if (err) {
                res.status(500).json({ message: "An error occurred" });
            } else {
                res.status(200).json({ message: "User is now admin" });
            }
        });
    } else {
        db.query('UPDATE users SET isadmin = $1 WHERE id = $2', [false, id], (err, result) => {
            if (err) {
                res.status(500).json({ message: "An error occurred" });
            } else {
                res.status(200).json({ message: "User is no longer admin" });
            }
        });
    }
});


userRouter.delete('/:id', verifyToken, async (req, res) => {
    const userId = req.params.id;
    const numericUserId = parseInt(userId);

    if (isNaN(numericUserId)) {
        return res.status(400).json({ message: "Invalid user ID" });
    }

    try {
   
        await db.query('BEGIN');

        // delete form mongo
        await axios.delete(`http://localhost:7979/privateMessages/deleteByUser/${numericUserId}`, {
            headers: {
                "x-access-token": req.headers['x-access-token'],
            },
        });

        await axios.delete(`http://localhost:7979/groupMessages/deleteByUser/${numericUserId}`, {
            headers: {
                "x-access-token": req.headers['x-access-token'],
            },
        });

        // delete form postgres
        await db.query('DELETE FROM todo_list WHERE user_id = $1', [numericUserId]);
        await db.query('DELETE FROM privatechats WHERE user1_id = $1 OR user2_id = $1', [numericUserId]);
        await db.query('DELETE FROM user_in_group WHERE user_id = $1', [numericUserId]);
        await db.query('DELETE FROM user_details WHERE user_id = $1', [numericUserId]);

        // delete the user
        await db.query('DELETE FROM users WHERE id = $1', [numericUserId]);
        
        await db.query('COMMIT');

        res.status(200).json({ message: "User deleted" });
    } catch (error) {
      
        await db.query('ROLLBACK');
        console.error(error);
        res.status(500).json({ message: "An error occurred" });
    }
});


console.log('...UserRouter is running');




module.exports = userRouter;