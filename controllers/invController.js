const invModel = require("../models/inventory-model")
const utilities = require("../utilities/")

const invCont = {}

/* ***************************
 *  Build inventory by classification view
 ************************** */
invCont.buildByClassificationId = async function (req, res, next) {
  const classification_id = req.params.classificationId
  const data = await invModel.getInventoryByClassificationId(classification_id)

  if (!data || data.length === 0) {
    return res.status(404).send("No vehicles found for this classification.")
  }

  const grid = utilities.buildClassificationGrid(data)
  let nav = await utilities.getNav()
  const className = data[0].classification_name

  res.render("inventory/classification", {
    title: className + " vehicles",
    nav,
    grid, 
  })
}


/* ***************************
 *  Build vehicle detail view
 ************************** */
invCont.showVehicleDetail = async function (req, res, next) {
  const inv_id = req.params.inv_id;
  try {
    const vehicle = await invModel.getVehicleById(inv_id);
    console.log(vehicle); // Log the vehicle object to debug
    if (!vehicle){
      return res.status(400).send("Vehicle not found");
    }
    const vehicleHTML = utilities.formatVehicleHtml(vehicle);
    const nav = await utilities.getNav(); // Create the nav variable
    res.render('inventory/vehicleDetail', { 
      title: `${vehicle.inv_make} ${vehicle.inv_model}`, 
      vehicleHTML, 
      nav // Pass nav to the template
    });
  } catch (error) {
    console.error(error);
    res.status(500).send("Error fetching vehicle details.");
  }
}

/* ***************************
 *  Handle favicon.ico requests
 ************************** */
invCont.handleFavicon = (req, res) => {
  res.status(204).end(); // Respond with no content for favicon requests
}

module.exports = invCont
