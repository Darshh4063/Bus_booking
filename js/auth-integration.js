import authService from "./auth.js";

// Check login status on page load
document.addEventListener("DOMContentLoaded", () => {
  // Check if user is logged in
  if (authService.isLoggedIn()) {
    const user = authService.getCurrentUser();
    updateUIForLoggedInUser(user);
  }

  // Login form handling
  const loginForm = document.querySelector("#loginModal .inp");
  if (loginForm) {
    const continueButton = loginForm.querySelector("button");
    continueButton.addEventListener("click", async () => {
      const phoneInput = loginForm.querySelector('input[type="text"]');
      const phone = phoneInput.value.trim();

      if (phone) {
        // In a real application, you would typically make an API call here to send OTP
        // For demo purposes, we'll simulate it by showing the OTP modal
        const otpModal = new bootstrap.Modal(
          document.getElementById("otpModal")
        );
        otpModal.show();

        // Update phone number in OTP modal
        const phoneDisplay = document.querySelector("#otpModal span");
        phoneDisplay.textContent = `+91 ${phone}`;
      }
    });
  }

  // OTP verification
  const otpForm = document.querySelector("#otpModal");
  if (otpForm) {
    const verifyButton = otpForm.querySelector(".veri");
    verifyButton.addEventListener("click", async () => {
      const otpInputs = otpForm.querySelectorAll(".otp-input");
      const otp = Array.from(otpInputs)
        .map((input) => input.value)
        .join("");
      const phone = document
        .querySelector('#loginModal input[type="text"]')
        .value.trim();

      const result = await authService.login(phone, otp);

      if (result.success) {
        // Hide modals
        bootstrap.Modal.getInstance(document.getElementById("otpModal")).hide();
        bootstrap.Modal.getInstance(
          document.getElementById("loginModal")
        ).hide();

        // Update UI to show logged-in state
        updateUIForLoggedInUser(result.user);

        // Redirect to profile page
        window.location.href = "Home.html";
      } else {
        alert(result.message);
      }
    });
  }

  // Registration form handling
  const registerForm = document.querySelector("#registerModal form");
  if (registerForm) {
    registerForm.addEventListener("submit", async (e) => {
      e.preventDefault();

      const formData = {
        name: registerForm.querySelector('input[type="text"]').value,
        phone: registerForm.querySelector('input[type="tel"]').value,
        email: registerForm.querySelector('input[type="email"]').value,
        password: registerForm.querySelector('input[type="password"]').value,
      };

      const result = await authService.register(formData);

      if (result.success) {
        // Show registration OTP modal
        bootstrap.Modal.getInstance(
          document.getElementById("registerModal")
        ).hide();
        const registerOtpModal = new bootstrap.Modal(
          document.getElementById("RegisterOtpModel")
        );
        registerOtpModal.show();

        // Update email in OTP modal
        const emailDisplay = document.querySelector(
          "#RegisterOtpModel .k-logout p"
        );
        emailDisplay.innerHTML = `We've sent a verification code to <br> ${formData.email}`;
      } else {
        alert(result.message);
      }
    });
  }
});

// Update UI after successful login
function updateUIForLoggedInUser(user) {
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
      authService.logout();
      window.location.reload();
    });
  }
}
