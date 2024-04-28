const express = require('express');
const flagRouter = express.Router();
const db = require('../dbConfig');
const { verifyToken } = require('../middleware');

flagRouter.get('/allFlags',verifyToken, (req,res)=>{
    db.query('SELECT * FROM flags', (err, result)=> {
        if(!err){
            res.status(200).json(result.rows);
        } else {
            res.status(500).json({ message: "ERROR BACKEND" });
        }
    });
});

flagRouter.get('/getFlagById/:id',verifyToken, (req,res)=>{
    const id = req.params.id;
    db.query('SELECT * FROM flags WHERE id = $1', [id], (err, result)=> {
        if(!err){
            res.status(200).json(result.rows);
        } else {
            res.status(500).json({ message: "ERROR BACKEND" });
        }
    });
});

module.exports = flagRouter;