// Player management module for Snake Game
import * as supabaseClient from './supabase.js';

// Current player state
let currentPlayer = null;
let achievements = [];
let hasSeenTutorial = false;

// Initialize player management
export async function initPlayerManager() {
    // Try to get player from local storage first (for offline play)
    const localPlayer = supabaseClient.getPlayerFromLocalStorage();
    
    if (localPlayer) {
        currentPlayer = localPlayer;
        hasSeenTutorial = supabaseClient.hasTutorialBeenSeenFromLocalStorage();
        
        // Load player achievements from Supabase
        try {
            const playerAchievements = await supabaseClient.getPlayerAchievements(currentPlayer.id);
            achievements = playerAchievements.map(a => a.name);
            console.log('Loaded achievements:', achievements);
        } catch (error) {
            console.error('Error loading achievements:', error);
        }
        
        return true;
    }
    
    return false;
}

// Show login/register dialog
export function showPlayerDialog() {
    return new Promise((resolve) => {
        // Create dialog overlay
        const overlay = document.createElement('div');
        overlay.className = 'dialog-overlay';
        
        // Create dialog content
        const dialog = document.createElement('div');
        dialog.className = 'player-dialog';
        dialog.innerHTML = `
            <h2>Welcome to Snake Game!</h2>
            <p>Enter your username to play:</p>
            <input type="text" id="username-input" placeholder="Username" maxlength="50">
            <div class="error-message" id="username-error"></div>
            <button id="play-button-dialog">Play</button>
        `;
        
        // Add to DOM
        overlay.appendChild(dialog);
        document.body.appendChild(overlay);
        
        // Focus input
        setTimeout(() => {
            document.getElementById('username-input').focus();
        }, 100);
        
        // Handle submit
        const handleSubmit = async () => {
            const usernameInput = document.getElementById('username-input');
            const username = usernameInput.value.trim();
            const errorElement = document.getElementById('username-error');
            
            if (!username) {
                errorElement.textContent = 'Please enter a username';
                return;
            }
            
            try {
                // Login or register with Supabase
                const player = await supabaseClient.getOrCreatePlayer(username);
                
                // Save player info
                currentPlayer = player;
                supabaseClient.savePlayerToLocalStorage(player);
                
                // Check if tutorial has been seen
                try {
                    hasSeenTutorial = await supabaseClient.hasTutorialBeenSeen(player.id);
                } catch (error) {
                    console.error('Error checking tutorial status:', error);
                    // Fallback to local storage
                    hasSeenTutorial = supabaseClient.hasTutorialBeenSeenFromLocalStorage();
                }
                
                // Load player achievements
                try {
                    const playerAchievements = await supabaseClient.getPlayerAchievements(player.id);
                    achievements = playerAchievements.map(a => a.name);
                    console.log('Loaded achievements after login:', achievements);
                } catch (error) {
                    console.error('Error loading achievements after login:', error);
                    achievements = [];
                }
                
                // Remove dialog
                document.body.removeChild(overlay);
                
                // Unlock "First Timer" achievement if new player
                if (!hasSeenTutorial) {
                    unlockAchievement('First Timer');
                }
                
                // Resolve promise
                resolve(true);
            } catch (error) {
                console.error('Error logging in:', error);
                errorElement.textContent = 'Error: ' + (error.message || 'Could not log in');
            }
        };
        
        // Event listeners
        document.getElementById('play-button-dialog').addEventListener('click', handleSubmit);
        document.getElementById('username-input').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') handleSubmit();
        });
    });
}

// Get current player
export function getCurrentPlayer() {
    return currentPlayer;
}

// Check if player has seen tutorial
export function hasPlayerSeenTutorial() {
    return hasSeenTutorial;
}

// Mark tutorial as seen
export async function markTutorialSeen() {
    hasSeenTutorial = true;
    
    // Save to local storage as fallback
    supabaseClient.saveTutorialSeenToLocalStorage();
    
    // Save to Supabase if connected
    if (currentPlayer) {
        try {
            await supabaseClient.markTutorialSeen(currentPlayer.id);
            // Unlock tutorial achievement
            unlockAchievement('Tutorial Complete');
        } catch (error) {
            console.error('Error marking tutorial as seen:', error);
        }
    }
}

// Save score to leaderboard
export async function saveScore(score, level) {
    if (!currentPlayer) return;
    
    try {
        await supabaseClient.saveScore(currentPlayer.id, score, level);
    } catch (error) {
        console.error('Error saving score:', error);
    }
}

// Get top scores for leaderboard
export async function getTopScores(limit = 10) {
    try {
        return await supabaseClient.getTopScores(limit);
    } catch (error) {
        console.error('Error fetching top scores:', error);
        return [];
    }
}

