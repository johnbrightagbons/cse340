// inventory-model.js stores all data interactions

const pool = require("../database/"); //  imports the database connection file

/***************************************
 * Get all classification data
 ************************************* */
// creates an "asynchronous" function, named getClassifications
async function getClassifications() {
  // Returns the result of the SQL query
  return await pool.query(
    "SELECT * FROM public.classification ORDER BY classification_name"
  );
}

/* ***************************
 *  Get all inventory items and classification_name by classification_id
 * ************************** */
async function getInventoryByClassificationId(classification_id) {
  try {
    const data = await pool.query(
      `SELECT * FROM public.inventory AS i 
      JOIN public.classification AS c 
      ON i.classification_id = c.classification_id 
      WHERE i.classification_id = $1`,
      [classification_id]
    );
    return data.rows;
  } catch (error) {
    console.error("getclassificationsbyid error " + error);
  }
}

/* ***************************
 *  Get vehicle by ID
 * ************************** */
async function getVehicleById(inv_id) {
  try {
    const sql = "SELECT * FROM public.inventory WHERE inv_id = $1";
    const data = await pool.query(sql, [inv_id]);
    return data.rows[0]; // Return single vehicle
  } catch (error) {
    console.error("getVehicleById error:", error);
  }
}

/* ***************************
 *  Insert a new classification
 * ************************** */
async function addClassification(classification_name) {
  try {
    const sql =
      "INSERT INTO public.classification (classification_name) VALUES ($1) RETURNING *";
    const result = await pool.query(sql, [classification_name]);
    return result.rows[0];
  } catch (error) {
    console.error("addClassification error:", error);
    return null;
  }
}

async function addVehicle(vehicleData) {
  try {
    const sql = `INSERT INTO public.inventory
    (classification_id, inv_make, inv_model, inv_year, inv_description, inv_price, inv_miles, inv_color, inv_image, inv_thumbnail)
    VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
    RETURNING *;`;

    const values = [
      vehicleData.classification_id,
      vehicleData.inv_make,
      vehicleData.inv_model,
      vehicleData.inv_year,
      vehicleData.inv_description,
      vehicleData.inv_price,
      vehicleData.inv_miles,
      vehicleData.inv_color,
      vehicleData.inv_image,
      vehicleData.inv_thumbnail,
    ];

    const result = await pool.query(sql, values);
    return result.rows[0];
  } catch (error) {
    console.error("addVehicle error:", error);
    return null;
  }
}

/* ***************************
 *  Update Vehicle Data
 * ************************** */
async function updateVehicle(
  inv_id,
  inv_make,
  inv_model,
  inv_description,
  inv_image,
  inv_thumbnail,
  inv_price,
  inv_year,
  inv_miles,
  inv_color,
  classification_id
) {
  try {
    const sql =
      "UPDATE public.inventory SET inv_make = $1, inv_model = $2, inv_description = $3, inv_image = $4, inv_thumbnail = $5, inv_price = $6, inv_year = $7, inv_miles = $8, inv_color = $9, classification_id = $10 WHERE inv_id = $11 RETURNING *";
    const data = await pool.query(sql, [
      inv_make,
      inv_model,
      inv_description,
      inv_image,
      inv_thumbnail,
      inv_price,
      inv_year,
      inv_miles,
      inv_color,
      classification_id,
      inv_id,
    ]);
    return data.rows[0];
  } catch (error) {
    console.error("model error: " + error);
  }
}

/* ***************************
 *  Delete vehicle by ID
 * ************************** */
async function deleteVehicle(inv_id) {
  try {
    const sql = "DELETE FROM public.inventory WHERE inv_id = $1 RETURNING *";
    const result = await pool.query(sql, [inv_id]);
    return result.rows[0]; // deleted row (or undefined if nothing deleted)
  } catch (error) {
    console.error("deleteVehicle error:", error);
    return null;
  }
}

module.exports = {
  getClassifications,
  getInventoryByClassificationId,
  getVehicleById,
  addClassification,
  addVehicle,
  updateVehicle,
  deleteVehicle,
}; // exports the function for use elsewhere
