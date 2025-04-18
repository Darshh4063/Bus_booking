const bookingDetailsString = localStorage.getItem("bookingDetails");
const user = localStorage.getItem("currentUser");
if (!bookingDetailsString) {
  console.error("No booking details found in localStorage");
}

// Parse the JSON data
const bookingDetails = JSON.parse(bookingDetailsString);
console.log("Booking details:", bookingDetails);

document.addEventListener("DOMContentLoaded", function () {
  console.log("DOM loaded, initializing payment system");

  // Get all payment buttons
  const cardPayButton = document.querySelector(
    "#paymentForm button[type='submit']"
  );
  const upiButton = document.getElementById("upi-pay-button");
  const bankButton = document.getElementById("bank-pay-button");
  const checkButton = document.getElementById("confirm-check-payment");
  const payFiftyCheckbox = document.getElementById("pay-fifty");

  // Fix for tab switching
  setupTabSwitching();

  // Setup payment amount toggle
  setupPaymentAmountToggle();

  // Setup payment button event listeners
  setupPaymentButtonListeners();

  // Format inputs
  setupInputFormatting();

  function setupTabSwitching() {
    const tabElements = document.querySelectorAll('a[data-bs-toggle="tab"]');
    if (tabElements.length > 0) {
      console.log("Found tab elements:", tabElements.length);
      tabElements.forEach((tab) => {
        tab.addEventListener("click", function (e) {
          e.preventDefault();
          const targetId = this.getAttribute("href");
          const target = document.querySelector(targetId);
          console.log("Tab clicked, target:", targetId);

          // Hide all tab panes
          document.querySelectorAll(".tab-pane").forEach((pane) => {
            pane.classList.remove("show", "active");
          });

          // Show the selected tab pane
          if (target) {
            target.classList.add("show", "active");
          }

          // Update active state on tabs
          document.querySelectorAll(".nav-link").forEach((link) => {
            link.classList.remove("active");
          });
          this.classList.add("active");
        });
      });
    } else {
      console.log("No tab elements found");
    }
  }

  function setupPaymentAmountToggle() {
    const payButtons = document.querySelectorAll(".pay");
    const fullAmount =
      bookingDetails.totalPayableAmount || bookingDetails.totalPrice;
    const halfAmount = fullAmount / 2;

    console.log("Setting up payment buttons:", payButtons.length);

    function updatePaymentButtonAmounts(isHalfPayment) {
      const amountToShow = isHalfPayment ? halfAmount : fullAmount;
      console.log("Updating payment amounts to:", amountToShow);

      // Update regular payment buttons with class "pay"
      payButtons.forEach((button) => {
        if (button.id === "bank-pay-button") {
          button.textContent = `Pay ₹${amountToShow}`;
        } else {
          button.textContent = `Pay ${amountToShow}`;
        }
      });
    }

    if (payFiftyCheckbox) {
      console.log("Pay 50% checkbox found");
      payFiftyCheckbox.addEventListener("change", function () {
        console.log("Pay 50% checkbox changed to:", this.checked);
        updatePaymentButtonAmounts(this.checked);
      });

      // Initial setup based on checkbox state
      updatePaymentButtonAmounts(payFiftyCheckbox.checked);
    } else {
      console.log("Pay 50% checkbox not found");
    }
  }

  function setupPaymentButtonListeners() {
    // Credit/Debit card payment form submission
    const cardForm = document.getElementById("paymentForm");
    if (cardForm) {
      console.log("Card payment form found");
      cardForm.addEventListener("submit", function (e) {
        e.preventDefault();
        console.log("Card payment form submitted");

        // Clear previous errors first
        document.querySelectorAll(".error").forEach((error) => {
          error.textContent = "";
        });

        // Validate card details
        const cardHolder = document.getElementById("cardHolder").value.trim();
        const cardNumber = document
          .getElementById("cardNumber")
          .value.replace(/\s/g, "");
        const expiryDate = document.getElementById("expiryDate").value.trim();
        const cvv = document.getElementById("cvv").value.trim();

        console.log("Validating card details");
        let isValid = true;
        const errors = [];

        if (!cardHolder) {
          showError(
            document.getElementById("cardHolder"),
            "Please enter cardholder name"
          );
          errors.push("Missing cardholder name");
          isValid = false;
        }

        if (!validateCardNumber(cardNumber)) {
          showError(
            document.getElementById("cardNumber"),
            "Please enter a valid card number"
          );
          errors.push("Invalid card number");
          isValid = false;
        }

        if (!validateExpiryDate(expiryDate)) {
          showError(
            document.getElementById("expiryDate"),
            "Please enter a valid expiry date (MM/YYYY)"
          );
          errors.push("Invalid expiry date");
          isValid = false;
        }

        if (!/^\d{3}$/.test(cvv)) {
          showError(
            document.getElementById("cvv"),
            "Please enter a valid 3-digit CVV"
          );
          errors.push("Invalid CVV");
          isValid = false;
        }

        if (isValid) {
          console.log("Card validation passed, processing payment");
          processPayment("Card");
        } else {
          console.log("Card validation failed:", errors);
        }
      });
    } else {
      console.error("Card payment form not found - check your HTML structure");
    }

    // UPI payment button
    if (upiButton) {
      console.log("UPI payment button found");
      upiButton.addEventListener("click", function (e) {
        e.preventDefault();
        console.log("UPI payment button clicked");

        // Validate UPI ID
        const upiId = document.getElementById("upi-id").value.trim();
        if (!upiId) {
          const upiError =
            document.getElementById("upi-error") || document.createElement("p");
          upiError.textContent = "Please enter a valid UPI ID";
          upiError.className = "error";
          upiError.style.color = "red";
          upiError.id = "upi-error";

          const upiInput = document.getElementById("upi-id");
          if (upiInput && !document.getElementById("upi-error")) {
            upiInput.parentNode.appendChild(upiError);
          }

          console.log("UPI validation failed: Missing UPI ID");
          return;
        }

        console.log("UPI validation passed, processing payment");
        processPayment("UPI");
      });
    } else {
      console.log("UPI payment button not found");
    }

    // Net Banking payment button
    if (bankButton) {
      console.log("Net Banking payment button found");
      bankButton.addEventListener("click", function (e) {
        e.preventDefault();
        console.log("Net Banking payment button clicked");

        // Validate bank selection
        const selectedBank = document.getElementById("bank-select").value;
        if (!selectedBank || selectedBank === "") {
          const bankError =
            document.getElementById("bank-error") ||
            document.createElement("p");
          bankError.textContent = "Please select a bank";
          bankError.className = "error";
          bankError.style.color = "red";
          bankError.id = "bank-error";

          const bankSelect = document.getElementById("bank-select");
          if (bankSelect && !document.getElementById("bank-error")) {
            bankSelect.parentNode.appendChild(bankError);
          }

          console.log("Bank validation failed: No bank selected");
          return;
        }

        console.log("Bank validation passed, processing payment");
        processPayment("NetBanking");
      });
    } else {
      console.log("Net Banking payment button not found");
    }

    // Check payment button
    if (checkButton) {
      console.log("Check payment button found");
      checkButton.addEventListener("click", function (e) {
        e.preventDefault();
        console.log("Check payment button clicked");
        processCheckPayment();
      });
    } else {
      console.log("Check payment button not found");
    }
  }

  function setupInputFormatting() {
    // Format card number with spaces
    const cardNumberInput = document.getElementById("cardNumber");
    if (cardNumberInput) {
      console.log("Card number input found, setting up formatting");
      cardNumberInput.addEventListener("input", function (e) {
        let value = e.target.value.replace(/\s+/g, "").replace(/[^0-9]/gi, "");
        let formattedValue = "";
        for (let i = 0; i < value.length; i++) {
          if (i > 0 && i % 4 === 0) {
            formattedValue += " ";
          }
          formattedValue += value[i];
        }
        e.target.value = formattedValue;
      });
    } else {
      console.log("Card number input not found");
    }

    // Format expiry date
    const expiryDateInput = document.getElementById("expiryDate");
    if (expiryDateInput) {
      console.log("Expiry date input found, setting up formatting");
      expiryDateInput.addEventListener("input", function (e) {
        let value = e.target.value.replace(/\s+/g, "").replace(/[^0-9]/gi, "");
        if (value.length > 2) {
          value = value.substring(0, 2) + "/" + value.substring(2, 6);
        }
        e.target.value = value;
      });
    } else {
      console.log("Expiry date input not found");
    }
  }
});

