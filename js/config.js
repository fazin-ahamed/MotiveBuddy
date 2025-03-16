// Simple configuration file to load environment variables for client-side usage

(function() {
  // Create a namespace for our environment variables
  window.env = {};
  
  // For GitHub Pages deployment
  const placeholderPrefix = '__GROQ_';
  const placeholderSuffix = 'API_KEY__';
  const placeholder = placeholderPrefix + placeholderSuffix;
  
  // Check if the placeholder was properly replaced during deployment
  if (placeholder === '') {
    console.log('API key placeholder not replaced, checking for local development');
    
    // Try to load from localStorage if available
    const localApiKey = localStorage.getItem('groq_api_key');
    if (localApiKey) {
      console.log('Using API key from localStorage');
      window.env.GROQ_API_KEY = localApiKey;
    } else {
      console.log('No API key found. Please set one using apiHandler.setGroqKey()');
      window.env.GROQ_API_KEY = null;
    }
  } else {
    console.log('Using API key from deployment configuration');
    window.env.GROQ_API_KEY = placeholder;
  }
  
  console.log('Environment configuration loaded');
})();
