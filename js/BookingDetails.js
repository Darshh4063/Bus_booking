document.addEventListener("DOMContentLoaded", async () => {
  await bookingDetailsData();
});

const bookingDetails = JSON.parse(localStorage.getItem("bookingDetails"));
async function bookingDetailsData() {
  try {
    const response = await fetch("http://localhost:3000/BookingDetails");
    const busdata = JSON.parse(localStorage.getItem("busdata"));
    const selectSeatData = JSON.parse(localStorage.getItem("selectedData"));

    // console.log("seat", selectSeatData);
    // console.log("Booking Details", bookingDetails);

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const data = await response.json();
    const bookingDetailsData = data[0];
    // console.log(bookingDetailsData);

    const bookingDetailsHtml = `
        <div class="col-12 col-xl-8 book-data">
          <div class="row user-Details">
            <div class="col-12 Booking Details">
              <div class="book">
                <h2>Booking Details</h2>
              </div>
  
              <div class="card">
                <div class="row card-data">
                  <div class="col-12 col-sm-12 col-md-4 pickup">
                         <h3 class="location">${
                           bookingDetails.pickupLocation
                         }</h3>
                          <h3 class="time">${bookingDetails.pickupTime}</h3>
                          <p class="point">${bookingDetails.pickupPoints}</p>
                  </div>
  
                  <div class="col-12 col-sm-12 col-md-3 route-data">
                    <div class="route">
                      <img src="./image/route1.png" alt="">
                      <img class="bus" src="./image/route-bus.png" alt="">
                      <img src="./image/route2.png" alt="">
                    </div>
                    <div class="time" id="time">
                      <h3>${bookingDetails.duration}</h3>
                    </div>
                  </div>
  
                  <div class="col-12 col-sm-12 col-md-4 drop">
                    <h3 class="location">${bookingDetails.dropLocation}</h3>
                    <h3 class="time">${bookingDetails.dropTime}</h3>
                    <p class="point">${bookingDetails.dropoffPoints}</p>
                  </div>
                </div>
                <hr>
                <div class="row Operator">
                  <div class="col-12 col-sm-12 col-md-4 bus-opp">
                    <span>Bus Operator :</span>
              
                         <span class="b-name">${bookingDetails.busName}</span>
                  </div>
                </div>
              </div>
            </div>
  
            <div class="col-12 accordion-item Passenger Details">
              <h2 class="accordion-header">
                <button class="accordion-button p-2" type="button" data-bs-toggle="collapse"
                  data-bs-target="#collapseOne">
                  Passenger Details
                </button>
              </h2>
  
              <div id="collapseOne" class="accordion-collapse collapse show"
                data-bs-parent="#passengerAccordion">
                <div class="accordion-body">
                  <div class="card user-data">
                    ${bookingDetailsData.passengers
                      .map(
                        (passenger, index) => `
                      <div class="row Passenger-data">
                        <div class="row Passenger-data-sec">
                         <div class="col-12 col-sm-7 Passenger">
                            <p>Name</p>
                            <input type="text" placeholder="Enter Name" value="${
                              passenger.name || ""
                            }" 
                                  oninput="validateNameInput(this)">
                          </div>
                        
                          <div class="col-6 col-sm-2 Passenger agePick">
                            <p>Age</p>
                            <input type="text" value="${passenger.age || ""}" 
                                  oninput="validateAgeInput(this)">
                          </div>

                          <div class="col-6 col-sm-2 Passenger">
                            <p>Gender</p>
                            <div class="input-group">
                              <div class="gender-group">
                                <input type="radio" id="gender${
                                  index + 1
                                }_male" name="gender${index + 1}"
                                  value="Male" ${
                                    passenger.gender === "Male" ? "checked" : ""
                                  }>
                                <label for="gender${
                                  index + 1
                                }_male">Male</label>
                                <input type="radio" id="gender${
                                  index + 1
                                }_female" name="gender${index + 1}"
                                  value="Female" ${
                                    passenger.gender === "Female"
                                      ? "checked"
                                      : ""
                                  }>
                                <label for="gender${
                                  index + 1
                                }_female">Female</label>
                              </div>
                            </div>
                          </div>
                          <div class="d-flex">
                            <div class="w-50 me-3 Passenger">
                              <p>Aadhaar Card Number</p>
                              <input type="text" placeholder="Enter Aadhaar Card" value="${
                                passenger.AadhaarCard || ""
                              }" 
                                    oninput="validateAadhaarInput(this)">
                              <div class="error-message" style="color: red; font-size: 0.9em; display: none;"></div> 
                            </div>
                            <div class="w-50 Passenger">
                              <p>Pancard Number (Optional)</p>
                              <input type="text" placeholder="Enter Pan Card" value="${
                                passenger.panCard || ""
                              }" 
                                    oninput="validatePanInput(this)">
                              <div class="error-message" style="color: red; font-size: 0.9em; display: none;"></div> 
                            </div>
                          </div>
                        </div>
                      </div>
                    `
                      )
                      .join("")}
                  </div>
                </div>
              </div>
            </div>
  
            <div class="col-12 accordion-item Contact Details">
              <h2 class="accordion-header">
                <button class="accordion-button p-2" type="button" data-bs-toggle="collapse"
                  data-bs-target="#collapseTwo">
                  Contact Details
                </button>
              </h2>
  
              <div id="collapseTwo" class="accordion-collapse collapse show"
                data-bs-parent="#passengerAccordion">
                <div class="accordion-body">
                  <div class="card user-data">
                    <div class="row user-con">
                      <div class="col-12 col-sm-6">
                        <label>Email</label>
                        <div class="col-12 phone-container">
                          <input type="text" placeholder="Enter your email" value="${
                            bookingDetailsData.contactDetails.email
                          }" 
                          oninput="validateEmailInput(this)">
                          <div class="error-message" style="color: red; font-size: 0.9em; display: none;"></div> 
                        </div>
                      </div>
  
                      <div class="col-12 col-sm-6 contact-details">
                        <label>Phone No.</label>
                        <div class="col-12 phone-container">
                          <select>
                            <option value="+91" ${
                              bookingDetailsData.contactDetails.phone
                                .countryCode === "+91"
                                ? "selected"
                                : ""
                            }>+91</option>
                            <option value="+1" ${
                              bookingDetailsData.contactDetails.phone
                                .countryCode === "+1"
                                ? "selected"
                                : ""
                            }>+1</option>
                            <option value="+44" ${
                              bookingDetailsData.contactDetails.phone
                                .countryCode === "+44"
                                ? "selected"
                                : ""
                            }>+44</option>
                            <option value="+61" ${
                              bookingDetailsData.contactDetails.phone
                                .countryCode === "+61"
                                ? "selected"
                                : ""
                            }>+61</option>
                          </select>
                          <input type="text" placeholder="Enter your phone no." value="${
                            bookingDetailsData.contactDetails.phone.number
                          }" 
                          oninput="validatePhoneInput(this)">
                          <div class="error-message" style="color: red; font-size: 0.9em; display: none;"></div>
                        </div>
                      </div>
                      <p>Your ticket will be sent on this contact details</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
  
        <div class="col-12 col-xl-4 Offers-data">
          <div class="row user-ofr">
            <div class="col-12 Offers">
              <div class="book">
                <h2>Offers</h2>
              </div>
  
              <div class="ofr-data">
                ${bookingDetailsData.offers
                  .map(
                    (offer, index) => `
                  <div class="offer">
                    <input type="radio" name="offer" id="${
                      offer.code
                    }-${index}" ${offer.selected ? "checked" : ""}>
                    <label for="${offer.code}-${index}">
                      <strong>${offer.code}</strong> ${offer.description}
                    </label>
                  </div>
                `
                  )
                  .join("")}
  
                <div class="coupon-box">
                  <input type="text" placeholder="Enter coupon code" value="${
                    bookingDetailsData.coupon
                  }">
                  <a href="#">APPLY</a>
                </div>
              </div>
            </div>
  
            <div class="col-12 payment">
              <div class="book">
                <h2>Fare Breakup</h2>
              </div>
  
              <div class="fare-container">
                <div class="fare-item">
                  <span>Onward Fare</span>
                  <span>₹${bookingDetails.onwardFare}</span>
                </div>
                <div class="fare-item">
                  <span>GST</span>
                  <span>₹${bookingDetails.gst}</span>
                </div>
                <div class="fare-item">
                  <span>Booking Charges</span>
                  <span>₹${bookingDetailsData.fareBreakup.bookingCharges}</span>
                </div>
                <div class="fare-item disc">
                  <span>Discount</span>
                  <span>-₹${Math.abs(bookingDetails.discount)}</span>
                </div>
                <div class="fare-item total">
                  <span>Total Payable Amount</span>
                  <span>₹${bookingDetails.totalPrice}</span>
                </div>
                <button class="pay-button" onclick="proceedToPay()" >Proceed to Pay</button>
              </div>
            </div>
          </div>
        </div>
      `;

    document.getElementById("bookingDetails").innerHTML = bookingDetailsHtml;
    initPage();
  } catch (error) {
    console.error("Error loading booking details:", error);
  }
}

