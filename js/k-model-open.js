document.addEventListener("DOMContentLoaded", function () {
  // Initialize all Bootstrap modals
  const loginModal = new bootstrap.Modal(document.getElementById("loginModal"));
  const otpModal = new bootstrap.Modal(document.getElementById("otpModal"));
  const registerModal = new bootstrap.Modal(
    document.getElementById("registerModal")
  );
  const registerOtpModal = new bootstrap.Modal(
    document.getElementById("RegisterOtpModel")
  );

  // Account button opens login modal
  const accountBtn = document.querySelector(".account-btn button");
  accountBtn.addEventListener("click", function () {
    loginModal.show();
  });

  // Sign up link in login modal opens register modal
  document
    .getElementById("showRegisterModal")
    .addEventListener("click", function (e) {
      e.preventDefault();
      loginModal.hide();
      registerModal.show();
    });

  // Sign in link in register modal opens login modal
  document
    .getElementById("showLoginModal")
    .addEventListener("click", function (e) {
      e.preventDefault();
      registerModal.hide();
      loginModal.show();
    });

  // Login form submission handler
  const loginContinueBtn = document.querySelector("#loginModal .k-submit-btn");
  loginContinueBtn.addEventListener("click", async function () {
    const phoneInput = document.querySelector("#loginModal #mobile");
    const phone = phoneInput.value.trim();

    if (!phone) {
      alert("Please enter a valid phone number");
      return;
    }

    try {
      // Fetch from json-server to check if user exists
      const response = await fetch(`http://localhost:3000/user?phone=${phone}`);
      if (!response.ok) throw new Error("Failed to connect to server");

      const users = await response.json();

      if (users.length === 0) {
        alert("Phone number not registered. Please sign up.");
        return;
      }

      // Update phone number in OTP modal
      const phoneDisplay = document.querySelector("#otpModal .k-subtitle span");
      phoneDisplay.textContent = `+91 ${phone}`;

      // Store phone in sessionStorage for OTP verification
      sessionStorage.setItem("currentLoginPhone", phone);

      // For development - log the actual OTP from the database
      console.log("User OTP:", users[0].otp);

      // Show OTP modal and hide login modal
      loginModal.hide();
      otpModal.show();
    } catch (error) {
      console.error("Error during login process:", error);
      alert("Connection error. Please try again later.");
    }
  });

  // Registration form submission handler
  const registerBtn = document.getElementById("registerButton");
  registerBtn.addEventListener("click", async function () {
    const nameInput = document.getElementById("regName");
    const emailInput = document.getElementById("regEmail");
    const phoneInput = document.getElementById("regMobile");

    const name = nameInput.value.trim();
    const email = emailInput.value.trim();
    const phone = phoneInput.value.trim();

    if (!name || !phone) {
      alert("Please fill in required fields");
      return;
    }

    try {
      // Check if user already exists
      const response = await fetch(`http://localhost:3000/user?phone=${phone}`);
      const users = await response.json();

      if (users.length > 0) {
        alert("Phone number already registered. Please sign in.");
        return;
      }

      // Generate random OTP for demo
      const otp = Math.floor(1000 + Math.random() * 9000).toString();

      // Create new user object
      const newUser = {
        id: Math.random().toString(36).substr(2, 6),
        name: name,
        email: email || "",
        phone: phone,
        otp: otp,
        createdAt: new Date().toISOString(),
        lastLogin: new Date().toISOString(),
        image:
          "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png",
      };

      // Save user to json-server
      const saveResponse = await fetch(`http://localhost:3000/user`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newUser),
      });

      if (!saveResponse.ok) {
        throw new Error("Failed to register user");
      }

      // Store phone for OTP verification
      sessionStorage.setItem("registerPhone", phone);
      sessionStorage.setItem("registerOtp", otp);

      // Show OTP in console for testing
      console.log("Registration OTP:", otp);

      // Update phone in Register OTP modal
      document.querySelector(".register-phone").textContent = `+91 ${phone}`;

      // Show Register OTP modal
      registerModal.hide();
      registerOtpModal.show();
    } catch (error) {
      console.error("Error during registration:", error);
      alert("Registration failed. Please try again later.");
    }
  });

  // OTP verification for login
  const verifyLoginBtn = document.querySelector("#otpModal .veri");
  verifyLoginBtn.addEventListener("click", async function () {
    const otpInputs = document.querySelectorAll("#otpModal .otp-input");
    let otp = Array.from(otpInputs)
      .map((input) => input.value)
      .join("");

    if (!otp || otp.length !== 4) {
      alert("Please enter a valid 4-digit OTP");
      return;
    }

    const phone = sessionStorage.getItem("currentLoginPhone");
    if (!phone) {
      alert("Phone number not found. Please try again.");
      return;
    }

    try {
      // Import auth service
      const authService = window.authService;
      const result = await authService.login(phone, otp);

      if (result.success) {
        // Close OTP modal
        otpModal.hide();

        // Update UI for logged in user
        window.updateUIForLoggedInUser(result.user);

        // Clear sessionStorage
        sessionStorage.removeItem("currentLoginPhone");

        // Reset OTP input fields
        otpInputs.forEach((input) => (input.value = ""));

        // Show success message
        alert("Login successful!");
      } else {
        alert(result.message || "Login failed. Please try again.");
      }
    } catch (error) {
      console.error("Error during OTP verification:", error);
      alert("Verification failed. Please try again.");
    }
  });

  // Register OTP verification
  const verifyRegisterBtn = document.querySelector(
    "#RegisterOtpModel .k-verify button"
  );
  verifyRegisterBtn.addEventListener("click", function () {
    const otpInputs = document.querySelectorAll("#RegisterOtpModel .otp-input");
    let enteredOtp = Array.from(otpInputs)
      .map((input) => input.value)
      .join("");

    if (!enteredOtp || enteredOtp.length !== 4) {
      alert("Please enter a valid 4-digit OTP");
      return;
    }

    const phone = sessionStorage.getItem("registerPhone");
    const correctOtp = sessionStorage.getItem("registerOtp");

    if (!phone || !correctOtp) {
      alert("Registration information not found. Please try again.");
      return;
    }

    if (enteredOtp === correctOtp) {
      // Registration successful
      registerOtpModal.hide();

      // Auto-login the user after registration
      fetch(`http://localhost:3000/user?phone=${phone}`)
        .then((response) => response.json())
        .then((users) => {
          if (users.length > 0) {
            const userData = {
              id: users[0].id,
              name: users[0].name || "",
              email: users[0].email || "",
              phone: users[0].phone || "",
              profileImage:
                users[0].image ||
                "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png",
            };

            // Store user in localStorage
            localStorage.setItem("currentUser", JSON.stringify(userData));

            // Update UI
            window.updateUIForLoggedInUser(userData);

            // Clean up session storage
            sessionStorage.removeItem("registerPhone");
            sessionStorage.removeItem("registerOtp");

            alert("Registration successful!");
          }
        })
        .catch((error) => {
          console.error("Error during auto-login:", error);
          alert("Registration successful! Please login.");
        });
    } else {
      alert("Invalid OTP. Please try again.");
      // Clear inputs for retry
      otpInputs.forEach((input) => (input.value = ""));
    }
  });

  // Initialize the OTP input functionality from k-otp.js
  // This will be handled by the imported script
});
