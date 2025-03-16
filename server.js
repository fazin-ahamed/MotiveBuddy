import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Serve static files from the src directory
app.use(express.static(path.join(__dirname, 'src')));

// API endpoint to securely provide environment variables to the client
app.get('/api/env-config', (req, res) => {
  // Only expose specific environment variables that are needed client-side
  res.json({
    OPENROUTER_API_KEY: process.env.OPENROUTER_API_KEY
  });
});

// All other GET requests not handled before will return the index.html
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'src', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
