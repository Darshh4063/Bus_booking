document.addEventListener("DOMContentLoaded", async () => {
  await busListData();
  initializeSeatSelection();
});

async function busListData() {
  try {
    const response = await fetch("http://localhost:3000/busListings");

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const data = await response.json();
    let filteredBuses = [...data];

    const filterControls = `
      <div class="filter-section">
        <div class="search-filters">
          <input type="text" id="searchInput" placeholder="Search by bus name or type..." class="search-input">
          
          <select id="priceFilter" class="filter-select">
            <option value="">Price Range</option>
            <option value="0-500">₹0 - ₹500</option>
            <option value="501-1000">₹501 - ₹1000</option>
            <option value="1001+">₹1001+</option>
          </select>
          
          <select id="ratingFilter" class="filter-select">
            <option value="">Rating</option>
            <option value="4+">4+ Stars</option>
            <option value="3+">3+ Stars</option>
            <option value="2+">2+ Stars</option>
          </select>
          
          <select id="busTypeFilter" class="filter-select">
            <option value="">Bus Type</option>
            <option value="AC">AC</option>
            <option value="Non AC">Non AC</option>
            <option value="Sleeper">Sleeper</option>
            <option value="Seater">Seater</option>
          </select>

          <button id="resetFilters" class="reset-btn">Reset Filters</button>
        </div>
      </div>
    `;

    // Insert filter controls before the bus list
    document
      .getElementById("buslist")
      .insertAdjacentHTML("beforebegin", filterControls);

    // Add event listeners for filters
    document
      .getElementById("searchInput")
      .addEventListener("input", updateFilters);
    document
      .getElementById("priceFilter")
      .addEventListener("change", updateFilters);
    document
      .getElementById("ratingFilter")
      .addEventListener("change", updateFilters);
    document
      .getElementById("busTypeFilter")
      .addEventListener("change", updateFilters);
    document
      .getElementById("resetFilters")
      .addEventListener("click", resetFilters);

    function updateFilters() {
      const searchTerm = document
        .getElementById("searchInput")
        .value.toLowerCase();
      const priceRange = document.getElementById("priceFilter").value;
      const ratingFilter = document.getElementById("ratingFilter").value;
      const busTypeFilter = document.getElementById("busTypeFilter").value;

      filteredBuses = data.filter((bus) => {
        const matchesSearch =
          bus.companyName.toLowerCase().includes(searchTerm) ||
          bus.busType.toLowerCase().includes(searchTerm);

        let matchesPrice = true;
        if (priceRange) {
          const price = parseFloat(bus.price.amount);
          const [min, max] = priceRange.split("-").map(Number);
          matchesPrice = max ? price >= min && price <= max : price >= min;
        }

        let matchesRating = true;
        if (ratingFilter) {
          const minRating = parseFloat(ratingFilter);
          matchesRating = parseFloat(bus.rating) >= minRating;
        }

        let matchesBusType = true;
        if (busTypeFilter) {
          matchesBusType = bus.busType.includes(busTypeFilter);
        }

        return matchesSearch && matchesPrice && matchesRating && matchesBusType;
      });

      renderBusList(filteredBuses);
    }

    function resetFilters() {
      document.getElementById("searchInput").value = "";
      document.getElementById("priceFilter").value = "";
      document.getElementById("ratingFilter").value = "";
      document.getElementById("busTypeFilter").value = "";
      filteredBuses = [...data];
      renderBusList(filteredBuses);
    }

    renderBusList(filteredBuses);

    const style = document.createElement("style");
    style.textContent = `
      .filter-section {
        padding: 15px;
        background: #f5f5f5;
        border-radius: 8px;
      }

      .search-filters {
        display: flex;
        gap: 15px;
        flex-wrap: wrap;
      }

      .search-input {
        padding: 8px 12px;
        border: 1px solid #ddd;
        border-radius: 4px;
        min-width: 250px;
      }

      .filter-select {
        padding: 8px 12px;
        border: 1px solid #ddd;
        border-radius: 4px;
        background: white;
      }

      .reset-btn {
        padding: 8px 16px;
        background: #b86d4b;
        color: white;
        border: none;
        border-radius: 4px;
        cursor: pointer;
      }
    `;
    document.head.appendChild(style);

    const buslist = data.buslist;
    console.log(data);

    const buslistHtml = data
      .map(
        (bus, busIndex) => `
      <div class="travel-card">
        <div class="travel-info">
          <div class="rating">
            <span class="star">★</span>
            <span class="rating-value">${bus.rating}</span>
          </div>
          <div class="company-name">${bus.companyName}</div>
          <div class="bus-type">${bus.busType}</div>
        </div>

        <div class="journey-details">
          <div class="location-time">
            <div class="time">${bus.journey.departure.time}</div>
            <div class="location">${bus.journey.departure.location}</div>
            <div class="date">${bus.journey.departure.date}</div>
          </div>

          <div class="journey-duration">
            <div class="duration-line">
              <span class="bus-icon">🚌</span>
            </div>
            <div class="duration-text">${bus.journey.duration}</div>
          </div>

          <div class="location-time">
            <div class="time">${bus.journey.arrival.time}</div>
            <div class="location">${bus.journey.arrival.location}</div>
            <div class="date">${bus.journey.arrival.date}</div>
          </div>
        </div>

        <div class="price-section">
          <div class="price">
            <span class="currency">${bus.price.currency}</span>
            <span class="amount">${bus.price.amount}</span>
          </div>
          <div class="discount">${bus.price.discount}</div>
        </div>
      </div>

      <div class="travel-links">
          ${bus.travelLinks
            .map(
              (link) => `
            <a href="#" class="link" data-tab="${link.dataTab}" data-bus="${busIndex}">${link.name}</a>
          `
            )
            .join("")}
          <div class="ms-auto">
            <button class="select-seat link" data-tab="selectseat" data-bus="${busIndex}">${
          bus.selectSeat.label
        }</button>
          </div>
        </div>

        <div class="content-sections" id="bus-${busIndex}-content">
          <div id="tracking-${busIndex}" class="content-section" style="display: none;">
            <div class="placeholder-content">${bus.tracking.content}</div>
          </div>

          <div id="policies-${busIndex}" class="content-section" style="display: none;">
            <div class="container d-flex">
              <div class="table-container">
                <table>
                  <thead>
                    <tr>
                      <th>Cancellation Time</th>
                      <th>Charges</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${bus.policies.cancellationPolicies
                      .map(
                        (policy) => `
                      <tr>
                        <td>${policy.time}</td>
                        <td class="charges">${policy.charges}</td>
                      </tr>
                    `
                      )
                      .join("")}
                  </tbody>
                </table>
              </div>
              <div class="info-container">
                <h2 class="info-heading">Info</h2>
                <ul class="info-list">
                  ${bus.policies.info
                    .map(
                      (info) => `
                    <li>${info}</li>
                  `
                    )
                    .join("")}
                </ul>
              </div>
            </div>
          </div>

          <div id="amenities-${busIndex}" class="content-section" style="display: none;">
            <div class="placeholder-content">
              <div class="amenities-container">
                <h2 class="amenities-title">Bus Amenities</h2>
                <div class="amenities-list">
                  ${bus.amenities
                    .map(
                      (amenity) => `
                    <div class="amenity-item">
                      <div class="amenity-icon">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none"
                        stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M5 12.55a11 11 0 0 1 14.08 0"></path>
                        <path d="M1.42 9a16 16 0 0 1 21.16 0"></path>
                        <path d="M8.53 16.11a6 6 0 0 1 6.95 0"></path>
                        <line x1="12" y1="20" x2="12" y2="20"></line>
                      </svg>
                      </div>
                      <div class="amenity-text">${amenity}</div>
                    </div>
                  `
                    )
                    .join("")}
                </div>
              </div>
            </div>
          </div>

          <div id="photos-${busIndex}" class="content-section" style="display: none;">
            <div class="placeholder-content">
              <div class="owl-carousel owl-theme">
                ${bus.photos
                  .map(
                    (photos) => `
                  <div class="item">
                    <img src="./image/u_images/${photos}" alt="" />
                  </div>
                `
                  )
                  .join("")}
              </div>
            </div>
          </div>

          <div id="pickup-${busIndex}" class="content-section" style="display: none;">
            <div class="placeholder-content">
              <div class="pickup-dropoff-container">
                <div class="points-grid">
                  <div class="pickup-section text-start">
                    <h5 class="section-title">Pick up Point</h5>
                    <div class="point-list">
                      ${bus.pickupPoints
                        .map(
                          (point) => `
                        <div class="point-item">
                          <div class="point-time">${point.time}</div>
                          <div class="point-location">${point.location}</div>
                        </div>
                      `
                        )
                        .join("")}
                    </div>
                  </div>
                  <div class="dropoff-section text-start">
                    <h2 class="section-title">Drop off Point</h2>
                    <div class="point-list">
                      ${bus.dropoffPoints
                        .map(
                          (point) => `
                        <div class="point-item">
                          <div class="point-time">${point.time}</div>
                          <div class="point-location">${point.location}</div>
                        </div>
                      `
                        )
                        .join("")}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div id="reviews-${busIndex}" class="content-section" style="display: none;">
            <div class="placeholder-content">
              <div class="reviews-grid">
                <div class="rating-summary">
                  <div class="overall-rating">
                    <span class="star">★</span>
                    <span class="rating-number">${bus.ratings.overall}</span>
                    <span class="rating-text">Rating</span>
                  </div>
                  <div class="category-ratings">
                    <h4>People like</h4>
                    <div class="rating-item">
                      <span class="category">Bus quality</span>
                      <div class="rating-value">
                        <span class="star">★</span>
                        <span>${bus.ratings.categories.busQuality}</span>
                      </div>
                    </div>
                    <!-- Add other rating categories similarly -->
                  </div>
                </div>
                <div class="user-reviews">
                  ${bus.reviews
                    .map(
                      (review) => `
                    <div class="review-card">
                      <div class="review-header">
                        <div class="user-info">
                          <img src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-aw6GYkNqBu9RHKV6YRCYTefLhtSz9r.png" 
                            alt="${review.name}" class="avatar">
                          <div class="user-details text-start">
                            <h4>${review.name}</h4>
                            <span class="review-date">${review.date}</span>
                          </div>
                        </div>
                        <div class="star-rating">
                          ${Array(5)
                            .fill()
                            .map(
                              (_, i) => `
                            <span class="star ${
                              i < review.rating ? "filled" : ""
                            }">★</span>
                          `
                            )
                            .join("")}
                        </div>
                      </div>
                      <p class="review-text">${review.comment}</p>
                    </div>
                  `
                    )
                    .join("")}
                  <a href="#" class="show-more">Show More</a>
                </div>
              </div>
            </div>
          </div>

          <div id="selectseat-${busIndex}" class="content-section" style="display: none;">
            <div class="placeholder-content">
              <div class="seats-container">
                <div class="legend">
                  <div class="legend-item">
                    <input type="checkbox" class="legend-box available" />
                    <span>Available</span>
                  </div>
                  <div class="legend-item">
                    <input type="checkbox" class="legend-box booked" />
                    <span>Booked</span>
                  </div>
                  <div class="legend-item">
                    <input type="checkbox" class="legend-box selected" />
                    <span>Selected</span>
                  </div>
                </div>

                <div class="seat-selection">
                  <div class="seat-section">
                    <div class="section-title">
                      Lower Seat
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none"
                        stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <circle cx="12" cy="12" r="10"></circle>
                        <circle cx="12" cy="12" r="4"></circle>
                        <line x1="4.93" y1="4.93" x2="9.17" y2="9.17"></line>
                        <line x1="14.83" y1="14.83" x2="19.07" y2="19.07"></line>
                        <line x1="14.83" y1="9.17" x2="19.07" y2="4.93"></line>
                        <line x1="4.93" y1="19.07" x2="9.17" y2="14.83"></line>
                      </svg>
                    </div>

                    <div class="seat-grid">
                      <div class="seat"></div>
                      <div class="seat"></div>
                      <div class="seat booked booked-seat"></div>

                      <div class="seat"></div>
                      <div class="seat"></div>
                      <div class="seat"></div>

                      <div class="seat"></div>
                      <div class="seat booked booked-seat"></div>
                      <div class="seat"></div>

                      <div class="seat booked booked-seat"></div>
                      <div class="seat"></div>
                      <div class="seat"></div>

                      <div class="seat"></div>
                      <div class="seat booked booked-seat"></div>
                      <div class="seat"></div>

                      <div class="seat"></div>
                      <div class="seat"></div>
                      <div class="seat"></div>
                    </div>
                  </div>

                  <div class="seat-section">
                    <div class="section-title">
                      Upper Seat
                    </div>

                    <div class="seat-grid">
                      <div class="seat"></div>
                      <div class="seat booked booked-seat"></div>
                      <div class="seat"></div>

                      <div class="seat booked booked-seat"></div>
                      <div class="seat"></div>
                      <div class="seat"></div>

                      <div class="seat booked booked-seat"></div>
                      <div class="seat"></div>
                      <div class="seat"></div>

                      <div class="seat"></div>
                      <div class="seat"></div>
                      <div class="seat booked booked-seat"></div>

                      <div class="seat booked booked-seat"></div>
                      <div class="seat"></div>
                      <div class="seat"></div>

                      <div class="seat"></div>
                      <div class="seat"></div>
                      <div class="seat"></div>
                    </div>
                  </div>

                  <div class="sidebar">
                    <div class="tabs">
                      <div class="tab active">Pick Up Point</div>
                      <div class="tab">Drop Off Point</div>
                    </div>

                    <div class="stops-list">
                      <div class="stop-item">
                        <div class="stop-info">
                          <div class="stop-time">10:00 AM</div>
                          <div class="stop-location">Shyamdham Mandir, Jakatnaka</div>
                        </div>
                        <input type="radio" name="name" class="radio-button"></input>
                      </div>

                      <div class="stop-item">
                        <div class="stop-info">
                          <div class="stop-time">11:00 AM</div>
                          <div class="stop-location">Pasodara Patiya, Pasodara</div>
                        </div>
                        <input type="radio" name="name" class="radio-button"></input>
                      </div>

                      <div class="stop-item">
                        <div class="stop-info">
                          <div class="stop-time">11:30 AM</div>
                          <div class="stop-location">Laskana Gam, Laskana</div>
                        </div>
                        <input type="radio" name="name" class="radio-button"></input>
                      </div>

                      <div class="stop-item">
                        <div class="stop-info">
                          <div class="stop-time">12:10 AM</div>
                          <div class="stop-location">Kamrej Under Bridge, Kamrej</div>
                        </div>
                        <input type="radio" name="name" class="radio-button"></input>
                      </div>

                      <div class="stop-item">
                        <div class="stop-info">
                          <div class="stop-time">01:00 AM</div>
                          <div class="stop-location">Raj Hotel, Kmarej Highway</div>
                        </div>
                        <input type="radio" name="name" class="radio-button"></input>
                      </div>
                    </div>

                    <div class="booking-summary">
                      <div class="summary-title">Selected Seats</div>
                      <div id="seatselected"></div>
                      <div class="no-seats">No Seats Selected</div>
                      <button class="continue-btn" onclick="window.location.href='Booking_Details.html'">Continue</button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    `
      )
      .join("");
    initializeSeatSelection();

    document.getElementById("buslist").innerHTML = buslistHtml;

    // Add click event listeners for tabs
    document.querySelectorAll(".link").forEach((link) => {
      link.addEventListener("click", (e) => {
        e.preventDefault();
        const busIndex = e.target.dataset.bus;
        const tabId = e.target.dataset.tab;

        // Hide all content sections for this bus
        document
          .querySelectorAll(`#bus-${busIndex}-content .content-section`)
          .forEach((section) => {
            section.style.display = "none";
          });

        // Show selected content section
        document.getElementById(`${tabId}-${busIndex}`).style.display = "block";

        // Update active tab styling
        document.querySelectorAll(`[data-bus="${busIndex}"]`).forEach((tab) => {
          tab.classList.remove("active");
        });
        e.target.classList.add("active");
      });
    });

    // showTab("tracking");

    $(".owl-carousel").owlCarousel({
      loop: true,
      margin: 10,
      dots: true,
      items: 2,
      nav: true,
      // responsive:{
      //     0:{
      //         items:1
      //     },
      //     600:{
      //         items:3
      //     },
      //     1000:{
      //         items:3
      //     }
      // }
    });
  } catch (error) {
    console.error("Error loading bus listings:", error);
  }
}