// Process Payments (Card, UPI, NetBanking)
function processPayment(method) {
  console.log(`Processing ${method} payment...`);

  // Clear previous errors
  document.querySelectorAll(".error").forEach((el) => {
    el.textContent = "";
  });

  /// Check if user is logged in before showing processing indicator
  if (!showProcessingIndicator()) {
    console.log("Payment processing aborted: User not logged in");
    showToast("Please log in to continue with payment", "error");
    return; // Exit if user is not logged in
  }

  // Gather payment data based on method
  let paymentData = {};
  let isValid = true;

  try {
    if (method === "Card") {
      const cardHolder = document.getElementById("cardHolder").value.trim();
      const cardNumber = document
        .getElementById("cardNumber")
        .value.replace(/\s/g, "");
      const expiryDate = document.getElementById("expiryDate").value.trim();
      const cvv = document.getElementById("cvv").value.trim();

      if (
        !cardHolder ||
        !validateCardNumber(cardNumber) ||
        !validateExpiryDate(expiryDate) ||
        !/^\d{3}$/.test(cvv)
      ) {
        isValid = false;
        hideProcessingIndicator();
        showFailedModal("Invalid card details. Please check your information.");
        return;
      }

      paymentData = { cardHolder, cardNumber, expiryDate };
    } else if (method === "UPI") {
      const upiId = document.getElementById("upi-id").value.trim();
      const upiHandle = document.getElementById("upi-handle")?.value || "";

      if (!upiId) {
        isValid = false;
        hideProcessingIndicator();
        showFailedModal("Please enter a valid UPI ID");
        return;
      }

      paymentData = { upiId, upiHandle };
    } else if (method === "NetBanking") {
      const selectedBank = document.getElementById("bank-select").value;

      if (!selectedBank || selectedBank === "") {
        isValid = false;
        hideProcessingIndicator();
        showFailedModal("Please select a bank");
        return;
      }

      paymentData = { bank: selectedBank };
    }

    if (isValid) {
      // Simulate network delay for payment processing
      setTimeout(() => {
        // Always succeed if validation passes
        completePayment(method);
      }, 1500);
    }
  } catch (error) {
    console.error("Payment processing error:", error);
    hideProcessingIndicator();
    showFailedModal("An unexpected error occurred. Please try again.");
  }
}
// Show processing indicator
function showProcessingIndicator() {
  if (user) {
    const processingModal = document.getElementById("processingModal");
    if (processingModal) {
      console.log("Found processing modal, showing it");
      if (typeof bootstrap !== "undefined" && bootstrap.Modal) {
        const bsModal = new bootstrap.Modal(processingModal);
        bsModal.show();
      } else {
        processingModal.style.display = "block";
        processingModal.classList.add("show");
      }
    }
  } else {
    console.log("User not logged in, showing login modal");
    // Show login modal instead
    if (typeof bootstrap !== "undefined" && bootstrap.Modal) {
      const loginModal = document.getElementById("loginModal");
      if (loginModal) {
        const bsModal = new bootstrap.Modal(loginModal);
        bsModal.show();
      } else {
        // alert("Please login to continue with payment");
      }
    } else {
      // alert("Please login to continue with payment");
    }
    return false; // Return false to indicate user is not logged in
  }
  return true; // Return true to indicate user is logged in
}

