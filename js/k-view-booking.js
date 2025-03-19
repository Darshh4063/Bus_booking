document.addEventListener("DOMContentLoaded", () => {
  // Extract booking ID from URL parameters
  const urlParams = new URLSearchParams(window.location.search);
  const bookingId = urlParams.get("id");

  if (bookingId) {
    // If booking ID is present in URL, fetch the booking details
    fetchBookingDetails(bookingId);
  } else {
    // Handle case when no booking ID is provided
    displayErrorMessage("No booking ID provided");
  }
});

async function fetchBookingDetails(bookingId) {
  try {
    const userId = getCurrentUserId();

    // Fetch user data from your JSON server
    const response = await fetch(`http://localhost:3000/user/${userId}`);
    const userData = await response.json();

    // Find the specific booking by ID
    const booking = userData.Bookings.find(
      (booking) => booking.bookingId == bookingId
    );

    if (booking) {
      // Check and update booking status based on date
      const updatedBooking = checkAndUpdateBookingStatus(booking);

      // If status was updated, save changes to the server
      if (updatedBooking.statusUpdated) {
        await updateBookingStatus(userId, bookingId, updatedBooking.status);
      }

      // Populate the page with booking details
      populateBookingDetails(updatedBooking);

      // Update action buttons based on booking status
      updateActionButtons(updatedBooking);
    } else {
      displayErrorMessage("Booking not found");
    }
  } catch (error) {
    console.error("Error fetching booking details:", error);
    displayErrorMessage("Failed to load booking details");
  }
}

function getCurrentUserId() {
  // Get the current user ID from localStorage
  const currentUser = JSON.parse(localStorage.getItem("currentUser"));
  return currentUser?.id;
}

function checkAndUpdateBookingStatus(booking) {
  // Don't update cancelled bookings
  if (booking.status && booking.status.toLowerCase() === "cancelled") {
    return { ...booking, statusUpdated: false };
  }

  // Get current date
  const currentDate = new Date();

  // Parse journey end date from booking
  let journeyEndDate;
  try {
    // Try to parse the drop date and time
    // Format expected: "03:30 PM 10 Feb 2025" or similar
    const dateTimeString = `${booking.dropTime} ${booking.busdateDepature}`;

    // Handle different date formats
    if (dateTimeString.includes("-")) {
      // If date is in format like "2025-02-10"
      const parts = booking.busdateDepature.split("-");
      journeyEndDate = new Date(parts[0], parts[1] - 1, parts[2]);
    } else {
      // If date is in format like "10 Feb 2025"
      journeyEndDate = new Date(dateTimeString);
    }
  } catch (e) {
    console.error("Error parsing journey end date:", e);
    // If parsing fails, use a fallback approach
    const dateParts = booking.busdateDepature.split(/[\s-]+/);
    // Try to create a date from parts
    if (dateParts.length >= 3) {
      // Assuming format is either "10 Feb 2025" or "2025-02-10"
      const year = dateParts.find((part) => part.length === 4);
      const month = dateParts.find((part) => isNaN(part) && part.length === 3);
      const day = dateParts.find((part) => !isNaN(part) && part.length <= 2);

      if (year && month && day) {
        const months = {
          Jan: 0,
          Feb: 1,
          Mar: 2,
          Apr: 3,
          May: 4,
          Jun: 5,
          Jul: 6,
          Aug: 7,
          Sep: 8,
          Oct: 9,
          Nov: 10,
          Dec: 11,
        };
        journeyEndDate = new Date(parseInt(year), months[month], parseInt(day));
      }
    }

    // If all parsing fails, default to upcoming
    if (!journeyEndDate || isNaN(journeyEndDate)) {
      return { ...booking, statusUpdated: false };
    }
  }

  // Check if journey end date has passed
  if (currentDate > journeyEndDate) {
    // If journey date has passed and status is not already completed, update to completed
    if (booking.status !== "completed") {
      return { ...booking, status: "completed", statusUpdated: true };
    }
  }

  // No status change needed
  return { ...booking, statusUpdated: false };
}

