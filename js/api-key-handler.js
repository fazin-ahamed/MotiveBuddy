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
        if (window.env && window.env.OPENROUTER_API_KEY) {
          // Store securely
          storeSecureCredentials(window.env);
        }
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
      
      if (!credentials) return {};
      
      if (service === 'openrouter') {
        // Return authentication headers for OpenRouter
        return { 
          'Authorization': `Bearer ${credentials.OPENROUTER_API_KEY}` 
        };
      }
      
      return {};
    } catch (e) {
      console.error("Error generating auth headers", e);
      return {};
    }
  };
  
  // Expose a secure method to check if credentials exist
  window.secureAccess.hasCredentials = (service) => {
    try {
      const credentials = getSecureCredentials();
      if (!credentials) return false;
      
      if (service === 'openrouter') {
        return !!credentials.OPENROUTER_API_KEY;
      }
      
      return false;
    } catch (e) {
      return false;
    }
  };
  
  // Initialize on load
  secureStorageInit();
  
  // Add listener for config data changes
  document.addEventListener('config-loaded', (e) => {
    if (e.detail && e.detail.config) {
      storeSecureCredentials(e.detail.config);
    }
  });
})();
