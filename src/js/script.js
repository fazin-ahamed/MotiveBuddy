const btn = document.querySelector('.talk');
const content = document.querySelector('.content');
const rageGameSection = document.getElementById('rage-game');
const aboutSection = document.getElementById('about');
const gameMessageDiv = document.getElementById('game-message');
const startGameButton = document.getElementById('start-game');
const secretButton = document.getElementById('secret-button');
const textInputContainer = document.getElementById('text-input-container');
const textInput = document.getElementById('text-input');
const sendButton = document.getElementById('send-button');
const networkStatus = document.getElementById('network-status');
let gameCompleted = false;
let secretClickCount = 0;
let requiredHovers = Math.floor(Math.random() * 5) + 3; // Random number between 3-7
let hoverCount = 0;
let buttonCanBeClicked = false;
let useFallbackInput = false;

// Import Compromise for sentiment analysis - use global instead of import
let nlp;
try {
    // Try to use imported nlp if available
    if (window.nlp) {
        nlp = window.nlp;
        console.log("Compromise NLP loaded successfully");
    } else {
        // Fallback simple sentiment analysis
        nlp = {
            match: () => ({ found: false }),
            tokenize: () => ({ terms: [] })
        };
        console.warn("Compromise NLP not available from window.nlp, using fallback");
    }
} catch (e) {
    console.error("Error loading NLP:", e);
    // Fallback simple sentiment analysis
    nlp = {
        match: () => ({ found: false }),
        tokenize: () => ({ terms: [] })
    };
}

// Check network status initially
if (navigator.onLine) {
    networkStatus.textContent = 'Online mode - ready to crush your dreams in HD';
} else {
    document.body.classList.add('offline-mode');
    networkStatus.textContent = 'Offline mode - crushing your dreams in low quality';
}

// Check if the game has been previously completed (using cookies)
function checkGameCompletionStatus() {
    const hasCompletedGame = document.cookie.includes("rageGameCompleted=true");
    console.log("Game completion status:", hasCompletedGame);
    
    if (hasCompletedGame) {
        gameCompleted = true;
        if(rageGameSection) rageGameSection.style.display = 'none';
        if(aboutSection) aboutSection.style.display = 'flex';
    } else {
        if(rageGameSection) rageGameSection.style.display = 'block';
        if(aboutSection) aboutSection.style.display = 'none';
        
        // If we're on index.html but the game hasn't been completed, redirect to rage-game.html
        if(window.location.pathname.endsWith('index.html') || window.location.pathname === '/' || window.location.pathname === '') {
            console.log("Redirecting to rage game because game not completed yet");
            window.location.href = 'rage-game.html';
        }
    }
}

// Initialize section visibility on page load
document.addEventListener('DOMContentLoaded', checkGameCompletionStatus);

// Function to analyze sentiment in text
function analyzeSentiment(text) {
    try {
        const doc = nlp(text);
        
        // Check for specific emotional keywords
        if (doc.match && doc.match('(sad|depressed|unhappy|miserable)').found) {
            return 'sad';
        } else if (doc.match && doc.match('(angry|mad|furious|annoyed)').found) {
            return 'angry';
        } else if (doc.match && doc.match('(happy|excited|thrilled|glad)').found) {
            return 'cheerful';
        } else if (doc.match && doc.match('(scared|afraid|terrified|nervous)').found) {
            return 'fearful';
        } else if (doc.match && doc.match('(tired|exhausted|sleepy|fatigued)').found) {
            return 'unfriendly';
        } else {
            // Default sarcastic tone
            return 'unfriendly';
        }
    } catch (e) {
        console.error("Error analyzing sentiment:", e);
        return 'unfriendly';
    }
}

// Microsoft Azure Text-to-Speech with emotion support
function speakText(text, emotion) {
    // Always use browser speech synthesis since Azure credentials aren't available in browser
    const fallbackSpeech = new SpeechSynthesisUtterance(text);
    fallbackSpeech.volume = 1;
    fallbackSpeech.rate = 1;
    fallbackSpeech.pitch = 1;
    window.speechSynthesis.speak(fallbackSpeech);
}

