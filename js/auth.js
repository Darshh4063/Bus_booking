class AuthService {
  constructor(baseUrl = "http://localhost:3000") {
    this.baseUrl = baseUrl;
    this.defaultProfileImage =
      "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png";
  }

  // Login with phone and OTP
  async login(phone, otp) {
    try {
      // Fetch user with matching phone number
      const response = await fetch(`${this.baseUrl}/user?phone=${phone}`);
      if (!response.ok) {
        throw new Error("Server connection failed");
      }

      const users = await response.json();

      if (users.length === 0) {
        return { success: false, message: "User not found" };
      }

      const user = users[0];

      // Verify OTP
      if (user.otp !== otp) {
        return { success: false, message: "Invalid OTP" };
      }

      // Prepare complete user data for localStorage
      const userData = {
        id: user.id,
        name: user.name || "",
        email: user.email || "",
        phone: user.phone || "",
        password: user.password || "",
        profileImage: user.image || this.defaultProfileImage,
        gender: user.gender || "",
        dateOfBirth: user.dateOfBirth || "",
        address: user.address || "-",
        city: user.city || "-",
        state: user.state || "-",
        pincode: user.pincode || "-",
        createdAt: user.createdAt || new Date().toISOString(),
        lastLogin: new Date().toISOString(),
      };

      // Store complete user info in localStorage
      localStorage.setItem("currentUser", JSON.stringify(userData));
      console.log("Login successful:", userData);

      // Update last login time on the server
      this.updateProfile(user.id, { lastLogin: userData.lastLogin }).catch(
        (err) => console.error("Failed to update last login time:", err)
      );

      return { success: true, user: userData };
    } catch (error) {
      console.error("Login error:", error);
      return { success: false, message: "Login failed: " + error.message };
    }
  }

  // Register new user
  async register(userData) {
    try {
      alert("Registering");
      // Check if user already exists
      const existingUserResponse = await fetch(
        `${this.baseUrl}/user?phone=${userData.phone}`
      );
      const existingUsers = await existingUserResponse.json();

      if (existingUsers.length > 0) {
        return { success: false, message: "Phone number already registered" };
      }

      // Generate OTP
      const otp = Math.floor(1000 + Math.random() * 9000).toString();

      // Prepare complete user data
      const newUser = {
        id: Math.random().toString(36).substr(2, 6),
        name: userData.name || "",
        email: userData.email || "",
        phone: userData.phone || "",
        password: userData.password || "",
        image: userData.profileImage || this.defaultProfileImage,
        gender: userData.gender || "",
        dateOfBirth: userData.dateOfBirth || "",
        address: userData.address || "",
        city: userData.city || "",
        state: userData.state || "",
        pincode: userData.pincode || "",
        otp: otp,
        createdAt: new Date().toISOString(),
        lastLogin: new Date().toISOString(),
      };

      // Create new user
      const response = await fetch(`${this.baseUrl}/user`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newUser),
      });

      if (!response.ok) {
        throw new Error("Registration failed");
      }

      const user = await response.json();

      // Store complete user info in localStorage with password included
      localStorage.setItem(
        "currentUser",
        JSON.stringify({
          ...newUser,
          profileImage: newUser.image,
        })
      );

      return {
        success: true,
        user: newUser,
        message: `Registration successful! Your OTP is ${otp}`,
      };
    } catch (error) {
      console.error("Registration error:", error);
      return {
        success: false,
        message: "Registration failed: " + error.message,
      };
    }
  }

  // Update user profile
  async updateProfile(userId, updatedData) {
    try {
      // Get current user data from server
      const response = await fetch(`${this.baseUrl}/user/${userId}`);
      if (!response.ok) {
        throw new Error("Failed to fetch user data");
      }

      const userData = await response.json();

      // Prepare updated user data
      const updatedUser = {
        ...userData,
        ...updatedData,
      };

      // Update user in backend
      const updateResponse = await fetch(`${this.baseUrl}/user/${userId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updatedData), // Only send the changed fields
      });

      if (!updateResponse.ok) {
        throw new Error("Failed to update profile");
      }

      // If the user is logged in, update localStorage
      const currentUser = this.getCurrentUser();
      if (currentUser && currentUser.id === userId) {
        localStorage.setItem(
          "currentUser",
          JSON.stringify({
            ...currentUser,
            ...updatedData,
            profileImage: updatedData.image || currentUser.profileImage,
            password: currentUser.password || "",
          })
        );
      }

      return { success: true, user: updatedUser };
    } catch (error) {
      console.error("Update profile error:", error);
      return {
        success: false,
        message: "Failed to update profile: " + error.message,
      };
    }
  }

  // Update profile image
  async updateProfileImage(userId, imageData, imageName) {
    try {
      // Update the image field on the server
      const result = await this.updateProfile(userId, { image: imageData });

      if (!result.success) {
        throw new Error(result.message || "Failed to update profile image");
      }

      // Update the local storage
      const currentUser = this.getCurrentUser();
      if (currentUser && currentUser.id === userId) {
        currentUser.profileImage = imageData;
        localStorage.setItem("currentUser", JSON.stringify(currentUser));
      }

      return {
        success: true,
        message: "Profile image updated successfully",
        imageData: imageData,
        imageName: imageName,
      };
    } catch (error) {
      console.error("Update profile image error:", error);
      return {
        success: false,
        message: "Failed to update profile image: " + error.message,
      };
    }
  }

  // Check if user is logged in
  isLoggedIn() {
    return localStorage.getItem("currentUser") !== null;
  }

  // Logout user
  logout() {
    // window.location.replace("/home.html");
    localStorage.removeItem("currentUser");
    window.location.href = "Home.html";
  }

  // Get current user
  getCurrentUser() {
    const userStr = localStorage.getItem("currentUser");
    return userStr ? JSON.parse(userStr) : null;
  }
}

// Initialize auth service
const authService = new AuthService();
export default authService;
