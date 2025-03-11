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
        phone = booking.contactDetails.phone;
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
            <td>${passenger.seatNo || ""}</td>
            <td>${passenger.gender || ""}</td>
            <td>${passenger.age || ""}</td>
          `;
        passengersTableBody.appendChild(row);
      });
    }

    // FARE DETAILS SECTION
    // Handle different possible property names and formats
    const onwardFare = booking.onwardFare || booking.fareBreakup?.baseFare || 0;
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