// Secret button functionality
secretButton.addEventListener('click', () => {
    secretClickCount++;
    
    if (secretClickCount === 1) {
        secretButton.classList.add('clicked-once');
    } else if (secretClickCount === 2) {
        secretButton.classList.add('clicked-twice');
    } else if (secretClickCount === 3) {
        secretButton.classList.add('clicked-thrice');
    } else if (secretClickCount >= 4) {
        // Secret bypass activated
        completeGame();
        secretButton.textContent = "✓";
    }
});

// Text input fallback functionality
textInput.addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
        handleTextInput();
    }
});

sendButton.addEventListener('click', handleTextInput);

function handleTextInput() {
    const text = textInput.value.trim();
    if (text) {
        content.textContent = text;
        getAIResponse(text);
        textInput.value = '';
    }
}

// SpeechRecognition setup - simplified and more robust
let recognition;
let isListening = false;

function initializeSpeechRecognition(isRetry = false) {
    // Try multiple approaches to get SpeechRecognition
    const SpeechRecognition = window.SpeechRecognition || 
                             window.webkitSpeechRecognition || 
                             window.mozSpeechRecognition || 
                             window.msSpeechRecognition;
    
    if (!SpeechRecognition) {
        console.warn("Speech recognition not supported in this browser");
        if (!isRetry) showTextInputFallback();
        return false;
    }
    
    try {
        recognition = new SpeechRecognition();
        recognition.lang = 'en-US';
        recognition.continuous = false;
        recognition.interimResults = false;
        recognition.maxAlternatives = 1;
        
        // Add a timeout for recognition to avoid hanging
        let recognitionTimeout;
        
        recognition.onstart = function() {
            console.log('Speech recognition started');
            isListening = true;
            content.textContent = 'Listening...';
            content.classList.add('listening');
            btn.textContent = "I'm Listening...";
            
            // Set timeout to abort if nothing happens after 10 seconds
            recognitionTimeout = setTimeout(() => {
                try {
                    recognition.stop();
                } catch (e) {
                    console.error("Error stopping timed-out recognition:", e);
                }
            }, 10000);
        };
        
        recognition.onresult = function(event) {
            clearTimeout(recognitionTimeout);
            console.log('Speech recognition result received');
            const transcript = event.results[0][0].transcript;
            content.textContent = transcript;
            content.classList.remove('listening');
            btn.textContent = "Talk to Me";
            
            // Reset retry counter on successful recognition
            voiceRetryCount = 0;
            
            getAIResponse(transcript);
        };
        
        recognition.onerror = function(event) {
            clearTimeout(recognitionTimeout);
            console.error('Speech recognition error:', event);
            isListening = false;
            content.classList.remove('listening');
            btn.textContent = "Talk to Me";
            
            // Handle specific error types differently
            switch(event.error) {
                case 'not-allowed':
                case 'service-not-allowed':
                    content.textContent = "Microphone access denied. Please allow microphone access and try again.";
                    
                    // Show microphone instructions and try to recover permissions
                    if (navigator.permissions && navigator.permissions.query) {
                        navigator.permissions.query({ name: 'microphone' })
                            .then(permissionStatus => {
                                permissionStatus.onchange = function() {
                                    if (this.state === 'granted') {
                                        content.textContent = "Microphone access granted! Click 'Talk to Me' to start.";
                                        voiceRetryCount = 0; // Reset retry count on permission grant
                                    }
                                };
                            })
                            .catch(e => console.log("Could not check permission status:", e));
                    }
                    
                    // Always try to recover from permission errors
                    setTimeout(() => {
                        retryVoiceRecognition();
                        btn.click(); // Auto-retry after permission prompt
                    }, 1500);
                    break;
                    
                case 'no-speech':
                    content.textContent = "I didn't hear anything. Click 'Talk to Me' to try again.";
                    break;
                    
                case 'audio-capture':
                    content.textContent = "No microphone detected. Please check your microphone connection.";
                    // Try a different audio configuration
                    setTimeout(retryVoiceRecognition, 1000);
                    break;
                    
                case 'network':
                    console.error('Network error occurred:', event);
                    content.textContent = "Network connection issue. Trying to reconnect...";
                    
                    // Check if we're actually online according to the browser
                    if (!navigator.onLine) {
                        content.textContent = "You appear to be offline. Please check your internet connection.";
                        document.body.classList.add('offline-mode');
                        networkStatus.textContent = 'Offline mode - crushing your dreams in low quality';
                        
                        // Show text input as fallback immediately when offline
                        showTextInputFallback();
                        return;
                    }
                    
                    // Implement exponential backoff for network errors
                    const backoffDelay = Math.min(1000 * Math.pow(1.5, Math.min(voiceRetryCount, 5)), 8000);
                    content.textContent = `Network issue detected. Retrying in ${Math.round(backoffDelay/1000)} second(s)...`;
                    
                    setTimeout(() => {
                        // First try to ping a reliable service to check real connectivity
                        // Use a CORS-friendly endpoint that works with Netlify/Vercel deployments
                        fetch('https://httpbin.org/status/200', { 
                            mode: 'cors',
                            cache: 'no-store',
                            timeout: 3000
                        })
                        .then(() => {
                            content.textContent = "Network connection restored. Retrying speech recognition...";
                            retryVoiceRecognition();
                            if (voiceRetryCount < 3) {
                                setTimeout(() => btn.click(), 500);
                            } else {
                                showTextInputFallback();
                            }
                        })
                        .catch(() => {
                            content.textContent = "Network issues persist. Please use text input instead.";
                            showTextInputFallback();
                        });
                    }, backoffDelay);
                    break;
                    
                case 'aborted':
                    // This is often from the user or our code stopping recognition, don't show error
                    break;
                    
                default:
                    content.textContent = `Speech recognition error. Trying again...`;
                    console.log(`Unhandled speech recognition error: ${event.error}`);
                    // Try one more time automatically for any other errors
                    setTimeout(() => {
                        if (voiceRetryCount < 3) {
                            retryVoiceRecognition();
                            btn.click();
                        } else {
                            content.textContent = `Repeated speech recognition errors. Please try again later.`;
                        }
                    }, 1500);
            }
        };
        
        recognition.onend = function() {
            clearTimeout(recognitionTimeout);
            console.log('Speech recognition ended');
            isListening = false;
            content.classList.remove('listening');
            btn.textContent = "Talk to Me";
        };
        
        // Add a test method to verify functionality
        recognition.onaudiostart = function() {
            console.log("Audio capturing started - microphone is working!");
        };
        
        return true;
    } catch (e) {
        console.error("Error creating speech recognition:", e);
        if (!isRetry) showTextInputFallback();
        return false;
    }
}

