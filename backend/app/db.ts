import { Pool } from "pg";

const pool = new Pool({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB,
});

pool.on("connect", (client) => {
  client.query(`SET search_path TO public,${process.env.DB_SCHEMA}`);
});

export default pool;