function initializeSeatSelection() {
  const seatContainer = document.querySelector(".seat-selection");
  if (!seatContainer) return;

  let selectedSeats = [];
  const summaryElement = document.querySelector(".booking-summary");
  const continueBtn = summaryElement.querySelector(".continue-btn");

  const pickupDropTabs = document.querySelectorAll(".sidebar .tabs .tab");
  const stopsList = document.querySelector(".stops-list");

  const pickupPoints = [
    { time: "10:00 AM", location: "Shyamdham Mandir, Jakatnaka" },
    { time: "11:00 AM", location: "Pasodara Patiya, Pasodara" },
    { time: "11:30 AM", location: "Laskana Gam, Laskana" },
    { time: "12:10 AM", location: "Kamrej Under Bridge, Kamrej" },
    { time: "01:00 AM", location: "Raj Hotel, Kmarej Highway" },
  ];

  const dropoffPoints = [
    { time: "06:00 PM", location: "Central Bus Station" },
    { time: "06:30 PM", location: "City Mall Stop" },
    { time: "07:00 PM", location: "Airport Terminal" },
    { time: "07:30 PM", location: "Railway Station" },
  ];

  function updateStopsList(points) {
    stopsList.innerHTML = points
      .map(
        (point) => `
      <div class="stop-item">
        <div class="stop-info">
          <div class="stop-time">${point.time}</div>
          <div class="stop-location">${point.location}</div>
        </div>
        <input type="radio" name="stop-point" class="radio-button">
      </div>
    `
      )
      .join("");
  }

  pickupDropTabs.forEach((tab, index) => {
    tab.addEventListener("click", () => {
      pickupDropTabs.forEach((t) => t.classList.remove("active"));
      tab.classList.add("active");
      if (index === 0) {
        updateStopsList(pickupPoints);
      } else {
        updateStopsList(dropoffPoints);
      }
    });
  });

  updateStopsList(pickupPoints);

  seatContainer.addEventListener("click", (e) => {
    const seatElement = e.target.closest(".seat");
    if (!seatElement || seatElement.classList.contains("booked-seat")) return;

    const isSelected = seatElement.classList.toggle("selected");

    const seatGrid = seatElement.closest(".seat-grid");
    const seats = Array.from(seatGrid.querySelectorAll(".seat"));
    const seatIndex = seats.indexOf(seatElement) + 1;
    const deckType = seatElement
      .closest(".seat-section")
      .querySelector(".section-title")
      .textContent.includes("Upper")
      ? "Upper"
      : "Lower";
    const seatId = `${deckType}-${seatIndex}`;

    if (isSelected) {
      selectedSeats.push(seatId);
    } else {
      selectedSeats = selectedSeats.filter((id) => id !== seatId);
    }

    // console.log(selectedSeats)
    const seatSelectedElement = document.getElementById("seatselected");
    if (seatSelectedElement) {
      seatSelectedElement.innerHTML =
        selectedSeats.length > 0
          ? selectedSeats.join(", ")
          : "No seats selected";
    } else {
      console.warn("seatselected element not found");
    }

    updateBookingSummary(selectedSeats);
  });

  continueBtn.addEventListener("click", () => {
    if (selectedSeats.length === 0) {
      alert("Please select at least one seat to continue.");
      return;
    }
    console.log("Selected seats:", selectedSeats);
  });

  const legendCheckboxes = document.querySelectorAll(".legend-box");
  legendCheckboxes.forEach((checkbox) => {
    checkbox.addEventListener("change", updateSeatVisibility);
  });

  function updateSeatVisibility() {
    const availableChecked = document.querySelector(
      ".legend-box.available"
    ).checked;
    const bookedChecked = document.querySelector(".legend-box.booked").checked;
    const selectedChecked = document.querySelector(
      ".legend-box.selected"
    ).checked;

    const anyCheckboxChecked =
      availableChecked || bookedChecked || selectedChecked;

    const allSeats = document.querySelectorAll(".seat");
    allSeats.forEach((seat) => {
      if (!anyCheckboxChecked) {
        seat.style.display = "block";
        return;
      }

      seat.style.display = "none";

      const isBooked = seat.classList.contains("booked");
      const isSelected = seat.classList.contains("selected");
      const isAvailable = !isBooked && !isSelected;

      if (
        (isAvailable && availableChecked) ||
        (isBooked && bookedChecked) ||
        (isSelected && selectedChecked)
      ) {
        seat.style.display = "block";
      }
    });
  }
}