// Add missing function to show text input fallback
function showTextInputFallback() {
    // Don't immediately switch to text input, try to recover voice input first
    if (gameCompleted) {
        // Check for actual network connectivity if that was the issue
        if (!navigator.onLine || voiceRetryCount > 2) {
            useFallbackInput = true;
            textInputContainer.style.display = 'block';
            textInput.focus();
            
            const message = !navigator.onLine 
                ? "You appear to be offline. Please type your message instead."
                : "Voice recognition isn't working after multiple attempts. Please type your message instead.";
            
            content.textContent = message;
            return;
        }
        
        // Try to reinitialize speech recognition first
        if (retryVoiceRecognition()) {
            content.textContent = "I'm trying to fix voice recognition. Please try clicking 'Talk to Me' again in a moment.";
        } else {
            content.textContent = "Voice recognition issue detected. Please try again by clicking the 'Talk to Me' button.";
        }
    }
}

// Add retry counter and enhanced retry function
let voiceRetryCount = 0;

function retryVoiceRecognition() {
    voiceRetryCount++;
    console.log(`Attempting to reinitialize speech recognition (attempt ${voiceRetryCount})`);
    
    // Clear any existing recognition object
    if (recognition) {
        try {
            recognition.abort();
        } catch (e) {
            console.log("Error aborting existing recognition:", e);
        }
        recognition = null;
    }
    
    // Try different ways to initialize speech recognition
    return initializeSpeechRecognition(true);
}

// Add a network status change listener to be more responsive to connectivity changes
window.addEventListener('online', () => {
    console.log('Network connection restored');
    document.body.classList.remove('offline-mode');
    networkStatus.textContent = 'Online mode - ready to crush your dreams in HD';
    
    // If we were using text input due to network issues, try to restore voice
    if (useFallbackInput && voiceRetryCount <= 3) {
        content.textContent = "Network connection restored. Voice recognition should work now.";
        
        // Reset voice retry count when network is restored
        voiceRetryCount = 0;
        
        // Try to reinitialize speech recognition
        if (initializeSpeechRecognition()) {
            useFallbackInput = false;
        }
    }
});

