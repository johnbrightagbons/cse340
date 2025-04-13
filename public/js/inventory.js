"use strict";

// Get a list of items in inventory based on the classification_id
let classificationList = document.querySelector("#classificationSelect");
classificationList.addEventListener("change", function () {
  let classification_id = classificationList.value;
  console.log(`classification_id is: ${classification_id}`);
  let classIdURL = "/inv/getInventory/" + classification_id;

  fetch(classIdURL)
    .then(function (response) {
      if (response.ok) {
        return response.json();
      }
      throw Error("Network response was not OK");
    })
    .then(function (data) {
      console.log(data);
      buildInventoryList(data);
    })
    .catch(function (error) {
      console.log("There was a problem: ", error.message);
    });
});

// Function to build the inventory table
function buildInventoryList(data) {
  let inventoryDisplay = document.querySelector("#inventoryDisplay");
  inventoryDisplay.innerHTML = ""; // Clear the table

  if (data.length > 0) {
    // Build table headers
    let thead = document.createElement("thead");
    thead.innerHTML = `
      <tr>
        <th>Make</th>
        <th>Model</th>
        <th>Year</th>
        <th>Price</th>
      </tr>
    `;
    inventoryDisplay.appendChild(thead);

    // Build table body
    let tbody = document.createElement("tbody");
    data.forEach((item) => {
      let row = document.createElement("tr");
      row.innerHTML = `
        <td>${item.inv_make}</td>
        <td>${item.inv_model}</td>
        <td>${item.inv_year}</td>
        <td>${item.inv_price}</td>
      `;
      tbody.appendChild(row);
    });
    inventoryDisplay.appendChild(tbody);
  } else {
    inventoryDisplay.innerHTML =
      "<p>No inventory found for this classification.</p>";
  }
}
