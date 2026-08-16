const { Pool } = require("pg");

const pool = new Pool({
    user: "postgres",
    host: "localhost",
    database: "LostFoundDB",
    password: "sql123",
    port: 5432
});

module.exports = pool;