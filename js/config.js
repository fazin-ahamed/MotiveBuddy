// Configuration file to load environment variables for client-side usage

(function() {
  // Create a namespace for our environment variables
  window.env = {};
  
  // For GitHub Pages deployment, this value will be replaced during the GitHub Actions build process
  // The placeholder will be replaced with the actual secret from GitHub repository
  window.env.OPENROUTER_API_KEY = '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';
  
  console.log('Environment configuration loaded');
})();
