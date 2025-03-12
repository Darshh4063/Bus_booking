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

document.getElementById("searchButton").addEventListener("click", function () {
  // Get values from inputs
  const fromValue = document.getElementById("fromInput").value;
  const toValue = document.getElementById("toInput").value;
  const dateValue = document.getElementById("dateInputField").value;
  const busNameValue = document.getElementById("busNameInput").value;
  const dta = {
    fromlocation: fromValue,
    toValuelocation: toValue,
    dateValuelocation: dateValue,
    busNameValuelocation: busNameValue,
  };

  localStorage.setItem("filterData", JSON.stringify(dta));
  // Redirect to Buslist.html
  window.location.href = "Buslist.html";
});