const busPriceData = JSON.parse(localStorage.getItem("bookingDetails"));
// console.log("prise", busPriceData.busPrice);
// start
function validateAgeInput(input) {
  const originalValue = input.value;
  input.value = input.value.replace(/[^0-9]/g, "");

  if (originalValue !== input.value) {
    alert("Please enter only numbers.");
  }
}

function validateNameInput(input) {
  const originalValue = input.value;
  input.value = input.value.replace(/[^a-zA-Z\s]/g, "");

  if (originalValue !== input.value) {
    alert("Please enter only letters.");
  }
}

function validateEmailInput(input) {
  const errorMessage = input.nextElementSibling;

  const emailPattern = /\S+@\S+\.\S+/;

  if (!emailPattern.test(input.value)) {
    errorMessage.textContent = "Please enter a valid email address.";
    errorMessage.style.display = "block";
  } else {
    errorMessage.style.display = "none";
  }
}

function validatePhoneInput(input) {
  const originalValue = input.value;
  input.value = input.value.replace(/[^0-9]/g, "");

  const errorMessage = input.nextElementSibling;

  if (input.value.length > 10) {
    errorMessage.textContent = "Phone number must be 10 digits.";
    errorMessage.style.display = "block";
    input.value = input.value.slice(0, 10);
  } else if (input.value.length === 0) {
    errorMessage.textContent = "Phone number is required.";
    errorMessage.style.display = "block";
  } else {
    errorMessage.style.display = "none";
  }
}

