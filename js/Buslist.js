document.addEventListener("DOMContentLoaded", async () => {
  await busListData();
  initializeSeatSelection();
});
let data = [];
async function busListData() {
  try {
    const response = await fetch("http://localhost:3000/busListings");

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    data = await response.json();
    let filteredBuses = [...data];

    const filterControls = `
      <div class="filtersection">
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

    document
      .getElementById("buslist")
      .insertAdjacentHTML("beforebegin", filterControls);

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
      .filtersection {
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

    // const buslistHtml = data
    //   .map(
    //     (bus, busIndex) => `
    //   <div class="travel-card">
    //     <div class="travel-info">
    //       <div class="rating">
    //         <span class="star">★</span>
    //         <span class="rating-value">${bus.rating}</span>
    //       </div>
    //       <div class="company-name">${bus.companyName}</div>
    //       <div class="bus-type">${bus.busType}</div>
    //     </div>

    //     <div class="journey-details">
    //       <div class="location-time">
    //         <div class="time">${bus.journey.departure.time}</div>
    //         <div class="location">${bus.journey.departure.location}</div>
    //         <div class="date">${bus.journey.departure.date}</div>
    //       </div>

    //       <div class="journey-duration">
    //         <div class="duration-line">
    //           <span class="bus-icon">🚌</span>
    //         </div>
    //         <div class="duration-text">${bus.journey.duration}</div>
    //       </div>

    //       <div class="location-time">
    //         <div class="time">${bus.journey.arrival.time}</div>
    //         <div class="location">${bus.journey.arrival.location}</div>
    //         <div class="date">${bus.journey.arrival.date}</div>
    //       </div>
    //     </div>

    //     <div class="price-section">
    //       <div class="price">
    //         <span class="currency">${bus.price.currency}</span>
    //         <span class="amount">${bus.price.amount}</span>
    //       </div>
    //       <div class="discount">${bus.price.discount}</div>
    //     </div>
    //   </div>

    //   <div class="travel-links">
    //       ${bus.travelLinks
    //         .map(
    //           (link) => `
    //         <a href="#" class="link" data-tab="${link.dataTab}" data-bus="${busIndex}">${link.name}</a>
    //       `
    //         )
    //         .join("")}
    //       <div class="ms-auto">
    //         <button class="select-seat link" data-tab="selectseat" data-bus="${busIndex}">${
    //       bus.selectSeat.label
    //     }</button>
    //       </div>
    //     </div>

    //     <div class="content-sections" id="bus-${busIndex}-content">
    //       <div id="tracking-${busIndex}" class="content-section" style="display: none;">
    //         <div class="placeholder-content">${bus.tracking.content}</div>
    //       </div>

    //       <div id="policies-${busIndex}" class="content-section" style="display: none;">
    //         <div class="container d-flex">
    //           <div class="table-container">
    //             <table>
    //               <thead>
    //                 <tr>
    //                   <th>Cancellation Time</th>
    //                   <th>Charges</th>
    //                 </tr>
    //               </thead>
    //               <tbody>
    //                 ${bus.policies.cancellationPolicies
    //                   .map(
    //                     (policy) => `
    //                   <tr>
    //                     <td>${policy.time}</td>
    //                     <td class="charges">${policy.charges}</td>
    //                   </tr>
    //                 `
    //                   )
    //                   .join("")}
    //               </tbody>
    //             </table>
    //           </div>
    //           <div class="info-container">
    //             <h2 class="info-heading">Info</h2>
    //             <ul class="info-list">
    //               ${bus.policies.info
    //                 .map(
    //                   (info) => `
    //                 <li>${info}</li>
    //               `
    //                 )
    //                 .join("")}
    //             </ul>
    //           </div>
    //         </div>
    //       </div>

    //       <div id="amenities-${busIndex}" class="content-section" style="display: none;">
    //         <div class="placeholder-content">
    //           <div class="amenities-container">
    //             <h2 class="amenities-title">Bus Amenities</h2>
    //             <div class="amenities-list">
    //               ${bus.amenities
    //                 .map(
    //                   (amenity) => `
    //                 <div class="amenity-item">
    //                   <div class="amenity-icon">
    //                     <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none"
    //                     stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    //                     <path d="M5 12.55a11 11 0 0 1 14.08 0"></path>
    //                     <path d="M1.42 9a16 16 0 0 1 21.16 0"></path>
    //                     <path d="M8.53 16.11a6 6 0 0 1 6.95 0"></path>
    //                     <line x1="12" y1="20" x2="12" y2="20"></line>
    //                   </svg>
    //                   </div>
    //                   <div class="amenity-text">${amenity}</div>
    //                 </div>
    //               `
    //                 )
    //                 .join("")}
    //             </div>
    //           </div>
    //         </div>
    //       </div>

    //       <div id="photos-${busIndex}" class="content-section" style="display: none;">
    //         <div class="placeholder-content">
    //           <div class="owl-carousel owl-theme">
    //             ${bus.photos
    //               .map(
    //                 (photos) => `
    //               <div class="item">
    //                 <img src="./image/u_images/${photos}" alt="" />
    //               </div>
    //             `
    //               )
    //               .join("")}
    //           </div>
    //         </div>
    //       </div>

    //       <div id="pickup-${busIndex}" class="content-section" style="display: none;">
    //         <div class="placeholder-content">
    //           <div class="pickup-dropoff-container">
    //             <div class="points-grid">
    //               <div class="pickup-section text-start">
    //                 <h5 class="section-title">Pick up Point</h5>
    //                 <div class="point-list">
    //                   ${bus.pickupPoints
    //                     .map(
    //                       (point) => `
    //                     <div class="point-item">
    //                       <div class="point-time">${point.time}</div>
    //                       <div class="point-location">${point.location}</div>
    //                     </div>
    //                   `
    //                     )
    //                     .join("")}
    //                 </div>
    //               </div>
    //               <div class="dropoff-section text-start">
    //                 <h2 class="section-title">Drop off Point</h2>
    //                 <div class="point-list">
    //                   ${bus.dropoffPoints
    //                     .map(
    //                       (point) => `
    //                     <div class="point-item">
    //                       <div class="point-time">${point.time}</div>
    //                       <div class="point-location">${point.location}</div>
    //                     </div>
    //                   `
    //                     )
    //                     .join("")}
    //                 </div>
    //               </div>
    //             </div>
    //           </div>
    //         </div>
    //       </div>

    //       <div id="reviews-${busIndex}" class="content-section" style="display: none;">
    //         <div class="placeholder-content">
    //           <div class="reviews-grid">
    //             <div class="rating-summary">
    //               <div class="overall-rating">
    //                 <span class="star">★</span>
    //                 <span class="rating-number">${bus.ratings.overall}</span>
    //                 <span class="rating-text">Rating</span>
    //               </div>
    //               <div class="category-ratings">
    //                 <h4>People like</h4>
    //                 <div class="rating-item">
    //                   <span class="category">Bus quality</span>
    //                   <div class="rating-value">
    //                     <span class="star">★</span>
    //                     <span>${bus.ratings.categories.busQuality}</span>
    //                   </div>
    //                 </div>
    //                 <!-- Add other rating categories similarly -->
    //               </div>
    //             </div>
    //             <div class="user-reviews">
    //               ${bus.reviews
    //                 .map(
    //                   (review) => `
    //                 <div class="review-card">
    //                   <div class="review-header">
    //                     <div class="user-info">
    //                       <img src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-aw6GYkNqBu9RHKV6YRCYTefLhtSz9r.png"
    //                         alt="${review.name}" class="avatar">
    //                       <div class="user-details text-start">
    //                         <h4>${review.name}</h4>
    //                         <span class="review-date">${review.date}</span>
    //                       </div>
    //                     </div>
    //                     <div class="star-rating">
    //                       ${Array(5)
    //                         .fill()
    //                         .map(
    //                           (_, i) => `
    //                         <span class="star ${
    //                           i < review.rating ? "filled" : ""
    //                         }">★</span>
    //                       `
    //                         )
    //                         .join("")}
    //                     </div>
    //                   </div>
    //                   <p class="review-text">${review.comment}</p>
    //                 </div>
    //               `
    //                 )
    //                 .join("")}
    //               <a href="#" class="show-more">Show More</a>
    //             </div>
    //           </div>
    //         </div>
    //       </div>

    //       <div id="selectseat-${busIndex}" class="content-section" style="display: none;">
    //         <div class="placeholder-content">
    //           <div class="seats-container">
    //             <div class="legend">
    //               <div class="legend-item">
    //                 <input type="checkbox" class="legend-box available" />
    //                 <span>Available</span>
    //               </div>
    //               <div class="legend-item">
    //                 <input type="checkbox" class="legend-box booked" />
    //                 <span>Booked</span>
    //               </div>
    //               <div class="legend-item">
    //                 <input type="checkbox" class="legend-box selected" />
    //                 <span>Selected</span>
    //               </div>
    //             </div>

    //             <div class="seat-selection">
    //               <div class="seat-section">
    //                 <div class="section-title">
    //                   Lower Seat
    //                   <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none"
    //                     stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    //                     <circle cx="12" cy="12" r="10"></circle>
    //                     <circle cx="12" cy="12" r="4"></circle>
    //                     <line x1="4.93" y1="4.93" x2="9.17" y2="9.17"></line>
    //                     <line x1="14.83" y1="14.83" x2="19.07" y2="19.07"></line>
    //                     <line x1="14.83" y1="9.17" x2="19.07" y2="4.93"></line>
    //                     <line x1="4.93" y1="19.07" x2="9.17" y2="14.83"></line>
    //                   </svg>
    //                 </div>

    //                 <div class="seat-grid">
    //                   <div class="seat"></div>
    //                   <div class="seat"></div>
    //                   <div class="seat booked booked-seat"></div>

    //                   <div class="seat"></div>
    //                   <div class="seat"></div>
    //                   <div class="seat"></div>

    //                   <div class="seat"></div>
    //                   <div class="seat booked booked-seat"></div>
    //                   <div class="seat"></div>

    //                   <div class="seat booked booked-seat"></div>
    //                   <div class="seat"></div>
    //                   <div class="seat"></div>

    //                   <div class="seat"></div>
    //                   <div class="seat booked booked-seat"></div>
    //                   <div class="seat"></div>

    //                   <div class="seat"></div>
    //                   <div class="seat"></div>
    //                   <div class="seat"></div>
    //                 </div>
    //               </div>

    //               <div class="seat-section">
    //                 <div class="section-title">
    //                   Upper Seat
    //                 </div>

    //                 <div class="seat-grid">
    //                   <div class="seat"></div>
    //                   <div class="seat booked booked-seat"></div>
    //                   <div class="seat"></div>

    //                   <div class="seat booked booked-seat"></div>
    //                   <div class="seat"></div>
    //                   <div class="seat"></div>

    //                   <div class="seat booked booked-seat"></div>
    //                   <div class="seat"></div>
    //                   <div class="seat"></div>

    //                   <div class="seat"></div>
    //                   <div class="seat"></div>
    //                   <div class="seat booked booked-seat"></div>

    //                   <div class="seat booked booked-seat"></div>
    //                   <div class="seat"></div>
    //                   <div class="seat"></div>

    //                   <div class="seat"></div>
    //                   <div class="seat"></div>
    //                   <div class="seat"></div>
    //                 </div>
    //               </div>

    //               <div class="sidebar">
    //                 <div class="tabs">
    //                   <div class="tab active">Pick Up Point</div>
    //                   <div class="tab">Drop Off Point</div>
    //                 </div>

    //                 <div class="stops-list">
    //                   <div class="stop-item">
    //                     <div class="stop-info">
    //                       <div class="stop-time">10:00 AM</div>
    //                       <div class="stop-location">Shyamdham Mandir, Jakatnaka</div>
    //                     </div>
    //                     <input type="radio" name="name" class="radio-button"></input>
    //                   </div>

    //                   <div class="stop-item">
    //                     <div class="stop-info">
    //                       <div class="stop-time">11:00 AM</div>
    //                       <div class="stop-location">Pasodara Patiya, Pasodara</div>
    //                     </div>
    //                     <input type="radio" name="name" class="radio-button"></input>
    //                   </div>

    //                   <div class="stop-item">
    //                     <div class="stop-info">
    //                       <div class="stop-time">11:30 AM</div>
    //                       <div class="stop-location">Laskana Gam, Laskana</div>
    //                     </div>
    //                     <input type="radio" name="name" class="radio-button"></input>
    //                   </div>

    //                   <div class="stop-item">
    //                     <div class="stop-info">
    //                       <div class="stop-time">12:10 AM</div>
    //                       <div class="stop-location">Kamrej Under Bridge, Kamrej</div>
    //                     </div>
    //                     <input type="radio" name="name" class="radio-button"></input>
    //                   </div>

    //                   <div class="stop-item">
    //                     <div class="stop-info">
    //                       <div class="stop-time">01:00 AM</div>
    //                       <div class="stop-location">Raj Hotel, Kmarej Highway</div>
    //                     </div>
    //                     <input type="radio" name="name" class="radio-button"></input>
    //                   </div>
    //                 </div>

    //                 <div class="booking-summary">
    //                   <div class="summary-title">Selected Seats</div>
    //                   <div id="seatselected"></div>
    //                   <div class="no-seats">No Seats Selected</div>
    //                   <button class="continue-btn" onclick="window.location.href='Booking_Details.html'">Continue</button>
    //                 </div>
    //               </div>
    //             </div>
    //           </div>
    //         </div>
    //       </div>
    //     </div>
    //   </div>
    // `
    //   )
    //   .join("");
    initializeSeatSelection();

    document.getElementById("buslist").innerHTML = buslistHtml;

    document.querySelectorAll(".link").forEach((link) => {
      link.addEventListener("click", (e) => {
        e.preventDefault();
        const busIndex = e.target.dataset.bus;
        const tabId = e.target.dataset.tab;

        document
          .querySelectorAll(`#bus-${busIndex}-content .content-section`)
          .forEach((section) => {
            section.style.display = "none";
          });

        document.getElementById(`${tabId}-${busIndex}`).style.display = "block";

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

let selectedSeats = [];
function initializeSeatSelection() {
  // Remove the single container query since we'll handle multiple buses
  const seatContainers = document.querySelectorAll(".seat-selection");
  if (!seatContainers.length) return;

  seatContainers.forEach((seatContainer, containerIndex) => {
    const summaryElement = seatContainer.querySelector(".booking-summary");
    const continueBtn = summaryElement.querySelector(".continue-btn");
    const seatSelectedElement = seatContainer.querySelector("#seatselected");
    const noSeatsElement = summaryElement.querySelector(".no-seats");

    const pickupDropTabs = seatContainer.querySelectorAll(
      ".sidebar .tabs .tab"
    );
    const stopsList = seatContainer.querySelector(".stops-list");

    // const pickupPoints = [
    //   { time: "10:00 AM", location: "Shyamdham Mandir, Jakatnaka" },
    //   { time: "11:00 AM", location: "Pasodara Patiya, Pasodara" },
    //   { time: "11:30 AM", location: "Laskana Gam, Laskana" },
    //   { time: "12:10 AM", location: "Kamrej Under Bridge, Kamrej" },
    //   { time: "01:00 AM", location: "Raj Hotel, Kmarej Highway" },
    // ];

    // const dropoffPoints = [
    //   { time: "06:00 PM", location: "Central Bus Station" },
    //   { time: "06:30 PM", location: "City Mall Stop" },
    //   { time: "07:00 PM", location: "Airport Terminal" },
    //   { time: "07:30 PM", location: "Railway Station" },
    // ];

    // function updateStopsList(points) {
    //   stopsList.innerHTML = points
    //     .map(
    //       (point) => `
    //     <div class="stop-item">
    //       <div class="stop-info">
    //         <div class="stop-time">${point.time}</div>
    //         <div class="stop-location">${point.location}</div>
    //       </div>
    //       <input type="radio" name="stop-point" class="radio-button">
    //     </div>
    //   `
    //     )
    //     .join("");
    // }

    // pickupDropTabs.forEach((tab, index) => {
    //   tab.addEventListener("click", () => {
    //     pickupDropTabs.forEach((t) => t.classList.remove("active"));
    //     tab.classList.add("active");
    //     if (index === 0) {
    //       // updateStopsList(pickupPoints);
    //     } else {
    //       updateStopsList(dropoffPoints);
    //     }
    //   });
    // });

    // updateStopsList(pickupPoints);

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

      if (seatSelectedElement) {
        seatSelectedElement.innerHTML =
          selectedSeats.length > 0 ? selectedSeats.join(", ") : "";
      }

      updateBookingSummary(selectedSeats, noSeatsElement);
    });

    const legendCheckboxes = seatContainer.querySelectorAll(".legend-box");
    legendCheckboxes.forEach((checkbox) => {
      checkbox.addEventListener("change", () =>
        updateSeatVisibility(seatContainer)
      );
    });
  });
}

function updateSeatVisibility(container) {
  const availableChecked = container.querySelector(
    ".legend-box.available"
  ).checked;
  const bookedChecked = container.querySelector(".legend-box.booked").checked;
  const selectedChecked = container.querySelector(
    ".legend-box.selected"
  ).checked;

  const anyCheckboxChecked =
    availableChecked || bookedChecked || selectedChecked;

  const allSeats = container.querySelectorAll(".seat");
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

function updateBookingSummary(selectedSeats, noSeatsElement) {
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
  localStorage.setItem("selectedData", JSON.stringify(selectedSeats));
}

const style = document.createElement("style");
style.textContent = `
  .seat {
    cursor: pointer;
    transition: all 0.3s ease;
  }
  
  .seat.selected {
    // background-color: #4CAF50 !important;
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
    border:none;
  }

  .legend-box.selected {
    background-color: #4CAF50;
    border: none;
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
                  <div class="rating-item">
                    <span class="category">Driving</span>
                    <div class="rating-value">
                      <span class="star">★</span>
                      <span>${bus.ratings.categories.driving}</span>
                    </div>
                  </div>
                  <div class="rating-item">
                    <span class="category">Seat Comfort</span>
                    <div class="rating-value">
                      <span class="star">★</span>
                      <span>${bus.ratings.categories.seatComfort}</span>
                    </div>
                  </div>
                  <div class="rating-item">
                    <span class="category">Safety and Hygiene</span>
                    <div class="rating-value">
                      <span class="star">★</span>
                      <span>${bus.ratings.categories.safetyAndHygiene}</span>
                    </div>
                  </div>
                  <div class="rating-item">
                    <span class="category">Cleanliness</span>
                    <div class="rating-value">
                      <span class="star">★</span>
                      <span>${bus.ratings.categories.cleanliness}</span>
                    </div>
                  </div>
                  <div class="rating-item">
                    <span class="category">Female Friendly</span>
                    <div class="rating-value">
                      <span class="star">★</span>
                      <span>${bus.ratings.categories.femaleFriendly}</span>
                    </div>
                  </div>
                  <div class="rating-item">
                    <span class="category">Punctuality</span>
                    <div class="rating-value">
                      <span class="star">★</span>
                      <span>${bus.ratings.categories.punctuality}</span>
                    </div>
                  </div>
                </div>
              </div>
              <div class="user-reviews">
                ${bus.reviews
                  .slice(0, 3)
                  .map(
                    (e) => `
                  <div class="review-card">
                    <div class="review-header">
                      <div class="user-info">
                        <img src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-aw6GYkNqBu9RHKV6YRCYTefLhtSz9r.png" 
                          alt="${e.name}" class="avatar">
                        <div class="user-details text-start">
                          <h4>${e.name}</h4>
                          <span class="review-date">${e.date}</span>
                        </div>
                      </div>
                      <div class="star-rating">
                        ${Array(5)
                          .fill()
                          .map(
                            (_, i) => `
                          <span class="star ${
                            i < e.rating ? "filled" : ""
                          }">★</span>
                        `
                          )
                          .join("")}
                      </div>
                    </div>
                    <p class="review-text">${e.comment}</p>
                  </div>
                `
                  )
                  .join("")}
                <div class="additional-reviews" style="display: none;">
                  ${bus.reviews
                    .slice(3)
                    .map(
                      (e) => `
                    <div class="review-card">
                      <div class="review-header">
                        <div class="user-info">
                          <img src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-aw6GYkNqBu9RHKV6YRCYTefLhtSz9r.png" 
                            alt="${e.name}" class="avatar">
                          <div class="user-details text-start">
                            <h4>${e.name}</h4>
                            <span class="review-date">${e.date}</span>
                          </div>
                        </div>
                        <div class="star-rating">
                          ${Array(5)
                            .fill()
                            .map(
                              (_, i) => `
                            <span class="star ${
                              i < e.rating ? "filled" : ""
                            }">★</span>
                          `
                            )
                            .join("")}
                        </div>
                      </div>
                      <p class="review-text">${e.comment}</p>
                    </div>
                  `
                    )
                    .join("")}
                </div>
                <a href="#" class="show-more" onclick="toggleReviews(this)">Show More</a>
              </div>
            </div>
          </div>
        </div>

        <div id="selectseat-${busIndex}" class="content-section" style="display: none;">
          <div class="placeholder-content">
            <div class="seats-container">
              <div class="legend">
                <div class="legend-item">
                  <input style="border: 1px solid green" class="legend-box available" />
                  <span>Available</span>
                </div>
                <div class="legend-item">
                  <input style="background-color: #6A6A6A66" class="legend-box booked" />
                  <span>Booked</span>
                </div>
                <div class="legend-item">
                  <input style="background-color: #C16C49" class="legend-box selected" />
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
                    <div class="seat margin_left"></div>
                    <div class="seat"></div>

                    <div class="seat"></div>
                    <div class="seat margin_left"></div>
                    <div class="seat"></div>

                    <div class="seat"></div>
                    <div class="seat margin_left"></div>
                    <div class="seat"></div>

                    <div class="seat "></div>
                    <div class="seat margin_left"></div>
                    <div class="seat"></div>

                    <div class="seat"></div>
                    <div class="seat margin_left"></div>
                    <div class="seat"></div>

                    <div class="seat"></div>
                    <div class="seat margin_left"></div>
                    <div class="seat"></div>
                  </div>
                </div>

                <div class="seat-section">
                  <div class="section-title">
                    Upper Seat
                  </div>

                  <div class="seat-grid">
                    <div class="seat"></div>
                    <div class="seat margin_left"></div>
                    <div class="seat"></div>

                    <div class="seat"></div>
                    <div class="seat margin_left"></div>
                    <div class="seat"></div>

                    <div class="seat"></div>
                    <div class="seat margin_left"></div>
                    <div class="seat"></div>

                    <div class="seat"></div>
                    <div class="seat margin_left"></div>
                    <div class="seat"></div>

                    <div class="seat"></div>
                    <div class="seat margin_left"></div>
                    <div class="seat"></div>

                    <div class="seat"></div>
                    <div class="seat margin_left"></div>
                    <div class="seat"></div>
                  </div>
                </div>

                <div class="sidebar">
                  <div class="tabs">
                    <div class="tab ${
                      selectedtype === "pick" ? "active" : ""
                    }"  active" onclick=handlelocation('pick',${busIndex})>Pick Up Point</div>
                    <div class="tab ${
                      selectedtype === "drop" ? "active" : ""
                    }"  onclick=handlelocation('drop',${busIndex})>Drop Off Point</div>
                  </div>
                  ${
                    selectedtype == "pick"
                      ? bus.pickupPoints
                          .map((e) => {
                            return `
                      <div class="stops-list">
                        <div class="stop-item">
                          <div class="stop-info">
                            <div class="stop-time">${e.time}</div>
                            <div class="stop-location">${e.location}</div>
                          </div>
                          <input type="radio" name="pickupStop" class="radio-button" value="${e.location}"></input>
                        </div>
                      </div>
                    `;
                          })
                          .join("")
                      : bus.dropoffPoints
                          .map((e) => {
                            return `
                      <div class="stops-list">
                      <div class="stop-item">
                        <div class="stop-info">
                          <div class="stop-time">${e.time}</div>
                          <div class="stop-location">${e.location}</div>
                        </div>
                        <input type="radio" name="dropoffStop" class="radio-button" value="${e.location}"></input>
                      </div>
                    </div>
                  `;
                          })
                          .join("")
                  }
                  <div class="booking-summary">
                    <div class="summary-title">Selected Seats</div>
                    <div id="seatselected"></div>
                    <div class="no-seats">No Seats Selected</div>
                      <button class="continue-btn" onclick='handleBookingDetail(${JSON.stringify(
                        bus
                      )})'>Continue</button>
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

  document.querySelectorAll(".link").forEach((link) => {
    link.addEventListener("click", (e) => {
      e.preventDefault();
      const busIndex = e.target.dataset.bus;
      const tabId = e.target.dataset.tab;

      document
        .querySelectorAll(`#bus-${busIndex}-content .content-section`)
        .forEach((section) => {
          section.style.display = "none";
        });

      document.getElementById(`${tabId}-${busIndex}`).style.display = "block";

      document.querySelectorAll(`[data-bus="${busIndex}"]`).forEach((tab) => {
        tab.classList.remove("active");
      });
      e.target.classList.add("active");
    });
  });

  initializeSeatSelection();

  document.querySelectorAll('input[name="pickupStop"]').forEach((radio) => {
    radio.addEventListener("change", (e) => {
      const selectedPickupLocation = e.target.value;
      let bookingDetails =
        JSON.parse(localStorage.getItem("bookingDetails")) || {};
      bookingDetails.pickupLocation = selectedPickupLocation;
      localStorage.setItem("bookingDetails", JSON.stringify(bookingDetails));
    });
  });
}