// Unlock an achievement
export async function unlockAchievement(achievementName) {
    if (!currentPlayer) {
        console.error('Cannot unlock achievement: No player logged in');
        return;
    }
    
    // Check if already unlocked locally
    if (achievements.includes(achievementName)) {
        console.log(`Achievement ${achievementName} already unlocked`);
        return;
    }
    
    console.log(`Unlocking achievement: ${achievementName}`);
    
    // Add to local list
    achievements.push(achievementName);
    
    // Show achievement notification
    showAchievementNotification(achievementName);
    
    // Save to Supabase
    try {
        const result = await supabaseClient.unlockAchievement(currentPlayer.id, achievementName);
        console.log(`Achievement ${achievementName} saved to Supabase:`, result);
        
        // Dispatch custom event to notify that achievements have changed
        document.dispatchEvent(new CustomEvent('achievementsLoaded'));
    } catch (error) {
        console.error(`Error unlocking achievement ${achievementName}:`, error);
    }
}

// Check if player has a specific achievement
export function hasAchievement(achievementName) {
    const result = achievements.includes(achievementName);
    console.log(`Checking achievement ${achievementName}: ${result}`);
    return result;
}

// Get current achievements list
export function getCurrentAchievements() {
    return [...achievements];
}

// Get player achievements
export async function getPlayerAchievements() {
    if (!currentPlayer) return [];
    
    try {
        return await supabaseClient.getPlayerAchievements(currentPlayer.id);
    } catch (error) {
        console.error('Error fetching achievements:', error);
        return [];
    }
}

// Show achievement notification
function showAchievementNotification(achievementName) {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = 'achievement-notification';
    notification.innerHTML = `
        <div class="achievement-icon">🏆</div>
        <div class="achievement-text">
            <h3>Achievement Unlocked!</h3>
            <p>${achievementName}</p>
        </div>
    `;
    
    // Add to DOM
    document.body.appendChild(notification);
    
    // Animate in
    setTimeout(() => {
        notification.classList.add('show');
    }, 100);
    
    // Remove after delay
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 500);
    }, 3000);
}

// Handle game events for achievements
export function handleGameEvent(event, data) {
    switch (event) {
        case 'death':
            unlockAchievement('Game Over');
            break;
        case 'difficulty_change':
            if (data === 'medium') {
                unlockAchievement('Medium Mode');
            } else if (data === 'hard') {
                unlockAchievement('Hardcore');
            }
            break;
        case 'high_score':
            // Check for score-based achievements
            const score = data;
            if (score >= 100000) {
                unlockAchievement('Snake Master');
            }
            if (score >= 300000) {
                unlockAchievement('Real Player');
            }
            if (score >= 350000) {
                // Unlock terminal for rainbow skin
                document.body.classList.add('terminal-unlocked');
            }
            break;
        case 'credits_viewed':
            // Credit Reader achievement is now handled by clicking the happy face
            break;
        case 'credits_secret_found':
            unlockAchievement('Credit Reader');
            break;
        case 'paranoid_mode_completed':
            unlockAchievement('Are you ok?');
            break;
        case 'rainbow_skin_unlocked':
            unlockAchievement('Rainbow Stuff');
            break;
        case 'death_master':
            // Unlocked after dying 199 times
            unlockAchievement('Death Master');
            break;
        case 'paranoid_master':
            // Unlocked after staying in paranoid mode for 5 minutes
            unlockAchievement('Paranoid Master');
            break;
        case 'cosmic_explorer':
            // Unlocked after reaching level 38 in infinite mode
            unlockAchievement('Cosmic Explorer');
            break;
        case 'hacker_mode_unlocked':
            // Unlocked by typing unlockHacker() in the console
            unlockAchievement('Hacker Mode');
            break;
    }
}

// Function to unlock all achievements for testing
export async function unlockForTest() {
    console.log('Unlocking all achievements for testing...');
    
    const allAchievements = [
        'First Timer',
        'Game Over',
        'Medium Mode',
        'Hardcore',
        'Snake Master',
        'Real Player',
        'Credit Reader',
        'Are you ok?',
        'Rainbow Stuff',
        'Death Master',
        'Paranoid Master',
        'Cosmic Explorer',
        'Hacker Mode',
        'Tutorial Complete'
    ];
    
    // Unlock each achievement
    for (const achievement of allAchievements) {
        await unlockAchievement(achievement);
    }
    
    // Add rainbow skin unlock
    document.body.classList.add('terminal-unlocked');
    
    console.log('All achievements unlocked!');
    return 'All achievements unlocked!';
}
