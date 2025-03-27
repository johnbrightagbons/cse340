const pool = require("../database/")

const invModel = {}

/* ***************************
 *  Get all classification data
 * ************************** */
invModel.getClassifications = async function () {
  return await pool.query("SELECT * FROM public.classification ORDER BY classification_name")
}

/* ***************************
 *  Get all inventory items and classification_name by classification_id
 * ************************** */
invModel.getInventoryByClassificationId = async function (classification_id) {
  try {
    const data = await pool.query(
      `SELECT * FROM public.inventory AS i 
      JOIN public.classification AS c 
      ON i.classification_id = c.classification_id 
      WHERE i.classification_id = $1`,
      [classification_id]
    )
    return data.rows
  } catch (error) {
    console.error("getclassificationsbyid error " + error)
  }
}

/* ***************************
 *  Get vehicle details by inv_id
 * ************************** */
invModel.getVehicleById = async function (inv_id) {
  try {
    const result = await pool.query('SELECT * FROM inventory WHERE inv_id = $1', [inv_id]);
    console.log(result.rows[0]); // Log the result to debug
    return result.rows[0];
  } catch (error) {
    console.error('Error fetching vehicle by ID:', error);
    throw error;
  }
}

module.exports = invModel;
