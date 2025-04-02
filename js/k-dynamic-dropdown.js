// Indian states and Gujarat cities data
const locations = {
  states: [
    "Andhra Pradesh",
    "Arunachal Pradesh",
    "Assam",
    "Bihar",
    "Chhattisgarh",
    "Goa",
    "Gujarat",
    "Haryana",
    "Himachal Pradesh",
    "Jharkhand",
    "Karnataka",
    "Kerala",
    "Madhya Pradesh",
    "Maharashtra",
    "Manipur",
    "Meghalaya",
    "Mizoram",
    "Nagaland",
    "Odisha",
    "Punjab",
    "Rajasthan",
    "Sikkim",
    "Tamil Nadu",
    "Telangana",
    "Tripura",
    "Uttar Pradesh",
    "Uttarakhand",
    "West Bengal",
    "Andaman and Nicobar Islands",
    "Chandigarh",
    "Dadra and Nagar Haveli and Daman and Diu",
    "Delhi",
    "Jammu and Kashmir",
    "Ladakh",
    "Lakshadweep",
    "Puducherry",
  ],
  cities: {
    Gujarat: [
      "Ahmedabad",
      "Ankleshwar",
      "Surat",
      "Vadodara",
      "Rajkot",
      "Bhavnagar",
      "Jamnagar",
      "Junagadh",
      "Gandhinagar",
      "Anand",
      "Nadiad",
      "Mehsana",
      "Morbi",
      "Surendranagar",
      "Gandhidham",
      "Patan",
      "Navsari",
      "Bharuch",
      "Porbandar",
      "Godhra",
      "Valsad",
      "Veraval",
      "Kalol",
      "Botad",
      "Amreli",
      "Dahod",
      "Dhasa",
      "Palanpur",
      "Jetpur",
      "Vapi",
      "Gondal",
      "Somnath",
    ],
  },
  allCities: [],
};

// Add all Gujarat cities to the allCities array
locations.cities["Gujarat"].forEach((city) => {
  locations.allCities.push(city);
});

// Function to create and handle dropdown
function setupAutocomplete(inputElement, locationType) {
  // Create dropdown element
  const dropdownEl = document.createElement("div");
  dropdownEl.className = "autocomplete-dropdown";
  inputElement.parentNode.style.position = "relative";
  inputElement.parentNode.appendChild(dropdownEl);

  // Set max-height and make it scrollable
  dropdownEl.style.maxHeight = "200px";
  dropdownEl.style.overflowY = "auto";

  // Event listener for input changes
  inputElement.addEventListener("input", function () {
    const query = this.value.toLowerCase().trim();
    if (query.length < 2) {
      dropdownEl.style.display = "none";
      return;
    }

    // Filter results
    let results = [];
    if (locationType === "all") {
      // Search in both states and cities
      const stateMatches = locations.states.filter((state) =>
        state.toLowerCase().includes(query)
      );
      const cityMatches = locations.allCities.filter((city) =>
        city.toLowerCase().includes(query)
      );

      // Combine results with cities first, then states
      results = [...cityMatches, ...stateMatches];

      // Remove duplicates
      results = [...new Set(results)];
    }

    // Limit results to avoid overwhelming the user
    results = results.slice(0, 10);

    // Display results
    if (results.length > 0) {
      dropdownEl.innerHTML = "";
      results.forEach((result) => {
        const itemEl = document.createElement("div");
        itemEl.className = "dropdown-item";

        // Add category label (State or City)
        if (locations.states.includes(result)) {
          itemEl.innerHTML = `<span>${result}</span><small class="category-label">State</small>`;
        } else {
          itemEl.innerHTML = `<span>${result}</span><small class="category-label">City (Gujarat)</small>`;
        }

        // Handle item selection
        itemEl.addEventListener("click", function () {
          // Extract just the location name without the category label
          const locationName = this.querySelector("span").textContent;
          inputElement.value = locationName;
          dropdownEl.style.display = "none";
        });

        dropdownEl.appendChild(itemEl);
      });
      dropdownEl.style.display = "block";
    } else {
      dropdownEl.style.display = "none";
    }
  });

  // Hide dropdown when clicking outside
  document.addEventListener("click", function (e) {
    if (e.target !== inputElement && !dropdownEl.contains(e.target)) {
      dropdownEl.style.display = "none";
    }
  });

  // Show dropdown when clicking on input
  inputElement.addEventListener("click", function () {
    if (this.value.length >= 2) {
      // Trigger the input event to show results
      const event = new Event("input");
      this.dispatchEvent(event);
    }
  });
}