function validateAadhaarInput(input) {
  const errorMessage = input.nextElementSibling;
  const aadhaarPattern = /^\d{12}$/;

  if (!aadhaarPattern.test(input.value)) {
    errorMessage.textContent = "Aadhaar Card Number must be 12 digits.";
    errorMessage.style.display = "block";
  } else {
    errorMessage.style.display = "none";
  }
}

function validatePanInput(input) {
  const errorMessage = input.nextElementSibling;
  const panPattern = /^[A-Z]{5}\d{4}[A-Z]{1}$/;

  if (input.value && !panPattern.test(input.value)) {
    errorMessage.textContent =
      "PAN Card Number must be in the format: ABCD1234E.";
    errorMessage.style.display = "block";
  } else {
    errorMessage.style.display = "none";
  }
}

// end
function proceedToPay() {
  const passengers = document.querySelectorAll(".Passenger-data");

  // start
  document.querySelectorAll(".error-message").forEach((msg) => msg.remove());

  let isValid = true;

  for (const passenger of passengers) {
    const nameInput = passenger.querySelector(
      "input[placeholder='Enter Name']"
    );
    const ageInput = passenger.querySelector(".agePick input");
    const aadhaarCardInput = passenger.querySelector(
      "input[placeholder='Enter Aadhaar Card']"
    );

    const emailInput = document.querySelector(
      ".phone-container input[type='text']"
    );
    const phoneSelect = document.querySelector(".phone-container select");
    const phoneNumberInput = document.querySelector(
      "input[placeholder='Enter your phone no.']"
    );

    nameInput.nextElementSibling?.remove();
    ageInput.nextElementSibling?.remove();
    aadhaarCardInput.nextElementSibling?.remove();
    emailInput.nextElementSibling?.remove();
    phoneNumberInput.nextElementSibling?.remove();

    if (!nameInput.value) {
      const errorMsg = document.createElement("div");
      errorMsg.className = "error-message";
      errorMsg.textContent = "Name is required.";
      errorMsg.style.color = "red";
      nameInput.parentNode.appendChild(errorMsg);
      isValid = false;
    }
    if (!ageInput.value) {
      const errorMsg = document.createElement("div");
      errorMsg.className = "error-message";
      errorMsg.textContent = "Age is required.";
      errorMsg.style.color = "red";
      ageInput.parentNode.appendChild(errorMsg);
      isValid = false;
    }
    if (!aadhaarCardInput.value) {
      const errorMsg = document.createElement("div");
      errorMsg.className = "error-message";
      errorMsg.textContent = "Aadhaar Card Number is required.";
      errorMsg.style.color = "red";
      aadhaarCardInput.parentNode.appendChild(errorMsg);
      isValid = false;
    }
    if (!emailInput.value) {
      const errorMsg = document.createElement("div");
      errorMsg.className = "error-message";
      errorMsg.textContent = "Email is required.";
      errorMsg.style.color = "red";
      emailInput.parentNode.appendChild(errorMsg);
      isValid = false;
    } else if (!/\S+@\S+\.\S+/.test(emailInput.value)) {
      const errorMsg = document.createElement("div");
      errorMsg.className = "error-message";
      errorMsg.textContent = "Please enter a valid email address.";
      errorMsg.style.color = "red";
      emailInput.parentNode.appendChild(errorMsg);
      isValid = false;
    }
    if (!phoneNumberInput.value) {
      const errorMsg = document.createElement("div");
      errorMsg.className = "error-message";
      errorMsg.textContent = "Phone number is required.";
      errorMsg.style.color = "red";
      phoneNumberInput.parentNode.appendChild(errorMsg);
      isValid = false;
    }
  }

  if (!isValid) return;
  // end
  const passengerDetails = Array.from(passengers).map((passenger) => ({
    name: passenger.querySelector("input[placeholder='Enter Name']").value,
    age: document.querySelector(".agePick input").value,
    gender:
      passenger.querySelector("input[name^='gender']:checked")?.value || "",
    // seat: passenger.querySelector("input[type='text'][value='']").value,
    AadhaarCard: document.querySelector(
      ".Passenger-data input[placeholder='Enter Aadhaar Card' ]"
    ).value,
    panCard: document.querySelector(
      ".Passenger-data input[placeholder='Enter Pan Card' ]"
    ).value,
  }));
  const contactDetails = {
    email: document.querySelector(".phone-container input[type='text']").value,

    phone: {
      countryCode: document.querySelector(".phone-container select").value,
      number: document.querySelector(
        "input[placeholder='Enter your phone no.']"
      ).value,
    },
  };

  const existingBookingDetails =
    JSON.parse(localStorage.getItem("bookingDetails")) || {};

  existingBookingDetails.passengers = existingBookingDetails.passengers || [];
  existingBookingDetails.passengers.push(...passengerDetails);
  existingBookingDetails.contactDetails = contactDetails;

  var onwardFare = busPriceData.busPrice;
  var gst = onwardFare * 0.18 * 100;
  const bookingCharges = 120;
  const discount = 120;
  const totalPayableAmount = onwardFare + gst + bookingCharges - discount;

  existingBookingDetails.fareBreakup = {
    onwardFare,
    gst,
    bookingCharges,
    discount,
    totalPayableAmount,
  };

  localStorage.setItem(
    "bookingDetails",
    JSON.stringify(existingBookingDetails)
  );
  window.location.href = "A-Checkout-Payment.html";
}

