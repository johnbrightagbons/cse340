// index.js

const { Pool } = require("pg");
require("dotenv").config();

/**********
 * Connection Pool
 * SSL is required for production (Render/Heroku/Postgres cloud providers).
 * In development, we also enable SSL but relax the certificate check.
 **********/

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

// Export a consistent query interface
module.exports = {
  async query(text, params) {
    try {
      const res = await pool.query(text, params);
      if (process.env.NODE_ENV === "development") {
        console.log("executed query", { text });
      }
      return res;
    } catch (error) {
      console.error("error in query", { text, error });
      throw error;
    }
  },
};