// Hide processing indicator
function hideProcessingIndicator() {
  const processingModal = document.getElementById("processingModal");
  if (processingModal) {
    console.log("Hiding processing modal");
    if (typeof bootstrap !== "undefined" && bootstrap.Modal) {
      const bsModal = bootstrap.Modal.getInstance(processingModal);
      if (bsModal) bsModal.hide();
    } else {
      processingModal.style.display = "none";
      processingModal.classList.remove("show");
    }
  } else {
    console.log("Removing simple processing indicator");
    const processingIndicator = document.getElementById("processingIndicator");
    if (processingIndicator) {
      processingIndicator.remove();
    }
  }
}

// Process Check Payment
function processCheckPayment() {
  console.log("Processing check payment...");
  const accountNumber = document.getElementById("accountNumber").value.trim();

  if (!/^\d{8,16}$/.test(accountNumber)) {
    showError(
      document.getElementById("accountNumber"),
      "Account Number must be 8-16 digits"
    );
    console.log("Check payment validation failed: Invalid account number");
    return;
  }

  // Check if user is logged in before showing processing indicator
  if (!showProcessingIndicator()) {
    console.log("Check payment processing aborted: User not logged in");
    return; // Exit if user is not logged in
  }

  setTimeout(() => {
    hideProcessingIndicator();
    const success = Math.random() > 0.3;
    console.log(`Check payment ${success ? "succeeded" : "failed"}`);

    if (success) {
      completeCheckPayment(accountNumber);
    } else {
      showFailedModal("Check payment failed. Please try again.");
    }
  }, 2000);
}

