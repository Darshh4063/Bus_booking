function initStarRating() {
  // Select all rating containers
  const ratingContainers = document.querySelectorAll(".star-rating");

  // Loop through each rating container
  ratingContainers.forEach((container) => {
    const stars = container.querySelectorAll("i");
    const categoryName =
      container.parentElement.querySelector("span").textContent;

    // Add event listeners to each star
    stars.forEach((star, index) => {
      // Mouseover event to show preview of rating
      star.addEventListener("mouseover", () => {
        // Fill stars up to the hovered one
        for (let i = 0; i <= index; i++) {
          stars[i].className = "fas fa-star";
          stars[i].style.color = "#ffd700";
        }
        // Empty stars after the hovered one
        for (let i = index + 1; i < stars.length; i++) {
          stars[i].className = "fas fa-star star-empty";
          stars[i].style.color = "#ddd";
        }
      });

      // Mouseout event to reset the preview
      container.addEventListener("mouseout", () => {
        // Get current rating (look for data attribute)
        const currentRating = parseInt(
          container.getAttribute("data-rating") || 0
        );

        // Reset stars based on current rating
        stars.forEach((s, i) => {
          if (i < currentRating) {
            s.className = "fas fa-star";
            s.style.color = "#ffd700";
          } else {
            s.className = "fas fa-star star-empty";
            s.style.color = "#ddd";
          }
        });
      });

      // Click event to set the rating
      star.addEventListener("click", () => {
        // Set the rating (1-based index for user-friendly rating)
        const rating = index + 1;
        container.setAttribute("data-rating", rating);

        // Fill stars up to the clicked one
        for (let i = 0; i <= index; i++) {
          stars[i].className = "fas fa-star";
          stars[i].style.color = "#ffd700";
        }
        // Empty stars after the clicked one
        for (let i = index + 1; i < stars.length; i++) {
          stars[i].className = "fas fa-star star-empty";
          stars[i].style.color = "#ddd";
        }

        console.log(`${categoryName} rated ${rating} stars`);
      });
    });
  });
}

// Function to format date (DD Mon YYYY)
function formatDate(date) {
  const months = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];
  const day = date.getDate();
  const month = months[date.getMonth()];
  const year = date.getFullYear();
  return `${day} ${month} ${year}`;
}

// Helper function to get current user ID
function getCurrentUserId() {
  const currentUser = JSON.parse(localStorage.getItem("currentUser"));
  return currentUser?.id;
}

// Helper function to get current user's name
function getCurrentUserName() {
  const currentUser = JSON.parse(localStorage.getItem("currentUser"));
  return currentUser?.name || currentUser?.username;
}

function getCurrentUserProfileImage() {
  const currentUser = JSON.parse(localStorage.getItem("currentUser"));
  return currentUser?.profileImage || "default-profile.png"; // Return default if no image exists
}

// Function to save review to localStorage
function saveReviewToLocalStorage(reviewData) {
  // Get existing reviews or initialize empty array
  const allReviews = JSON.parse(localStorage.getItem("busReviews")) || [];

  // Add new review
  allReviews.push(reviewData);

  // Save back to localStorage
  localStorage.setItem("busReviews", JSON.stringify(allReviews));
}

