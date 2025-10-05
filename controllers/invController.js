// controllers/invController.js
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
      errors: null,
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
        errors: null,
      });
    }

    // Build HTML for detail view
    const vehicleHTML = utilities.formatVehicleHtml(vehicle);

    res.render("inventory/vehicleDetail", {
      title: `${vehicle.inv_make} ${vehicle.inv_model}`,
      nav,
      vehicleHTML,
      errors: null,
    });
  } catch (err) {
    next(err);
  }
};

/* ***************************
 *  Build Inventory Management View
 * ************************** */
invCont.buildManagement = async function (req, res, next) {
  try {
    const nav = await utilities.getNav();

    // Builds the dropdown for classification
    const classificationSelect = await utilities.buildClassificationList();
    res.render("inventory/management", {
      title: "Inventory Management",
      nav,
      classificationSelect,
      errors: null,
    });
  } catch (err) {
    next(err);
  }
};

/* ***************************
 *  Deliver add classification form
 * ************************** */
invCont.buildAddClassification = async function (req, res, next) {
  const nav = await utilities.getNav();
  res.render("inventory/add-classification", {
    title: "Add New Classification",
    nav,
    errors: null,
  });
};

/* ***************************
 *  Process add classification
 * ************************** */
invCont.addClassification = async function (req, res, next) {
  try {
    const { classification_name } = req.body;
    const nav = await utilities.getNav();

    // Server-side validation
    const regex = /^[A-Za-z]/;
    if (!regex.test(classification_name)) {
      req.flash(
        "error",
        "Invalid classification name. No spaces or special characters allowed."
      );
      return res.render("inventory/add-classification", {
        title: "Add New Classification",
        nav,
        classification_name,
        errors: null,
      });
    }

    const addResult = await invModel.addClassification(classification_name);

    if (addResult) {
      req.flash("notice", "Classification added successfully!");
      let newNav = await utilities.getNav(); // refresh nav
      return res.render("inventory/management", {
        title: "Inventory Management",
        nav: newNav,
        errors: null,
      });
    } else {
      req.flash("notice", "Sorry, adding classification failed.");
      res.render("inventory/add-classification", {
        title: "Add New Classification",
        nav,
        classification_name,
        errors: null,
      });
    }
  } catch (err) {
    next(err);
  }
};

/* ***************************
 *  Deliver add vehicle form
 * ************************** */
invCont.buildAddVehicle = async function (req, res, next) {
  try {
    const nav = await utilities.getNav();
    const classificationList = await utilities.buildClassificationList();
    res.render("inventory/add-vehicle", {
      title: "Add New Vehicle",
      nav,
      classificationList,
      errors: null,
      locals: {
        classification_id: "",
        inv_make: "",
        inv_model: "",
        inv_year: "",
        inv_description: "",
        inv_price: "",
        inv_miles: "",
        inv_color: "",
        inv_image: "",
        inv_thumbnail: "",
      },
    });
  } catch (err) {
    next(err);
  }
};

/* ***************************
 *  Process add vehicle
 * ************************** */
