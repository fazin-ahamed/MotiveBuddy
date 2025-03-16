const rageGameButton = document.querySelector('.rage-game-button');
const stopGameButton = document.querySelector('.stop-game-button');
const secretHint = document.querySelector('.secret-hint');
let hoverCount = 0; // Changed from clickCount to hoverCount
let lastMoveTime = 0;
let requiredHovers = 20; // Changed from requiredClicks to requiredHovers
let gameTimer;
let canMove = true;

// Check for game completion first - if already completed, redirect to index
document.addEventListener('DOMContentLoaded', function() {
    const hasCompletedGame = document.cookie.includes("rageGameCompleted=true");
    console.log("Rage game page loaded - game completed status:", hasCompletedGame);
    
    if (hasCompletedGame) {
        console.log("Game already completed, redirecting to index");
        window.location.href = 'index.html';
        return;
    }
    
    console.log("Starting rage game - game not completed yet");
    
    // Make sure the rage game is visible and positioned correctly
    const rageGame = document.querySelector('.rage-game');
    if (rageGame) {
        rageGame.style.display = 'flex';
        console.log("Rage game display set to flex");
    } else {
        console.warn("Could not find rage game element");
    }
    
    // Update the hover counter display initially
    updateHoverDisplay();
    
    // Position the button initially
    if (rageGameButton) {
        // Initial random position
        console.log("Setting up rage game button");
        setTimeout(moveButton, 500);
    } else {
        console.warn("Could not find rage game button");
    }
});

// Update the hover counter display
function updateHoverDisplay() {
    const hoversLeft = Math.max(0, requiredHovers - hoverCount);
    secretHint.textContent = `Hovers left: ${hoversLeft} hovers...`;
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
        
        // Count hover and check for completion
        hoverCount++;
        
        // Update display with new hover count
        updateHoverDisplay();
        
        const speech = new SpeechSynthesisUtterance(`You got ${hoverCount} hover${hoverCount === 1 ? '' : 's'}! Impressive... NOT!`);
        window.speechSynthesis.speak(speech);
        
        // If user manages to hover over the button 20 times, complete the game
        if (hoverCount >= requiredHovers) {
            completeRageGame();
        }
    });

    // Handle touch events
    rageGameButton.addEventListener('touchstart', (e) => {
        e.preventDefault();
        setTimeout(moveButton, 100);
        
        // Count hover for touch as well
        hoverCount++;
        
        // Update display with new hover count
        updateHoverDisplay();
        
        // If user manages to hover over the button 20 times, complete the game
        if (hoverCount >= requiredHovers) {
            completeRageGame();
        }
    });

    // Remove click handler functionality as we're now using hovers
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
    if (gameTimer) {
        clearInterval(gameTimer);
    }
    const speech = new SpeechSynthesisUtterance('You hovered over the rage bait 20 times! Now you can interact with the demotivational buddy.');
    window.speechSynthesis.speak(speech);
    
    // Set cookie to remember the game was completed - use secure settings
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