// Function to update bus with the review
function updateBusWithReview(reviewData) {
  // Get all buses from localStorage (using busdata as the key)
  const buses = JSON.parse(localStorage.getItem("busdata")) || [];

  // Find the bus by ID
  const busIndex = buses.findIndex((bus) => bus.id === reviewData.busId);

  if (busIndex !== -1) {
    // Bus found, update it
    const bus = buses[busIndex];

    // Initialize ratings if it doesn't exist
    if (!bus.ratings) {
      bus.ratings = {
        overall: "0.0",
        categories: {},
      };
    }

    // Initialize reviews array if it doesn't exist
    if (!bus.reviews) {
      bus.reviews = [];
    }

    // Update overall rating (recalculate based on all reviews)
    const totalReviews = bus.reviews.length;
    const currentOverall = parseFloat(bus.ratings.overall) || 0;
    const newOverallRating =
      (currentOverall * totalReviews + parseFloat(reviewData.ratings.overall)) /
      (totalReviews + 1);
    bus.ratings.overall = newOverallRating.toFixed(1);

    // Update categories (average with existing values)
    Object.keys(reviewData.ratings.categories).forEach((category) => {
      const currentCategoryRating = parseFloat(
        bus.ratings.categories[category] || "0.0"
      );
      const newCategoryRating =
        (currentCategoryRating * totalReviews +
          parseFloat(reviewData.ratings.categories[category])) /
        (totalReviews + 1);
      bus.ratings.categories[category] = newCategoryRating.toFixed(1);
    });

    // Add the new review to the bus's reviews array
    bus.reviews.push(reviewData.review);

    // Update the bus in the buses array
    buses[busIndex] = bus;

    // Save updated buses back to localStorage (using busdata as the key)
    localStorage.setItem("busdata", JSON.stringify(buses));

    // Update on JSON server (using busListings as the endpoint)
    updateBusOnServer(bus);

    console.log("Bus updated with new review:", bus);
  } else {
    console.error("Bus not found with ID:", reviewData.busId);
  }
}

// Function to update bus on JSON server - using busListings endpoint
async function updateBusOnServer(bus) {
  try {
    // Use busListings as the endpoint for the JSON server
    const endpoint = `http://localhost:3000/busListings/${bus.id}`;

    const response = await fetch(endpoint, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(bus),
    });

    if (!response.ok) {
      throw new Error(`Server returned ${response.status}`);
    }

    console.log("Bus updated on server successfully");
  } catch (error) {
    console.error("Error updating bus on server:", error);
    // Continue with local storage updates even if server update fails
  }
}

// Function to collect all ratings and submit review
function submitReview() {
  const bookingDataJson = localStorage.getItem("currentReviewBooking");
  if (!bookingDataJson) {
    alert("Error: No booking data found");
    return;
  }

  const bookingData = JSON.parse(bookingDataJson);
  const userId = getCurrentUserId();
  const userName = getCurrentUserName();

  if (!userId) {
    alert("You need to be logged in to submit a review");
    return;
  }

  // Make sure we have a busId
  if (!bookingData.busId) {
    // If no busId, try to find it from bus name or other identifiers
    const buses = JSON.parse(localStorage.getItem("busdata")) || [];
    const bus = buses.find(
      (b) =>
        b.companyName === bookingData.busName || b.name === bookingData.busName
    );

    if (bus) {
      bookingData.busId = bus.id;
    } else {
      alert("Error: Could not identify which bus to review");
      return;
    }
  }

  // Convert category names to camelCase for the desired format
  const categoryMapping = {
    "Bus quality": "busQuality",
    Driving: "driving",
    "Seat Comfort": "seatComfort",
    "Safety and Hygiene": "safetyAndHygiene",
    Cleanliness: "cleanliness",
    "Female Friendly": "femaleFriendly",
    Punctuality: "punctuality",
  };

  // Collect individual category ratings
  let ratingSum = 0;
  let ratingCount = 0;
  const categories = {};

  const ratingContainers = document.querySelectorAll(".star-rating");
  ratingContainers.forEach((container) => {
    const categoryName = container.parentElement
      .querySelector("span")
      .textContent.trim();
    const rating = parseInt(container.getAttribute("data-rating") || 0);

    // Map the display name to the camelCase property name
    const categoryKey =
      categoryMapping[categoryName] || categoryName.toLowerCase();
    categories[categoryKey] = rating.toFixed(1);

    // Add to overall rating calculation
    if (rating > 0) {
      ratingSum += rating;
      ratingCount++;
    }
  });

  // Calculate overall rating (average of all category ratings)
  const overallRating =
    ratingCount > 0 ? (ratingSum / ratingCount).toFixed(1) : "0.0";

  // Create the review object
  const reviewObj = {
    name: userName || "Anonymous User",
    date: formatDate(new Date()),
    rating: Math.round(parseFloat(overallRating)),
    comment: document.querySelector("textarea").value || "No comment provided",
    userId: userId,
    profileImage: getCurrentUserProfileImage()
  };

  // Create the complete review data in the desired format
  const reviewData = {
    busId: bookingData.busId,
    bookingId: bookingData.bookingId,
    userId: userId,
    ratings: {
      overall: overallRating,
      categories: categories,
    },
    review: reviewObj,
  };

  console.log("Review data to be submitted:", reviewData);

  // Save to localStorage and then to the bus object
  saveReviewToLocalStorage(reviewData);
  updateBusWithReview(reviewData);

  alert("Thank you for your review!");
  // Clear the current review data
  localStorage.removeItem("currentReviewBooking");
  // Redirect to bookings page
  window.location.href = "mybooking.html";
}

