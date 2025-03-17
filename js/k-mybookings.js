document.addEventListener("DOMContentLoaded", () => {
  // Fetch the user's booking data
  fetchUserBookings();

  // Set up event listeners for the dropdown filter
  setupBookingsFilter();
});

async function fetchUserBookings() {
  try {
    const userId = getCurrentUserId();

    // Fetch bookings from your JSON server
    const response = await fetch("http://localhost:3000/user/" + userId);
    const userData = await response.json();

    // Check if the user has any bookings
    if (userData.Bookings && userData.Bookings.length > 0) {
      // Display the bookings
      displayBookings(userData.Bookings);
    //   console.log(userData.Bookings.map((booking) => booking.bookingId));
      
    } else {
      displayNoBookingsMessage();
    }
  } catch (error) {
    console.error("Error fetching booking data:", error);
    displayErrorMessage();
  }
}

function getCurrentUserId() {
  // Get the current user ID from localStorage
  const currentUser = JSON.parse(localStorage.getItem("currentUser"));
//   console.log("Current User:", currentUser);

  const userId = currentUser?.id;
  console.log("Current User ID:", userId);

  return userId;
}

function displayBookings(bookings) {
  const bookingCardsContainer = document.querySelector(".booking-cards");

  // Clear any existing content
  bookingCardsContainer.innerHTML = "";

  // Generate HTML for each booking
  bookings.forEach((booking) => {
    const card = createBookingCard(booking);
    bookingCardsContainer.appendChild(card);
  });
}

function createBookingCard(booking) {
  // Create a div element for the booking card
  const card = document.createElement("div");
  card.className = "booking-card";

  // Determine the status class
  const statusClass = `status-${booking.status}`;

  // Create the card HTML structure
  card.innerHTML = `
      <div class="booking-status ${statusClass}">
        <i class="fas fa-circle" style="font-size: 8px"></i> ${capitalizeFirstLetter(
          booking.status
        )}
      </div>
  
      <div class="bus-details">
        <h2 class="bus-name">${booking.busName}</h2>
        <p class="bus-type">${booking.busType}</p>
      </div>
  
      <div class="journey-info">
        <div class="destination">
          <div class="destination-time">${booking.pickupTime}</div>
          <div class="destination-name">${booking.pickupLocation}</div>
          <div class="destination-date">${booking.busdateDepature}</div>
        </div>
  
        <div class="d-none d-md-block w-50">
          <div class="journey-line">
          <div class="line">
            <div class="start-point"></div>
          </div>
          <div class="bus-icon">
            <i class="fas fa-bus"></i>
          </div>
          <div class="line">
            <div class="end-point"></div>
          </div>
        </div>
        </div>
  
        <div class="destination">
          <div class="destination-time">${booking.dropTime}</div>
          <div class="destination-name">${booking.dropLocation}</div>
          <div class="destination-date">${booking.busDateArrival}</div>
        </div>
      </div>
  
      <div class="journey-time">${booking.duration}</div>
  
      <div class="passengers">
        ${generatePassengersHTML(booking.passengers)}
      </div>
  
      <div class="booking-footer">
        <div class="booking-price">₹ ${formatPrice(
          booking.totalPayableAmount || booking.totalPrice
        )}</div>
        <button class="view-booking-btn">
          <a href="k-view-booking.html?id=${
            booking?.bookingId
          }" class="text-decoration-none text-white">View Booking</a>
        </button>
      </div>
    `;

  return card;
}

function generatePassengersHTML(passengers) {
  if (!passengers || passengers.length === 0) {
    return '<div class="passenger">No passenger information available</div>';
  }

  return passengers
    .map((passenger) => {
      const genderCode = passenger.gender === "Male" ? "M" : "F";
      return `
        <div class="passenger">
          ${passenger.name} <span class="passenger-age">(${genderCode}, ${passenger.age})</span>
        </div>
      `;
    })
    .join("");
}

function formatPrice(price) {
  // Format the price with commas for thousands
  return price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

function capitalizeFirstLetter(string) {
  return string?.charAt(0)?.toUpperCase() + string?.slice(1);
}

function displayNoBookingsMessage() {
  const bookingCardsContainer = document.querySelector(".booking-cards");
  bookingCardsContainer.innerHTML = `
      <div class="k-main">
          <div class="k-upcoming">
            <div class="k-up-box">
              <div
                class="k-no-upcoming d-flex justify-content-center align-items-center"
              >
                <img
                  src="k_images/No Upcoming Trips.svg"
                  alt="No Upcoming"
                  width="200px"
                />
              </div>
              <div class="k-no-details text-center">
                <p class="p-0 m-0">No Booking Found</p>
                <a class="text-gray text-decoration-none" href="buslist.html">Book a trip Now</a>
              </div>
            </div>
          </div>
        </div>
    `;
}

function displayErrorMessage() {
  const bookingCardsContainer = document.querySelector(".booking-cards");
  bookingCardsContainer.innerHTML = `
      <div class="k-main">
          <div class="k-upcoming">
            <div class="k-up-box">
              <div
                class="k-no-upcoming d-flex justify-content-center align-items-center"
              >
                <img
                  src="k_images/No Upcoming Trips.svg"
                  alt="No Upcoming"
                  width="200px"
                />
              </div>
              <div class="k-no-details text-center">
                <p class="p-0 m-0">No Booking Found</p>
                <p class="text-gray">Lorem Ipsum is simply dummy</p>
              </div>
            </div>
          </div>
        </div>
    `;
}

function setupBookingsFilter() {
  const filterOptions = document.querySelectorAll(
    ".dropdown-menu .dropdown-item"
  );

  filterOptions.forEach((option) => {
    option.addEventListener("click", (e) => {
      e.preventDefault();

      // Update the dropdown button text
      const filterButton = document.querySelector(".filter-button");
      filterButton.textContent = option.textContent;

      // Get the filter value (All, Upcoming, Completed, Cancelled)
      const filterValue = option.textContent.trim().toLowerCase();

      // Filter the bookings based on selection
      filterBookings(filterValue);
    });
  });
}

function filterBookings(filterValue) {
  // Get all booking cards
  const allCards = document.querySelectorAll(".booking-card");

  // If "All Bookings" is selected, show all cards
  if (filterValue === "all bookings") {
    allCards.forEach((card) => {
      card.style.display = "block";
    });
    return;
  }

  // Otherwise, filter the cards based on their status
  allCards.forEach((card) => {
    const statusElement = card.querySelector(".booking-status");
    const status = statusElement.textContent.trim().toLowerCase();

    if (status.includes(filterValue)) {
      card.style.display = "block";
    } else {
      card.style.display = "none";
    }
  });
}
