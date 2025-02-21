document.addEventListener("DOMContentLoaded", async () => {
  await busListData();
});

async function busListData() {
  try {
    const response = await fetch("http://localhost:3000/busListings");

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const data = await response.json();
    const buslist = data.buslist;
    console.log(data);

    // const buslistHtml = data
    //   .map(
    //     (bus) => `
    //      <div class="travel-card">
    //             <div class="travel-info">
    //               <div class="rating">
    //                 <span class="star">★</span>
    //                 <span class="rating-value">4.5</span>
    //               </div>
    //               <div class="company-name">${bus.busListings.companyName}</div>
    //               <div class="bus-type">${bus.busListings.busType}</div>
    //             </div>

    //             <div class="journey-details">
    //               <div class="location-time">
    //                 <div class="time">${bus.busListings.journey.departure.time}</div>
    //                 <div class="location">${bus.busListings.journey.departure.location}</div>
    //                 <div class="date">${bus.busListings.journey.departure.date}</div>
    //               </div>

    //               <div class="journey-duration">
    //                 <div class="duration-line">
    //                   <span class="bus-icon">🚌</span>
    //                 </div>
    //                 <div class="duration-text">${bus.busListings.journey.duration}</div>
    //               </div>

    //               <div class="location-time">
    //                 <div class="time">${bus.busListings.journey.arrival.time}</div>
    //                 <div class="location">${bus.busListings.journey.arrival.time}</div>
    //                 <div class="date">${bus.busListings.journey.arrival.time}</div>
    //               </div>
    //             </div>

    //             <div class="price-section">
    //               <div class="price">
    //                 <span class="currency">${busListings.currency.amount}</span>
    //                 <span class="amount">${busListings.price.amount}</span>
    //               </div>
    //               <div class="discount">Best deal 10% Off</div>
    //             </div>
    //           </div>
    //           <div>
    //             <div class="travel-links">
    //               <a href="#" class="link" data-tab="tracking">Live Tracking</a>
    //               <a href="#" class="link" data-tab="policies">Policies</a>
    //               <a href="#" class="link" data-tab="amenities">Amenities</a>
    //               <a href="#" class="link" data-tab="photos">Photos</a>
    //               <a href="#" class="link" data-tab="pickup">Pickup & Drop off Point</a>
    //               <a href="#" class="link" data-tab="reviews">Reviews</a>
    //               <div class="ms-auto">
    //                   <button class="select-seat link" data-tab="selectseat">Select Seat</button>
    //               </div>
    //             </div>    
    //           </div>

    //           <div id="tracking" class="content-section">
    //               <div class="placeholder-content">Live Tracking Content Will Appear Here</div>
    //           </div>

    //           <div id="policies" class="content-section">
    //               <div class="container d-flex">
    //                   <div class="table-container">
    //                       <table>
    //                           <thead>
    //                               <tr>
    //                                   <th>Cancellation Time</th>
    //                                   <th>Charges</th>
    //                               </tr>
    //                           </thead>
    //                           <tbody>
    //                               <tr>
    //                                   <td>After Wed 05 Feb 12:44 PM</td>
    //                                   <td class="charges">20%</td>
    //                               </tr>
    //                               <tr>
    //                                   <td>Before Tue 04 Feb 12:44 PM</td>
    //                                   <td class="charges">10%</td>
    //                               </tr>
    //                               <tr>
    //                                   <td>Before Tue 04 Feb 12:44 PM</td>
    //                                   <td class="charges">10%</td>
    //                               </tr>
    //                               <tr>
    //                                   <td>After Wed 05 Feb 12:44 PM</td>
    //                                   <td class="charges">20%</td>
    //                               </tr>
    //                           </tbody>
    //                       </table>
    //                   </div>
    //                   <div class="info-container">
    //                       <h2 class="info-heading">Info</h2>
    //                       <ul class="info-list">
    //                           <li>Lorem Ipsum is simply dummy text of the printing and typesetting industry.</li>
    //                           <li>Lorem Ipsum is simply dummy text of the printing and</li>
    //                           <li>Lorem Ipsum is simply dummy text of the printing</li>
    //                           <li>Lorem Ipsum is simply dummy text of the printing and typesetting industry.</li>
    //                           <li>Lorem Ipsum is simply dummy text of the printing and</li>
    //                       </ul>
    //                   </div>
    //               </div>
    //           </div>
              
    //           <div id="amenities" class="content-section">
    //               <div class="placeholder-content">
    //                   <div class="amenities-container">
    //                       <h2 class="amenities-title">Bus Amenities</h2>
    //                       <div class="amenities-list">
    //                           <div class="amenity-item">
    //                               <div class="amenity-icon">
    //                                   <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    //                                       <path d="M5 12.55a11 11 0 0 1 14.08 0"></path>
    //                                       <path d="M1.42 9a16 16 0 0 1 21.16 0"></path>
    //                                       <path d="M8.53 16.11a6 6 0 0 1 6.95 0"></path>
    //                                       <line x1="12" y1="20" x2="12" y2="20"></line>
    //                                   </svg>
    //                               </div>
    //                               <div class="amenity-text">WiFi</div>
    //                           </div>
                              
    //                           <div class="amenity-item">
    //                               <div class="amenity-icon">
    //                                   <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    //                                       <path d="M19 11h-14"></path>
    //                                       <path d="M14 15a3 3 0 0 1-6 0H5l1.5-9h11l1.5 9H16"></path>
    //                                       <path d="M5 15h14"></path>
    //                                   </svg>
    //                               </div>
    //                               <div class="amenity-text">Water Bottle</div>
    //                           </div>
                              
    //                           <div class="amenity-item">
    //                               <div class="amenity-icon">
    //                                   <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    //                                       <path d="M7 19h10"></path>
    //                                       <path d="M7 19a2 2 0 0 1-2-2"></path>
    //                                       <path d="M17 19a2 2 0 0 0 2-2"></path>
    //                                       <path d="M5 17V7a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v10"></path>
    //                                       <line x1="8" y1="11" x2="16" y2="11"></line>
    //                                       <line x1="12" y1="7" x2="12" y2="15"></line>
    //                                   </svg>
    //                               </div>
    //                               <div class="amenity-text">Charging Point</div>
    //                           </div>
                              
    //                           <div class="amenity-item">
    //                               <div class="amenity-icon">
    //                                   <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    //                                       <rect x="2" y="6" width="20" height="12" rx="2" ry="2"></rect>
    //                                       <line x1="2" y1="12" x2="22" y2="12"></line>
    //                                   </svg>
    //                               </div>
    //                               <div class="amenity-text">Blanket</div>
    //                           </div>
                              
    //                           <div class="amenity-item">
    //                               <div class="amenity-icon">
    //                                   <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    //                                       <circle cx="12" cy="12" r="10"></circle>
    //                                       <circle cx="12" cy="12" r="4"></circle>
    //                                       <line x1="4.93" y1="4.93" x2="9.17" y2="9.17"></line>
    //                                       <line x1="14.83" y1="14.83" x2="19.07" y2="19.07"></line>
    //                                       <line x1="14.83" y1="9.17" x2="19.07" y2="4.93"></line>
    //                                       <line x1="14.83" y1="9.17" x2="18.36" y2="5.64"></line>
    //                                       <line x1="4.93" y1="19.07" x2="9.17" y2="14.83"></line>
    //                                   </svg>
    //                               </div>
    //                               <div class="amenity-text">Live Tracking</div>
    //                           </div>
                              
    //                           <div class="amenity-item">
    //                               <div class="amenity-icon">
    //                                   <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    //                                       <path d="M8 3v4a2 2 0 0 1-2 2H3"></path>
    //                                       <path d="M21 8V6a2 2 0 0 0-2-2H8"></path>
    //                                       <path d="M3 10v10a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V10"></path>
    //                                       <rect x="8" y="14" width="8" height="6" rx="1"></rect>
    //                                   </svg>
    //                               </div>
    //                               <div class="amenity-text">Emergency Toilet</div>
    //                           </div>
    //                       </div>
    //                   </div>
    //               </div>
    //           </div>
              
    //           <div id="photos" class="content-section ">
    //               <div class="placeholder-content ">
    //                 <div class="owl-carousel owl-theme ">
    //                   <div class="item">
    //                       <img src="./image/u_images/buslist_slider1.png" alt="" />
    //                   </div>
    //                   <div class="item"> <img src="./image/u_images/buslist_slider2.png" alt="" /></div>
    //                   <div class="item"><img src="./image/u_images/buslist_slider3.png" alt="" /></div>
    //                   <div class="item"><img src="./image/u_images/buslist_slider1.png" alt="" /></div>
    //               </div>
    //               </div>
    //           </div>
              
    //           <div id="pickup" class="content-section">
    //               <div class="placeholder-content">
    //                 <div class="pickup-dropoff-container">
    //                   <div class="points-grid">
    //                       <div class="pickup-section text-start">
    //                           <h2 class="section-title">Pick up Point</h2>
    //                           <div class="point-list">
    //                               <div class="point-item">
    //                                   <div class="point-time">10:00</div>
    //                                   <div class="point-location">Navjivan Hotel</div>
    //                               </div>
    //                               <div class="point-item">
    //                                   <div class="point-time">11:00</div>
    //                                   <div class="point-location">Katargam, Unapani Road</div>
    //                               </div>
    //                               <div class="point-item">
    //                                   <div class="point-time">01:00</div>
    //                                   <div class="point-location">Kiram Hospital, Nanigam Circle</div>
    //                               </div>
    //                               <div class="point-item">
    //                                   <div class="point-time">05:00</div>
    //                                   <div class="point-location">Savera Complex, Udhana</div>
    //                               </div>
    //                               <div class="point-item">
    //                                   <div class="point-time">08:00</div>
    //                                   <div class="point-location">Navjivan Hotel</div>
    //                               </div>
    //                           </div>
    //                       </div>          
    //                       <div class="dropoff-section text-start">
    //                           <h2 class="section-title">Drop off Point</h2>
    //                           <div class="point-list">
    //                               <div class="point-item">
    //                                   <div class="point-time">10:00</div>
    //                                   <div class="point-location">Valiya Chokdi Ashirwad Hotel</div>
    //                               </div>
    //                               <div class="point-item">
    //                                   <div class="point-time">10:00</div>
    //                                   <div class="point-location">Valiya Chokdi Ashirwad Hotel</div>
    //                               </div>
    //                               <div class="point-item">
    //                                   <div class="point-time">10:00</div>
    //                                   <div class="point-location">Valiya Chokdi Ashirwad Hotel</div>
    //                               </div>
    //                           </div>
    //                       </div>
    //                   </div>
    //               </div>
    //               </div>
    //           </div>
              
    //           <div id="reviews" class="content-section">
    //               <div class="placeholder-content">
    //                 <div class="reviews-grid">
    //                   <div class="rating-summary">
    //                       <div class="overall-rating">
    //                           <span class="star">★</span>
    //                           <span class="rating-number">4.5</span>
    //                           <span class="rating-text">Rating</span>
    //                       </div>
    //                       <div class="category-ratings">
    //                           <h4>People like</h4>
    //                           <div class="rating-item">
    //                               <span class="category">Bus quality</span>
    //                               <div class="rating-value">
    //                                   <span class="star">★</span>
    //                                   <span>3.5</span>
    //                               </div>
    //                           </div>
    //                           <div class="rating-item">
    //                               <span class="category">Driving</span>
    //                               <div class="rating-value">
    //                                   <span class="star">★</span>
    //                                   <span>4.0</span>
    //                               </div>
    //                           </div>
    //                           <div class="rating-item">
    //                               <span class="category">Seat comfort</span>
    //                               <div class="rating-value">
    //                                   <span class="star">★</span>
    //                                   <span>3.0</span>
    //                               </div>
    //                           </div>
    //                           <div class="rating-item">
    //                               <span class="category">Safety and hygiene</span>
    //                               <div class="rating-value">
    //                                   <span class="star">★</span>
    //                                   <span>4.1</span>
    //                               </div>
    //                           </div>
    //                           <div class="rating-item">
    //                               <span class="category">Cleanliness</span>
    //                               <div class="rating-value">
    //                                   <span class="star">★</span>
    //                                   <span>3.2</span>
    //                               </div>
    //                           </div>
    //                           <a href="#" class="show-more">Show More</a>
    //                       </div>
    //                   </div>
    //                   <div class="user-reviews">
    //                       <div class="review-card">
    //                           <div class="review-header">
    //                               <div class="user-info">
    //                                   <img src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-aw6GYkNqBu9RHKV6YRCYTefLhtSz9r.png" alt="Johan Kumar" class="avatar">
    //                                   <div class="user-details text-start">
    //                                       <h4>Johan Kumar</h4>
    //                                       <span class="review-date">12 Jun 2024</span>
    //                                   </div>
    //                               </div>
    //                               <div class="star-rating">
    //                                   <span class="star filled">★</span>
    //                                   <span class="star filled">★</span>
    //                                   <span class="star filled">★</span>
    //                                   <span class="star">★</span>
    //                                   <span class="star">★</span>
    //                               </div>
    //                           </div>
    //                           <p class="review-text">
    //                               Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lm Ipsum is simply dummy text of the printing and typesetting industry.
    //                           </p>
    //                       </div> 
    //                       <div class="review-card">
    //                           <div class="review-header">
    //                               <div class="user-info">
    //                                   <img src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-aw6GYkNqBu9RHKV6YRCYTefLhtSz9r.png" alt="Johan Kumar" class="avatar">
    //                                   <div class="user-details text-start">
    //                                       <h4>Johan Kumar</h4>
    //                                       <span class="review-date">12 Jun 2024</span>
    //                                   </div>
    //                               </div>
    //                               <div class="star-rating">
    //                                   <span class="star filled">★</span>
    //                                   <span class="star filled">★</span>
    //                                   <span class="star filled">★</span>
    //                                   <span class="star">★</span>
    //                                   <span class="star">★</span>
    //                               </div>
    //                           </div>
    //                           <p class="review-text">
    //                               Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lm Ipsum is simply dummy text of the printing and typesetting industry.
    //                           </p>
    //                       </div>
    //                       <a href="#" class="show-more">Show More</a>
    //                   </div>
    //               </div>
    //               </div>
    //           </div>

    //           <div id="selectseat" class="content-section">
    //             <div class="placeholder-content">
    //               <div class="seats-container">
    //                 <div class="legend">
    //                   <div class="legend-item">
    //                     <input type="checkbox" class="legend-box available"/>
    //                     <span>Available</span>
    //                   </div>
    //                   <div class="legend-item">
    //                     <input type="checkbox" class="legend-box booked"/>
    //                     <span>Booked</span>
    //                   </div>
    //                   <div class="legend-item">
    //                     <input type="checkbox" class="legend-box selected"/>
    //                     <span>Selected</span>
    //                   </div>
    //                 </div>
                    
    //                 <div class="seat-selection">
    //                   <div class="seat-section">
    //                     <div class="section-title">
    //                       Lower Seat
    //                       <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    //                         <circle cx="12" cy="12" r="10"></circle>
    //                         <circle cx="12" cy="12" r="4"></circle>
    //                         <line x1="4.93" y1="4.93" x2="9.17" y2="9.17"></line>
    //                         <line x1="14.83" y1="14.83" x2="19.07" y2="19.07"></line>
    //                         <line x1="14.83" y1="9.17" x2="19.07" y2="4.93"></line>
    //                         <line x1="4.93" y1="19.07" x2="9.17" y2="14.83"></line>
    //                       </svg>
    //                     </div>
                        
    //                     <div class="seat-grid">
    //                       <div class="seat booked booked-seat"></div>
    //                       <div class="seat"></div>
    //                       <div class="seat booked booked-seat"></div>
                          
    //                       <div class="seat"></div>
    //                       <div class="seat"></div>
    //                       <div class="seat"></div>
                          
    //                       <div class="seat booked booked-seat"></div>
    //                       <div class="seat booked booked-seat"></div>
    //                       <div class="seat booked booked-seat"></div>
                          
    //                       <div class="seat booked booked-seat"></div>
    //                       <div class="seat"></div>
    //                       <div class="seat booked booked-seat"></div>
                          
    //                       <div class="seat"></div>
    //                       <div class="seat booked booked-seat"></div>
    //                       <div class="seat"></div>
                          
    //                       <div class="seat"></div>
    //                       <div class="seat"></div>
    //                       <div class="seat booked booked-seat"></div>
    //                     </div>
    //                   </div>
                      
    //                   <div class="seat-section">
    //                     <div class="section-title">
    //                       Upper Seat
    //                     </div>
                        
    //                     <div class="seat-grid">
    //                       <div class="seat"></div>
    //                       <div class="seat booked booked-seat"></div>
    //                       <div class="seat"></div>
                          
    //                       <div class="seat booked booked-seat"></div>
    //                       <div class="seat booked booked-seat"></div>
    //                       <div class="seat"></div>
                          
    //                       <div class="seat booked booked-seat"></div>
    //                       <div class="seat booked booked-seat"></div>
    //                       <div class="seat"></div>
                          
    //                       <div class="seat booked booked-seat"></div>
    //                       <div class="seat booked booked-seat"></div>
    //                       <div class="seat booked booked-seat"></div>
                          
    //                       <div class="seat booked booked-seat"></div>
    //                       <div class="seat booked booked-seat"></div>
    //                       <div class="seat"></div>
                          
    //                       <div class="seat"></div>
    //                       <div class="seat"></div>
    //                       <div class="seat"></div>
    //                     </div>
    //                   </div>

    //                   <div class="sidebar">
    //                     <div class="tabs">
    //                       <div class="tab active">Pick Up Point</div>
    //                       <div class="tab">Drop Off Point</div>
    //                     </div>
                        
    //                     <div class="stops-list">
    //                       <div class="stop-item">
    //                         <div class="stop-info">
    //                           <div class="stop-time">10:00 AM</div>
    //                           <div class="stop-location">Shyamdham Mandir, Jakatnaka</div>
    //                         </div>
    //                         <input type="radio" class="radio-button selected"/>
    //                       </div>
                          
    //                       <div class="stop-item">
    //                         <div class="stop-info">
    //                           <div class="stop-time">11:00 AM</div>
    //                           <div class="stop-location">Pasodara Patiya, Pasodara</div>
    //                         </div>
    //                         <input type="radio" class="radio-button"/>
    //                       </div>
                          
    //                       <div class="stop-item">
    //                         <div class="stop-info">
    //                           <div class="stop-time">11:30 AM</div>
    //                           <div class="stop-location">Laskana Gam, Laskana</div>
    //                         </div>
    //                         <input type="radio" class="radio-button"/>
    //                       </div>
                          
    //                       <div class="stop-item">
    //                         <div class="stop-info">
    //                           <div class="stop-time">12:10 AM</div>
    //                           <div class="stop-location">Kamrej Under Bridge, Kamrej</div>
    //                         </div>
    //                         <input type="radio" class="radio-button"/>
    //                       </div>
                          
    //                       <div class="stop-item">
    //                         <div class="stop-info">
    //                           <div class="stop-time">01:00 AM</div>
    //                           <div class="stop-location">Raj Hotel, Kmarej Highway</div>
    //                         </div>
    //                         <input type="radio" class="radio-button"/>
    //                       </div>
    //                     </div>
                        
    //                     <div class="booking-summary">
    //                       <div class="summary-title">Selected Seats</div>
    //                       <div class="no-seats">No Seats Selected</div>
                          
    //                       <button class="continue-btn">Continue</button>
    //                     </div>
    //                   </div>
    //                 </div>
    //               </div>
    //             </div>
    //           </div>
    //     `
    //   )
    //   .join("");

    document.getElementById("buslist").innerHTML = buslistHtml;
  } catch (error) {
    console.error("Error loading bus listings:", error);
  }
}

document.addEventListener("DOMContentLoaded", function () {
  const tabs = document.querySelectorAll(".link");
  const contentSections = document.querySelectorAll(".content-section");
  function showTab(tabId) {
    contentSections.forEach((section) => {
      section.classList.remove("active");
    });
    tabs.forEach((tab) => {
      tab.classList.remove("active");
    });
    document.getElementById(tabId).classList.add("active");
    document.querySelector(`[data-tab="${tabId}"]`).classList.add("active");
  }
  tabs.forEach((tab) => {
    tab.addEventListener("click", function (e) {
      e.preventDefault();
      const tabId = this.getAttribute("data-tab");
      showTab(tabId);
    });
  });
  showTab("policies");
});
