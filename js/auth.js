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
        profileImage: user.image || this.defaultProfileImage,
        gender: user.gender || "",
        dateOfBirth: user.dateOfBirth || "",
        address:
          user.address ||
          "-", // Default address
        city: user.city || "-", // Default city
        state: user.state || "-", // Default state
        pincode: user.pincode || "-", // Default pincode
        createdAt: user.createdAt || new Date().toISOString(),
        lastLogin: new Date().toISOString(),
        gender: user.gender || "",
      };

      // Store complete user info in localStorage
      localStorage.setItem("currentUser", JSON.stringify(userData));
      console.log("Login successful:", userData);

      return { success: true, user: userData };
    } catch (error) {
      console.error("Login error:", error);
      return { success: false, message: "Login failed" };
    }
  }

  // Register new user
  async register(userData) {
    try {
      // Check if user already exists
      const existingUserResponse = await fetch(
        `${this.baseUrl}/user?phone=${userData.phone}`
      );
      const existingUsers = await existingUserResponse.json();

      if (existingUsers.length > 0) {
        return { success: false, message: "Phone number already registered" };
      }

      // Prepare complete user data
      const newUser = {
        id: Math.random().toString(36).substr(2, 6),
        name: userData.name || "",
        email: userData.email || "",
        phone: userData.phone || "",
        password: userData.password || "",
        profileImage: userData.profileImage || this.defaultProfileImage,
        gender: userData.gender || "",
        dateOfBirth: userData.dateOfBirth || "",
        address:
          userData.address ||
          "D-502, Ravi Nagar, Junction of Milan Subway & SV Road, Santa Cruz (W)", // Default address
        city: userData.city || "Mumbai", // Default city
        state: userData.state || "Maharashtra", // Default state
        pincode: userData.pincode || "400001", // Default pincode
        otp: Math.floor(1000 + Math.random() * 9000).toString(),
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

      // Store complete user info in localStorage
      localStorage.setItem("currentUser", JSON.stringify(newUser));

      return {
        success: true,
        user: newUser,
        message: `Registration successful! Your OTP is ${newUser.otp}`,
      };
    } catch (error) {
      console.error("Registration error:", error);
      return { success: false, message: "Registration failed" };
    }
  }

  // Update user profile
  async updateProfile(userId, updatedData) {
    try {
      const currentUser = this.getCurrentUser();
      if (!currentUser)
        return { success: false, message: "User not logged in" };

      // Merge current user data with updates
      const updatedUser = {
        ...currentUser,
        ...updatedData,
        lastUpdated: new Date().toISOString(),
      };

      // Update user in backend
      const response = await fetch(`${this.baseUrl}/user/${userId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updatedUser),
      });

      if (!response.ok) {
        throw new Error("Failed to update profile");
      }

      // Update local storage
      localStorage.setItem("currentUser", JSON.stringify(updatedUser));

      return { success: true, user: updatedUser };
    } catch (error) {
      console.error("Update profile error:", error);
      return { success: false, message: "Failed to update profile" };
    }
  }

  // Update profile image
  async updateProfileImage(userId, imageUrl) {
    return this.updateProfile(userId, { profileImage: imageUrl });
  }

  // Check if user is logged in
  isLoggedIn() {
    return localStorage.getItem("currentUser") !== null;
  }

  // Logout user
  logout() {
    localStorage.removeItem("currentUser");
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