async function handleBookingDetail(bus) {
  console.log(bus);
  const selectSeat = JSON.parse(localStorage.getItem("selectedData")) || [];

  const selectedPickupLocation =
    document.querySelector('input[name="pickupStop"]:checked')?.value || "";
  const selectedDropoffLocation =
    document.querySelector('input[name="dropoffStop"]:checked')?.value || "";

  const existingBookingDetails =
    JSON.parse(localStorage.getItem("bookingDetails")) || {};

  if (selectedPickupLocation) {
    existingBookingDetails.pickupLocation =
      existingBookingDetails.pickupLocation
        ? existingBookingDetails.pickupLocation + ", " + selectedPickupLocation
        : selectedPickupLocation;
  }

  if (selectedDropoffLocation) {
    existingBookingDetails.dropLocation = existingBookingDetails.dropLocation
      ? existingBookingDetails.dropLocation + ", " + selectedDropoffLocation
      : selectedDropoffLocation;
  }
  var price = bus.price.amount.replace(",", "");
  const pricePerSeat = parseFloat(price);
  // console.log(typeof pricePerSeat);
  const onwardFare = pricePerSeat;
  const discount = 120;
  const bookingCharges = 120;
  const gst = onwardFare * 0.18;
  const totalPrice = onwardFare + gst + bookingCharges - discount;
  const pickupTime = bus.journey.departure.time;
  const dropoffTime = bus.journey.arrival.time;

  const bookingDetails = {
    busId: bus.id,
    busName: bus.companyName,
    busType: bus.busType,
    busDateArrival: bus.journey.arrival.date,
    busdateDepature: bus.journey.departure.date,
    pickupLocation: bus.journey.departure.location,
    pickupTime: bus.journey.departure.time,
    dropLocation: bus.journey.arrival.location,
    dropTime: bus.journey.arrival.time,
    duration: bus.journey.duration,
    selectedSeats: selectSeat,
    busPrice: bus.price,
    onwardFare: onwardFare,
    discount: discount,
    gst: gst,
    totalPrice: totalPrice,
    pickupPoints: existingBookingDetails.pickupLocation,
    dropoffPoints: existingBookingDetails.dropLocation,
    pickupTimeData: pickupTime,
    dropTimeData: dropoffTime,
  };

  localStorage.setItem("bookingDetails", JSON.stringify(bookingDetails));

  let dt = JSON.parse(localStorage.getItem("busdata")) || [];
  if (!Array.isArray(dt)) dt = [];

  // Add new bus data
  dt.push(bus);
  localStorage.setItem("busdata", JSON.stringify(dt));
  window.location.href = "Booking_Details.html";
}

