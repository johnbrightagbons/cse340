const invModel = require("../models/inventory-model"); // DB queries
const utilities = require("../utilities/"); // Helper utilities

const invCont = {};

/* ***************************
 *  Build inventory by classification view
 * ************************** */
invCont.buildByClassificationId = async function (req, res, next) {
  try {
    const classification_id = req.params.classificationId;
    const data = await invModel.getInventoryByClassificationId(
      classification_id
    );
    const grid = await utilities.buildClassificationGrid(data);
    const nav = await utilities.getNav();
    const className = data[0].classification_name;

    res.render("./inventory/classification", {
      title: className + " vehicles",
      nav,
      grid,
    });
  } catch (err) {
    next(err);
  }
};

/* ***************************
 *  Deliver vehicle detail view
 * ************************** */
invCont.buildById = async function (req, res, next) {
  try {
    const inv_id = parseInt(req.params.inv_id);
    const vehicle = await invModel.getVehicleById(inv_id);
    const nav = await utilities.getNav();

    if (!vehicle) {
      return res.status(404).render("errors/error", {
        title: "Vehicle Not Found",
        message: "Sorry, we could not find that vehicle.",
        nav,
      });
    }

    // Build HTML for detail view
    const vehicleHTML = utilities.formatVehicleHtml(vehicle);

    res.render("inventory/vehicleDetail", {
      title: `${vehicle.inv_make} ${vehicle.inv_model}`,
      nav,
      vehicleHTML, // send the detail HTML to the view
    });
  } catch (err) {
    next(err);
  }
};

module.exports = invCont;