async function updateBookingStatus(userId, bookingId, newStatus) {
  try {
    // First, get the current user data
    const userResponse = await fetch(`http://localhost:3000/user/${userId}`);
    const userData = await userResponse.json();

    // Find and update the specific booking
    const updatedBookings = userData.Bookings.map((booking) => {
      if (booking.bookingId == bookingId) {
        return { ...booking, status: newStatus };
      }
      return booking;
    });

    // Update the user data with the modified bookings
    userData.Bookings = updatedBookings;

    // Send the updated data back to the server
    await fetch(`http://localhost:3000/user/${userId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(userData),
    });

    console.log(`Booking status updated to ${newStatus}`);
    return true;
  } catch (error) {
    console.error("Error updating booking status:", error);
    return false;
  }
}

function populateBookingDetails(booking) {
  try {
    // Safely update elements by checking if they exist first
    updateElementText(
      ".time-label:first-of-type",
      `${booking.pickupTime} ${booking.busDateArrival}`
    );
    updateElementText(".location:first-of-type", booking.pickupLocation);

    updateElementText(
      ".time-label:last-of-type",
      `${booking.dropTime} ${booking.busdateDepature}`
    );
    updateElementText(".location:last-of-type", booking.dropLocation);

    // Update journey duration
    updateElementText(".time-info", booking.duration);


    // Update passenger details
    const passengersTableBody = document.querySelector(
      ".booking-section:nth-of-type(2) tbody"
    );
    if (passengersTableBody && booking.passengers) {
      passengersTableBody.innerHTML = "";

      booking.passengers.forEach((passenger) => {
        const row = document.createElement("tr");
        row.innerHTML = `
            <td>${passenger.name || ""}</td>
            <td>${passenger.gender || ""}</td>
            <td>${passenger.age || ""}</td>
          `;
        passengersTableBody.appendChild(row);
      });
    }

    // Update contact details
    const emailInput = document.querySelector('input[type="email"]');
    if (emailInput) {
      emailInput.value = booking.contactDetails.email || "example123@gmail.com";
    }

    const phoneInput = document.querySelector('input[type="tel"]');
    if (phoneInput) {
      phoneInput.value =
        booking.contactDetails.phone.number || "+91 95555 55555";
    }

    // Update fare details with specific breakdown
    updateFareDetails(booking);

    // Update status (if applicable)
    updateBookingStatusUI(booking.status);

    if (booking.status && booking.status.toLowerCase() === "cancelled") {
      displayCancellationDetails(booking);
    } else {
      // Hide cancellation details section if not cancelled
      const cancellationSection = document.querySelector("#k-cancel-details");
      if (cancellationSection) {
        cancellationSection.style.display = "none";
      }
    }
  } catch (error) {
    console.error("Error populating booking details:", error);
    // Continue execution despite errors in populating some fields
  }
}

function updateFareDetails(booking) {
  const totalPrice = booking.totalPayableAmount || booking.totalPrice || 0;
  const basePrice = booking.onwardFare;
  const discount = booking.discount;
  const gst = booking.gst;
  const bookingCharges = booking.fareBreakup.bookingCharges;

  // Update fare details in the HTML
  updateElementText(
    ".fare-details .bus-price span:last-child",
    `₹${basePrice}`
  );
  updateElementText(".fare-details .discount span:last-child", `₹${discount}`);
  updateElementText(".fare-details .gst span:last-child", `₹${gst}`);
  updateElementText(
    ".fare-details .b-charge span:last-child",
    `₹${bookingCharges}`
  );
  updateElementText(
    ".fare-details .total-price span:last-child",
    `₹${totalPrice}`
  );
}

// Helper function to safely update element text
function updateElementText(selector, text) {
  const element = document.querySelector(selector);
  if (element) {
    element.textContent = text;
  }
}

function updateBookingStatusUI(status) {
  // Find the status element
  const statusElement = document.querySelector(".text-primary");

  if (statusElement && status) {
    // Update the status text and color based on booking status
    switch (status.toLowerCase()) {
      case "upcoming":
        statusElement.innerHTML =
          '<div class="upcoming-dot"></div><b>Upcoming</b>';
        statusElement.className = "text-primary d-flex align-items-center";
        break;
      case "completed":
        statusElement.innerHTML =
          '<div class="completed-dot"></div><b>Completed</b>';
        statusElement.className = "text-success d-flex align-items-center";
        break;
      case "cancelled":
        statusElement.innerHTML =
          '<div class="cancelled-dot"></div><b>Cancelled</b>';
        statusElement.className = "text-danger d-flex align-items-center";
        break;
      default:
        // Default case to handle unexpected status values
        statusElement.innerHTML =
          '<div class="upcoming-dot"></div><b>Upcoming</b>';
        statusElement.className = "text-primary d-flex align-items-center";
    }
  }
}

// Function to create action buttons based on booking status
function updateActionButtons(booking) {
  // Get references to both buttons
  const cancelButton = document
    .querySelector("button.primary-btn a[href='k-cancel-bus.html']")
    .closest("button");
  const reviewButton = document
    .querySelector("button.primary-btn a[href='k-add-review.html']")
    .closest("button");

  // Hide both buttons initially
  if (cancelButton) cancelButton.style.display = "none";
  if (reviewButton) reviewButton.style.display = "none";

  // Show the appropriate button based on booking status
  if (booking.status) {
    if (booking.status.toLowerCase() === "completed" && reviewButton) {
      // Show review button for completed bookings
      reviewButton.style.display = "block";

      // Update the href to include the booking ID
      const reviewLink = reviewButton.querySelector("a");
      if (reviewLink) {
        reviewLink.href = `k-add-review.html?id=${booking.bookingId}`;

        // Store booking info in localStorage for use on review page
        reviewButton.addEventListener("click", () => {
          storeBookingForReview(booking);
        });
      }
    } else if (booking.status.toLowerCase() === "upcoming" && cancelButton) {
      // Show cancel button for upcoming bookings
      cancelButton.style.display = "block";

      // Update the href to include the booking ID
      const cancelLink = cancelButton.querySelector("a");
      if (cancelLink) {
        cancelLink.href = `k-cancel-bus.html?id=${booking.bookingId}`;
      }
    }
    // No buttons shown for cancelled bookings - we just don't show either button

    // Handle invoice button - this is available for all booking statuses
    const downloadInvoiceBtn = document.querySelector(".k-invoice-btn");
    if (downloadInvoiceBtn) {
      downloadInvoiceBtn.addEventListener("click", function (event) {
        event.preventDefault(); // Prevent default action

        // Create a properly formatted booking object for the invoice
        const invoiceData = {
          bookingId: booking.bookingId,
          busName: booking.busName,
          pickupLocation: booking.pickupLocation,
          dropLocation: booking.dropLocation,
          busdateDepature: booking.busdateDepature,
          busDateArrival: booking.busDateArrival,
          pickupTime: booking.pickupTime,
          dropTime: booking.dropTime,

          // Contact details - ensure these are properly formatted
          contactDetails: {
            phone: booking.contactDetails?.phone || {
              countryCode: "+91",
              number: booking.phone || "55555 55555",
            },
            email: booking.contactDetails?.email || "example@email.com",
          },

          // Passenger details - ensure this is properly formatted as an array
          passengers: booking.passengers || [],

          // Fare details - ensure these values exist
          onwardFare: booking.onwardFare || 0,
          gst: booking.gst || 0,
          fareBreakup: {
            bookingCharges: booking.fareBreakup?.bookingCharges || 0,
          },
          discount: booking.discount || 0,
          totalPayableAmount:
            booking.totalPayableAmount || booking.totalPrice || 0,

          // Add status to show in invoice
          status: booking.status || "Upcoming",

          // Pass cancellation details if available
          cancellationDetails: booking.cancellationDetails || null,
        };

        // Store complete and properly formatted data
        localStorage.setItem("invoiceBookingData", JSON.stringify(invoiceData));

        // Redirect to invoice page
        window.location.href = "k-invoice.html";
      });
    }
  }
}

// Store booking details in localStorage for use in the review page
function storeBookingForReview(booking) {
  const reviewData = {
    bookingId: booking.bookingId,
    busName: booking.busName,
    pickupLocation: booking.pickupLocation,
    dropLocation: booking.dropLocation,
    busdateDepature: booking.busdateDepature,
    pickupTime: booking.pickupTime,
    passengers: booking.passengers,
  };

  localStorage.setItem("currentReviewBooking", JSON.stringify(reviewData));
}

// Update the displayCancellationDetails function to ensure it only shows for cancelled bookings
function displayCancellationDetails(booking) {
  // Check if the booking status is cancelled
  if (booking.status.toLowerCase() !== "cancelled") {
    // Hide cancellation details section
    const cancelDetailsSection = document.getElementById("k-cancel-details");
    if (cancelDetailsSection) {
      cancelDetailsSection.style.display = "none";
    }
    return;
  }

  // Get or create the cancellation details section
  let cancelDetailsSection = document.getElementById("k-cancel-details");

  if (!cancelDetailsSection) {
    // Create a new cancellation details section if it doesn't exist
    cancelDetailsSection = document.createElement("div");
    cancelDetailsSection.id = "k-cancel-details";

    // Insert it after fare details section
    const fareDetailsSection = document
      .querySelector(".fare-details")
      .closest(".booking-section");
    if (fareDetailsSection) {
      fareDetailsSection.parentNode.insertBefore(
        cancelDetailsSection,
        fareDetailsSection.nextSibling
      );
    } else {
      // Fallback if fare details section is not found
      const container = document.querySelector(".container.mt-4");
      if (container) {
        container.appendChild(cancelDetailsSection);
      }
    }
  } else {
    // Show the section if it exists but was hidden
    cancelDetailsSection.style.display = "block";
  }

  // Get cancellation details from the booking object
  const cancellationDetails = booking.cancellationDetails || {};

  // Build the HTML content
  let htmlContent = `
    <div class="fare-details-cancel my-3">
      <h5>Cancellation Details</h5>
      <div class="k-cancel-details">
        <div class="k-cancel-seats">
  `;

  // Add passenger details
  if (booking.passengers && booking.passengers.length > 0) {
    booking.passengers.forEach((passenger) => {
      htmlContent += `
        <div class="d-flex align-items-center justify-content-between">
          <div>
            <p class="fw-bold">
              ${passenger.name}
              <span class="text-gray fw-normal ps-2">(${passenger.gender},${passenger.age})</span>
            </p>
          </div>
        </div>
      `;
    });
  }

  // Add reason section
  htmlContent += `
    <div>
      <div>
        <p class="m-0 text-gray">Reason</p>
      </div>
      <div>
        <p class="k-reason fw-semibold">
          ${
            cancellationDetails.reason ||
            "You booked a ticket for the wrong bus or time"
          }
        </p>
      </div>
    </div>
  `;

  // Add description section
  htmlContent += `
    <div>
      <div>
        <p class="m-0 text-gray">Description</p>
      </div>
      <div>
          <p class="k-reason fw-semibold">
          ${
            cancellationDetails.description ||
            "Lorem Ipsum is simply dummy text of the printing and typesetting industry for demo."
          }
        </p>
      </div>
    </div>
  `;

  // Close all divs
  htmlContent += `
        </div>
      </div>
    </div>
  `;

  // Set the HTML content
  cancelDetailsSection.innerHTML = htmlContent;
}

function displayErrorMessage(message) {
  const container = document.querySelector(".container.mt-4");
  if (container) {
    container.innerHTML = `
        <div class="alert alert-danger text-center" role="alert">
          <h4 class="alert-heading">Error</h4>
          <p>${message}</p>
          <hr>
          <p class="mb-0">
            <a href="mybooking.html" class="btn btn-outline-danger">Back to My Bookings</a>
          </p>
        </div>
      `;
  } else {
    // Fallback if container is not found
    document.body.innerHTML = `
        <div class="container mt-5">
          <div class="alert alert-danger text-center" role="alert">
            <h4 class="alert-heading">Error</h4>
            <p>${message}</p>
            <hr>
            <p class="mb-0">
              <a href="mybooking.html" class="btn btn-outline-danger">Back to My Bookings</a>
            </p>
          </div>
        </div>
      `;
  }
}