invCont.addVehicle = async function (req, res, next) {
  try {
    const nav = await utilities.getNav();
    const {
      classification_id,
      inv_make,
      inv_model,
      inv_year,
      inv_description,
      inv_price,
      inv_miles,
      inv_color,
      inv_image,
      inv_thumbnail,
    } = req.body;

    const errors = [];
    if (!classification_id) errors.push("Please select a classification.");
    if (!inv_make || !inv_make.trim()) errors.push("Make is required.");
    if (!inv_model || !inv_model.trim()) errors.push("Model is required.");
    if (!inv_year || isNaN(Number(inv_year)) || String(inv_year).length !== 4)
      errors.push("Enter a valid 4-digit year.");
    if (!inv_price || isNaN(Number(inv_price)))
      errors.push("Enter a valid price.");
    if (!inv_miles || isNaN(Number(inv_miles)))
      errors.push("Enter valid mileage.");
    if (!inv_color || !inv_color.trim()) errors.push("Color is required.");
    if (!inv_description || !inv_description.trim())
      errors.push("Description is required.");

    const imagePath =
      inv_image && inv_image.trim()
        ? inv_image.trim()
        : "/images/no-image-available.png";
    const thumbPath =
      inv_thumbnail && inv_thumbnail.trim()
        ? inv_thumbnail.trim()
        : "/images/no-image-available-thumb.png";

    if (errors.length > 0) {
      req.flash("error", errors.join(" "));
      const classificationList = await utilities.buildClassificationList(
        classification_id
      );
      return res.status(400).render("inventory/add-vehicle", {
        title: "Add New Vehicle",
        nav,
        classificationList,
        errors,
        locals: {
          classification_id,
          inv_make,
          inv_model,
          inv_year,
          inv_description,
          inv_price,
          inv_miles,
          inv_color,
          inv_image,
          inv_thumbnail,
        },
      });
    }

    const vehicleData = {
      classification_id: Number(classification_id),
      inv_make: inv_make.trim(),
      inv_model: inv_model.trim(),
      inv_year: Number(inv_year),
      inv_description: inv_description ? inv_description.trim() : "",
      inv_price: Number(inv_price),
      inv_miles: Number(inv_miles),
      inv_color: inv_color ? inv_color.trim() : "",
      inv_image: imagePath,
      inv_thumbnail: thumbPath,
    };

    const insertResult = await invModel.addVehicle(vehicleData);

    if (insertResult) {
      req.flash("notice", "Vehicle added successfully!");
      const newNav = await utilities.getNav();
      return res.status(201).render("inventory/management", {
        title: "Inventory Management",
        nav: newNav,
        errors: null,
      });
    } else {
      req.flash("notice", "Sorry, adding the vehicle failed.");
      const classificationList = await utilities.buildClassificationList(
        classification_id
      );
      return res.status(500).render("inventory/add-vehicle", {
        title: "Add New Vehicle",
        nav,
        classificationList,
        errors: null,
        locals: {
          classification_id,
          inv_make,
          inv_model,
          inv_year,
          inv_description,
          inv_price,
          inv_miles,
          inv_color,
          inv_image,
          inv_thumbnail,
        },
      });
    }
  } catch (err) {
    next(err);
  }
};

/* ***************************
 *  Update Inventory Data
 * ************************** */
invCont.updateVehicle = async function (req, res, next) {
  let nav = await utilities.getNav();
  const {
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
    classification_id,
  } = req.body;
  const updateResult = await invModel.updateVehicle(
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
  );

  if (updateResult) {
    const itemName = updateResult.inv_make + " " + updateResult.inv_model;
    req.flash("notice", `The ${itemName} was successfully updated.`);
    res.redirect("/inv/");
  } else {
    const classificationSelect = await utilities.buildClassificationList(
      classification_id
    );
    const itemName = `${inv_make} ${inv_model}`;
    req.flash("notice", "Sorry, the insert failed.");
    res.status(501).render("inventory/edit-inventory", {
      title: "Edit " + itemName,
      nav,
      classificationSelect: classificationSelect,
      errors: null,
      inv_id,
      inv_make,
      inv_model,
      inv_year,
      inv_description,
      inv_image,
      inv_thumbnail,
      inv_price,
      inv_miles,
      inv_color,
      classification_id,
    });
  }
};

/* ***************************
 *  Return Inventory by Classification As JSON
 * ************************** */
invCont.getInventoryJSON = async (req, res, next) => {
  const classification_id = parseInt(req.params.classification_id);
  const invData = await invModel.getInventoryByClassificationId(
    classification_id
  );
  if (invData[0].inv_id) {
    return res.json(invData);
  } else {
    next(new Error("No data returned"));
  }
};

/* ***************************
 *  Build edit inventory view
 * ************************** */
