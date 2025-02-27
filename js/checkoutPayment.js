document.addEventListener("DOMContentLoaded", async () => {
  await checkoutPayment();
});

async function checkoutPayment() {
  try {
    const response = await fetch("http://localhost:3000/checkoutPayment");

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const data = await response.json();
    const checkoutPaymentData = data[0].CheckoutPayment;

    const paymentData = checkoutPaymentData;
    const bookingDetails = paymentData.bookingDetails;
    const fareDetails = paymentData.fareDetails;

    // Generate passengers HTML
    const passengersHtml = bookingDetails.passengers
      .map((passenger) => {
        const genderChar = passenger.gender === "Male" ? "M" : "F";
        return `
        <p class="col-8">${passenger.name} <span>(${genderChar},${passenger.age})</span></p>
        <p class="col-4 Seat">Seat : <span>${passenger.seat}</span></p>
      `;
      })
      .join("");

    // Generate banks options for net banking
    const banksOptions = paymentData.paymentOptions
      .find((option) => option.method === "Net Banking")
      .availableBanks.map(
        (bank) =>
          `<option value="${bank
            .toLowerCase()
            .replace(/\s+/g, "-")}">${bank}</option>`
      )
      .join("");

    // Generate UPI provider options
    const upiProviders = paymentData.paymentOptions
      .find((option) => option.method === "UPI")
      .provider.map((provider) => `<option>${provider}</option>`)
      .join("");

    const checkoutPaymentHtml = `
      <div class="col-12 col-xl-7 Payment-Option">
        <div class="Payment-data">
          <div class="book">
            <h2>Payment Option</h2>
          </div>
          <div class="card">
            <div class="Payment-Option">
              <ul class="row nav">
                <li class="col-4 nav-item">
                  <a class="nav-link active" data-bs-toggle="tab" href="#card">Credit/Debit Card</a>
                </li>
                <li class="col-4 nav-item">
                  <a class="nav-link" data-bs-toggle="tab" href="#upi">UPI</a>
                </li>
                <li class="col-4 nav-item">
                  <a class="nav-link" data-bs-toggle="tab" href="#netbanking">Net Banking</a>
                </li>
              </ul>
  
              <div class="tab-content mt-3">
                <div id="card" class="tab-pane fade show active">
                  <div class="row Card-holder">
                    <div class="col-12 col-md-6 Credit-data">
                      <label>Card holder Name</label>
                      <input type="text" placeholder="Enter name same as on card" value="${paymentData.paymentOptions[0].cardHolderName}">
                    </div>
                    <div class="col-12 col-md-6 Credit-data">
                      <label>Card No.</label>
                      <input type="password" placeholder="**** **** **** ****" value="${paymentData.paymentOptions[0].cardNumber}">
                    </div>
                    <div class="col-12 col-md-6 Credit-data">
                      <label>Expiry Date</label>
                      <input type="text" placeholder="MM / YYYY" value="${paymentData.paymentOptions[0].expiryDate}">
                    </div>
                    <div class="col-12 col-md-6 Credit-data">
                      <label>CVV</label>
                      <input type="password" placeholder="***" value="${paymentData.paymentOptions[0].cvv}">
                    </div>
                  </div>
  
                  <div class="Pay-Amount">
                    <div class="col-12 col-md-6 pay">
                      <a href="#">Pay ₹${fareDetails.totalAmount}</a>
                    </div>
                  </div>
                </div>
  
                <div id="upi" class="tab-pane fade">
                  <div class="col-12 col-md-6 upi">
                    <label>UPI ID</label>
                    <div class="input-group">
                      <input type="text" id="upi-id" placeholder="Enter UPI ID" value="${paymentData.paymentOptions[1].upiID}">
                      <select>
                        ${upiProviders}
                      </select>
                    </div>
                  </div>
                  <div class="Pay-Amount">
                    <div class="col-12 col-md-6 pay">
                      <a href="#">Pay ₹${fareDetails.totalAmount}</a>
                    </div>
                  </div>
                </div>
  
                <div id="netbanking" class="tab-pane fade">
                  <div class="Banking">
                    <div class="col-6 bank">
                      <select>
                        <option selected disabled>Select bank</option>
                        ${banksOptions}
                      </select>
                    </div>
                  </div>
                  <div class="Pay-Amount">
                    <div class="col-6 pay">
                      <a href="#">Pay ₹${fareDetails.totalAmount}</a>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
  
      <div class="col-12 col-xl-5 Booking-Details">
        <div class="row confirmation">
          <div class="col-12 Booking-data">
            <div class="book">
              <h2>Booking Details</h2>
            </div>
            <div class="card">
              <div class="row Sleeper-bus">
                <div class="col-1 Travels">
                  <img src="./image/bus-logo.png" alt="">
                </div>
                <div class="col-10 Travels">
                  <h3>${bookingDetails.busOperator}</h3>
                  <p>${bookingDetails.busType}</p>
                </div>
              </div>
  
              <div class="row Travels-route">
                <div class="col-4 pickup">
                  <p>${bookingDetails.pickup.time}</p>
                  <h3>${bookingDetails.pickup.date}</h3>
                  <p>${bookingDetails.pickup.location}</p>
                </div>
                <div class="col-12 col-sm-12 col-md-4 route-data">
                  <div class="route">
                    <img src="./image/route1.png" alt="">
                    <img class="bus" src="./image/route-bus.png" alt="">
                    <img src="./image/route2.png" alt="">
                  </div>
                  <div class="time" id="time">
                    <h3>${bookingDetails.duration}</h3>
                  </div>
                </div>
                <div class="col-4 drop">
                  <p>${bookingDetails.drop.time}</p>
                  <h3>${bookingDetails.drop.date}</h3>
                  <p>${bookingDetails.drop.location}</p>
                </div>
              </div>
  
              <div class="row up-off">
                <div class="col-1 loaction">
                  <div class="location-container">
                    <img src="./image/loaction.png" alt="">
                    <div class="dotted-line"></div>
                    <img src="./image/loaction.png" alt="">
                  </div>
                </div>
                <div class="col-6">
                  <div class="row Passenger-pick">
                    <div class="pick-area">
                      <h3>Pick up</h3>
                      <p>${bookingDetails.pickup.point}</p>
                    </div>
                    <div class="pick-area">
                      <h3>Drop - Off</h3>
                      <p>${bookingDetails.drop.point}</p>
                    </div>
                  </div>
                </div>
              </div>
  
              <div class="row Passenger-data">
                <div class="col-12 p-data">
                  <h3>Passenger</h3>
                  <div class="row p-Details">
                    ${passengersHtml}
                  </div>
                </div>
              </div>
            </div>
          </div>
  
          <div class="col-12 Fare-Details">
            <div class="book">
              <h2>Fare Details</h2>
            </div>
            <div class="card">
              <div class="row Fare-Total">
                <h3 class="col-8 Fare">Onward Fare</h3>
                <p class="col-4 Amount">₹${fareDetails.onwardFare}</p>
                <h3 class="col-8 Fare">Others</h3>
                <p class="col-4 Amount">₹${fareDetails.others}</p>
              </div>
              <div class="row Total-Amount">
                <h3 class="col-8 Fare">Total Payable Amount</h3>
                <p class="col-4 Amount">₹${fareDetails.totalAmount}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;

    document.getElementById("checkoutPayment").innerHTML = checkoutPaymentHtml;
  } catch (error) {
    console.error("Error loading checkout payment data:", error);
    console.error("Error details:", error.message);
  }
}