// Complete Payment (Card, UPI, NetBanking)
function completePayment(method) {
  console.log(`Completing ${method} payment...`);
  var user = JSON.parse(localStorage.getItem("currentUser"));
  console.log("user", user);
  if (user) {
    const transactionId = generateTransactionId();
    const isPayFifty = document.getElementById("pay-fifty")?.checked || false;
    const totalAmount =
      bookingDetails.totalPayableAmount || bookingDetails.totalPrice;
    console.log("totalAmount", totalAmount);

    const paidAmount = isPayFifty ? totalAmount / 2 : totalAmount;
    const remainingAmount = isPayFifty ? totalAmount / 2 : 0;
    let data;

    if (method === "UPI") {
      const upiInput = document.getElementById("upi-id").value.trim();
      const upiHandle = document.getElementById("upi-handle").value;

      if (!upiInput) {
        showFailedModal("Invalid UPI ID");
        return;
      }

      data = {
        id: transactionId,
        paymentBy: "UPI",
        upiId: `${upiInput}${upiHandle}`,
        paidAmount: paidAmount,
        remainingAmount: remainingAmount,
        timestamp: new Date().toISOString(),
      };
    } else if (method === "NetBanking") {
      const selectedBank = document.getElementById("bank-select").value;

      if (!selectedBank) {
        showFailedModal("Please select a bank");
        return;
      }

      data = {
        id: transactionId,
        paymentBy: "NetBanking",
        bank: selectedBank,
        paidAmount: paidAmount,
        remainingAmount: remainingAmount,
        timestamp: new Date().toISOString(),
      };
    } else if (method === "Card") {
      const cardHolder = document.getElementById("cardHolder").value.trim();
      const cardNumber = document
        .getElementById("cardNumber")
        .value.replace(/\s/g, "");
      const expiryDate = document.getElementById("expiryDate").value.trim();
      const cvv = document.getElementById("cvv").value.trim();

      if (
        !cardHolder ||
        !validateCardNumber(cardNumber) ||
        !validateExpiryDate(expiryDate) ||
        !/^\d{3}$/.test(cvv)
      ) {
        showFailedModal("Invalid card details");
        return;
      }

      data = {
        id: transactionId,
        paymentBy: "Card",
        cardHolder: cardHolder,
        cardNumber: maskCardNumber(cardNumber),
        expiryDate: expiryDate,
        paidAmount: paidAmount,
        remainingAmount: remainingAmount,
        timestamp: new Date().toISOString(),
      };
    }

    console.log("Payment data:", data);

    // Update transaction details in success modal
    const transactionDetails = document.getElementById("transactionDetails");
    if (transactionDetails) {
      transactionDetails.innerHTML = `Transaction ID: ${transactionId}<br>Amount: ₹${paidAmount}`;
    }

    // Try to send payment data to server
    try {
      sendPaymentData(data);
    } catch (e) {
      console.log("Error sending payment data:", e);
      // Still show success modal even if server communication fails
      showSuccessModal();
      window.location.href = "mybooking.html";
    }
  } else {
    const loginModal = new bootstrap.Modal(
      document.getElementById("loginModal")
    );
    loginModal.show();
  }
}

