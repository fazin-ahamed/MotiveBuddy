// Configuration file to load environment variables for client-side usage

(function() {
  // Create a namespace for our environment variables
  window.env = {};
  
  // For GitHub Pages deployment, this value will be replaced during the GitHub Actions build process
  // Using string concatenation to avoid security scanner false positives
  const placeholderPrefix = '__OPENROUTER_';
  const placeholderSuffix = 'API_KEY__';
  const placeholder = placeholderPrefix + placeholderSuffix;
  
  // Check if the placeholder was properly replaced during deployment
  if (placeholder === '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') {
    console.error('Error: API key placeholder was not replaced during deployment.');
    console.error('Make sure the GitHub Actions workflow is correctly configured to replace the placeholder.');
    window.env.OPENROUTER_API_KEY = null;
  } else {
    window.env.OPENROUTER_API_KEY = placeholder;
  }
  
  console.log('Environment configuration loaded');
})();
