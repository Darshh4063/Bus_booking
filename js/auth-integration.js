import authService from "./auth.js";

// Global function to update UI after successful login
window.updateUIForLoggedInUser = function (user) {
  // Update all account buttons (both in header and navbar)
  const accountBtns = document.querySelectorAll(".account-btn button");

  if (accountBtns.length > 0) {
    accountBtns.forEach((accountBtn) => {
      // Create profile image element
      const profileImage = `
        <img 
          src="${user.profileImage || authService.defaultProfileImage}" 
          alt="${user.name}" 
          style="width: 24px; height: 24px; border-radius: 50%; object-fit: cover; margin-right: 8px;"
        /> ${user.name}`;

      accountBtn.innerHTML = profileImage;

      // Add CSS to the button for better alignment
      accountBtn.style.display = "flex";
      accountBtn.style.alignItems = "center";
      accountBtn.style.justifyContent = "center";

      // Remove any existing click listeners
      const newAccountBtn = accountBtn.cloneNode(true);
      accountBtn.parentNode.replaceChild(newAccountBtn, accountBtn);

      // Add logout functionality
      newAccountBtn.addEventListener("click", (e) => {
        e.preventDefault();
        // Show logout confirmation using Toastify
        Toastify({
          text: "Click to confirm logout",
          duration: 5000,
          close: true,
          gravity: "top",
          position: "right",
          backgroundColor: "#ff9800",
          onClick: function () {
            authService.logout();
            window.location.reload();
          },
        }).showToast();
      });
    });
  }
};

// Function to initialize auth listeners on any page
window.initAuthListeners = function () {
  // Login form handling
  const loginForm = document.querySelector("#loginModal .inp");
  if (loginForm) {
    const continueButton = loginForm.querySelector("button");
    continueButton.addEventListener("click", async () => {
      const phoneInput = loginForm.querySelector('input[type="text"]');
      const phone = phoneInput.value.trim();

      if (!phone) {
        Toastify({
          text: "Please enter a valid phone number",
          duration: 3000,
          close: true,
          gravity: "top",
          position: "right",
          backgroundColor: "#ff6b6b",
        }).showToast();
        return;
      }

      try {
        // Check if user with this phone exists
        const response = await fetch(
          `${authService.baseUrl}/user?phone=${phone}`
        );
        if (!response.ok) throw new Error("Failed to connect to server");

        const users = await response.json();

        if (users.length === 0) {
          Toastify({
            text: "Phone number not registered. Please sign up.",
            duration: 3000,
            close: true,
            gravity: "top",
            position: "right",
            backgroundColor: "#ff6b6b",
          }).showToast();
          return;
        }

        // Show the OTP modal
        const otpModal = new bootstrap.Modal(
          document.getElementById("otpModal")
        );
        otpModal.show();

        // Close the login modal
        bootstrap.Modal.getInstance(
          document.getElementById("loginModal")
        ).hide();

        // Update phone number in OTP modal
        const phoneDisplay = document.querySelector("#otpModal span");
        phoneDisplay.textContent = `+91 ${phone}`;

        // Store phone in sessionStorage for OTP verification
        sessionStorage.setItem("currentLoginPhone", phone);

        // For development - log the actual OTP from the database
        console.log("User OTP:", users[0].otp);

        Toastify({
          text: "OTP sent to your phone",
          duration: 3000,
          close: true,
          gravity: "top",
          position: "right",
          backgroundColor: "#20c997",
        }).showToast();
      } catch (error) {
        console.error("Error during login process:", error);
        Toastify({
          text: "Connection error. Please try again later.",
          duration: 3000,
          close: true,
          gravity: "top",
          position: "right",
          backgroundColor: "#ff6b6b",
        }).showToast();
      }
    });
  }

  // OTP verification
  const otpForm = document.querySelector("#otpModal");
  if (otpForm) {
    const verifyButton = otpForm.querySelector(".veri");
    verifyButton.addEventListener("click", async () => {
      const otpInputs = otpForm.querySelectorAll(".otp-input");
      let otp = Array.from(otpInputs)
        .map((input) => input.value)
        .join("");

      // Validate OTP input
      if (!otp || otp.length !== 4) {
        Toastify({
          text: "Please enter a valid 4-digit OTP",
          duration: 3000,
          close: true,
          gravity: "top",
          position: "right",
          backgroundColor: "#ff6b6b",
        }).showToast();
        return;
      }

      const phone = sessionStorage.getItem("currentLoginPhone");
      if (!phone) {
        Toastify({
          text: "Phone number not found. Please try again.",
          duration: 3000,
          close: true,
          gravity: "top",
          position: "right",
          backgroundColor: "#ff6b6b",
        }).showToast();
        return;
      }

      try {
        const result = await authService.login(phone, otp);

        if (result.success) {
          // Hide OTP modal
          bootstrap.Modal.getInstance(
            document.getElementById("otpModal")
          ).hide();

          // Update UI to show logged-in state
          window.updateUIForLoggedInUser(result.user);

          // Clean up session storage
          sessionStorage.removeItem("currentLoginPhone");

          // Reset OTP input fields
          otpInputs.forEach((input) => (input.value = ""));

          // Show success message
          Toastify({
            text: "Login successful!",
            duration: 3000,
            close: true,
            gravity: "top",
            position: "right",
            backgroundColor: "#20c997",
          }).showToast();
        } else {
          Toastify({
            text: result.message || "Login failed. Please try again.",
            duration: 3000,
            close: true,
            gravity: "top",
            position: "right",
            backgroundColor: "#ff6b6b",
          }).showToast();
        }
      } catch (error) {
        console.error("Error during OTP verification:", error);
        Toastify({
          text: "Connection error. Please try again later.",
          duration: 3000,
          close: true,
          gravity: "top",
          position: "right",
          backgroundColor: "#ff6b6b",
        }).showToast();
      }
    });

    // Add event listener for Resend OTP
    const resendLink = otpForm.querySelector(".undo span");
    if (resendLink) {
      resendLink.addEventListener("click", async () => {
        const phone = sessionStorage.getItem("currentLoginPhone");
        if (!phone) {
          Toastify({
            text: "Phone number not found. Please try again.",
            duration: 3000,
            close: true,
            gravity: "top",
            position: "right",
            backgroundColor: "#ff6b6b",
          }).showToast();
          return;
        }

        try {
          // In a real app, this would make an API call to resend OTP
          // For this demo, we'll just inform the user
          const response = await fetch(
            `${authService.baseUrl}/user?phone=${phone}`
          );
          const users = await response.json();

          if (users.length > 0) {
            Toastify({
              text: `For testing purposes, your OTP is: ${users[0].otp}`,
              duration: 5000,
              close: true,
              gravity: "top",
              position: "right",
              backgroundColor: "#0d6efd",
            }).showToast();
          } else {
            Toastify({
              text: "User not found. Please try again.",
              duration: 3000,
              close: true,
              gravity: "top",
              position: "right",
              backgroundColor: "#ff6b6b",
            }).showToast();
          }
        } catch (error) {
          console.error("Error resending OTP:", error);
          Toastify({
            text: "Connection error. Please try again later.",
            duration: 3000,
            close: true,
            gravity: "top",
            position: "right",
            backgroundColor: "#ff6b6b",
          }).showToast();
        }
      });
    }
  }

  // Add event listeners for all Account buttons to open login modal
  const accountBtns = document.querySelectorAll(".account-btn button");
  if (accountBtns.length > 0 && !authService.isLoggedIn()) {
    accountBtns.forEach((btn) => {
      btn.addEventListener("click", (e) => {
        e.preventDefault();
        const loginModal = new bootstrap.Modal(
          document.getElementById("loginModal")
        );
        loginModal.show();
      });
    });
  }
};

