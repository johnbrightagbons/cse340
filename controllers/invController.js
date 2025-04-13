const invModel = require("../models/inventory-model");
const utilities = require("../utilities/");

const invCont = {};

/* ***************************
 *  Build inventory by classification view
 ************************** */
invCont.buildByClassificationId = async function (req, res, next) {
  const classification_id = req.params.classificationId;
  const data = await invModel.getInventoryByClassificationId(classification_id);

  if (!data || data.length === 0) {
    return res.status(404).send("No vehicles found for this classification.");
  }

  const grid = utilities.buildClassificationGrid(data);
  let nav = await utilities.getNav();
  const className = data[0].classification_name;

  res.render("inventory/classification", {
    title: className + " vehicles",
    nav,
    grid,
  });
};

/* ***************************
 *  Build vehicle detail view
 ************************** */
invCont.showVehicleDetail = async function (req, res, next) {
  const inv_id = req.params.inv_id;
  try {
    const vehicle = await invModel.getVehicleById(inv_id);
    console.log(vehicle); // Log the vehicle object to debug
    if (!vehicle) {
      return res.status(400).send("Vehicle not found");
    }
    const vehicleHTML = utilities.formatVehicleHtml(vehicle);
    const nav = await utilities.getNav(); // Create the nav variable
    res.render("inventory/vehicleDetail", {
      title: `${vehicle.inv_make} ${vehicle.inv_model}`,
      vehicleHTML,
      nav, // Pass nav to the template
    });
  } catch (error) {
    console.error(error);
    res.status(500).send("Error fetching vehicle details.");
  }
};

/* ***************************
 *  Handle favicon.ico requests
 ************************** */
invCont.handleFavicon = (req, res) => {
  res.status(204).end(); // Respond with no content for favicon requests
};

/* ***************************
 *  Build classification select list
 ************************** */
invCont.buildClassificationList = async function () {
  try {
    const classifications = await invModel.getClassifications();

    // Validate data structure more thoroughly
    if (
      !classifications ||
      !Array.isArray(classifications) ||
      classifications.some(
        (c) => !c.classification_id || !c.classification_name
      )
    ) {
      console.error("Invalid classifications data structure:", classifications);
      throw new Error("Invalid classifications data");
    }

    // Build select list with validation
    let classificationList = `
      <select id='classificationSelect' name='classificationSelect' class='form-control'>
        <option value=''>Select a Classification</option>
    `;

    classifications.forEach((classification) => {
      if (
        classification.classification_id &&
        classification.classification_name
      ) {
        classificationList += `
          <option value="${classification.classification_id}">
            ${classification.classification_name}
          </option>
        `;
      }
    });

    classificationList += "</select>";
    return classificationList;
  } catch (error) {
    console.error("Error in buildClassificationList:", error);
    return `
      <select id='classificationSelect' name='classificationSelect' class='form-control'>
        <option value=''>Error loading classifications - please try again later</option>
      </select>
    `;
  }
};

/* ***************************
 *  Build Vehicle management view
 ************************** */
invCont.buildInventoryManagement = async function (req, res, next) {
  try {
    let nav = await utilities.getNav();
    const classificationSelect = await invCont.buildClassificationList();

    res.render("inventory/invManagement", {
      title: "Vehicle Management",
      nav,
      classificationSelect,
      errors: null,
    });
  } catch (error) {
    console.error("Error in buildInventoryManagement:", error);
    next(error); // Pass the error to the error-handling middleware
  }
};

/* ***************************
 * Return Inventory JSON Data for classification_id (AJAX)
 ************************** */
invCont.getInventoryJSON = async (req, res, next) => {
  try {
    const classification_id = parseInt(req.params.classification_id);
    const invData = await invModel.getInventoryByClassificationId(
      classification_id
    );

    if (invData.length > 0) {
      return res.json(invData);
    } else {
      throw new Error(
        "No inventory data found for the selected classification."
      );
    }
  } catch (error) {
    console.error("Error in getInventoryJSON:", error);
    res.status(500).json({ error: "Failed to retrieve inventory data." });
  }
};

module.exports = invCont;