function updateBookingSummary(selectedSeats) {
  const summaryElement = document.querySelector(".booking-summary");
  const noSeatsElement = summaryElement.querySelector(".no-seats");

  if (selectedSeats.length === 0) {
    noSeatsElement.style.display = "block";
    noSeatsElement.textContent = "No Seats Selected";
  } else {
    noSeatsElement.style.display = "none";
    noSeatsElement.innerHTML = `
      <div class="selected-seats-summary">
        <h4>Selected Seats:</h4>
        ${selectedSeats
          .map((seat) => `<div class="selected-seat-item">${seat}</div>`)
          .join("")}
        <div class="total-amount">
          <span>Total Amount:</span>
          <span>₹${(selectedSeats.length * 1400).toFixed(2)}</span>
        </div>
      </div>
    `;
  }
}

const style = document.createElement("style");
style.textContent = `
  .seat {
    cursor: pointer;
    transition: all 0.3s ease;
  }
  
  .seat.selected {
    background-color: #4CAF50 !important;
  }
  
  .seat.booked-seat {
    cursor: not-allowed;
  }
  
  .selected-seats-summary {
    padding: 10px;
  }
  
  .selected-seat-item {
    margin: 5px 0;
    padding: 5px;
    background-color: #f0f0f0;
    border-radius: 4px;
  }
  
  .total-amount {
    margin-top: 10px;
    padding-top: 10px;
    border-top: 1px solid #ddd;
    display: flex;
    justify-content: space-between;
    font-weight: bold;
  }

  .legend-item {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 10px;
  }

  .legend-box {
    width: 20px;
    height: 20px;
    cursor: pointer;
  }

  .legend-box.available {
    background-color: #fff;
    border: 1px solid #ccc;
  }

  .legend-box.booked {
    background-color: #ff0000;
    border: 1px solid #ff0000;
  }

  .legend-box.selected {
    background-color: #4CAF50;
    border: 1px solid #4CAF50;
  }

  .link.active {
    color: #007bff;
    border-bottom: 2px solid #007bff;
  }

  .content-section {
    padding: 20px;
    border-top: 1px solid #ddd;
  }
`;
document.head.appendChild(style);

