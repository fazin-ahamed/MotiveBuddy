/**
 * Simple Groq API Key Handler
 * A basic approach to store and use Groq API key
 */

// Create global namespace for API handling
window.apiHandler = {
  // Store API key
  setGroqKey: function(key) {
    if (key && typeof key === 'string') {
      localStorage.setItem('groq_api_key', key);
      console.log('Groq API key stored successfully');
      return true;
    }
    return false;
  },
  
  // Get API key
  getGroqKey: function() {
    return localStorage.getItem('groq_api_key');
  },
  
  // Check if key exists
  hasGroqKey: function() {
    return !!localStorage.getItem('groq_api_key');
  },
  
  // Get authorization headers
  getGroqHeaders: function() {
    const key = this.getGroqKey();
    if (key) {
      return { 'Authorization': `Bearer ${key}` };
    }
    return {};
  }
};

// Helper for development
if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
  console.log("%cSimple Groq API Setup", "font-size: 16px; font-weight: bold; color: blue;");
  console.log("%cTo set your Groq API key, run:", "font-weight: bold;");
  console.log("%capiHandler.setGroqKey('your-groq-api-key-here')", "background-color: #f0f0f0; padding: 5px; border-radius: 3px;");
  
  // Add test function
  window.testGroqKey = function() {
    const hasKey = window.apiHandler.hasGroqKey();
    console.log(`Groq API key available: ${hasKey}`);
    if (hasKey) {
      const headers = window.apiHandler.getGroqHeaders();
      console.log("Auth headers:", headers);
      return headers && headers.Authorization && headers.Authorization.length > 20;
    }
    return false;
  };
}

// Try to load key from config if available
document.addEventListener('DOMContentLoaded', function() {
  if (window.env && window.env.GROQ_API_KEY) {
    window.apiHandler.setGroqKey(window.env.GROQ_API_KEY);
  }
});