function searchData() {
  const from = document.getElementById("from-city").value;
  const to = document.getElementById("to-city").value;
  const date = document.getElementById("journey-date").value;
  const busName = document.getElementById("bus-name").value;

  const busFilterData = data.filter((ele) => {
    console.log(ele.journey.departure.location);
    console.log(ele.journey.arrival.location);

    return (
      ele.journey.departure.location.toLowerCase() == from.toLowerCase() &&
      ele.journey.arrival.location.toLowerCase() == to.toLowerCase() &&
      ele.companyName.toLowerCase().includes(busName.toLowerCase())
    );
  });
  renderBusList(busFilterData);
  console.log(busFilterData);
}

let selectedtype = "pick";
function handlelocation(value, busIndex) {
  console.log(value);

  selectedtype = value;
  console.log(selectedtype);

  const filteredBuses =
    selectedtype === "pick"
      ? data.filter((bus) => bus.pickupPoints.length > 0)
      : data.filter((bus) => bus.dropoffPoints.length > 0);

  renderBusList(filteredBuses);

  document.getElementById(`selectseat-${busIndex}`).style.display = "block";

  document.querySelectorAll(`[data-bus="${busIndex}"]`).forEach((tab) => {
    tab.classList.remove("active");
  });
}


function toggleReviews(button) {
  const additionalReviews = button.previousElementSibling; 
  if (additionalReviews.style.display === "none") {
    additionalReviews.style.display = "block"; 
    button.textContent = "Show Less"; 
  } else {
    additionalReviews.style.display = "none"; 
    button.textContent = "Show More"; 
  }
}