function loadBookingData() {
  // Get booking data from localStorage
  const bookingDataJson = localStorage.getItem("currentReviewBooking");

  if (!bookingDataJson) {
    // No booking data found, redirect to bookings page
    // alert("No booking found to review");
    // window.location.href = "mybooking.html";
    return;
  }

  const bookingData = JSON.parse(bookingDataJson);

  // Make sure we have a busId for the review
  if (!bookingData.busId && bookingData.busName) {
    // If no busId but we have a busName, try to find the bus
    const buses = JSON.parse(localStorage.getItem("busdata")) || [];
    const bus = buses.find(
      (b) =>
        b.name === bookingData.busName || b.companyName === bookingData.busName
    );
    if (bus) {
      bookingData.busId = bus.id;
      // Update in localStorage
      localStorage.setItem("currentReviewBooking", JSON.stringify(bookingData));
    }
  }

  // Populate trip summary card with booking data
  document.querySelector(".card-body .col-6:first-child strong").textContent =
    bookingData.pickupLocation?.split(",")[0] || "Pickup Location";
  document.querySelector(
    ".card-body .col-6:first-child .text-muted"
  ).textContent = bookingData.pickupLocation || "Details";

  document.querySelector(".card-body .col-6:last-child strong").textContent =
    bookingData.dropLocation?.split(",")[0] || "Drop Location";
  document.querySelector(
    ".card-body .col-6:last-child .text-muted"
  ).textContent = bookingData.dropLocation || "Details";

  document.querySelector(
    ".card-body .pb-2:nth-of-type(1)"
  ).innerHTML = `<strong>Booking ID:</strong> ${
    bookingData.bookingId || "Not available"
  }`;

  document.querySelector(
    ".card-body .pb-2:nth-of-type(2)"
  ).innerHTML = `<strong>Date & Time:</strong> ${
    bookingData.busdateDepature || "Not available"
  } ${bookingData.pickupTime || ""}`;

  document.querySelector(
    ".card-body .mb-2"
  ).innerHTML = `<strong>Bus Operator:</strong> ${
    bookingData.busName || "Not available"
  }`;

  // Get seat numbers if available
  let seatText = "Not available";
  if (bookingData.passengers && bookingData.passengers.length > 0) {
    seatText = bookingData.passengers
      .map((passenger) => passenger.seatNo)
      .join(" • ");
  }
  document.querySelector(
    ".card-body div:last-child"
  ).innerHTML = `<strong>Seat(s):</strong> ${seatText}`;
}

// Initialize when DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
  // Initialize star rating functionality
  initStarRating();

  // Load booking data from localStorage
  loadBookingData();

  // Add event listener to submit button
  const submitButton = document.querySelector(".k-submit");
  submitButton.addEventListener("click", submitReview);

  // Add event listener to cancel button
  const cancelButton = document.querySelector(".cancel-btn");
  cancelButton.addEventListener("click", () => {
    if (confirm("Are you sure you want to cancel your review?")) {
      window.location.href = "mybooking.html"; // Back to bookings page
    }
  });
});