// Update the dropdown function to handle all account buttons
window.updateUIForLoggedInUser = function (user) {
  const accountBtnContainers = document.querySelectorAll(".account-btn");
  if (accountBtnContainers.length > 0) {
    accountBtnContainers.forEach((accountBtnContainer) => {
      // Replace the button with a dropdown
      accountBtnContainer.innerHTML = `
        <div class="dropdown">
          <button class="btn dropdown-toggle k-after-login" type="button" data-bs-toggle="dropdown" aria-expanded="false" style="display: flex; align-items: center;">
            <img 
              src="${user.profileImage || authService.defaultProfileImage}" 
              alt="${user.name}" 
              style="width: 24px; height: 24px; border-radius: 50%; object-fit: cover; margin-right: 8px;"
            /> 
            <span>Hi, ${user.name}</span>
          </button>
          <ul class="dropdown-menu k-responsive-btn">
            <li><a class="dropdown-item" href="profile.html">My Profile</a></li>
            <li><a class="dropdown-item" href="mybooking.html">My Bookings</a></li>
            <li><a class="dropdown-item logout-btn" href="#">Logout</a></li>
          </ul>
        </div>
      `;

      // Add logout functionality to dropdown menu's logout button
      const logoutBtn = accountBtnContainer.querySelector(".logout-btn");
      logoutBtn.addEventListener("click", (e) => {
        e.preventDefault();
        Toastify({
          text: "Click to confirm logout",
          duration: 5000,
          close: true,
          gravity: "top",
          position: "right",
          backgroundColor: "#ff9800",
          onClick: function () {
            authService.logout();
          },
        }).showToast();
      });
    });
  }
};

// Initialize auth on page load
document.addEventListener("DOMContentLoaded", () => {
  // Check if user is logged in
  if (authService.isLoggedIn()) {
    const user = authService.getCurrentUser();
    window.updateUIForLoggedInUser(user);
  }

  // Initialize auth listeners
  window.initAuthListeners();
});

// Export auth service to global scope
window.authService = authService;