// Add CSS for the dropdowns
function addStyles() {
  const styleEl = document.createElement("style");
  styleEl.textContent = `
      .autocomplete-dropdown {
        position: absolute;
        width: 100%;
        background: white;
        border: 1px solid #ddd;
        border-top: none;
        z-index: 1000;
        display: none;
        box-shadow: 0 4px 8px rgba(0,0,0,0.1);
        border-radius: 0 0 4px 4px;
        left: 0;
        top: 100%;
      }
      
      .dropdown-item {
        padding: 10px 15px;
        cursor: pointer;
        transition: background-color 0.2s;
        display: flex;
        justify-content: space-between;
        align-items: center;
      }
        .dropdown-item span {
        color: #333;
        }
      
      .dropdown-item:hover {
        background-color: #f5f5f5;
      }
      
      .category-label {
        color: #777;
        font-size: 0.8em;
        margin-left: 10px;
      }
      
      .box {
        position: relative;
      }
    `;
  document.head.appendChild(styleEl);
}

// Initialize when DOM is loaded
document.addEventListener("DOMContentLoaded", function () {
  addStyles();

  // Get the From and To input fields
  const fromInput = document.querySelector('input[placeholder="From"]');
  const toInput = document.querySelector('input[placeholder="To"]');

  // Setup autocomplete for both fields
  if (fromInput) {
    setupAutocomplete(fromInput, "all");
  }

  if (toInput) {
    setupAutocomplete(toInput, "all");
  }
});

document.addEventListener("DOMContentLoaded", function () {
  addStyles();

  // Get the From and To input fields
  const fromInput = document.querySelector(
    'input[placeholder="From location"]'
  );
  const toInput = document.querySelector('input[placeholder="To location"]');

  // Setup autocomplete for both fields
  if (fromInput) {
    setupAutocomplete(fromInput, "all");
  }

  if (toInput) {
    setupAutocomplete(toInput, "all");
  }
});

