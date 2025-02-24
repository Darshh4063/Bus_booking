document.addEventListener("DOMContentLoaded", function () {
  const otpInputs = document.querySelectorAll(".k .otp-input");
  const verifyButton = document.querySelector(".k-verify button");
  const otpModal = new bootstrap.Modal(
    document.getElementById("RegisterOtpModel")
  );

  // Create error message container and add it to DOM
  const errorMessageDiv = document.createElement("div");
  errorMessageDiv.className = "text-danger text-center mt-2 otp-error";
  errorMessageDiv.style.display = "none";
  const otpContainer = document.querySelector(".otp-container");
  otpContainer.insertAdjacentElement("afterend", errorMessageDiv);

  // Function to show error message
  const showError = (message) => {
    errorMessageDiv.textContent = message;
    errorMessageDiv.style.display = "block";
  };

  // Function to hide error message
  const hideError = () => {
    errorMessageDiv.style.display = "none";
  };

  // Function to check if OTP is complete
  const isOTPComplete = () => {
    return [...otpInputs].every((input) => input.value.length === 1);
  };

  // Function to get entered OTP
  const getEnteredOTP = () => {
    return [...otpInputs].map((input) => input.value).join("");
  };

  // Focus first input when modal opens
  document
    .getElementById("RegisterOtpModel")
    .addEventListener("shown.bs.modal", function () {
      otpInputs[0].focus();
      hideError();
    });

  // Handle input for each OTP field
  otpInputs.forEach((input, index) => {
    input.addEventListener("input", function (e) {
      // Ensure only numbers
      this.value = this.value.replace(/[^0-9]/g, "");

      if (this.value.length === 1) {
        if (index < otpInputs.length - 1) {
          otpInputs[index + 1].focus();
        } else {
          verifyButton.focus();
        }
      }

      // Hide error when user starts typing
      hideError();
    });

    // Handle paste event
    input.addEventListener("paste", function (e) {
      e.preventDefault();
      const pastedData = e.clipboardData
        .getData("text")
        .replace(/[^0-9]/g, "")
        .slice(0, 4);

      if (pastedData) {
        [...pastedData].forEach((digit, i) => {
          if (otpInputs[i]) {
            otpInputs[i].value = digit;
          }
        });

        if (pastedData.length < 4) {
          showError("Please enter all 4 digits");
        }

        const nextEmptyIndex = [...otpInputs].findIndex(
          (input) => !input.value
        );
        if (nextEmptyIndex === -1) {
          verifyButton.focus();
        } else {
          otpInputs[nextEmptyIndex].focus();
        }
      }
    });

    // Handle backspace and arrow keys
    input.addEventListener("keydown", function (e) {
      if (e.key === "Backspace") {
        if (this.value.length === 0 && index > 0) {
          otpInputs[index - 1].focus();
        } else {
          this.value = "";
        }
      } else if (e.key === "ArrowLeft" && index > 0) {
        otpInputs[index - 1].focus();
      } else if (e.key === "ArrowRight" && index < otpInputs.length - 1) {
        otpInputs[index + 1].focus();
      }
    });
  });

  // Handle verification button click
  verifyButton.addEventListener("click", function (e) {
    e.preventDefault();

    // For demo purposes, correct OTP is "1234"
    const correctOTP = "1234";
    const enteredOTP = getEnteredOTP();

    if (!isOTPComplete()) {
      showError("Please enter all 4 digits");
      return;
    }

    if (enteredOTP !== correctOTP) {
      showError("Incorrect OTP. Please try again.");
      // Clear inputs for retry
      otpInputs.forEach((input) => (input.value = ""));
      otpInputs[0].focus();
      return;
    }

    // OTP is correct
    hideError();
    otpModal.hide();
    alert("OTP verified successfully!");
  });

  // Handle Resend OTP
  const resendButton = document.querySelector(".k-resend");
  if (resendButton) {
    resendButton.addEventListener("click", function () {
      otpInputs.forEach((input) => (input.value = ""));
      otpInputs[0].focus();
      hideError();
      // Here you would typically call your API to resend OTP
      alert("New OTP has been sent!");
    });
  }
});
