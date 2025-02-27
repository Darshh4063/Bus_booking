document.addEventListener("DOMContentLoaded", async () => {
  await bookingDetails();
});

async function bookingDetails() {
  try {
    const response = await fetch("http://localhost:3000/BookingDetails");

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const data = await response.json();
    const bookingDetailsData = data[0];

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
                      bookingDetailsData.booking.pickup.location
                    }</h3>
                    <h3 class="time">${
                      bookingDetailsData.booking.pickup.time
                    }</h3>
                    <p class="point">${
                      bookingDetailsData.booking.pickup.point
                    }</p>
                  </div>
  
                  <div class="col-12 col-sm-12 col-md-3 route-data">
                    <div class="route">
                      <img src="./image/route1.png" alt="">
                      <img class="bus" src="./image/route-bus.png" alt="">
                      <img src="./image/route2.png" alt="">
                    </div>
                    <div class="time" id="time">
                      <h3>${bookingDetailsData.booking.duration}</h3>
                    </div>
                  </div>
  
                  <div class="col-12 col-sm-12 col-md-4 drop">
                    <h3 class="location">${
                      bookingDetailsData.booking.drop.location
                    }</h3>
                    <h3 class="time">${
                      bookingDetailsData.booking.drop.time
                    }</h3>
                    <p class="point">${
                      bookingDetailsData.booking.drop.point
                    }</p>
                  </div>
                </div>
                <hr>
                <div class="row Operator">
                  <div class="col-12 col-sm-12 col-md-8 seat">
                    <span>Seat Selected :</span>
                    <span class="s-num">
                      ${bookingDetailsData.booking.seatsSelected
                        .map((seat) => `<li>${seat}</li>`)
                        .join("")}
                    </span>
                  </div>
  
                  <div class="col-12 col-sm-12 col-md-4 bus-opp">
                    <span>Bus Operator :</span>
                    <span class="b-name">${
                      bookingDetailsData.booking.busOperator
                    }</span>
                  </div>
                </div>
              </div>
            </div>
  
            <div class="col-12 accordion-item Passenger Details">
              <h2 class="accordion-header">
                <button class="accordion-button" type="button" data-bs-toggle="collapse"
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
                            }">
                          </div>
  
                          <div class="col-6 col-sm-2 Passenger">
                            <p>Age</p>
                            <input type="text" value="${passenger.age || ""}">
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
  
                          <div class="col-12 col-sm-1 Passenger">
                            <p>Seat</p>
                            <input type="text" value="${
                              passenger.seat ||
                              bookingDetailsData.booking.seatsSelected[index] ||
                              ""
                            }">
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
                <button class="accordion-button" type="button" data-bs-toggle="collapse"
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
                          }">
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
                          }">
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
                  <span>₹${bookingDetailsData.fareBreakup.onwardFare}</span>
                </div>
                <div class="fare-item">
                  <span>GST</span>
                  <span>₹${bookingDetailsData.fareBreakup.GST}</span>
                </div>
                <div class="fare-item">
                  <span>Booking Charges</span>
                  <span>₹${bookingDetailsData.fareBreakup.bookingCharges}</span>
                </div>
                <div class="fare-item">
                  <span>Discount</span>
                  <span>-₹${Math.abs(
                    bookingDetailsData.fareBreakup.discount
                  )}</span>
                </div>
                <div class="fare-item total">
                  <span>Total Payable Amount</span>
                  <span>₹${bookingDetailsData.fareBreakup.totalAmount}</span>
                </div>
                <button class="pay-button" onclick="window.location.href='A-Checkout-Payment.html'">Proceed to Pay</button>
              </div>
            </div>
          </div>
        </div>
      `;

    document.getElementById("bookingDetails").innerHTML = bookingDetailsHtml;
  } catch (error) {
    console.error("Error loading booking details:", error);
  }
}

window.onload = () => {
  getData();
};

function getData() {
  bookingDetails();
}
