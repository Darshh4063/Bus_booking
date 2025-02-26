import authService from "./auth.js";

// Global function to update UI after successful login
window.updateUIForLoggedInUser = function (user) {
  const accountBtn = document.querySelector(".account-btn button");
  if (accountBtn) {
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
      // Show logout confirmation dialog
      if (confirm("Are you sure you want to logout?")) {
        authService.logout();
        window.location.reload();
      }
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
        // alert("Please enter a valid phone number");
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
          // alert("Phone number not registered. Please sign up.");
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
      } catch (error) {
        console.error("Error during login process:", error);
        // alert("Connection error. Please try again later.");
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
        // alert("Please enter a valid 4-digit OTP");
        return;
      }

      const phone = sessionStorage.getItem("currentLoginPhone");
      if (!phone) {
        // alert("Phone number not found. Please try again.");
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
          // alert("Login successful!");
        } else {
          // alert(result.message || "Login failed. Please try again.");
        }
      } catch (error) {
        console.error("Error during OTP verification:", error);
        // alert("Connection error. Please try again later.");
      }
    });

    // Add event listener for Resend OTP
    const resendLink = otpForm.querySelector(".undo span");
    if (resendLink) {
      resendLink.addEventListener("click", async () => {
        const phone = sessionStorage.getItem("currentLoginPhone");
        if (!phone) {
          // alert("Phone number not found. Please try again.");
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
            // alert(`For testing purposes, your OTP is: ${users[0].otp}`);
          } else {
            // alert("User not found. Please try again.");
          }
        } catch (error) {
          console.error("Error resending OTP:", error);
          // alert("Connection error. Please try again later.");
        }
      });
    }
  }

  // Add event listener for the Account button to open login modal
  const accountBtn = document.querySelector(".account-btn button");
  if (accountBtn && !authService.isLoggedIn()) {
    accountBtn.addEventListener("click", (e) => {
      e.preventDefault();
      const loginModal = new bootstrap.Modal(
        document.getElementById("loginModal")
      );
      loginModal.show();
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
