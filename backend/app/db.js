const { Pool } = require("pg");
const logger = require("../log.js");

const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB,
});

pool.on("connect", (client) => {
  client.query(`SET search_path TO public,${process.env.DB_SCHEMA}`);
});

module.exports = pool;
