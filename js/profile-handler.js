// profile-handler.js
import authService from "./auth.js";

document.addEventListener("DOMContentLoaded", function () {
  // Check if user is logged in
  if (!authService.isLoggedIn()) {
    window.location.href = "Home.html";
    return;
  }

  // Get current user data
  const user = authService.getCurrentUser();

  // Populate user information
  populateUserProfile(user);

  // Handle profile image upload
  setupProfileImageUpload();

  // Handle logout
  setupLogout();
});

function populateUserProfile(user) {
  if (!user) return;

  // Update header user info
  const userInfoSpan = document.querySelector(".user-info span");
  if (userInfoSpan) {
    userInfoSpan.textContent = `Hi, ${user.name}`;
  }

  // Update profile image
  const profileImage = document.querySelector(".profile-image");
  if (profileImage) {
    profileImage.src = user.profileImage || authService.defaultProfileImage;
    console.log("Setting profile image src to:", user.profileImage);
  }

  // Format the gender value properly
  let formattedGender = user.gender || "-";
  // Capitalize first letter if gender exists
  if (formattedGender !== "-") {
    formattedGender =
      formattedGender.charAt(0).toUpperCase() +
      formattedGender.slice(1).toLowerCase();
  }

  // Define profile fields mapping
  const profileFields = {
    "Name :": user.name,
    "Email :": user.email,
    "Mobile No. :": user.phone,
    "Gender :": formattedGender,
    "Date of Birth :": user.dateOfBirth || "-",
    "Address :": user.address || "-",
    "City :": user.city || "-",
    "State :": user.state || "-",
    "Pin code :": user.pincode || "-",
  };

  // Update each field in the profile
  document.querySelectorAll(".profile-field").forEach((field) => {
    const label = field.querySelector("label");
    const value = field.querySelector("p");
    if (label && value) {
      const fieldName = label.textContent;
      if (profileFields.hasOwnProperty(fieldName)) {
        value.textContent = profileFields[fieldName];
      }
    }
  });

  // Populate edit form
  populateEditForm(user);
}

function setupProfileImageUpload() {
  const imageContainer = document.querySelector(".profile-image-container");
  const imageUploadIcon = imageContainer?.querySelector(".import-pro-img");
  const profileImage = document.querySelector(".profile-image");

  if (imageUploadIcon) {
    imageUploadIcon.addEventListener("click", () => {
      const input = document.createElement("input");
      input.type = "file";
      input.accept = "image/*";

      input.onchange = async (e) => {
        const file = e.target.files[0];
        if (file) {
          // Convert the file to base64 for storage
          const reader = new FileReader();
          reader.onload = async function (event) {
            const base64Image = event.target.result;
            const user = authService.getCurrentUser();

            if (!user) {
              alert("Error: User not logged in");
              return;
            }

            try {
              // Create a filename for the image
              const fileName = `profile_${user.id}_${Date.now()}.${file.name
                .split(".")
                .pop()}`;

              // Update the image on the server
              const result = await authService.updateProfileImage(
                user.id,
                base64Image,
                fileName
              );

              if (result.success) {
                // Update the image in the UI
                if (profileImage) {
                  profileImage.src = base64Image;
                }

                console.log("Profile image updated successfully!");
                console.log(
                  "Image data:",
                  base64Image.substring(0, 50) + "..."
                );

                alert("Profile image updated successfully!");
              } else {
                alert(result.message || "Failed to update profile image");
              }
            } catch (error) {
              console.error("Error updating profile image:", error);
              alert("An error occurred while updating the profile image.");
            }
          };

          reader.readAsDataURL(file);
        }
      };

      input.click();
    });
  }
}

function populateEditForm(user) {
  const form = document.querySelector("#editProfileModal form");
  if (!form) return;

  // Populate form fields
  const fieldMappings = {
    "#name": user.name,
    "#email": user.email,
    "#mobile": user.phone,
    "#address": user.address,
    "#city": user.city,
    "#state": user.state,
    "#pincode": user.pincode,
  };

  // Update each form field
  Object.entries(fieldMappings).forEach(([selector, value]) => {
    const input = form.querySelector(selector);
    if (input && value) {
      input.value = value;
    }
  });

  // Special handling for date of birth field
  const dobInput = form.querySelector("#dob");
  if (dobInput) {
    // Ensure correct date format (YYYY-MM-DD)
    if (user.dateOfBirth) {
      dobInput.value = user.dateOfBirth;
    }

    // Make sure the input has the correct attributes for the date picker
    dobInput.type = "date";
    dobInput.setAttribute("max", new Date().toISOString().split("T")[0]); // Set max date to today

    // Add event listener to handle date picker interaction
    dobInput.addEventListener("click", function () {
      // Force the date picker to open on click if needed
      this.showPicker();
    });
  }

  // Set gender if available
  if (user.gender) {
    const genderInput = form.querySelector(
      `input[name="gender"][id="${user.gender.toLowerCase()}"]`
    );
    if (genderInput) {
      genderInput.checked = true;
    }
  }

  // Handle form submission
  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const selectedGender = form.querySelector('input[name="gender"]:checked');

    // Create a JSON object with updated user data
    const updatedData = {
      name: form.querySelector("#name").value,
      email: form.querySelector("#email").value,
      phone: form.querySelector("#mobile").value,
      dateOfBirth: form.querySelector("#dob").value,
      address: form.querySelector("#address").value,
      city: form.querySelector("#city").value,
      state: form.querySelector("#state").value,
      pincode: form.querySelector("#pincode").value,
      gender: selectedGender ? selectedGender.id : "", // Use the id value
      lastUpdated: new Date().toISOString(),
    };

    // Log the JSON object to console for testing
    console.log("Updated profile data:", JSON.stringify(updatedData, null, 2));

    try {
      // Update profile on the server
      const result = await authService.updateProfile(user.id, updatedData);

      if (result.success) {
        // Refresh profile display
        populateUserProfile(authService.getCurrentUser());

        // Close modal
        const modal = bootstrap.Modal.getInstance(
          document.getElementById("editProfileModal")
        );
        if (modal) {
          modal.hide();
        }

        alert("Profile updated successfully!");
      } else {
        alert(result.message || "Failed to update profile");
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      alert("An error occurred while updating the profile.");
    }
  });

  // Add event listener to the update button
  const updateButton = document.querySelector(".k-updated");
  if (updateButton) {
    updateButton.addEventListener("click", () => {
      form.dispatchEvent(new Event("submit"));
    });
  }
}

// Add this function to your profile-handler.js
function initializeDatePicker() {
  const dobInput = document.querySelector("#editProfileModal #dob");
  if (dobInput) {
    // Ensure it has proper attributes
    dobInput.type = "date";
    dobInput.setAttribute("max", new Date().toISOString().split("T")[0]);

    // If there are browser compatibility issues, you might need to add:
    // This forces the date picker to show on iOS and some Android devices
    dobInput.setAttribute("onfocus", "(this.type='date')");
    dobInput.setAttribute("onblur", "(this.type='date')");
  }
}

// Then call this when the modal is shown
document.addEventListener("DOMContentLoaded", function () {
  const editProfileModal = document.getElementById("editProfileModal");
  if (editProfileModal) {
    editProfileModal.addEventListener("shown.bs.modal", function () {
      initializeDatePicker();
    });
  }
});

function setupLogout() {
  const logoutBtns = document.querySelectorAll('a[href="/logout"], .k-logout');
  logoutBtns.forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      authService.logout();
      window.location.href = "Home.html";
    });
  });
}