// Mask card number for security
function maskCardNumber(cardNumber) {
  return cardNumber.slice(0, 4) + " **** **** " + cardNumber.slice(-4);
}

// Complete Check Payment
function completeCheckPayment(accountNumber) {
  console.log("Completing check payment...");
  const transactionId = generateTransactionId();
  const isPayFifty = document.getElementById("pay-fifty")?.checked || false;
  const totalAmount =
    bookingDetails.totalPayableAmount || bookingDetails.totalPrice;
  const paidAmount = isPayFifty ? totalAmount / 2 : totalAmount;
  const remainingAmount = isPayFifty ? totalAmount / 2 : 0;

  const data = {
    id: transactionId,
    paymentBy: "Check",
    accountNumber: accountNumber,
    paidAmount: paidAmount,
    remainingAmount: remainingAmount,
    timestamp: new Date().toISOString(),
  };

  console.log("Check payment data:", data);

  // Update transaction details in success modal
  const transactionDetails = document.getElementById("transactionDetails");
  if (transactionDetails) {
    transactionDetails.innerHTML = `Transaction ID: ${transactionId}<br>Amount: ₹${paidAmount}`;
  }

  try {
    sendPaymentData(data);
  } catch (e) {
    console.log("Error sending check payment data:", e);
    showSuccessModal();
    window.location.href = "mybooking.html";
  }
}

