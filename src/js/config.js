// Configuration file to load environment variables for client-side usage

(function() {
  // Create a namespace for our environment variables
  window.env = {};
  
  // For GitHub Pages deployment, this value will be replaced during the GitHub Actions build process
  // The placeholder will be replaced with the actual secret from GitHub repository
  const apiKey = '__OPENROUTER_API_KEY__';
  
  // Check if the placeholder was properly replaced during deployment
  if (apiKey === '__OPENROUTER_API_KEY__') {
    console.error('Error: API key placeholder was not replaced during deployment.');
    console.error('Make sure the GitHub Actions workflow is correctly configured to replace the placeholder.');
    window.env.OPENROUTER_API_KEY = null;
  } else {
    window.env.OPENROUTER_API_KEY = apiKey;
  }
  
  console.log('Environment configuration loaded');
})();