invCont.buildEditInventoryView = async function (req, res, next) {
  const inv_id = parseInt(req.params.inv_id); // get id from URL
  let nav = await utilities.getNav();

  // get the inventory item by id
  const itemData = await invModel.getVehicleById(inv_id);

  // build dropdown list for classifications, preselect the one belonging to this item
  const classificationSelect = await utilities.buildClassificationList(
    itemData.classification_id
  );

  // combine make and model for display title
  const itemName = `${itemData.inv_make} ${itemData.inv_model}`;

  // render edit-inventory view and send all item data to populate the form
  res.render("./inventory/edit-vehicle", {
    title: "Edit " + itemName,
    nav,
    classificationSelect,
    errors: null,
    inv_id: itemData.inv_id,
    inv_make: itemData.inv_make,
    inv_model: itemData.inv_model,
    inv_year: itemData.inv_year,
    inv_description: itemData.inv_description,
    inv_image: itemData.inv_image,
    inv_thumbnail: itemData.inv_thumbnail,
    inv_price: itemData.inv_price,
    inv_miles: itemData.inv_miles,
    inv_color: itemData.inv_color,
    classification_id: itemData.classification_id,
  });
};

invCont.updateVehicle = async function (req, res) {
  try {
    // Clean up inv_id if it's an array
    req.body.inv_id = parseInt(
      Array.isArray(req.body.inv_id) ? req.body.inv_id[0] : req.body.inv_id
    );

    const {
      inv_id,
      classification_id,
      inv_make,
      inv_model,
      inv_year,
      inv_price,
      inv_miles,
      inv_color,
      inv_description,
      inv_image,
      inv_thumbnail,
    } = req.body;

    const updateResult = await invModel.updateVehicle(
      parseInt(inv_id),
      inv_make,
      inv_model,
      inv_description,
      inv_image,
      inv_thumbnail,
      parseFloat(inv_price),
      parseInt(inv_year),
      parseInt(inv_miles),
      inv_color,
      parseInt(classification_id)
    );

    if (updateResult) {
      req.flash(
        "notice",
        `Successfully updated ${updateResult.inv_make} ${updateResult.inv_model}.`
      );
      res.redirect("/inv/");
    } else {
      req.flash("notice", "Sorry, the update failed.");
      res.redirect(`/inv/edit-vehicle/${inv_id}`);
    }
  } catch (error) {
    console.error("❌ Controller error updating vehicle:", error);
    res.status(500).render("inventory/edit-vehicle", {
      title: "Edit Inventory Item",
      message: "Error updating vehicle. Please try again.",
    });
  }
};

/* ***************************
 *  Build Delete inventory confirmation view
 * ************************** */
invCont.buildDeleteVehicleView = async function (req, res, next) {
  try {
    const inv_id = parseInt(req.params.inv_id);
    const nav = await utilities.getNav();
    const itemData = await invModel.getVehicleById(inv_id);

    if (!itemData) {
      req.flash("notice", "Vehicle not found.");
      return res.redirect("/inv/");
    }

    const itemName = `${itemData.inv_make} ${itemData.inv_model}`;

    res.render("./inventory/delete-confirm", {
      title: "Delete " + itemName,
      nav,
      errors: null,
      inv_id: itemData.inv_id,
      inv_make: itemData.inv_make,
      inv_model: itemData.inv_model,
      inv_year: itemData.inv_year,
      inv_price: itemData.inv_price,
      inv_color: itemData.inv_color,
      inv_description: itemData.inv_description,
    });
  } catch (error) {
    console.error("❌ Error building delete confirmation view:", error);
    next(error);
  }
};

/* ***************************
 *  Handle Delete Vehicle
 * ************************** */
invCont.deleteVehicle = async function (req, res) {
  try {
    const inv_id = parseInt(req.body.inv_id);
    const deleteResult = await invModel.deleteVehicle(inv_id);

    if (deleteResult) {
      req.flash("notice", "Vehicle successfully deleted.");
      res.redirect("/inv/");
    } else {
      req.flash("notice", "Delete failed. Vehicle not found.");
      res.redirect("/inv/");
    }
  } catch (error) {
    console.error("❌ Controller error deleting vehicle:", error);
    req.flash("notice", "An error occurred while deleting the vehicle.");
    res.redirect("/inv/");
  }
};

module.exports = invCont;
