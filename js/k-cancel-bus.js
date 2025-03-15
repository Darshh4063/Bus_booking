document.addEventListener("DOMContentLoaded", function () {
  // Get booking ID from URL parameters
  const urlParams = new URLSearchParams(window.location.search);
  const bookingId = urlParams.get("id");
  let bookingData = null;

  // Handle OTP verification
  const otpInputs = document.querySelectorAll(".otp-input");
  const verifyButton = document.querySelector(".k-verify button");
  const otpModal = new bootstrap.Modal(document.getElementById("otpmodel"));
  const successModal = new bootstrap.Modal(document.getElementById("okmodel"));
  const errorMessageDiv = document.createElement("div");
  const cancelButton = document.querySelector(".k-cancel-tikcet-btn");
  const reasonSelect = document.querySelector(".form-select");
  const descriptionTextarea = document.querySelector("textarea");
  const passengerCheckboxes = document.querySelectorAll(
    ".passenger-table input[type='checkbox']"
  );

  // Check if booking ID exists
  if (!bookingId) {
    displayErrorMessage("No booking ID provided");
    return;
  }

  // Fetch booking details
  fetchBookingDetails(bookingId);

  // Add error message element (initially hidden)
  errorMessageDiv.className = "text-danger text-center mt-2 otp-error";
  errorMessageDiv.style.display = "none";
  errorMessageDiv.textContent = "Please enter the correct OTP code";
  document.querySelector(".otp-container").after(errorMessageDiv);

  // Auto focus and move to next input for OTP
  otpInputs.forEach((input, index) => {
    input.addEventListener("input", function () {
      if (this.value.length === 1) {
        if (index < otpInputs.length - 1) {
          otpInputs[index + 1].focus();
        }
      }
    });

    // Handle backspace
    input.addEventListener("keydown", function (e) {
      if (e.key === "Backspace" && this.value.length === 0) {
        if (index > 0) {
          otpInputs[index - 1].focus();
        }
      }
    });
  });

  // Only allow numeric input for OTP
  otpInputs.forEach((input) => {
    input.addEventListener("input", function () {
      this.value = this.value.replace(/[^0-9]/g, "");
    });
  });

  // Cancel Ticket button click handler
  cancelButton.addEventListener("click", function (e) {
    e.preventDefault();

    // Validate form before showing OTP modal
    if (validateCancellationForm()) {
      // Reset OTP inputs when showing the modal
      otpInputs.forEach((input) => {
        input.value = "";
      });
      otpInputs[0].focus();
      errorMessageDiv.style.display = "none";

      otpModal.show();
    }
  });

  // Verify OTP button click handler
  verifyButton.addEventListener("click", function (e) {
    e.preventDefault();

    // Get OTP from inputs
    let enteredOTP = "";
    let isComplete = true;

    otpInputs.forEach((input) => {
      if (input.value.length === 0) {
        isComplete = false;
      }
      enteredOTP += input.value;
    });

    // For demo purposes, correct OTP is "1234"
    const correctOTP = "1234";

    if (!isComplete) {
      // Show error if OTP is incomplete
      errorMessageDiv.textContent = "Please enter all 4 digits";
      errorMessageDiv.style.display = "block";
    } else if (enteredOTP !== correctOTP) {
      // Show error for incorrect OTP
      errorMessageDiv.textContent = "Incorrect OTP. Please try again.";
      errorMessageDiv.style.display = "block";
    } else {
      // OTP is correct, proceed with cancellation
      errorMessageDiv.style.display = "none";

      // Process the cancellation
      processCancellation()
        .then(() => {
          // Hide OTP modal and show success modal
          otpModal.hide();
          setTimeout(() => {
            successModal.show();
          }, 500);

          // Add event listener to return to bookings after seeing success message
          document
            .querySelector("#okmodel .btn-close")
            .addEventListener("click", function () {
              // Clear any temporary booking data from localStorage
              localStorage.removeItem("tempBookingData");
              // Redirect to bookings page
              window.location.href = "mybooking.html";
            });

          // Also add event listener for the success button
          document
            .querySelector("#okmodel .btn-primary")
            .addEventListener("click", function () {
              // Clear any temporary booking data from localStorage
              localStorage.removeItem("tempBookingData");
              // Redirect to bookings page
              window.location.href = "mybooking.html";
            });
        })
        .catch((error) => {
          // Show error message
          errorMessageDiv.textContent =
            "Cancellation failed. Please try again.";
          errorMessageDiv.style.display = "block";
          console.error("Cancellation error:", error);
        });
    }
  });

  // Hide error when user starts typing OTP again
  otpInputs.forEach((input) => {
    input.addEventListener("input", function () {
      errorMessageDiv.style.display = "none";
    });
  });

  // Validate the cancellation form
  function validateCancellationForm() {
    let isValid = true;
    let errorMessage = "";

    // Check if reason is selected
    if (
      reasonSelect.value === "Select reason" ||
      reasonSelect.selectedIndex === 0
    ) {
      errorMessage = "Please select a reason for cancellation";
      isValid = false;
    }


    // Display error message if validation fails
    if (!isValid) {
      alert(errorMessage);
    }

    return isValid;
  }

  // Process the cancellation
// Process the cancellation
// Modify the processCancellation function in k-cancel-bus.js
async function processCancellation() {
  try {
    const userId = getCurrentUserId();
    if (!userId || !bookingData) {
      throw new Error("Missing user ID or booking data");
    }

    // Get selected passengers
    const selectedPassengers = [];
    const selectedPassengerDetails = [];

    passengerCheckboxes.forEach((checkbox, index) => {
      if (checkbox.checked) {
        selectedPassengers.push(index);

        // Get the passenger details from the row
        const row = checkbox.closest("tr");
        const passengerDetail = {
          name: row.cells[1].textContent,
          gender: row.cells[2].textContent,
          age: row.cells[3].textContent,
          seatNo: row.cells[4].textContent,
        };
        selectedPassengerDetails.push(passengerDetail);
      }
    });

    // If all passengers are selected, cancel the entire booking
    const cancelEntireBooking =
      selectedPassengers.length === passengerCheckboxes.length;

    // Calculate cancellation charge (20% of the fare)
    const totalPrice = bookingData.totalPayableAmount || bookingData.totalPrice || 0;
    const cancellationFeePercent = 20; // Using 20% as per your cancellation policy
    const cancellationCharge = Math.round((totalPrice * cancellationFeePercent) / 100);
    const refundAmount = totalPrice - cancellationCharge;

    // Create cancellation object with complete details
    const cancellationDetails = {
      bookingId: bookingId,
      busName: bookingData.busName,
      pickupLocation: bookingData.pickupLocation,
      dropLocation: bookingData.dropLocation,
      travelDate: bookingData.busdateDepature,
      reason: reasonSelect.value,
      description: descriptionTextarea.value,
      cancelDate: new Date().toISOString(),
      cancellationTime: new Date().toLocaleTimeString(),
      selectedPassengers: selectedPassengerDetails,
      cancellationCharge: cancellationCharge,
      refundAmount: refundAmount,
      totalPaid: totalPrice,
      originalFare: totalPrice,
      fullCancellation: cancelEntireBooking,
      status: "Cancelled",
      contactDetails: bookingData.contactDetails || {
        phone: { number: "" },
        email: "",
      },
    };

    // Store cancellation in localStorage
    storeCancellationInLocalStorage(cancellationDetails);

    // Update booking status on the server
    await updateBookingStatusWithCancellation(
      userId,
      bookingId,
      "cancelled",
      cancellationDetails,
      selectedPassengers
    );

    // Release seat reservations for the cancelled seats
    if (cancelEntireBooking) {
      await releaseSeatReservations(bookingData);
    }

    // Important: Store updated booking data for invoice display
    // Create a new object with all booking data plus cancellation details
    const updatedBookingData = {
      ...bookingData,
      status: "Cancelled",
      cancellationDetails: cancellationDetails
    };
    
    // Save this updated booking data for the invoice page
    localStorage.setItem("invoiceBookingData", JSON.stringify(updatedBookingData));
    
    // Log for debugging
    console.log("Saved cancellation data for invoice:", updatedBookingData);

    return true;
  } catch (error) {
    console.error("Error processing cancellation:", error);
    throw error;
  }
}

// Also update the success button click handler to redirect to invoice.html
document
  .querySelector("#okmodel .btn-primary")
  .addEventListener("click", function () {
    // Redirect to invoice page
    window.location.href = "invoice.html";
  });
  
  // Store cancellation details in localStorage
  function storeCancellationInLocalStorage(cancellationDetails) {
    // Get existing cancellations or initialize empty array
    let cancellations = JSON.parse(localStorage.getItem("cancellations")) || [];

    // Add this cancellation to the array
    cancellations.push(cancellationDetails);

    // Store updated array back in localStorage
    localStorage.setItem("cancellations", JSON.stringify(cancellations));

    // Also store the most recent cancellation separately for easy access
    localStorage.setItem(
      "lastCancellation",
      JSON.stringify(cancellationDetails)
    );

    // Clear any temporary booking data
    localStorage.removeItem("tempBookingData");

    // Clear any seat selection data that might be stored
    localStorage.removeItem("selectedSeats");
  }

  // Fetch booking details from server
  async function fetchBookingDetails(bookingId) {
    try {
      const userId = getCurrentUserId();
      if (!userId) {
        displayErrorMessage("User not logged in");
        return;
      }

      // Fetch user data from your JSON server
      const response = await fetch(`http://localhost:3000/user/${userId}`);
      const userData = await response.json();

      // Find the specific booking by ID
      const booking = userData.Bookings.find(
        (booking) => booking.bookingId == bookingId
      );

      if (booking) {
        bookingData = booking;

        // Populate passenger table
        populatePassengerTable(booking.passengers);

        // Disable form if booking is not upcoming
        if (booking.status && booking.status.toLowerCase() !== "upcoming") {
          disableCancellationForm();
          displayErrorMessage("Only upcoming bookings can be cancelled");
        }
      } else {
        displayErrorMessage("Booking not found");
      }
    } catch (error) {
      console.error("Error fetching booking details:", error);
      displayErrorMessage("Failed to load booking details");
    }
  }

  // Populate passenger table
  function populatePassengerTable(passengers) {
    if (!passengers || passengers.length === 0) return;

    const tbody = document.querySelector(".passenger-table tbody");
    tbody.innerHTML = "";

    passengers.forEach((passenger) => {
      const row = document.createElement("tr");
      row.innerHTML = `
            <td><input type="checkbox" /></td>
            <td>${passenger.name || ""}</td>
            <td>${passenger.gender || ""}</td>
            <td>${passenger.age || ""}</td>
            <td>${passenger.seatNo || ""}</td>
          `;
      tbody.appendChild(row);
    });
  }

  // Disable cancellation form
  function disableCancellationForm() {
    reasonSelect.disabled = true;
    descriptionTextarea.disabled = true;
    document
      .querySelectorAll(".passenger-table input[type='checkbox']")
      .forEach((checkbox) => {
        checkbox.disabled = true;
      });
    cancelButton.disabled = true;
  }

  // Display error message
  function displayErrorMessage(message) {
    // Create error alert if it doesn't exist
    let errorAlert = document.querySelector(".cancellation-error");
    if (!errorAlert) {
      errorAlert = document.createElement("div");
      errorAlert.className = "alert alert-danger mt-3 cancellation-error";
      document.querySelector(".cancel-form").prepend(errorAlert);
    }

    errorAlert.textContent = message;
    errorAlert.style.display = "block";
  }

  // Update booking status with cancellation details
  async function updateBookingStatusWithCancellation(
    userId,
    bookingId,
    newStatus,
    cancellationDetails,
    selectedPassengers
  ) {
    try {
      // First, get the current user data
      const userResponse = await fetch(`http://localhost:3000/user/${userId}`);
      const userData = await userResponse.json();

      // Find and update the specific booking
      const updatedBookings = userData.Bookings.map((booking) => {
        if (booking.bookingId == bookingId) {
          if (newStatus === "cancelled") {
            // Full cancellation
            return {
              ...booking,
              status: newStatus,
              cancellationDetails: cancellationDetails,
            };
          } else {
            // Partial cancellation - remove cancelled passengers
            const cancelledSeatNos = cancellationDetails.selectedPassengers.map(
              (p) => p.seatNo
            );
            const remainingPassengers = booking.passengers.filter(
              (p) => !cancelledSeatNos.includes(p.seatNo)
            );

            return {
              ...booking,
              status: newStatus,
              passengers: remainingPassengers,
              Cancellations: [
                ...(booking.Cancellations || []),
                cancellationDetails,
              ],
            };
          }
        }
        return booking;
      });

      // Update the user data with the modified bookings
      userData.Bookings = updatedBookings;

      // Check if cancellations array exists, if not create it
      if (!userData.cancellations) {
        userData.cancellations = [];
      }

      // Add this cancellation to the user's cancellations array
      userData.cancellations.push(cancellationDetails);

      // Send the updated data back to the server
      const updateResponse = await fetch(
        `http://localhost:3000/user/${userId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(userData),
        }
      );

      if (!updateResponse.ok) {
        throw new Error(`Server responded with ${updateResponse.status}`);
      }

      console.log(
        `Booking status updated to ${newStatus} with cancellation details`
      );
      return true;
    } catch (error) {
      console.error("Error updating booking status:", error);
      throw error;
    }
  }

  // Get current user ID from localStorage
  function getCurrentUserId() {
    const currentUser = JSON.parse(localStorage.getItem("currentUser"));
    return currentUser?.id;
  }
});


// Add event listener for the success button
document
  .querySelector("#okmodel .btn-primary")
  .addEventListener("click", function () {
    // Clear any temporary booking data from localStorage
    localStorage.removeItem("tempBookingData");
    // Redirect to invoice page instead
    window.location.href = "invoice.html";
  });