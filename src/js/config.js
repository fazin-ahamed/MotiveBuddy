// Configuration file to load environment variables for client-side usage

(function() {
  // Create a namespace for our environment variables
  window.env = {};
  
  // For GitHub Pages deployment, this value will be replaced during the GitHub Actions build process
  // The placeholder will be replaced with the actual secret from GitHub repository
  window.env.OPENROUTER_API_KEY = '__OPENROUTER_API_KEY__';
  
  console.log('Environment configuration loaded');
})();
