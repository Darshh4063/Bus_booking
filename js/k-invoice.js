document.addEventListener("DOMContentLoaded", () => {
  console.log("Invoice page loaded");

  // Get booking data from localStorage
  const invoiceDataStr = localStorage.getItem("invoiceBookingData");
  console.log("Raw invoice data from localStorage:", invoiceDataStr);

  const invoiceData = JSON.parse(invoiceDataStr);
  console.log("Parsed invoice data:", invoiceData);

  if (invoiceData) {
    populateInvoiceDetails(invoiceData);
    addPrintButton();
    addDownloadPdfButton();
  } else {
    console.error("No invoice data found in localStorage");
    displayErrorMessage(
      "No invoice data found. Please return to your bookings."
    );
  }
});
function populateInvoiceDetails(booking) {
  try {
    console.log("Received booking data:", booking); // Add this for debugging

    // Format current date for invoice date
    const currentDate = new Date();
    const options = { day: "2-digit", month: "short", year: "numeric" };
    const formattedDate = currentDate.toLocaleDateString("en-GB", options);

    // Generate random invoice number
    const invoiceNo = generateRandomInvoiceNumber();

    // BOOKING DETAILS SECTION
    // Update booking ID
    updateElementText(
      ".booking-id strong + span, .booking-details .booking-row:nth-child(1) strong + span",
      booking.bookingId || "GKJ1564674JV1U552"
    );

    // Update invoice date
    updateElementText(
      ".booking-date strong + span, .booking-details .booking-row:nth-child(2) strong + span",
      formattedDate
    );

    // Update invoice number
    updateElementText(
      ".invoice-id strong + span, .booking-details .booking-row:nth-child(3) strong + span",
      invoiceNo
    );

    // Update travel date - check multiple possible properties
    const travelDate =
      booking.busdateDepature ||
      booking.busDateArrival ||
      booking.travelDate ||
      "10 Feb 2025";
    updateElementText(
      ".travel-date strong + span, .booking-details .booking-row:nth-child(4) strong + span",
      travelDate
    );

    // Update bus operator
    updateElementText(
      ".bus-operator strong + span, .booking-details .col-md-6:nth-child(2) .booking-row:nth-child(1) strong + span",
      booking.busName || "Shree Nath Travels"
    );

    // Update "From" location
    updateElementText(
      ".location-a strong + span, .booking-details .col-md-6:nth-child(2) .booking-row:nth-child(2) strong + span",
      booking.pickupLocation || "Surat"
    );

    // Update "To" location
    updateElementText(
      ".location-b strong + span, .booking-details .col-md-6:nth-child(2) .booking-row:nth-child(3) strong + span",
      booking.dropLocation || "Ankleshwar"
    );

    // Update mobile number - handle different formats
    let phone = "+91 55555 55555"; // Default
    if (booking.contactDetails && booking.contactDetails.phone) {
      if (typeof booking.contactDetails.phone === "object") {
        phone = `${booking.contactDetails.phone.countryCode || "+91"} ${
          booking.contactDetails.phone.number || "55555 55555"
        }`;
      } else {
        phone = booking.contactDetails.phone.number;
      }
    } else if (booking.phone) {
      phone = booking.phone;
    }

    updateElementText(
      ".contact-number strong + span, .booking-details .col-md-6:nth-child(2) .booking-row:nth-child(4) strong + span",
      phone
    );

    // PASSENGER DETAILS SECTION
    const passengersTableBody = document.querySelector(
      ".passenger-table tbody"
    );

    if (
      passengersTableBody &&
      booking.passengers &&
      booking.passengers.length > 0
    ) {
      passengersTableBody.innerHTML = ""; // Clear existing rows

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

    const fareDetails = document.querySelector(".fare-details");
    const cancellationFareDetails = document.querySelector(
      ".fare-details-cancelation"
    );

    if (booking.status === "Cancelled") {
      // Show cancellation fare details
      if (fareDetails) fareDetails.style.display = "none";
      if (cancellationFareDetails)
        cancellationFareDetails.style.display = "block";

      // If cancellation details exist, populate them
      if (booking.cancellationDetails) {
        displayCancellationDetails(booking.bookingId);
      }
    } else {
      // Show regular fare details for "Complete" or "Upcoming" status
      if (fareDetails) fareDetails.style.display = "block";
      if (cancellationFareDetails)
        cancellationFareDetails.style.display = "none";

      // Update regular fare details
      const onwardFare =
        booking.onwardFare || booking.fareBreakup?.baseFare || 0;
      const gst = booking.gst || booking.fareBreakup?.gst || 0;
      const bookingCharges =
        booking.fareBreakup?.bookingCharges || booking.bookingCharges || 0;
      const discount = booking.discount || booking.fareBreakup?.discount || 0;
      const totalAmount =
        booking.totalPayableAmount ||
        booking.totalPrice ||
        booking.totalFare ||
        0;

      updateElementText(
        ".fare-details .fare-row:nth-child(1) span:last-child",
        `₹${onwardFare}`
      );
      updateElementText(
        ".fare-details .fare-row:nth-child(2) span:last-child",
        `₹${gst}`
      );
      updateElementText(
        ".fare-details .fare-row:nth-child(3) span:last-child",
        `₹${bookingCharges}`
      );
      updateElementText(
        ".fare-details .fare-row:nth-child(4) span:last-child",
        `-₹${discount}`
      );
      updateElementText(
        ".fare-details .total-row span:last-child",
        `₹${totalAmount}`
      );
    }
  } catch (error) {
    console.error("Error populating invoice details:", error);
    displayErrorMessage("Error displaying invoice details. Please try again.");
  }
}
// Helper function to safely update element text
function updateElementText(selector, text) {
  try {
    const elements = document.querySelectorAll(selector);
    if (elements.length === 0) {
      console.warn(`No elements found for selector: ${selector}`);
    }

    elements.forEach((element) => {
      if (element) {
        element.textContent = text;
      }
    });
  } catch (error) {
    console.error(`Error updating element with selector ${selector}:`, error);
  }
}
// Generate a random invoice number
function generateRandomInvoiceNumber() {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let result = "";
  for (let i = 0; i < 16; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

// Add this function to display errors
function displayErrorMessage(message) {
  const container = document.querySelector(".ticket-container");
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
  }
}

// Add this to your k-invoice.js file
function addDownloadPdfButton() {
  const container = document.querySelector(".ticket-container");
  if (container) {
    const downloadButton = document.createElement("button");
    downloadButton.className = "btn btn-success mt-4 ms-2";
    downloadButton.innerHTML = '<i class="fas fa-file-pdf"></i> Download PDF';
    downloadButton.addEventListener("click", function () {
      const invoiceElement = document.querySelector(".ticket-container");

      // Configure pdf options
      const options = {
        margin: 10,
        filename: "bus-ticket-invoice.pdf",
        image: { type: "jpeg", quality: 0.98 },
        html2canvas: { scale: 2 },
        jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
      };

      // Generate and download PDF
      html2pdf().from(invoiceElement).set(options).save();
    });

    container.appendChild(downloadButton);
  }
}

// Add this missing function to k-invoice.js
function addPrintButton() {
  const container = document.querySelector(".ticket-container");
  if (container) {
    const printButton = document.createElement("button");
    printButton.className = "btn btn-primary mt-4";
    printButton.innerHTML = '<i class="fas fa-print"></i> Print Invoice';
    printButton.addEventListener("click", function () {
      window.print();
    });

    container.appendChild(printButton);
  }
}

// Helper function to get current user ID
function getCurrentUserId() {
  try {
    const currentUser = JSON.parse(localStorage.getItem("currentUser"));
    return currentUser?.id;
  } catch (error) {
    console.error("Error getting current user ID:", error);
    return null;
  }
}

// Update booking on the server
async function updateBookingOnServer(userId, bookingId, cancellationDetails) {
  try {
    const response = await fetch(`http://localhost:3000/user/${userId}`);
    if (!response.ok) return;

    const userData = await response.json();

    // Find and update the booking
    if (userData.Bookings) {
      userData.Bookings = userData.Bookings.map((booking) => {
        if (booking.bookingId == bookingId) {
          return {
            ...booking,
            status: "Cancelled",
            cancellationDetails: cancellationDetails,
          };
        }
        return booking;
      });

      // Add to cancellations array if it exists
      if (!userData.cancellations) userData.cancellations = [];
      userData.cancellations.push(cancellationDetails);

      // Update on server
      await fetch(`http://localhost:3000/user/${userId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(userData),
      });
    }
  } catch (error) {
    console.error("Error updating booking on server:", error);
  }
}
// Function to display cancellation details on the invoice
function displayCancellationDetails(bookingId) {
  console.log("Displaying cancellation details for booking ID:", bookingId);

  try {
    // Get cancellation details from various sources
    let cancellationDetails = null;

    // First check invoice data
    const invoiceDataStr = localStorage.getItem("invoiceBookingData");
    if (invoiceDataStr) {
      const invoiceData = JSON.parse(invoiceDataStr);
      if (invoiceData && invoiceData.cancellationDetails) {
        cancellationDetails = invoiceData.cancellationDetails;
      }
    }

    // If not found, check cancellations in localStorage
    if (!cancellationDetails) {
      const cancellationsStr = localStorage.getItem("cancellations");
      if (cancellationsStr) {
        const cancellations = JSON.parse(cancellationsStr);

        if (Array.isArray(cancellations)) {
          cancellationDetails = cancellations.find(
            (c) => c.bookingId === bookingId
          );
        } else if (cancellations.bookingId === bookingId) {
          cancellationDetails = cancellations;
        }
      }
    }

    // If no cancellation details found, exit
    if (!cancellationDetails) {
      console.error("No cancellation details found for this booking");
      return;
    }

    // Get the cancellation fare details container
    const cancellationFareDetails = document.querySelector(
      ".fare-details-cancelation"
    );
    if (!cancellationFareDetails) {
      console.error("Cancellation fare details container not found");
      return;
    }

    // Update the cancellation details
    const originalFare = cancellationDetails.originalFare || 0;
    const cancellationCharge = cancellationDetails.cancellationCharge || 0;
    const refundAmount = cancellationDetails.refundAmount || 0;
    const totalPaid = cancellationDetails.totalPaid || 0;

    updateElementText(
      ".fare-details-cancelation .fare-row:nth-child(1) span:last-child",
      `₹${originalFare}`
    );
    updateElementText(
      ".fare-details-cancelation .fare-row:nth-child(2) span:last-child",
      `₹${cancellationCharge}`
    );
    updateElementText(
      ".fare-details-cancelation .fare-row:nth-child(3) span:last-child",
      `₹${refundAmount}`
    );
    updateElementText(
      ".fare-details-cancelation .total-row span:last-child",
      `₹${totalPaid}`
    );
  } catch (error) {
    console.error("Error displaying cancellation details:", error);
  }
}
// Function to send cancellation data to your JSON server
function sendCancellationToServer(cancellationDetails) {
  try {
    const apiUrl = "http://localhost:3000/cancellations";
    fetch(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(cancellationDetails),
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        return response.json();
      })
      .then((data) => {
        console.log("Cancellation saved to server:", data);
      })
      .catch((error) => {
        console.error("Error saving cancellation to server:", error);
      });
  } catch (error) {
    console.error("Error sending cancellation to server:", error);
  }
}
document.addEventListener("DOMContentLoaded", () => {
  console.log("Invoice page loaded");

  // Get booking data from localStorage
  const invoiceDataStr = localStorage.getItem("invoiceBookingData");
  console.log("Raw invoice data from localStorage:", invoiceDataStr);

  let invoiceData = null;

  try {
    invoiceData = JSON.parse(invoiceDataStr);
    console.log("Parsed invoice data:", invoiceData);
  } catch (error) {
    console.error("Error parsing invoice data:", error);
  }

  if (invoiceData) {
    populateInvoiceDetails(invoiceData);

    // Check if the booking is cancelled
    console.log("Booking status:", invoiceData.status);
    console.log("Cancellation details:", invoiceData.cancellationDetails);

    if (invoiceData.status === "Cancelled" && invoiceData.cancellationDetails) {
      console.log("Displaying cancellation details");
      // Display cancellation details
      displayCancellationDetails(invoiceData.cancellationDetails);
    }
  } else {
    console.error("No invoice data found in localStorage");
    displayErrorMessage(
      "No invoice data found. Please return to your bookings."
    );
  }
});

// Function to display cancellation details on the invoice
function displayCancellationDetails(bookingId) {
  console.log("Displaying cancellation details for booking ID:", bookingId);

  try {
    let cancellationDetails = null;
    const cancellationsStr = localStorage.getItem("cancellations");

    if (cancellationsStr) {
      const cancellations = JSON.parse(cancellationsStr);
      console.log("Found cancellations in localStorage:", cancellations);

      // Find the cancellation for this specific booking
      if (Array.isArray(cancellations)) {
        cancellationDetails = cancellations.find(
          (c) => c.bookingId === bookingId
        );
      } else if (cancellations.bookingId === bookingId) {
        // If it's a single object, check if it matches
        cancellationDetails = cancellations;
      }
    }

    // If not found in cancellations, fall back to the invoice data
    if (!cancellationDetails) {
      console.log(
        "No matching cancellation found in localStorage, checking invoiceBookingData"
      );
      const invoiceDataStr = localStorage.getItem("invoiceBookingData");
      if (invoiceDataStr) {
        const invoiceData = JSON.parse(invoiceDataStr);
        if (invoiceData && invoiceData.cancellationDetails) {
          cancellationDetails = invoiceData.cancellationDetails;
        }
      }
    }

    console.log("Final cancellation details to display:", cancellationDetails);

    // If no cancellation details found anywhere, exit
    if (!cancellationDetails) {
      console.error("No cancellation details found in localStorage");
      return;
    }

    // Show the cancellation fare details and hide the regular fare details
    const fareDetails = document.querySelector(".fare-details");
    const cancellationFareDetails = document.querySelector(
      ".fare-details-cancelation"
    );

    if (fareDetails) {
      fareDetails.style.display = "none";
    }

    if (cancellationFareDetails) {
      // Make sure the cancellation details are visible
      cancellationFareDetails.style.display = "block";

      // Get values with fallbacks to prevent undefined errors
      const originalFare = cancellationDetails.originalFare || 0;
      const totalPaid = cancellationDetails.totalPaid || 0;
      const cancellationCharge = cancellationDetails.cancellationCharge || 0;
      const refundAmount = cancellationDetails.refundAmount || 0;

      // Format the cancellation date safely
      let formattedCancelDate = "Unknown date";
      if (cancellationDetails.cancelDate) {
        try {
          const cancelDate = new Date(cancellationDetails.cancelDate);
          formattedCancelDate = cancelDate.toLocaleString();
        } catch (e) {
          console.error("Error formatting cancel date:", e);
          formattedCancelDate = cancellationDetails.cancelDate.toString();
        }
      }

      // Update all values in the fare breakdown
      updateElementText(
        ".fare-details-cancelation .fare-row:nth-child(1) span:last-child",
        `₹${originalFare}`
      );

      updateElementText(
        ".fare-details-cancelation .fare-row:nth-child(2) span:last-child",
        `₹${cancellationCharge}`
      );

      updateElementText(
        ".fare-details-cancelation .fare-row:nth-child(3) span:last-child",
        `₹${refundAmount}`
      );
    } else {
      console.error("Cancellation fare details container not found in the DOM");
    }
  } catch (error) {
    console.error("Error displaying cancellation details:", error);
    // Create an error alert
    const container = document.querySelector(".ticket-container");
    if (container) {
      const errorAlert = document.createElement("div");
      errorAlert.className = "alert alert-warning";
      errorAlert.textContent =
        "There was an error displaying cancellation details.";
      container.insertBefore(errorAlert, container.firstChild);
    }
  }
}

function showRegularFareDetails() {
  const fareDetails = document.querySelector(".fare-details");
  const cancellationFareDetails = document.querySelector(
    ".fare-details-cancelation"
  );

  if (fareDetails) {
    fareDetails.style.display = "block";
  }

  if (cancellationFareDetails) {
    cancellationFareDetails.style.display = "none";
  }
}

// Update the document.addEventListener to include the cancellations from localStorage
document.addEventListener("DOMContentLoaded", () => {
  console.log("Invoice page loaded");

  // Get booking data from localStorage
  const invoiceDataStr = localStorage.getItem("invoiceBookingData");
  console.log("Raw invoice data from localStorage:", invoiceDataStr);

  let invoiceData = null;

  try {
    invoiceData = JSON.parse(invoiceDataStr);
    console.log("Parsed invoice data:", invoiceData);
  } catch (error) {
    console.error("Error parsing invoice data:", error);
  }

  if (invoiceData) {
    // First populate the basic invoice details
    populateInvoiceDetails(invoiceData);

    // Get the booking ID for looking up cancellation data
    const bookingId = invoiceData.bookingId;
    console.log("Booking ID for cancellation lookup:", bookingId);

    // Check if the booking is cancelled in invoice data or has cancellation details
    if (invoiceData.status === "Cancelled" || invoiceData.cancellationDetails) {
      console.log("Booking is cancelled according to invoice data");

      displayCancellationDetails(bookingId);
    } else {
      // Now check if there's cancellation info in the cancellations localStorage
      try {
        const cancellationsStr = localStorage.getItem("cancellations");
        if (cancellationsStr) {
          const cancellations = JSON.parse(cancellationsStr);

          // Find if this booking has a cancellation
          let hasCancellation = false;

          if (Array.isArray(cancellations)) {
            hasCancellation = cancellations.some(
              (c) => c.bookingId === bookingId
            );
          } else if (cancellations.bookingId === bookingId) {
            hasCancellation = true;
          }

          if (hasCancellation) {
            console.log("Found cancellation in cancellations localStorage");
            displayCancellationDetails(bookingId);
          }
        }
      } catch (error) {
        console.error("Error checking cancellations localStorage:", error);
      }
    }
  } else {
    console.error("No invoice data found in localStorage");
    displayErrorMessage(
      "No invoice data found. Please return to your bookings."
    );
  }
});

window.onload = function () {
  // Get invoice data
  const invoiceDataStr = localStorage.getItem("invoiceBookingData");

  // Skip if the DOM content loaded handler has already done the work
  // Just perform a quick check if cancellation banner exists
  if (!document.querySelector(".cancellation-banner") && invoiceDataStr) {
    try {
      const invoiceData = JSON.parse(invoiceDataStr);

      if (invoiceData) {
        const bookingId = invoiceData.bookingId;

        // Check cancellations in localStorage
        const cancellationsStr = localStorage.getItem("cancellations");
        if (cancellationsStr) {
          const cancellations = JSON.parse(cancellationsStr);

          // Check if this booking has a cancellation
          let hasCancellation = false;

          if (Array.isArray(cancellations)) {
            hasCancellation = cancellations.some(
              (c) => c.bookingId === bookingId
            );
          } else if (cancellations.bookingId === bookingId) {
            hasCancellation = true;
          }

          if (hasCancellation) {
            console.log(
              "Window onload found cancellation in localStorage, displaying details"
            );
            displayCancellationDetails(bookingId);
          }
        }
      }
    } catch (error) {
      console.error("Error in window.onload:", error);
    }
  }
};
