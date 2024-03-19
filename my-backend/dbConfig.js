require('dotenv').config();
const pg =require('pg');
const { DB_USERNAME, DB_PASSWORD, DB_DATABASE, DB_HOST, PORT } = process.env;

const pool = new pg.Pool({
    user: DB_USERNAME,
    password: DB_PASSWORD,
    host: DB_HOST,
    database: DB_DATABASE,
    port: PORT,

});

module.exports = pool;


 
