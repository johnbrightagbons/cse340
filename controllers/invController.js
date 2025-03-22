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

  const grid = utilities.buildClassificationGrid(data)  // No need for await
  let nav = await utilities.getNav()
  const className = data[0].classification_name

  res.render("inventory/classification", {
    title: className + " vehicles",
    nav,
    grid,
  })
}

module.exports = invCont
