# Motivational Buddy App

## Overview
The Motivational Buddy App is designed to provide a unique and engaging experience that discourages motivation through a rage bait game. Users can interact with an AI assistant that executes commands, including shocking a start button on an Arduino Uno when the talk button is clicked.

## Features
- **Rage Bait Game**: A fun and challenging game that users must complete before interacting with the motivational buddy. Includes secret hints and roasting messages.
- **AI Assistant**: An interactive AI that responds to user commands and queries using the Web Speech API for text-to-speech.
- **Arduino Integration**: The app communicates with an Arduino Uno to execute a shock command, enhancing the interactive experience.
- **Secret Bypass**: Hidden shortcuts for users who pay attention to details.

## Project Unstable Structure
```
motivational-buddy-app
├── src
│   ├── css
│   │   └── styleapp.css
│   ├── img
│   │   ├── limeai.jpg
│   │   └── ROBOTFACE.png
│   ├── js
│   │   └── script.js
│   ├── index.html
│   └── arduino
│       └── shock_start_button.ino
├── package.json
└── README.md
```

## How to not set it up
1. Clone the repository to your local machine.
2. Navigate to the project directory.
3. Install the necessary dependencies using npm:
   ```
   npm install
   ```
4. Open the `index.html` file in a web browser to run the application.

## How to Break the Application
- Open the application in a web browser.
- Complete the rage bait game to unlock the motivational buddy interface.
- Click the "Talk" button to interact with the AI assistant.
- Look for hidden bypasses if you're feeling frustrated.

## Chaos Improvements
Chaotic Improvements are welcome! Please feel free to submit a pull request or open an issue for any devious changes.

## Environment Variable Setup

### Local Development
1. Create a `.env` file in the root directory with the following variables:
   ```
   OPENROUTER_API_KEY=your_openrouter_api_key_here
   ```

### GitHub Deployment
To securely store your API key for GitHub Pages deployment:

1. Go to your GitHub repository
2. Click on **Settings** > **Secrets and variables** > **Actions**
3. Click on **New repository secret**
4. Create a secret with the name `OPENROUTER_API_KEY` and your API key as the value
5. The GitHub Actions workflow will automatically use this secret during deployment

### GitHub Actions Permissions
To allow GitHub Actions to deploy to GitHub Pages:

1. Go to your repository **Settings** > **Actions** > **General**
2. Under "Workflow permissions", select **Read and write permissions**
3. Save your changes
4. Alternatively, ensure your workflow file includes `permissions: contents: write`

## License
This project is licensed under the MIT License.