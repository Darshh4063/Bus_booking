document
  .getElementById("paymentForm")
  .addEventListener("submit", async function (e) {
    e.preventDefault();

    const cardHolder = document.getElementById("cardHolder");
    const cardNumber = document.getElementById("cardNumber");
    const expiryDate = document.getElementById("expiryDate");
    const cvv = document.getElementById("cvv");
    const message = document.getElementById("message");

    // Clear previous error messages
    document.querySelectorAll(".error").forEach((el) => (el.innerText = ""));

    let isValid = true;

    // Validate Cardholder Name
    if (cardHolder.value.trim() === "") {
      showError(cardHolder, "Cardholder name is required");
      isValid = false;
    }

    // Validate Card Number using Luhn Algorithm
    if (!validateCardNumber(cardNumber.value)) {
      showError(cardNumber, "Invalid card number");
      isValid = false;
    }

    // Validate Expiry Date (MM/YYYY)
    if (!validateExpiryDate(expiryDate.value)) {
      showError(expiryDate, "Invalid expiry date (MM/YYYY)");
      isValid = false;
    }

    // Validate CVV (3 digits)
    if (!/^\d{3}$/.test(cvv.value)) {
      showError(cvv, "CVV must be 3 digits");
      isValid = false;
    }

    if (!isValid) return;

    // Send data to JSON Server
    const paymentData = {
      cardHolder: cardHolder.value,
      cardNumber: cardNumber.value.replace(/\s/g, ""), // Remove spaces
      expiryDate: expiryDate.value,
      cvv: cvv.value,
    };

    try {
      const response = await fetch("http://localhost:3000/payments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(paymentData),
      });

      if (response.ok) {
        message.style.color = "green";
        message.innerText = "Payment successful!";
        document.getElementById("paymentForm").reset();
      } else {
        throw new Error("Payment failed!");
      }
    } catch (error) {
      message.style.color = "red";
      message.innerText = error.message;
    }
  });

// Show error function
function showError(input, message) {
  const error = input.nextElementSibling;
  error.innerText = message;
}

// Luhn Algorithm for Credit Card Validation
function validateCardNumber(cardNumber) {
  cardNumber = cardNumber.replace(/\s/g, ""); // Remove spaces

  // Check if length is between 12 to 16 digits
  if (!/^\d{12,16}$/.test(cardNumber)) {
    return false;
  }

  // Apply Luhn Algorithm for final validation
  let sum = 0;
  let alternate = false;
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
  const regex = /^(0[1-9]|1[0-2])\/\s?(\d{4})$/;
  if (!regex.test(expiry)) return false;

  const [month, year] = expiry.split("/").map((str) => str.trim());
  const expiryDate = new Date(year, month - 1);
  const currentDate = new Date();

  return expiryDate >= currentDate;
}
