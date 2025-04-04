// This script handles the toggle functionality for the password field in the login form
// It allows users to show or hide their password by clicking a button
document
  .getElementById("togglePassword")
  .addEventListener("click", function () {
    const passwordField = document.getElementById("account_password");
    if (passwordField.type === "password") {
      passwordField.type = "text"; // Show password
      this.textContent = "Hide Password"; // Update button text
    } else {
      passwordField.type = "password"; // Hide password
      this.textContent = "Show Password"; // Update button text
    }
  });
