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
    const sql = `
      INSERT INTO account (
        account_firstname, 
        account_lastname, 
        account_email, 
        account_password, 
        account_type
      )
      VALUES ($1, $2, $3, $4, 'Client')
      RETURNING *;
    `;
    const result = await pool.query(sql, [
      account_firstname,
      account_lastname,
      account_email,
      account_password,
    ]);
    return result.rows[0]; // return just the new account
  } catch (error) {
    console.error("Database Error in registerAccount:", error);
    throw error; // pass error to controller
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
    console.error("Database Error in checkExistingEmail:", error);
    throw error;
  }
};

/* *************************************
 * Return account data using email address
 * ************************************* */
accountModel.getAccountByEmail = async function (account_email) {
  try {
    const result = await pool.query(
      `SELECT account_id, account_firstname, account_lastname, 
              account_email, account_type, account_password
       FROM account 
       WHERE account_email = $1`,
      [account_email]
    );
    return result.rows[0];
  } catch (error) {
    console.error("Database Error in getAccountByEmail:", error);
    throw error;
  }
};

/* *****************************
 *   Get Account by id
 * ***************************** */
accountModel.getAccountById = async function (account_id) {
  try {
    const result = await pool.query(
      `SELECT account_id, account_firstname, account_lastname, account_email, account_type
       FROM public.account
       WHERE account_id = $1`,
      [account_id]
    );
    return result.rows[0];
  } catch (error) {
    console.error("getAccountById error:", error);
    throw error;
  }
};

module.exports = accountModel;
