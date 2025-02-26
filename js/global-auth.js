// File: global-auth.js
// Add this script to any page where you need authentication

(function () {
  // Check if JSON Server is running
  async function checkServer() {
    try {
      const response = await fetch("http://localhost:3000/user");
      return response.ok;
    } catch (error) {
      console.error("JSON Server is not running:", error);
      return false;
    }
  }

  // Function to dynamically load scripts in sequence
  async function loadScripts() {
    const scripts = ["./js/auth.js", "./js/auth-integration.js", "./js/OTP.js"];

    for (const src of scripts) {
      await new Promise((resolve, reject) => {
        const script = document.createElement("script");
        script.type = src.endsWith(".js") ? "module" : "text/javascript";
        script.src = src;
        script.onload = resolve;
        script.onerror = reject;
        document.head.appendChild(script);
      });
    }
  }

  // Initialize authentication on page load
  document.addEventListener("DOMContentLoaded", async function () {
    const serverRunning = await checkServer();

    if (!serverRunning) {
      console.error(
        "JSON Server is not running. Authentication will not work properly."
      );
      console.log( "Authentication server is not available. Please start JSON Server.");
    
      return;
    }

    try {
      await loadScripts();

      // Initialize auth system once scripts are loaded
      if (window.authService) {
        if (window.authService.isLoggedIn()) {
          const user = window.authService.getCurrentUser();
          if (window.updateUIForLoggedInUser) {
            window.updateUIForLoggedInUser(user);
          }
        }

        if (window.initAuthListeners) {
          window.initAuthListeners();
        }
      }
    } catch (error) {
      console.error("Error initializing authentication:", error);
    }
  });
})();