// Wait for the DOM to fully load
// Wait for the DOM to fully load
document.addEventListener("DOMContentLoaded", function () {
  // Add validation to the search button
  document
    .getElementById("searchButton")
    .addEventListener("click", function (event) {
      // Prevent the default form submission
      event.preventDefault();

      // Get form fields
      const fromInput = document.getElementById("fromInput");
      const toInput = document.getElementById("toInput");
      const dateInput = document.getElementById("dateInputField");
      const busNameInput = document.getElementById("busNameInput");

      // Clear previous error styling
      clearErrors();

      // Validate inputs
      let isValid = true;

      // From location validation
      if (!fromInput.value.trim()) {
        showError(fromInput, "Please enter departure location");
        isValid = false;
      } else if (!isValidLocation(fromInput.value.trim())) {
        showError(
          fromInput,
          "Please select a valid location from the dropdown"
        );
        isValid = false;
      }

      // To location validation
      if (!toInput.value.trim()) {
        showError(toInput, "Please enter destination location");
        isValid = false;
      } else if (!isValidLocation(toInput.value.trim())) {
        showError(toInput, "Please select a valid location from the dropdown");
        isValid = false;
      }

      // Same location check
      if (
        fromInput.value.trim() &&
        toInput.value.trim() &&
        fromInput.value.trim().toLowerCase() ===
          toInput.value.trim().toLowerCase()
      ) {
        showError(toInput, "Departure and destination cannot be the same");
        isValid = false;
      }

      // Date validation
      if (!dateInput.value) {
        showError(dateInput, "Please select a travel date");
        isValid = false;
      } else {
        // Check if date is not in the past
        const selectedDate = new Date(dateInput.value);
        const today = new Date();
        today.setHours(0, 0, 0, 0); // Reset time part for proper comparison

        if (selectedDate < today) {
          showError(dateInput, "Please select a future date");
          isValid = false;
        }
      }

      // If all validations pass, proceed with form submission
      if (isValid) {
        // Store the form data
        const formData = {
          fromlocation: fromInput.value.trim(),
          toValuelocation: toInput.value.trim(),
          dateValuelocation: dateInput.value,
          busNameValuelocation: busNameInput.value.trim(),
        };

        localStorage.setItem("filterData", JSON.stringify(formData));

        // Redirect to the bus list page
        window.location.href = "Buslist.html";
      }
    });

  // Add swap functionality for From and To fields
  document.getElementById("swipe").addEventListener("click", function () {
    const fromInput = document.getElementById("fromInput");
    const toInput = document.getElementById("toInput");

    // Swap the values
    const temp = fromInput.value;
    fromInput.value = toInput.value;
    toInput.value = temp;

    // Clear any error messages
    clearErrors();
  });

  // Set minimum date on the date input to today
  const dateInput = document.getElementById("dateInputField");
  const today = new Date();
  const formattedDate = today.toISOString().split("T")[0]; // Format: YYYY-MM-DD
  dateInput.setAttribute("min", formattedDate);

  // Add event listeners to clear errors when inputs change
  const inputs = document.querySelectorAll("input");
  inputs.forEach((input) => {
    input.addEventListener("input", function () {
      clearErrorForInput(this);
    });
  });
});

// Function to check if location is valid
function isValidLocation(location) {
  // Check if location exists in our list of states or cities
  const allLocations = [...locations.states, ...locations.allCities];

  return allLocations.some(
    (item) => item.toLowerCase() === location.toLowerCase()
  );
}

// Function to display error for an input
function showError(inputElement, message) {
  // Create error message element
  const errorElement = document.createElement("div");
  errorElement.className = "validation-error";
  errorElement.textContent = message;
  errorElement.style.color = "#f44336";
  errorElement.style.fontSize = "12px";
  errorElement.style.marginTop = "4px";
  errorElement.style.position = "absolute";
  errorElement.style.bottom = "-20px";
  errorElement.style.left = "0";
  errorElement.style.width = "100%";

  // Add error message after the input field container
  const boxElement = inputElement.closest(".box");
  if (boxElement) {
    boxElement.style.position = "relative";
    boxElement.style.marginBottom = "20px";
    boxElement.appendChild(errorElement);
  }
}

// Function to clear error for a specific input
function clearErrorForInput(inputElement) {
  const boxElement = inputElement.closest(".box");
  if (boxElement) {
    const errorElement = boxElement.querySelector(".validation-error");
    if (errorElement) {
      errorElement.remove();
      boxElement.style.marginBottom = "";
    }
    inputElement.style.border = "";
  }
}

// Function to clear all errors
function clearErrors() {
  // Remove all error messages
  const errorMessages = document.querySelectorAll(".validation-error");
  errorMessages.forEach((element) => element.remove());

  // Reset input styling
  const inputs = document.querySelectorAll("input");
  inputs.forEach((input) => {
    input.style.border = "";
    const boxElement = input.closest(".box");
    if (boxElement) {
      boxElement.style.marginBottom = "";
    }
  });
}

// Add CSS for error messages
function addErrorStyles() {
  const styleEl = document.createElement("style");
  styleEl.textContent = `
    .box {
      position: relative;
      margin-bottom: 0;
      transition: margin-bottom 0.3s;
    }
    
    .validation-error {
      animation: fadeIn 0.3s;
    }
    
    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }
  `;
  document.head.appendChild(styleEl);
}

// Call this function when DOM is loaded
document.addEventListener("DOMContentLoaded", function () {
  addErrorStyles();
});