// Send Payment Data to JSON Server
function sendPaymentData(data) {
  console.log("Sending payment data to server...");

  const newBooking = JSON.parse(localStorage.getItem("bookingDetails"));

  // Add status "upcoming" to the booking
  newBooking.status = "upcoming";

  // Generate and add a unique bookingId
  newBooking.bookingId = "BK" + Math.random().toString(36).substr(2, 8).toUpperCase();

  console.log("New Booking with status and ID:", newBooking);
  const user = JSON.parse(localStorage.getItem("currentUser"));
  console.log("User", user);

  // First, save the payment data
  fetch("http://localhost:3000/payments", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  })
    .then((response) => {
      console.log("Payment data server response:", response.ok ? "Success" : "Failed");
      
      if (!response.ok) {
        showToast("Payment failed. Please try again.", "error");
        throw new Error("Failed to save payment data");
      }
      
      localStorage.setItem("paymentData", JSON.stringify(data));
      showToast("Payment processed successfully!", "success");

      // Continue with updating user data
      return fetch(`http://localhost:3000/user/${user.id}`);
    })
    .then((response) => {
      if (!response.ok) {
        showToast("Failed to update user data", "error");
        throw new Error("Failed to fetch user data");
      }
      return response.json();
    })
    .then((userData) => {
      console.log("Retrieved user data:", userData);

      // Initialize bookings array if it doesn't exist
      let updatedBookings = [];

      // If user already has bookings, add them to the array
      if (userData.Bookings && Array.isArray(userData.Bookings)) {
        updatedBookings = [...userData.Bookings];
      } else if (userData.Bookings) {
        // If booking exists but isn't in a bookings array, add it
        updatedBookings = [userData.Bookings];
      }

      // Add the new booking to the array
      updatedBookings.push(newBooking);

      // Initialize payments array if it doesn't exist
      let updatedPayments = [];

      // If user already has payments, add them to the array
      if (userData.payments && Array.isArray(userData.payments)) {
        updatedPayments = [...userData.payments];
      } else if (userData.payment) {
        // If payment exists but isn't in a payments array, add it
        updatedPayments = [userData.payment];
      }

      // Add the new payment to the array
      updatedPayments.push(data);

      console.log("Updating user with bookings:", updatedBookings);
      console.log("Updating user with payments:", updatedPayments);

      // Update the user data with the new bookings and payments
      return fetch(`http://localhost:3000/user/${user.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          Bookings: updatedBookings,
          payments: updatedPayments,
        }),
      });
    })
    .then((response) => {
      if (!response.ok) {
        showToast("Failed to update booking information", "error");
        throw new Error("Failed to update user data");
      }
      console.log("User update successful");
      showToast("Booking confirmed! Redirecting to your bookings...", "success");

      // Skip showing success modal and redirect directly
      console.log("Redirecting to mybooking.html");
      window.location.href = "mybooking.html";
    })
    .catch((error) => {
      console.log("Error updating user data:", error);
      showToast("An error occurred, but your payment was processed", "error");

      // Even if there's an error, redirect to mybooking page
      console.log("Error occurred but still redirecting to mybooking.html");
      window.location.href = "mybooking.html";
    });
}
// Show Error Message
function showError(input, message) {
  if (!input) {
    console.error("Cannot show error: input element is null");
    return;
  }
  console.log(`Showing error for ${input.id}: ${message}`);

  const error = input.nextElementSibling;
  if (error && error.classList.contains("error")) {
    error.innerText = message;
  } else {
    // If no error element exists, create one
    const errorElement = document.createElement("small");
    errorElement.className = "error";
    errorElement.style.color = "red";
    errorElement.innerText = message;
    input.insertAdjacentElement("afterend", errorElement);
  }

  // Also show a toast notification
  showToast(message, "error");
}

// Show Success Modal
function showSuccessModal() {
  console.log("Showing success modal");

  // Show success toast
  showToast("Payment successful! Redirecting to your bookings...", "success");
  const successModal = document.getElementById("successModal");
  if (successModal) {
    if (typeof bootstrap !== "undefined" && bootstrap.Modal) {
      const bsModal = new bootstrap.Modal(successModal);
      bsModal.show();

      // Set up event listener for when modal is hidden
      successModal.addEventListener("hidden.bs.modal", function () {
        console.log("Success modal closed, redirecting to mybooking.html");
        window.location.href = "mybooking.html";
      });

      // Also set a timeout as a fallback
      setTimeout(() => {
        window.location.href = "mybooking.html";
      }, 3000); // Redirect after 3 seconds
    } else {
      successModal.style.display = "block";
      successModal.classList.add("show");

      // Add a simple close functionality with redirect
      const closeButtons = successModal.querySelectorAll(
        '[data-bs-dismiss="modal"]'
      );
      closeButtons.forEach((button) => {
        button.addEventListener("click", () => {
          successModal.style.display = "none";
          successModal.classList.remove("show");
          window.location.href = "mybooking.html";
        });
      });

      // Also set a timeout as a fallback
      setTimeout(() => {
        window.location.href = "mybooking.html";
      }, 3000); // Redirect after 3 seconds
    }
  } else {
    // alert("Payment successful! Transaction ID: " + generateTransactionId());
    // Redirect immediately if there's no modal
    window.location.href = "mybooking.html";
  }
}
// Show Failed Modal
function showFailedModal(message) {
  console.log(`Showing failed modal: ${message}`);
  // Show error toast
  showToast(message, "error");
  const failedModal = document.getElementById("failedModal");

  if (failedModal) {
    const failedMessage = document.getElementById("failedMessage");
    if (failedMessage) {
      failedMessage.innerText = message;
    }

    // Close any other open modals first
    const allModals = document.querySelectorAll(".modal.show");
    allModals.forEach((modal) => {
      if (typeof bootstrap !== "undefined" && bootstrap.Modal) {
        const bsModal = bootstrap.Modal.getInstance(modal);
        if (bsModal) bsModal.hide();
      } else {
        modal.style.display = "none";
        modal.classList.remove("show");
      }
    });

    if (typeof bootstrap !== "undefined" && bootstrap.Modal) {
      const bsModal = new bootstrap.Modal(failedModal);
      bsModal.show();
    } else {
      failedModal.style.display = "block";
      failedModal.classList.add("show");

      const closeButtons = failedModal.querySelectorAll(
        '[data-bs-dismiss="modal"]'
      );
      closeButtons.forEach((button) => {
        button.addEventListener("click", () => {
          failedModal.style.display = "none";
          failedModal.classList.remove("show");
        });
      });
    }
  } else {
    // alert("Payment failed: " + message);
  }
}

// Generate Random Transaction ID
function generateTransactionId() {
  return "TXN" + Math.random().toString(36).substr(2, 8).toUpperCase();
}

// Validate Card Number (Luhn Algorithm)
function validateCardNumber(cardNumber) {
  console.log("Validating card number");
  cardNumber = cardNumber.replace(/\s/g, "");
  if (!/^\d{12,16}$/.test(cardNumber)) {
    console.log("Card number has invalid length or contains non-digits");
    return false;
  }

  let sum = 0,
    alternate = false;
  for (let i = cardNumber.length - 1; i >= 0; i--) {
    let n = parseInt(cardNumber[i], 10);
    if (alternate) {
      n *= 2;
      if (n > 9) n -= 9;
    }
    sum += n;
    alternate = !alternate;
  }

  const isValid = sum % 10 === 0;
  console.log("Card number validation result:", isValid);
  return isValid;
}

// Validate Expiry Date
function validateExpiryDate(expiry) {
  console.log("Validating expiry date:", expiry);
  const regex = /^(0[1-9]|1[0-2])\/\d{4}$/;
  if (!regex.test(expiry)) {
    console.log("Expiry date format is invalid");
    return false;
  }

  const [month, year] = expiry.split("/").map((str) => str.trim());
  const expiryDate = new Date(year, month - 1);
  const currentDate = new Date();

  const isValid = expiryDate >= currentDate;
  console.log("Expiry date validation result:", isValid);
  return isValid;
}


document.addEventListener("DOMContentLoaded", function () {
  // Get booking details from localStorage
  const bookingDetailsString = localStorage.getItem("bookingDetails");

  if (!bookingDetailsString) {
    console.error("No booking details found in localStorage");
    return;
  }

  // Parse the JSON data
  const bookingDetails = JSON.parse(bookingDetailsString);

  // Update bus details
  document.querySelector(".Travels h3").textContent =
    bookingDetails.busName || "Shree Nath Travels";
  document.querySelector(".Travels p").textContent =
    bookingDetails.busType || "Non AC Sleeper";

  // Update pickup and drop times/locations with dynamic dates
  const pickupTimeElements = document.querySelectorAll(".pickup p:first-child");
  const pickupDateElements = document.querySelectorAll(".pickup h3");
  const pickupLocationElements = document.querySelectorAll(
    ".pickup p:last-child"
  );

  if (pickupTimeElements.length > 0)
    pickupTimeElements[0].textContent = bookingDetails.pickupTime || "10:00 AM";
  if (pickupDateElements.length > 0)
    pickupDateElements[0].textContent =
      bookingDetails.busdateDepature || "10 Feb 2025";
  if (pickupLocationElements.length > 0)
    pickupLocationElements[0].textContent =
      bookingDetails.pickupLocation || "Surat";

  const dropTimeElements = document.querySelectorAll(".drop p:first-child");
  const dropDateElements = document.querySelectorAll(".drop h3");
  const dropLocationElements = document.querySelectorAll(".drop p:last-child");

  if (dropTimeElements.length > 0)
    dropTimeElements[0].textContent = bookingDetails.dropTime || "06:00 PM";
  if (dropDateElements.length > 0)
    dropDateElements[0].textContent =
      bookingDetails.busDateArrival || "10 Feb 2025";
  if (dropLocationElements.length > 0)
    dropLocationElements[0].textContent =
      bookingDetails.dropLocation || "Ankleshwar";

  // Update duration
  const durationElement = document.querySelector("#time h3");
  if (durationElement)
    durationElement.textContent = bookingDetails.duration || "05h 30m";

  // Update pickup and dropoff points
  const pickupPointElement = document.querySelector(".pick-area:first-child p");
  if (pickupPointElement)
    pickupPointElement.textContent =
      bookingDetails.pickupPoints || "Shyamdham Mandir, Jakatnaka";

  const dropPointElement = document.querySelector(".pick-area:last-child p");
  if (dropPointElement)
    dropPointElement.textContent =
      bookingDetails.dropoffPoints || "Lalita Chowkdi";

  // Update passenger details
  const passengersContainer = document.querySelector(".p-Details");
  if (
    passengersContainer &&
    bookingDetails.passengers &&
    bookingDetails.passengers.length > 0
  ) {
    // Clear existing passengers
    passengersContainer.innerHTML = "";

    // Add passengers from localStorage
    bookingDetails.passengers.forEach((passenger, index) => {
      const genderShort = passenger.gender === "Male" ? "M" : "F";
      const passengerNameElement = document.createElement("p");
      passengerNameElement.className = "col-8";
      passengerNameElement.innerHTML = `${passenger.name} <span>(${genderShort},${passenger.age})</span>`;

      passengersContainer.appendChild(passengerNameElement);
    });
  }

  // Update fare details using the specific class names

  // Onward Fare
  const onwardFareElement = document.querySelector(".Amount");
  if (onwardFareElement) {
    onwardFareElement.textContent = `₹${
      bookingDetails.onwardFare
        ? bookingDetails.onwardFare.toLocaleString()
        : "35,000"
    }`;
  }

  // GST
  const gstElement = document.querySelector(".Amount-gst");
  if (gstElement) {
    gstElement.textContent = `₹${
      bookingDetails.gst ? bookingDetails.gst.toLocaleString() : "6,300"
    }`;
  }

  // Booking Charges
  const bookingChargesElement = document.querySelector(".Amount-b-charges");
  if (bookingChargesElement) {
    const bookingCharges = bookingDetails.fareBreakup?.bookingCharges || 120;
    bookingChargesElement.textContent = `₹${bookingCharges}`;
  }

  // Discount
  const discountElement = document.querySelector(".Amount-discount");
  if (discountElement) {
    const discount = bookingDetails.discount || 7120;
    discountElement.textContent = `-₹${discount.toLocaleString()}`; // Adding minus sign to show it's a discount
  }

  // Update total amount
  const totalAmountElement = document.querySelector(".Total-Amount .Amount");
  if (totalAmountElement) {
    const total =
      bookingDetails.totalPayableAmount || bookingDetails.totalPrice || 34300;
    totalAmountElement.textContent = `₹${total.toLocaleString()}`;
  }
});

// Add this function at the top of your file or in a suitable location
function showToast(message, type) {
  // Check if Toastify is available
  if (typeof Toastify === "undefined") {
    console.error(
      "Toastify is not loaded. Please include the Toastify library."
    );
    // alert(message); // Fallback to alert if Toastify is not available
    return;
  }

  // Configure toast options
  const toastOptions = {
    text: message,
    duration: 3000,
    close: true,
    gravity: "top",
    position: "right",
    stopOnFocus: true,
    style: {
      background:
        type === "success"
          ? "linear-gradient(to right, #00b09b, #96c93d)"
          : "linear-gradient(to right, #ff5f6d, #ffc371)",
    },
  };

  // Show the toast
  Toastify(toastOptions).showToast();
}
