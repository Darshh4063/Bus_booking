document.addEventListener("DOMContentLoaded", function () {
  const upiButton = document.getElementById("upi-pay-button");
  const bankButton = document.getElementById("bank-pay-button");
  const cardForm = document.getElementById("paymentForm");
  const checkButton = document.getElementById("confirm-check-payment");

  if (upiButton) {
    upiButton.addEventListener("click", function (e) {
      e.preventDefault();
      processPayment("UPI");
    });
  }

  if (bankButton) {
    bankButton.addEventListener("click", function (e) {
      e.preventDefault();
      processPayment("NetBanking");
    });
  }

  if (cardForm) {
    cardForm.addEventListener("submit", function (e) {
      e.preventDefault();
      processPayment("Card");
    });
  }

  if (checkButton) {
    checkButton.addEventListener("click", function (e) {
      e.preventDefault();
      processCheckPayment();
    });
  }
});

// Process Card, UPI, and Net Banking Payments
function processPayment(method) {
  const processingModal = new bootstrap.Modal(
    document.getElementById("processingModal")
  );
  processingModal.show();

  setTimeout(() => {
    processingModal.hide();
    const success = Math.random() > 0.3; // 70% success rate

    if (success) {
      completePayment(method);
    } else {
      showFailedModal("Payment failed. Please try again.");
    }
  }, 2000);
}

// Process Check Payment
function processCheckPayment() {
  const accountNumber = document.getElementById("accountNumber").value.trim();

  // Clear previous error messages
  document.querySelectorAll(".error").forEach((el) => (el.innerText = ""));

  let isValid = true;

  // Validate Account Number (8-16 digits)
  if (!/^\d{8,16}$/.test(accountNumber)) {
    showError(
      document.getElementById("accountNumber"),
      "Account Number must be 8-16 digits"
    );
    isValid = false;
  }

  if (!isValid) return;

  const processingModal = new bootstrap.Modal(
    document.getElementById("processingModal")
  );
  processingModal.show();

  setTimeout(() => {
    processingModal.hide();
    const success = Math.random() > 0.3; // 70% success rate

    if (success) {
      completeCheckPayment(accountNumber);
    } else {
      showFailedModal("Check payment failed. Please try again.");
    }
  }, 2000);
}

//  Complete Card, UPI, or NetBanking Payment
function completePayment(method) {
  const transactionId = generateTransactionId();
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
      amount: 6060,
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
      amount: 6060,
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
      cardNumber: cardNumber,
      expiryDate: expiryDate,
      cvv: cvv,
      amount: 6060,
      timestamp: new Date().toISOString(),
    };
  }

  sendPaymentData(data);
}

// Complete Check Payment
function completeCheckPayment(accountNumber) {
  const transactionId = generateTransactionId();

  const data = {
    id: transactionId,
    paymentBy: "Check",
    accountNumber: accountNumber,
    amount: 6060,
    timestamp: new Date().toISOString(),
  };

  sendPaymentData(data);
}

// Send Payment Data to JSON Server
function sendPaymentData(data) {
  fetch("http://localhost:3000/payments", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  })
    .then(() => showSuccessModal())
    .catch(() => showFailedModal("Server error. Payment failed."));
}

// Show Error Message
function showError(input, message) {
  const error = input.nextElementSibling;
  error.innerText = message;
}

// Show Success Modal
function showSuccessModal() {
  const successModal = new bootstrap.Modal(
    document.getElementById("successModal")
  );
  successModal.show();
}

// Show Failed Modal
function showFailedModal(message) {
  document.getElementById("failedMessage").innerText = message;
  const failedModal = new bootstrap.Modal(
    document.getElementById("failedModal")
  );
  failedModal.show();
}

// Show Processing Modal
function showProcessingModal() {
  const processingModal = new bootstrap.Modal(
    document.getElementById("processingModal")
  );
  processingModal.show();
}

// Generate Random Transaction ID
function generateTransactionId() {
  return Math.random().toString(36).substr(2, 6);
}

// Validate Card Number (Luhn Algorithm)
function validateCardNumber(cardNumber) {
  cardNumber = cardNumber.replace(/\s/g, "");
  if (!/^\d{12,16}$/.test(cardNumber)) return false;

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
  return sum % 10 === 0;
}

// Validate Expiry Date
function validateExpiryDate(expiry) {
  const regex = /^(0[1-9]|1[0-2])\/\d{4}$/;
  if (!regex.test(expiry)) return false;

  const [month, year] = expiry.split("/").map((str) => str.trim());
  const expiryDate = new Date(year, month - 1);
  const currentDate = new Date();

  return expiryDate >= currentDate;
}
