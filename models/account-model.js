// require the database > index file
// and store it to a local "pool" variable
const pool = require("../database/");

const accountModel = {};

/* *****************************
 *   Register new account
 * *************************** */
accountModel.registerAccount = async function (
  account_firstname,
  account_lastname,
  account_email,
  account_password
) {
  try {
    const sql =
      "INSERT INTO account (account_firstname, account_lastname, account_email, account_password, account_type) VALUES ($1, $2, $3, $4, 'Client') RETURNING *";
    return await pool.query(sql, [
      account_firstname,
      account_lastname,
      account_email,
      account_password,
    ]);
  } catch (error) {
    return error.message;
  }
};

/* *****************************
 *   Check for existing email
 * *************************** */
accountModel.checkExistingEmail = async function (account_email) {
  try {
    const sql = "SELECT * FROM account WHERE account_email = $1";
    const email = await pool.query(sql, [account_email]);
    return email.rowCount;
  } catch (error) {
    return error.message;
  }
};

/* ***************************
 *  Get account by email
 *************************** */
accountModel.getAccountByEmail = async function (email) {
  try {
    const result = await pool.query(
      "SELECT * FROM accounts WHERE account_email = $1",
      [email]
    );
    return result.rows[0];
  } catch (error) {
    console.error("Error fetching account by email:", error);
    throw error;
  }
};

module.exports = accountModel;
