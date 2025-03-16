/**
 * Secure API Key Handler
 * This file manages secure access to API keys without directly referencing them in code
 */

(function() {
  // Create a secure namespace 
  window.secureAccess = {};
  
  // Initialize secure storage
  const secureStorageInit = () => {
    try {
      // Check if we have secure values in localStorage as encrypted data
      if (!localStorage.getItem('secure_credentials')) {
        // If running in development, try to get from environment
        if (window.env && window.env.GROQ_API_KEY) {
          // Store securely
          storeSecureCredentials(window.env);
          return true;
        }
        return false;
      }
      return true;
    } catch (e) {
      console.error("Error initializing secure storage:", e);
      return false;
    }
  };
  
  // Simple obfuscation (not true encryption but adds a layer of obscurity)
  const obfuscate = (str) => {
    return btoa(
      encodeURIComponent(str).replace(/%([0-9A-F]{2})/g, (match, p1) => {
        return String.fromCharCode('0x' + p1);
      })
    );
  };
  
  const deobfuscate = (str) => {
    try {
      return decodeURIComponent(
        atob(str).split('').map(c => {
          return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join('')
      );
    } catch (e) {
      return '';
    }
  };
  
  // Store credentials securely
  const storeSecureCredentials = (credentials) => {
    try {
      const obfuscatedData = obfuscate(JSON.stringify(credentials));
      localStorage.setItem('secure_credentials', obfuscatedData);
      return true;
    } catch (e) {
      console.error("Failed to store credentials", e);
      return false;
    }
  };
  
  // Get credentials securely
  const getSecureCredentials = () => {
    try {
      const data = localStorage.getItem('secure_credentials');
      if (!data) return null;
      
      const deobfuscatedData = deobfuscate(data);
      return JSON.parse(deobfuscatedData);
    } catch (e) {
      console.error("Failed to retrieve credentials", e);
      return null;
    }
  };
  
  // Secure method to get authentication for API requests
  window.secureAccess.getAuthHeaders = (service) => {
    try {
      const credentials = getSecureCredentials();
      
      if (!credentials) {
        console.warn("No credentials found in secure storage");
        // Try direct access as fallback (less secure but helps during development)
        if (window.env && window.env.GROQ_API_KEY && service === 'groq') {
          return { 'Authorization': `Bearer ${window.env.GROQ_API_KEY}` };
        }
        return {};
      }
      
      if (service === 'groq') {
        // Return authentication headers for Groq
        return { 
          'Authorization': `Bearer ${credentials.GROQ_API_KEY}` 
        };
      }
      
      return {};
    } catch (e) {
      console.error("Error generating auth headers", e);
      // Emergency fallback for development
      if (window.env && window.env.GROQ_API_KEY && service === 'groq') {
        console.warn("Using emergency fallback auth from window.env");
        return { 'Authorization': `Bearer ${window.env.GROQ_API_KEY}` };
      }
      return {};
    }
  };
  
  // Expose a secure method to check if credentials exist
  window.secureAccess.hasCredentials = (service) => {
    try {
      const credentials = getSecureCredentials();
      if (!credentials) {
        // Try direct access as fallback
        if (window.env && window.env.GROQ_API_KEY && service === 'groq') {
          return true;
        }
        return false;
      }
      
      if (service === 'groq') {
        return !!credentials.GROQ_API_KEY;
      }
      
      return false;
    } catch (e) {
      // Emergency fallback check for development
      if (window.env && window.env.GROQ_API_KEY && service === 'groq') {
        return true;
      }
      return false;
    }
  };
  
  // Initialize on load
  const initialized = secureStorageInit();
  if (!initialized) {
    console.warn("Secure storage initialization failed, will retry when config is loaded");
  }
  
  // Add listener for config data changes
  document.addEventListener('config-loaded', (e) => {
    if (e.detail && e.detail.config) {
      const stored = storeSecureCredentials(e.detail.config);
      if (stored) {
        console.log("Credentials securely stored from config event");
      }
    }
  });
  
  // Add helper in development to check if API key is working
  if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    window.checkApiKey = function() {
      const hasKey = window.secureAccess.hasCredentials('groq');
      console.log(`API key available: ${hasKey}`);
      if (hasKey) {
        const headers = window.secureAccess.getAuthHeaders('groq');
        console.log("Auth headers:", headers);
        return headers && headers.Authorization && headers.Authorization.length > 20;
      }
      return false;
    };
  }
})();
