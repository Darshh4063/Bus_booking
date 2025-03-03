document.addEventListener("DOMContentLoaded", function () {
  // Eye icon toggle functionality (keeping your existing code)
  const eyeIcons = document.querySelectorAll(".eye-icon");

  eyeIcons.forEach((icon) => {
    icon.addEventListener("click", function () {
      const input = this.parentElement.querySelector("input");
      const currentType = input.getAttribute("type");

      if (currentType === "password") {
        input.setAttribute("type", "text");
        this.innerHTML = `
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-eye" viewBox="0 0 16 16">
                          <path d="M16 8s-3-5.5-8-5.5S0 8 0 8s3 5.5 8 5.5S16 8 16 8M1.173 8a13.133 13.133 0 0 1 1.66-2.043C4.12 4.668 5.88 3.5 8 3.5c2.12 0 3.879 1.168 5.168 2.457A13.133 13.133 0 0 1 14.828 8c-.058.087-.122.183-.195.288-.335.48-.83 1.12-1.465 1.755C11.879 11.332 10.119 12.5 8 12.5c-2.12 0-3.879-1.168-5.168-2.457A13.134 13.134 0 0 1 1.172 8z"/>
                          <path d="M8 5.5a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5M4.5 8a3.5 3.5 0 1 1 7 0 3.5 3.5 0 0 1-7 0"/>
                      </svg>
                  `;
      } else {
        input.setAttribute("type", "password");
        this.innerHTML = `
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-eye-slash" viewBox="0 0 16 16">
                          <path d="M13.359 11.238C15.06 9.72 16 8 16 8s-3-5.5-8-5.5a7.028 7.028 0 0 0-2.79.588l.77.771A5.944 5.944 0 0 1 8 3.5c2.12 0 3.879 1.168 5.168 2.457A13.134 13.134 0 0 1 14.828 8c-.058.087-.122.183-.195.288-.335.48-.83 1.12-1.465 1.755-.165.165-.337.328-.517.486z"/>
                          <path d="M11.297 9.176a3.5 3.5 0 0 0-4.474-4.474l.823.823a2.5 2.5 0 0 1 2.829 2.829zm-2.943 1.299.822.822a3.5 3.5 0 0 1-4.474-4.474l.823.823a2.5 2.5 0 0 0 2.829 2.829"/>
                          <path d="M3.35 5.47c-.18.16-.353.322-.518.487A13.134 13.134 0 0 0 1.172 8l.195.288c.335.48.83 1.12 1.465 1.755C4.121 11.332 5.881 12.5 8 12.5c.716 0 1.39-.133 2.02-.36l.77.772A7.029 7.029 0 0 1 8 13.5C3 13.5 0 8 0 8s.939-1.721 2.641-3.238l.708.709zm10.296 8.884-12-12 .708-.708 12 12-.708.708"/>
                      </svg>
                  `;
      }
    });
  });

  // Add click event listener for Change button in the modal
  const changeButton = document.querySelector(".btn-change");
  if (changeButton) {
    changeButton.addEventListener("click", handlePasswordChange);
  }

  // Also handle the standalone Change Password button in the sidebar if present
  const changePasswordLink = document.querySelector(
    'a[href="#changePasswordModal"]'
  );
  if (changePasswordLink) {
    changePasswordLink.addEventListener("click", function (e) {
      // Clear previous inputs when opening the modal
      const form = document.querySelector("#changePasswordModal form");
      if (form) form.reset();
    });
  }
});

// Function to handle password change
async function handlePasswordChange() {
  try {
    // Get password values
    const oldPassword = document.getElementById("oldPassword").value.trim();
    const newPassword = document.getElementById("newPassword").value.trim();
    const confirmPassword = document
      .getElementById("confirmPassword")
      .value.trim();

    // Basic validation
    if (!oldPassword || !newPassword || !confirmPassword) {
      showAlert("All fields are required", "error");
      return;
    }

    if (newPassword !== confirmPassword) {
      showAlert("New password and confirm password do not match", "error");
      return;
    }

    // Get current user data
    const currentUser = JSON.parse(localStorage.getItem("currentUser"));
    if (!currentUser || !currentUser.id) {
      showAlert("User not authenticated", "error");
      return;
    }

    // Fetch the user from the server to verify the old password
    const response = await fetch(
      `http://localhost:3000/user/${currentUser.id}`
    );
    if (!response.ok) {
      throw new Error("Failed to fetch user data");
    }

    const userData = await response.json();

    // Verify old password
    if (userData.password !== oldPassword) {
      showAlert("Incorrect old password", "error");
      return;
    }

    // Update password on the server
    const updateResponse = await fetch(
      `http://localhost:3000/user/${currentUser.id}`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ password: newPassword }),
      }
    );

    if (!updateResponse.ok) {
      throw new Error("Failed to update password");
    }

    // Success - close modal and show success message
    showAlert("Password changed successfully", "success");

    // Close the modal
    const modal = document.getElementById("changePasswordModal");
    const bsModal = bootstrap.Modal.getInstance(modal);
    if (bsModal) {
      bsModal.hide();
    } else {
      // Fallback if bootstrap.Modal is not available
      modal.classList.remove("show");
      modal.style.display = "none";
      document.body.classList.remove("modal-open");
      const backdrop = document.querySelector(".modal-backdrop");
      if (backdrop) backdrop.remove();
    }

    // Clear form
    document.getElementById("oldPassword").value = "";
    document.getElementById("newPassword").value = "";
    document.getElementById("confirmPassword").value = "";
  } catch (error) {
    console.error("Password change error:", error);
    showAlert(error.message || "Failed to change password", "error");
  }
}

// Helper function to show alerts
function showAlert(message, type) {
  // Check if there's an existing alert and remove it
  const existingAlert = document.querySelector(".password-alert");
  if (existingAlert) {
    existingAlert.remove();
  }

  // Create alert element
  const alertDiv = document.createElement("div");
  alertDiv.className = `alert alert-${
    type === "error" ? "danger" : "success"
  } password-alert`;
  alertDiv.textContent = message;

  // Insert the alert before the form in the modal
  const modalBody = document.querySelector(".modal-body");
  if (modalBody) {
    const form = modalBody.querySelector("form");
    modalBody.insertBefore(alertDiv, form);

    // Auto dismiss after 3 seconds
    setTimeout(() => {
      alertDiv.remove();
    }, 3000);
  } else {
    // Fallback to simple alert if modal body not found
    alert(message);
  }
}

// Import your auth service if needed (make sure to include this file after auth.js)
// Or you can use the authService directly if it's already available globally
