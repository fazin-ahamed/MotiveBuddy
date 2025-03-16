const rageGameButton = document.querySelector('.rage-game-button');
const stopGameButton = document.querySelector('.stop-game-button');
const secretHint = document.querySelector('.secret-hint');
let clickCount = 0;
let lastMoveTime = 0;
let gameStartTime = Date.now();
let gameTimer;
let canMove = true;

// Check for game completion first - if already completed, redirect to index
document.addEventListener('DOMContentLoaded', function() {
    const hasCompletedGame = document.cookie.includes("rageGameCompleted=true");
    if (hasCompletedGame) {
        console.log("Game already completed, redirecting to index");
        window.location.href = 'index.html';
        return;
    }
    startGameTimer();
});

// Start the 20-second timer when the page loads
function startGameTimer() {
    gameStartTime = Date.now();
    updateTimerDisplay();
    
    gameTimer = setInterval(() => {
        updateTimerDisplay();
        
        // Check if 20 seconds have passed
        if (Date.now() - gameStartTime >= 20000) {
            clearInterval(gameTimer);
            completeRageGame();
        }
    }, 1000);
}

// Update the timer display
function updateTimerDisplay() {
    const secondsLeft = Math.max(0, 20 - Math.floor((Date.now() - gameStartTime) / 1000));
    secretHint.textContent = `Time left: ${secondsLeft} seconds...`;
}

function moveButton() {
    // Only move the button if enough time has passed (300ms minimum between moves)
    const currentTime = Date.now();
    if (currentTime - lastMoveTime < 300 || !canMove) {
        return;
    }
    
    lastMoveTime = currentTime;
    
    const gameArea = document.querySelector('.rage-game');
    const gameAreaRect = gameArea.getBoundingClientRect();
    const buttonRect = rageGameButton.getBoundingClientRect();

    const maxX = gameAreaRect.width - buttonRect.width - 40;
    const maxY = gameAreaRect.height - buttonRect.height - 40;

    const randomX = Math.max(20, Math.floor(Math.random() * maxX));
    const randomY = Math.max(20, Math.floor(Math.random() * maxY));

    rageGameButton.style.left = `${randomX}px`;
    rageGameButton.style.top = `${randomY}px`;

    // Roasting messages
    const roastMessages = [
        "Too slow!",
        "Is that all you've got?",
        "Keep trying, maybe you'll get it someday.",
        "You call that a click?",
        "Better luck next time!",
        "Pathetic!",
        "My grandma clicks faster!",
        "Are you even trying?",
        "This is embarrassing!",
        "You must be joking!"
    ];
    const randomRoast = roastMessages[Math.floor(Math.random() * roastMessages.length)];
    
    // Only speak occasionally to avoid overwhelming
    if (Math.random() > 0.7) {
        const speech = new SpeechSynthesisUtterance(randomRoast);
        speech.volume = 0.7;
        window.speechSynthesis.speak(speech);
    }
}

// Add event listeners with a slight delay to give user a chance
if (rageGameButton) {
    rageGameButton.addEventListener('mouseover', () => {
        setTimeout(moveButton, 100);
    });

    // Handle touch events
    rageGameButton.addEventListener('touchstart', (e) => {
        e.preventDefault();
        setTimeout(moveButton, 100);
    });

    // Click handler for the rage button
    rageGameButton.addEventListener('click', (e) => {
        e.stopPropagation(); // Prevent event bubbling
        
        // Make the button temporarily unable to move after clicking
        canMove = false;
        clickCount++;
        
        const speech = new SpeechSynthesisUtterance(`You got ${clickCount} click${clickCount === 1 ? '' : 's'}! Impressive... NOT!`);
        window.speechSynthesis.speak(speech);
        
        // Re-enable movement after a short delay
        setTimeout(() => { canMove = true; }, 800);
        
        // If user manages to click the button, congratulate and redirect
        completeRageGame();
    });
}

// Stop button functionality - it's a trick!
if (stopGameButton) {
    stopGameButton.addEventListener('click', () => {
        const speech = new SpeechSynthesisUtterance("You can't stop me! Keep trying!");
        window.speechSynthesis.speak(speech);
        
        // Make it even harder by increasing movement frequency temporarily
        const originalCanMove = canMove;
        canMove = true;
        for (let i = 0; i < 5; i++) {
            setTimeout(moveButton, i * 200);
        }
        
        // Restore original state
        setTimeout(() => { canMove = originalCanMove; }, 1500);
    });
}

// Function to complete the rage game and redirect
function completeRageGame() {
    clearInterval(gameTimer);
    const speech = new SpeechSynthesisUtterance('You clicked the rage bait! Now you can interact with the demotivational buddy.');
    window.speechSynthesis.speak(speech);
    
    // Set cookie to remember the game was completed
    document.cookie = "rageGameCompleted=true; path=/; max-age=86400; SameSite=Lax";
    
    // Redirect after the speech finishes
    speech.onend = () => {
        window.location.href = 'index.html';
    };
    
    // Fallback in case speech synthesis fails
    setTimeout(() => {
        window.location.href = 'index.html';
    }, 3000);
}

// Initial setup - check for existing elements first to avoid errors
if (rageGameButton) {
    // Initial random position
    setTimeout(moveButton, 500);
}