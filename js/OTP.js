// function moveToNext(input, index) {
//     const inputs = document.querySelectorAll('.otp-input');
//     if (input.value && index < inputs.length - 1) {
//       inputs[index + 1].focus();
//     }
//   }

//   function moveBack(event, input, index) {
//     const inputs = document.querySelectorAll('.otp-input');
//     if (event.key === "Backspace" && !input.value && index > 0) {
//       inputs[index - 1].focus();
//     }
//   }

//   function openOtpModal() {
//     var loginModalEl = document.getElementById('loginModal');
//     var otpModal = new bootstrap.Modal(document.getElementById('otpModal'));

//     var loginModal = bootstrap.Modal.getInstance(loginModalEl);
//     if (loginModal) {
//       loginModal.hide();
//     }

//     // Ensure modal is fully hidden before showing the next one
//     loginModalEl.addEventListener('hidden.bs.modal', function () {
//       otpModal.show();
//     }, { once: true });
//   }

// function openOtpModal() {
//     var loginModalEl = document.getElementById('loginModal');
//     var otpModal = new bootstrap.Modal(document.getElementById('otpModal'));

//     var loginModal = bootstrap.Modal.getInstance(loginModalEl);
//     if (loginModal) {
//       loginModal.hide();
//     }

//     // Ensure modal is fully hidden before showing the next one
//     loginModalEl.addEventListener('hidden.bs.modal', function () {
//       otpModal.show();
//     }, { once: true });
//   }

// Handle OTP input navigation
// Handle OTP input navigation
// Function to handle OTP input and auto-advance to next field
function moveToNext(currentInput, index) {
  const maxLength = parseInt(currentInput.getAttribute("maxlength"));
  const currentLength = currentInput.value.length;

  // Only allow numeric input
  currentInput.value = currentInput.value.replace(/[^0-9]/g, "");

  // Auto-advance to next input field
  if (currentLength >= maxLength) {
    const nextInput = currentInput.nextElementSibling;
    if (nextInput) {
      nextInput.focus();
    }
  }

  // Handle backspace to go to previous field
  currentInput.addEventListener("keydown", function (e) {
    if (e.key === "Backspace" && currentInput.value.length === 0) {
      const prevInput = currentInput.previousElementSibling;
      if (prevInput) {
        prevInput.focus();
      }
    }
  });

  // Check if all OTP fields are filled
  const otpContainer = currentInput.closest(".otp-container");
  if (otpContainer) {
    const allInputs = otpContainer.querySelectorAll(".otp-input");
    const allFilled = Array.from(allInputs).every(
      (input) => input.value.length === maxLength
    );

    // If all fields are filled, enable the verify button
    const verifyButton = otpContainer.parentElement.querySelector(".veri");
    if (verifyButton) {
      verifyButton.disabled = !allFilled;
    }
  }
}

// Initialize OTP fields on page load
document.addEventListener("DOMContentLoaded", function () {
  // Set up OTP input fields
  const otpInputs = document.querySelectorAll(".otp-input");
  otpInputs.forEach((input, index) => {
    // Clear any existing values
    input.value = "";

    // Add event listeners
    input.addEventListener("input", function () {
      moveToNext(this, index);
    });

    // Focus first input field
    if (index === 0) {
      setTimeout(() => {
        const otpModal = document.getElementById("otpModal");
        if (otpModal && otpModal.classList.contains("show")) {
          input.focus();
        }
      }, 500);
    }
  });

  // Handle pasting OTP codes
  document.querySelectorAll(".otp-container").forEach((container) => {
    container.addEventListener("paste", function (e) {
      e.preventDefault();
      const clipboardData = e.clipboardData || window.clipboardData;
      const pastedData = clipboardData.getData("Text").trim();

      // If pasted data is numeric and has correct length
      if (/^\d+$/.test(pastedData) && pastedData.length === 4) {
        const inputs = container.querySelectorAll(".otp-input");
        [...pastedData].forEach((char, index) => {
          if (inputs[index]) {
            inputs[index].value = char;
          }
        });

        // Enable verify button
        const verifyButton = container.parentElement.querySelector(".veri");
        if (verifyButton) {
          verifyButton.disabled = false;
        }
      }
    });
  });
});
