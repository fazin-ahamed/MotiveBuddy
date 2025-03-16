// Configuration file to load environment variables for client-side usage
// This approach keeps API keys out of the client-side code directly

(function() {
  // Create a namespace for our environment variables
  window.env = {};
  
  // In production, these values would be injected during the build process
  // by reading from actual environment variables
  
  // Load the API key from environment variables
  // For GitHub Pages deployment, these would be set in the repository settings
  // For local development, these might be served by a small server-side component
  
  // This function fetches environment variables from a server endpoint
  async function loadEnvironmentVariables() {
    try {
      const response = await fetch('/api/env-config');
      if (response.ok) {
        const config = await response.json();
        window.env = config;
        console.log('Environment configuration loaded');
      } else {
        console.warn('Failed to load environment configuration');
      }
    } catch (error) {
      console.error('Error loading environment configuration:', error);
    }
  }
  
  // For development fallback only - REMOVE IN PRODUCTION
  window.env.OPENROUTER_API_KEY = 'OPENROUTER_API_KEY';
  
  // Try to load real env variables
  loadEnvironmentVariables();
})();
