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
    res.render("inventory/management", {
      title: "Inventory Management",
      nav,
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

module.exports = invCont;