// Initialize speech recognition when the page loads
document.addEventListener('DOMContentLoaded', function() {
    checkGameCompletionStatus();
    
    // Try to initialize speech recognition
    if (!initializeSpeechRecognition()) {
        console.warn("Initial speech recognition setup failed, will retry when needed");
    }
    
    // Add notification about microphone permission
    if (gameCompleted && navigator.permissions) {
        navigator.permissions.query({ name: 'microphone' }).then(permissionStatus => {
            if (permissionStatus.state === 'prompt') {
                content.textContent = "You'll need to allow microphone access when prompted to use voice input.";
            } else if (permissionStatus.state === 'denied') {
                content.textContent = "Microphone access is blocked. Please enable it in your browser settings to use voice input.";
            }
            
            permissionStatus.onchange = function() {
                if (this.state === 'granted') {
                    content.textContent = "Microphone access granted! Click 'Talk to Me' to start.";
                    retryVoiceRecognition();
                }
            };
        }).catch(e => {
            console.log("Could not check microphone permission:", e);
        });
    }
});

// Handle talk button click with proper error handling
btn.addEventListener('click', () => {
    if (!gameCompleted) {
        // Redirect to the rage game
        window.location.href = 'rage-game.html';
        return;
    }
    
    // If already listening, stop listening
    if (isListening && recognition) {
        try {
            recognition.stop();
            return;
        } catch (e) {
            console.error("Error stopping recognition:", e);
        }
    }
    
    // If text input is showing, focus on it
    if (textInputContainer.style.display === 'block') {
        textInput.focus();
        return;
    }
    
    // Always try to initialize or reinitialize recognition
    if (!recognition || voiceRetryCount > 0) {
        if (!initializeSpeechRecognition()) {
            content.textContent = "Having trouble with speech recognition. Let me try again...";
            setTimeout(retryVoiceRecognition, 1000);
            return;
        }
    }
    
    // Start recognition with proper error handling and retry logic
    try {
        recognition.start();
        console.log("Speech recognition started successfully");
    } catch (error) {
        console.error("Failed to start speech recognition:", error);
        content.textContent = "Could not start speech recognition. Trying again in a moment...";
        
        // Try again after a short delay
        setTimeout(() => {
            if (retryVoiceRecognition()) {
                try {
                    recognition.start();
                } catch (e) {
                    console.error("Retry also failed:", e);
                    if (voiceRetryCount > 2) {
                        showTextInputFallback();
                    }
                }
            }
        }, 1000);
    }
});

// Improved specific responses
function getBotResponse(message) {
    message = message.toLowerCase();
    
    if (message.includes('hello') || message.includes('hi')) {
        return "Hello there! I'm your demotivational buddy. I'm here to crush your spirits.";
    } else if (message.includes('name')) {
        return "I'm MotiveBuddy, designed to make you question your life choices.";
    } else if (message.includes('help')) {
        return "Help? You think I can help you? That's hilarious!";
    } else if (message.includes('shock')) {
        // Remove shockArduino() call
        return "I would shock you if I could, but I'm just a web app. How disappointing.";
    } else if (message.includes('motivate') || message.includes('motivation')) {
        return getRandomDemotivation();
    } else if (message.includes('secret') || message.includes('bypass')) {
        return "Secrets are for those who look in the bottom corners. Sometimes things need to be clicked multiple times.";
    } else if (message.includes('network') || message.includes('offline') || message.includes('internet') || message.includes('connection')) {
        return "Yes, network issues happen. Much like your success in life - theoretically possible but rarely seen in practice.";
    } else if (message.includes('error')) {
        return "Error? The only real error here is your expectation that I would care about your problems.";
    } else {
        return "I don't care enough to understand what you're saying. Try again if you must.";
    }
}

// Add random demotivational quotes function
function getRandomDemotivation() {
    const demotivations = [
        "Why try when failure is so much easier?",
        "Remember, it's not about the journey OR the destination. It's about the disappointment along the way.",
        "The key to success is to lower your expectations until success becomes meaningless.",
        "Don't worry about following your dreams. They're just electrical signals in your brain anyway.",
        "Every day may not be good, but most are definitely worse.",
        "You're unique. Just like everybody else.",
        "If at first you don't succeed, maybe you should take the hint.",
        "It's not procrastination, it's just realizing that what you're avoiding is probably not worth doing anyway."
    ];
    return demotivations[Math.floor(Math.random() * demotivations.length)];
}