function renderBusList(buses) {
  const buslistHtml = buses
    .map(
      (bus, busIndex) => `
    <div class="travel-card">
      <div class="travel-info">
        <div class="rating">
          <span class="star">★</span>
          <span class="rating-value">${bus.rating}</span>
        </div>
        <div class="company-name">${bus.companyName}</div>
        <div class="bus-type">${bus.busType}</div>
      </div>

      <div class="journey-details">
        <div class="location-time">
          <div class="time">${bus.journey.departure.time}</div>
          <div class="location">${bus.journey.departure.location}</div>
          <div class="date">${bus.journey.departure.date}</div>
        </div>

        <div class="journey-duration">
          <div class="duration-line">
            <span class="bus-icon">🚌</span>
          </div>
          <div class="duration-text">${bus.journey.duration}</div>
        </div>

        <div class="location-time">
          <div class="time">${bus.journey.arrival.time}</div>
          <div class="location">${bus.journey.arrival.location}</div>
          <div class="date">${bus.journey.arrival.date}</div>
        </div>
      </div>

      <div class="price-section">
        <div class="price">
          <span class="currency">${bus.price.currency}</span>
          <span class="amount">${bus.price.amount}</span>
        </div>
        <div class="discount">${bus.price.discount}</div>
      </div>
    </div>

    <div class="travel-links">
        ${bus.travelLinks
          .map(
            (link) => `
          <a href="#" class="link" data-tab="${link.dataTab}" data-bus="${busIndex}">${link.name}</a>
        `
          )
          .join("")}
        <div class="ms-auto">
          <button class="select-seat link" data-tab="selectseat" data-bus="${busIndex}">${
        bus.selectSeat.label
      }</button>
        </div>
      </div>

      <div class="content-sections" id="bus-${busIndex}-content">
        <div id="tracking-${busIndex}" class="content-section" style="display: none;">
          <div class="placeholder-content">${bus.tracking.content}</div>
        </div>

        <div id="policies-${busIndex}" class="content-section" style="display: none;">
          <div class="container d-flex">
            <div class="table-container">
              <table>
                <thead>
                  <tr>
                    <th>Cancellation Time</th>
                    <th>Charges</th>
                  </tr>
                </thead>
                <tbody>
                  ${bus.policies.cancellationPolicies
                    .map(
                      (policy) => `
                    <tr>
                      <td>${policy.time}</td>
                      <td class="charges">${policy.charges}</td>
                    </tr>
                  `
                    )
                    .join("")}
                </tbody>
              </table>
            </div>
            <div class="info-container">
              <h2 class="info-heading">Info</h2>
              <ul class="info-list">
                ${bus.policies.info
                  .map(
                    (info) => `
                  <li>${info}</li>
                `
                  )
                  .join("")}
              </ul>
            </div>
          </div>
        </div>

        <div id="amenities-${busIndex}" class="content-section" style="display: none;">
          <div class="placeholder-content">
            <div class="amenities-container">
              <h2 class="amenities-title">Bus Amenities</h2>
              <div class="amenities-list">
                ${bus.amenities
                  .map(
                    (amenity) => `
                  <div class="amenity-item">
                    <div class="amenity-icon">
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none"
                      stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                      <path d="M5 12.55a11 11 0 0 1 14.08 0"></path>
                      <path d="M1.42 9a16 16 0 0 1 21.16 0"></path>
                      <path d="M8.53 16.11a6 6 0 0 1 6.95 0"></path>
                      <line x1="12" y1="20" x2="12" y2="20"></line>
                    </svg>
                    </div>
                    <div class="amenity-text">${amenity}</div>
                  </div>
                `
                  )
                  .join("")}
              </div>
            </div>
          </div>
        </div>

        <div id="photos-${busIndex}" class="content-section" style="display: none;">
          <div class="placeholder-content">
            <div class="owl-carousel owl-theme">
              ${bus.photos
                .map(
                  (photos) => `
                <div class="item">
                  <img src="./image/u_images/${photos}" alt="" />
                </div>
              `
                )
                .join("")}
            </div>
          </div>
        </div>

        <div id="pickup-${busIndex}" class="content-section" style="display: none;">
          <div class="placeholder-content">
            <div class="pickup-dropoff-container">
              <div class="points-grid">
                <div class="pickup-section text-start">
                  <h5 class="section-title">Pick up Point</h5>
                  <div class="point-list">
                    ${bus.pickupPoints
                      .map(
                        (point) => `
                      <div class="point-item">
                        <div class="point-time">${point.time}</div>
                        <div class="point-location">${point.location}</div>
                      </div>
                    `
                      )
                      .join("")}
                  </div>
                </div>
                <div class="dropoff-section text-start">
                  <h2 class="section-title">Drop off Point</h2>
                  <div class="point-list">
                    ${bus.dropoffPoints
                      .map(
                        (point) => `
                      <div class="point-item">
                        <div class="point-time">${point.time}</div>
                        <div class="point-location">${point.location}</div>
                      </div>
                    `
                      )
                      .join("")}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div id="reviews-${busIndex}" class="content-section" style="display: none;">
          <div class="placeholder-content">
            <div class="reviews-grid">
              <div class="rating-summary">
                <div class="overall-rating">
                  <span class="star">★</span>
                  <span class="rating-number">${bus.ratings.overall}</span>
                  <span class="rating-text">Rating</span>
                </div>
                <div class="category-ratings">
                  <h4>People like</h4>
                  <div class="rating-item">
                    <span class="category">Bus quality</span>
                    <div class="rating-value">
                      <span class="star">★</span>
                      <span>${bus.ratings.categories.busQuality}</span>
                    </div>
                  </div>
                  <!-- Add other rating categories similarly -->
                </div>
              </div>
              <div class="user-reviews">
                ${bus.reviews
                  .map(
                    (review) => `
                  <div class="review-card">
                    <div class="review-header">
                      <div class="user-info">
                        <img src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-aw6GYkNqBu9RHKV6YRCYTefLhtSz9r.png" 
                          alt="${review.name}" class="avatar">
                        <div class="user-details text-start">
                          <h4>${review.name}</h4>
                          <span class="review-date">${review.date}</span>
                        </div>
                      </div>
                      <div class="star-rating">
                        ${Array(5)
                          .fill()
                          .map(
                            (_, i) => `
                          <span class="star ${
                            i < review.rating ? "filled" : ""
                          }">★</span>
                        `
                          )
                          .join("")}
                      </div>
                    </div>
                    <p class="review-text">${review.comment}</p>
                  </div>
                `
                  )
                  .join("")}
                <a href="#" class="show-more">Show More</a>
              </div>
            </div>
          </div>
        </div>

        <div id="selectseat-${busIndex}" class="content-section" style="display: none;">
          <div class="placeholder-content">
            <div class="seats-container">
              <div class="legend">
                <div class="legend-item">
                  <input type="checkbox" class="legend-box available" />
                  <span>Available</span>
                </div>
                <div class="legend-item">
                  <input type="checkbox" class="legend-box booked" />
                  <span>Booked</span>
                </div>
                <div class="legend-item">
                  <input type="checkbox" class="legend-box selected" />
                  <span>Selected</span>
                </div>
              </div>

              <div class="seat-selection">
                <div class="seat-section">
                  <div class="section-title">
                    Lower Seat
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none"
                      stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                      <circle cx="12" cy="12" r="10"></circle>
                      <circle cx="12" cy="12" r="4"></circle>
                      <line x1="4.93" y1="4.93" x2="9.17" y2="9.17"></line>
                      <line x1="14.83" y1="14.83" x2="19.07" y2="19.07"></line>
                      <line x1="14.83" y1="9.17" x2="19.07" y2="4.93"></line>
                      <line x1="4.93" y1="19.07" x2="9.17" y2="14.83"></line>
                    </svg>
                  </div>

                  <div class="seat-grid">
                    <div class="seat"></div>
                    <div class="seat"></div>
                    <div class="seat booked booked-seat"></div>

                    <div class="seat"></div>
                    <div class="seat"></div>
                    <div class="seat"></div>

                    <div class="seat"></div>
                    <div class="seat booked booked-seat"></div>
                    <div class="seat"></div>

                    <div class="seat booked booked-seat"></div>
                    <div class="seat"></div>
                    <div class="seat"></div>

                    <div class="seat"></div>
                    <div class="seat booked booked-seat"></div>
                    <div class="seat"></div>

                    <div class="seat"></div>
                    <div class="seat"></div>
                    <div class="seat"></div>
                  </div>
                </div>

                <div class="seat-section">
                  <div class="section-title">
                    Upper Seat
                  </div>

                  <div class="seat-grid">
                    <div class="seat"></div>
                    <div class="seat booked booked-seat"></div>
                    <div class="seat"></div>

                    <div class="seat booked booked-seat"></div>
                    <div class="seat"></div>
                    <div class="seat"></div>

                    <div class="seat booked booked-seat"></div>
                    <div class="seat"></div>
                    <div class="seat"></div>

                    <div class="seat"></div>
                    <div class="seat"></div>
                    <div class="seat booked booked-seat"></div>

                    <div class="seat booked booked-seat"></div>
                    <div class="seat"></div>
                    <div class="seat"></div>

                    <div class="seat"></div>
                    <div class="seat"></div>
                    <div class="seat"></div>
                  </div>
                </div>

                <div class="sidebar">
                  <div class="tabs">
                    <div class="tab active">Pick Up Point</div>
                    <div class="tab">Drop Off Point</div>
                  </div>

                  <div class="stops-list">
                    <div class="stop-item">
                      <div class="stop-info">
                        <div class="stop-time">10:00 AM</div>
                        <div class="stop-location">Shyamdham Mandir, Jakatnaka</div>
                      </div>
                      <input type="radio" name="name" class="radio-button"></input>
                    </div>

                    <div class="stop-item">
                      <div class="stop-info">
                        <div class="stop-time">11:00 AM</div>
                        <div class="stop-location">Pasodara Patiya, Pasodara</div>
                      </div>
                      <input type="radio" name="name" class="radio-button"></input>
                    </div>

                    <div class="stop-item">
                      <div class="stop-info">
                        <div class="stop-time">11:30 AM</div>
                        <div class="stop-location">Laskana Gam, Laskana</div>
                      </div>
                      <input type="radio" name="name" class="radio-button"></input>
                    </div>

                    <div class="stop-item">
                      <div class="stop-info">
                        <div class="stop-time">12:10 AM</div>
                        <div class="stop-location">Kamrej Under Bridge, Kamrej</div>
                      </div>
                      <input type="radio" name="name" class="radio-button"></input>
                    </div>

                    <div class="stop-item">
                      <div class="stop-info">
                        <div class="stop-time">01:00 AM</div>
                        <div class="stop-location">Raj Hotel, Kmarej Highway</div>
                      </div>
                      <input type="radio" name="name" class="radio-button"></input>
                    </div>
                  </div>

                  <div class="booking-summary">
                    <div class="summary-title">Selected Seats</div>
                    <div id="seatselected"></div>
                    <div class="no-seats">No Seats Selected</div>
                    <button class="continue-btn" onclick="window.location.href='Booking_Details.html'">Continue</button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `
    )
    .join("");

  document.getElementById("buslist").innerHTML = buslistHtml;

  // Add click event listeners for tabs
  document.querySelectorAll(".link").forEach((link) => {
    link.addEventListener("click", (e) => {
      e.preventDefault();
      const busIndex = e.target.dataset.bus;
      const tabId = e.target.dataset.tab;

      // Hide all content sections for this bus
      document
        .querySelectorAll(`#bus-${busIndex}-content .content-section`)
        .forEach((section) => {
          section.style.display = "none";
        });

      // Show selected content section
      document.getElementById(`${tabId}-${busIndex}`).style.display = "block";

      // Update active tab styling
      document.querySelectorAll(`[data-bus="${busIndex}"]`).forEach((tab) => {
        tab.classList.remove("active");
      });
      e.target.classList.add("active");
    });
  });

  initializeSeatSelection();
}
