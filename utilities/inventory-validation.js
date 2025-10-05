// === utilities/inventory-validation.js ===
// This file runs on the SERVER to validate inventory form data
// It uses express-validator for backend validation

const { body, validationResult } = require("express-validator");
const utilities = require(".");
const inValidate = {};

// =========================
// Validation Rules
// =========================
inValidate.newInventoryRules = () => {
  return [
    body("inv_make")
      .trim()
      .isLength({ min: 1 })
      .withMessage("Please provide a make."),

    body("inv_model")
      .trim()
      .isLength({ min: 1 })
      .withMessage("Please provide a model."),

    body("inv_year")
      .trim()
      .isInt({ min: 1900, max: new Date().getFullYear() + 1 })
      .withMessage("Please provide a valid year."),

    body("inv_price")
      .trim()
      .isFloat({ min: 0 })
      .withMessage("Please provide a valid price."),

    body("inv_miles")
      .optional({ checkFalsy: true })
      .isInt({ min: 0 })
      .withMessage("Mileage must be a non-negative number."),

    body("inv_color")
      .trim()
      .isLength({ min: 1 })
      .withMessage("Please provide a color."),
  ];
};

// =========================
// Check Inventory Data (Add)
// =========================
inValidate.checkInventoryData = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const classificationSelect = await utilities.buildClassificationList(
      req.body.classification_id
    );

    res.render("inventory/add", {
      title: "Add New Vehicle",
      errors: errors.array(),
      classificationSelect,
      ...req.body,
    });
    return;
  }
  next();
};

// =========================
// Check Update Data (Edit)
// =========================
inValidate.checkUpdateData = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const classificationSelect = await utilities.buildClassificationList(
      req.body.classification_id
    );

    res.render("inventory/edit", {
      title: "Edit Inventory Item",
      errors: errors.array(),
      classificationSelect,
      ...req.body, // repopulate the form with submitted data
    });
    return;
  }
  next();
};

// =========================
// Exports
// =========================
module.exports = {
  inValidate,
};