window.onload = () => {
  getData();
};

function getData() {
  bookingDetailsData();
}

function initPage() {
  const offerRadios = document.querySelectorAll('.offer input[type="radio"]');
  offerRadios.forEach((radio) => {
    radio.addEventListener("change", function () {
      if (this.checked) {
        const offerId = this.id.split("-")[0];

        document.querySelector(".coupon-box input").value = offerId;
      }
    });
  });

  let couponApplied = false;
  function applyDiscount() {
    if (couponApplied) {
      alert("Coupon has already been applied.");
      return;
    }
    var onwardFare = bookingDetails.onwardFare;
    var discount = bookingDetails.discount;

    const couponDiscountPercentage = 0.2;
    const coupenDiscountPrice = onwardFare * couponDiscountPercentage;
    const bookingCharges = 120;

    console.log(`Discount applied: ₹${coupenDiscountPrice}`);
    // console.log(coupenDiscountPrice);

    discount += coupenDiscountPrice;

    bookingDetails.discount = discount;

    const totalPayableAmount =
      onwardFare + bookingDetails.gst + bookingCharges - discount;

      const existingBookingDetails = JSON.parse(localStorage.getItem("bookingDetails")) || {};
    existingBookingDetails.discount = discount;
    existingBookingDetails.totalPayableAmount = totalPayableAmount;
    localStorage.setItem("bookingDetails", JSON.stringify(existingBookingDetails));

    const discountElement = document.querySelector(".disc span:nth-child(2)");
    if (discountElement) {
      discountElement.textContent = `-₹${Math.abs(discount).toFixed(2)}`;
    } else {
      console.error("Discount element not found in the DOM.");
    }

    const totalAmountElement = document.querySelector(
      ".total span:nth-child(2)"
    );
    if (totalAmountElement) {
      totalAmountElement.textContent = `₹${totalPayableAmount.toFixed(2)}`;
    } else {
      console.error("Total amount element not found in the DOM.");
    }
    couponApplied = true;
  }

  document.querySelector(".coupon-box a").addEventListener("click", (e) => {
    e.preventDefault();
    applyDiscount();
  });
}