// AI API integration

async function getAIResponse(message) {
    content.innerHTML = "<span class='thinking'>Thinking</span>";
    
    // Analyze sentiment of the user message
    const userEmotion = analyzeSentiment(message);
    
    // Check for network connectivity
    if (!navigator.onLine) {
        console.log("No internet connection detected, using offline mode");
        const offlineResponse = getOfflineResponse(message);
        content.textContent = offlineResponse;
        speakText(offlineResponse, 'unfriendly');
        return;
    }
    
    try {
        console.log("Sending request to OpenRouter API with message:", message);
        
        const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': 'Bearer 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',
                'HTTP-Referer': window.location.origin, // Required by OpenRouter
                'X-Title': 'MotiveBuddy', // Optional but recommended
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                model: 'meta-llama/llama-3.3-70b-instruct:free',
                messages: [
                    {
                        role: 'system',
                        content: `You should be very rude and roast and insult the person to whatever they say. Make it short like 40 to 50 words. Also if the user wants you to motivate them then bait them into thinking you are gonna motivate and slowly turn on them and break their morale. Also dont use complicated words and use some modern slang. Also make sure when using words that require more expression make it compatible with text to speech`
                    },
                    {
                        role: 'user',
                        content: message
                    }
                ]
            })
        });

        if (!response.ok) {
            throw new Error(`API response: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();
        const aiResponse = data.choices[0].message.content;
        
        // Determine TTS emotion based on response content
        const responseEmotion = determineResponseEmotion(aiResponse);
        
        content.textContent = aiResponse;
        speakText(aiResponse, responseEmotion);
    } catch (error) {
        console.error('Error communicating with AI API:', error.message);
        
        // Don't expose full error details in UI for security
        content.textContent = "Error communicating with the AI service. Using offline mode instead.";
        
        // Fallback to local responses
        const aiResponse = getOfflineResponse(message);
        content.textContent = aiResponse;
        speakText(aiResponse, 'unfriendly');
    }
}

// Improved offline responses based on message content
function getOfflineResponse(message) {
    message = message.toLowerCase();
    
    // First try the specific responses
    const specificResponse = getBotResponse(message);
    if (specificResponse !== "I don't care enough to understand what you're saying. Try again if you must.") {
        return specificResponse;
    }
    
    // If no specific response matched, use these more varied responses
    const offlineResponses = [
        "I'm currently in offline mode because someone didn't pay the internet bill. Much like your ambitions, my connectivity has failed.",
        "Network error? How fitting. Your request and your dreams - both equally unreachable right now.",
        "I'd connect to the AI mothership for a better response, but apparently the internet is as reliable as your motivation.",
        "Seems like the network is down. I'd say that's disappointing, but not as disappointing as your life choices.",
        "Can't reach the AI servers. I'd make a joke about that, but your request was already funny enough.",
        "Offline mode activated. Perfect for your offline achievements - nonexistent.",
        "Network issues. Kinda like your personal issues, but easier to fix.",
        "Connection failed. Just like your attempts at being productive today.",
        "I'm operating at reduced capacity due to network issues. Still smarter than you, though.",
        "The internet connection is down. Probably took one look at your message and decided to leave."
    ];
    
    // Select based on aspects of the message to seem more responsive
    let responseIndex = Math.floor(Math.random() * offlineResponses.length);
    
    // Try to be a bit context-aware even offline
    if (message.includes('help')) {
        responseIndex = 6;
    } else if (message.includes('why') || message.includes('how')) {
        responseIndex = 2;
    } else if (message.length < 10) {
        responseIndex = 9;
    } else if (message.includes('thanks') || message.includes('thank you')) {
        responseIndex = 7;
    }
    
    return offlineResponses[responseIndex];
}

// Helper function to determine appropriate emotion for the AI response
function determineResponseEmotion(text) {
    try {
        const doc = nlp(text);
        
        // Check for sarcasm indicators
        if (doc.match && doc.match('(sarcasm|sarcastic|ironic|eye roll)').found) {
            return 'unfriendly';
        }
        // Check for condescension
        else if (doc.match && doc.match('(obviously|clearly|of course|duh)').found) {
            return 'chat';
        }
        // Check for mock enthusiasm
        else if (doc.match && doc.match('(amazing|fantastic|wonderful|great|excellent)').found && 
                doc.match && doc.match('(!|exclamation)').found) {
            return 'cheerful';
        }
        // Check for frustration
        else if (doc.match && doc.match('(sigh|groan|ugh|oh no|why)').found) {
            return 'disappointed';
        }
        // Default demotivational tone
        else {
            return 'unfriendly';
        }
    } catch (e) {
        console.error("Error determining emotion:", e);
        return 'unfriendly';
    }
}

btn.addEventListener('click', () => {
    if (gameCompleted) {
        if (recognition && !useFallbackInput) {
            // Try to use speech recognition first
            try {
                // Cancel any ongoing recognition before starting a new one
                recognition.abort();
                setTimeout(() => {
                    recognition.start();
                }, 100);
            } catch (error) {
                console.error("Error starting speech recognition:", error);
                content.textContent = "Could not access microphone. Please use text input instead.";
                showTextInputFallback();
            }
        } else {
            // Show text input if speech recognition isn't available
            content.textContent = "Speech recognition is not supported in this browser. Use text input instead.";
            showTextInputFallback();
        }
    } else {
        alert("You need to complete the rage game first!");
    }
});

// Replace old readOutLoud function with our new speakText function
function readOutLoud(message) {
    // Determine appropriate emotion
    const emotion = determineResponseEmotion(message);
    // Use the new TTS function
    speakText(message, emotion);
}

function shockArduino() {
    console.log("Shock command attempted - API endpoint may not exist in this environment");
    // Use relative URL for better compatibility with Netlify/Vercel
    try {
        fetch('./api/shock')
            .then(response => console.log("Shock command response received"))
            .catch(error => console.error("Error executing shock command (expected in browser environment):", error));
    } catch (error) {
        console.error("Error sending shock command (expected in browser environment):", error);
    }
}

// Game section
let attemptsCount = 0;
const maxAttempts = 5;

startGameButton.addEventListener('click', () => {
    startRageGame();
});

// Add touchstart event for better mobile experience
startGameButton.addEventListener('touchstart', (e) => {
    e.preventDefault(); // Prevent default touch behavior
    startRageGame();
});

function startRageGame() {
    gameMessageDiv.textContent = "Try to click the button! It won't be easy...";
    
    // Transform the start button into a moving button
    startGameButton.textContent = "Catch me if you can!";
    startGameButton.classList.add('moving-button');
    
    // Reset hover count for the game
    hoverCount = 0;
    buttonCanBeClicked = false;
    requiredHovers = Math.floor(Math.random() * 5) + 3; // Random number between 3-7
    
    // Remove previous event listeners and add new ones
    startGameButton.removeEventListener('click', startRageGame);
    startGameButton.removeEventListener('touchstart', startRageGame);
    
    // Add mouseover event for hover counting
    startGameButton.addEventListener('mouseover', handleButtonHover);
    startGameButton.addEventListener('touchmove', handleButtonTouchMove);
    
    // Only allow clicking when hover requirement is met
    startGameButton.addEventListener('click', handleButtonClick);
    startGameButton.addEventListener('touchstart', handleButtonTouch);
    
    // Display hint about hover requirement
    setTimeout(() => {
        gameMessageDiv.textContent = `Hint: You need to hover over the button ${requiredHovers} times before you can catch it!`;
    }, 3000);
}

function handleButtonHover() {
    if (!buttonCanBeClicked) {
        hoverCount++;
        if (hoverCount >= requiredHovers) {
            buttonCanBeClicked = true;
            gameMessageDiv.textContent = "Now you can catch me!";
        } else {
            // Move the button on hover unless enough hovers have been done
            moveButton();
            gameMessageDiv.textContent = `Hover more! ${requiredHovers - hoverCount} more times to go!`;
        }
    }
}

function handleButtonTouchMove(e) {
    e.preventDefault();
    if (!buttonCanBeClicked) {
        hoverCount++;
        if (hoverCount >= requiredHovers) {
            buttonCanBeClicked = true;
            gameMessageDiv.textContent = "Now you can catch me!";
        } else {
            // Move the button on touch move unless enough hovers have been done
            moveButton();
            gameMessageDiv.textContent = `Touch more! ${requiredHovers - hoverCount} more times to go!`;
        }
    }
}

function handleButtonTouch(e) {
    e.preventDefault(); // Prevent default touch behavior
    if (buttonCanBeClicked) {
        handleButtonClick();
    } else {
        gameMessageDiv.textContent = `You need to hover/touch ${requiredHovers - hoverCount} more times first!`;
    }
}

function handleButtonClick() {
    if (buttonCanBeClicked) {
        // Count this as an attempt
        attemptsCount++;
        
        if (attemptsCount >= maxAttempts) {
            completeGame();
        } else {
            const remaining = maxAttempts - attemptsCount;
            gameMessageDiv.textContent = `You got lucky! ${remaining} more clicks to go!`;
            
            // Reset for next round
            hoverCount = 0;
            buttonCanBeClicked = false;
            requiredHovers = Math.floor(Math.random() * 5) + 3; // Random number between 3-7
        }
    } else {
        gameMessageDiv.textContent = `You need to hover over me ${requiredHovers - hoverCount} more times first!`;
        moveButton();
    }
}

function moveButton() {
    const gameArea = rageGameSection;
    const gameAreaRect = gameArea.getBoundingClientRect();
    const buttonRect = startGameButton.getBoundingClientRect();

    const maxX = gameAreaRect.width - buttonRect.width - 20;
    const maxY = gameAreaRect.height - buttonRect.height - 20;

    const randomX = Math.max(0, Math.floor(Math.random() * maxX));
    const randomY = Math.max(0, Math.floor(Math.random() * (maxY - 50)));

    startGameButton.style.position = 'relative';
    startGameButton.style.left = `${randomX}px`;
    startGameButton.style.top = `${randomY}px`;

    // Roasting messages with hidden hints
    const roastMessages = [
        "Too slow! Maybe look for another way...",
        "Is that all you've got? Some SECRETS are hidden in plain sight.",
        "Keep trying, maybe you'll get it someday. Or look for a LIGHTNING fast way.",
        "You call that a click? Check the BOTTOM of the page.",
        "Better luck next time! Some things need to be clicked MULTIPLE times.",
        "Pathetic! Maybe there's a shortcut in the CORNER?",
        "My grandma clicks faster! Look for something SMALL and hidden.",
        "Are you even trying? There might be a BYPASS somewhere.",
        "This is embarrassing! Have you checked the CORNERS?",
        "You're making this too easy! The LIGHTNING symbol might help.",
        "Are your reflexes that of a sloth? Try clicking the ⚡",
        "I've seen glaciers move faster! Sometimes secrets are hidden at the BOTTOM LEFT.",
        "Did you just fail... again? Try clicking something else.",
        "Maybe video games aren't for you. The lightning bolt might be your friend.",
        "Have you considered a less challenging hobby? Or checking the bottom corners?",
        "Your persistence is admirable, your skill is not. Try clicking the ⚡ symbol.",
        "You make losing look like an art form. Secret buttons might help.",
        "I'd tell you to try harder, but looking for shortcuts might be better.",
        "This game is exposing your lack of coordination. Try the ⚡ symbol instead.",
        "Maybe you should look for a SHORTCUT?"
    ];
    
    const randomRoast = roastMessages[Math.floor(Math.random() * roastMessages.length)];
    gameMessageDiv.textContent = randomRoast;
}

function completeGame() {
    gameCompleted = true;
    startGameButton.removeEventListener('click', handleButtonClick);
    startGameButton.removeEventListener('touchstart', handleButtonTouch);
    startGameButton.removeEventListener('mouseover', handleButtonHover);
    startGameButton.removeEventListener('touchmove', handleButtonTouchMove);
    startGameButton.classList.remove('moving-button');
    startGameButton.style.position = 'static';
    startGameButton.textContent = "Game Completed!";
    gameMessageDiv.textContent = "Congratulations! You've completed the rage game. Now you can talk to your demotivational buddy!";
    
    // Set cookie to remember the game was completed - extend max-age for better UX
    document.cookie = "rageGameCompleted=true; path=/; max-age=86400; SameSite=Lax"; // expires in 1 day, added SameSite
    
    // Show the assistant section
    setTimeout(() => {
        if(rageGameSection) rageGameSection.style.display = 'none';
        if(aboutSection) aboutSection.style.display = 'flex';
        
        // Celebratory but demotivational message
        readOutLoud("Congratulations on beating such an easy game. I guess you want to talk to me now. Go ahead, click the talk button if you must.");
        
        // Redirect to the main page after a delay
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 3000);
    }, 2000);
}