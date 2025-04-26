// Skin manager for Snake Game
import * as playerManager from './playerManager.js';
import { GRID_SIZE } from './components/config.js';

// Available skins
const SKINS = {
    DEFAULT: 'default',
    RAINBOW: 'rainbow',
    SKULL: 'skull',
    PARANOID: 'paranoid',
    INFINITE: 'infinite',
    HACKER: 'hacker'
};

// Current selected skin
let currentSkin = SKINS.DEFAULT;

// Initialize skin manager
export function initSkinManager() {
    // Check if skins are unlocked
    const hasRainbowSkin = playerManager.hasAchievement('Rainbow Stuff');
    const hasSkullSkin = playerManager.hasAchievement('Death Master');
    const hasParanoidSkin = playerManager.hasAchievement('Paranoid Master');
    const hasInfiniteSkin = playerManager.hasAchievement('Cosmic Explorer');
    const hasHackerSkin = playerManager.hasAchievement('Hacker Mode');
    
    // Update UI to reflect unlocked skins
    updateSkinsUI(hasRainbowSkin, hasSkullSkin, hasParanoidSkin, hasInfiniteSkin, hasHackerSkin);
    
    // Set up event listeners
    setupEventListeners();
    
    console.log('Skin manager initialized');
    return currentSkin;
}

// Update the skins UI based on unlocked skins
function updateSkinsUI(hasRainbowSkin, hasSkullSkin, hasParanoidSkin, hasInfiniteSkin, hasHackerSkin) {
    // Rainbow skin
    const rainbowButton = document.querySelector('.select-skin-button[data-skin="rainbow"]');
    if (hasRainbowSkin) {
        rainbowButton.disabled = false;
        rainbowButton.textContent = 'Select';
    } else {
        rainbowButton.disabled = true;
        rainbowButton.textContent = 'Locked';
    }
    
    // Skull skin
    const skullButton = document.querySelector('.select-skin-button[data-skin="skull"]');
    if (hasSkullSkin) {
        skullButton.disabled = false;
        skullButton.textContent = 'Select';
    } else {
        skullButton.disabled = true;
        skullButton.textContent = 'Locked';
    }
    
    // Paranoid skin
    const paranoidButton = document.querySelector('.select-skin-button[data-skin="paranoid"]');
    if (hasParanoidSkin) {
        paranoidButton.disabled = false;
        paranoidButton.textContent = 'Select';
    } else {
        paranoidButton.disabled = true;
        paranoidButton.textContent = 'Locked';
    }
    
    // Infinite skin
    const infiniteButton = document.querySelector('.select-skin-button[data-skin="infinite"]');
    if (hasInfiniteSkin) {
        infiniteButton.disabled = false;
        infiniteButton.textContent = 'Select';
    } else {
        infiniteButton.disabled = true;
        infiniteButton.textContent = 'Locked';
    }
    
    // Hacker skin - only show if unlocked
    const hackerSkinItem = document.querySelector('.skin-item[data-skin="hacker"]');
    if (hackerSkinItem) {
        if (hasHackerSkin) {
            hackerSkinItem.style.display = 'block';
            const hackerButton = document.querySelector('.select-skin-button[data-skin="hacker"]');
            hackerButton.disabled = false;
            hackerButton.textContent = 'Select';
        } else {
            hackerSkinItem.style.display = 'none';
        }
    }
    
    // Mark the current skin as active
    document.querySelectorAll('.select-skin-button').forEach(button => {
        if (button.dataset.skin === currentSkin) {
            button.classList.add('active');
            button.textContent = 'Selected';
        } else if (!button.disabled) {
            button.classList.remove('active');
            button.textContent = 'Select';
        }
    });
    
    // Show/hide creative mode controller based on current skin
    const creativeController = document.getElementById('creative-mode-controller');
    if (creativeController) {
        creativeController.style.display = currentSkin === SKINS.HACKER ? 'block' : 'none';
    }
}

// Set up event listeners for skin selection
function setupEventListeners() {
    // Skin selection buttons
    document.querySelectorAll('.select-skin-button').forEach(button => {
        button.addEventListener('click', () => {
            if (button.disabled) return;
            
            const skin = button.dataset.skin;
            selectSkin(skin);
        });
    });
    
    // Terminal setup
    setupTerminal();
    
    // Carousel navigation
    setupCarouselNavigation();
    
    // Creative mode controller setup
    setupCreativeModeController();
}

// Set up carousel navigation
function setupCarouselNavigation() {
    const prevButton = document.getElementById('prev-skin');
    const nextButton = document.getElementById('next-skin');
    const indicators = document.querySelectorAll('.indicator');
    const pages = document.querySelectorAll('.carousel-page');
    let currentPage = 1;
    const totalPages = pages.length;
    
    // Update active page
    function updateActivePage() {
        // Hide all pages
        pages.forEach(page => page.classList.remove('active'));
        
        // Show current page
        document.querySelector(`.carousel-page[data-page="${currentPage}"]`).classList.add('active');
        
        // Update indicators
        indicators.forEach(indicator => indicator.classList.remove('active'));
        document.querySelector(`.indicator[data-page="${currentPage}"]`).classList.add('active');
    }
    
    // Previous button click
    prevButton.addEventListener('click', () => {
        currentPage = currentPage > 1 ? currentPage - 1 : totalPages;
        updateActivePage();
    });
    
    // Next button click
    nextButton.addEventListener('click', () => {
        currentPage = currentPage < totalPages ? currentPage + 1 : 1;
        updateActivePage();
    });
    
    // Indicator clicks
    indicators.forEach(indicator => {
        indicator.addEventListener('click', () => {
            currentPage = parseInt(indicator.dataset.page);
            updateActivePage();
        });
    });
}

// Global flag to track if the terminal should be visible during gameplay
let keepTerminalVisible = false;

// Global flag to track if we've switched from hacker skin
let switchedFromHackerSkin = false;

// Select a skin
export function selectSkin(skin) {
    if (!Object.values(SKINS).includes(skin)) {
        console.error(`Invalid skin: ${skin}`);
        return;
    }
    
    // Check if skin is unlocked
    let isUnlocked = true;
    switch (skin) {
        case SKINS.RAINBOW:
            isUnlocked = playerManager.hasAchievement('Rainbow Stuff');
            break;
        case SKINS.SKULL:
            isUnlocked = playerManager.hasAchievement('Death Master');
            break;
        case SKINS.PARANOID:
            isUnlocked = playerManager.hasAchievement('Paranoid Master');
            break;
        case SKINS.INFINITE:
            isUnlocked = playerManager.hasAchievement('Cosmic Explorer');
            break;
        case SKINS.HACKER:
            isUnlocked = playerManager.hasAchievement('Hacker Mode');
            break;
    }
    
    // Only change if unlocked or it's the default skin
    if (!isUnlocked && skin !== SKINS.DEFAULT) {
        console.log(`Skin ${skin} is locked. Unlock it first!`);
        return;
    }
    
    // Store the previous skin before changing
    const previousSkin = currentSkin;
    
    // Update the current skin
    currentSkin = skin;
    console.log(`Selected skin: ${skin}`);
    
    // Check if we're switching from hacker skin
    if (previousSkin === SKINS.HACKER && skin !== SKINS.HACKER) {
        switchedFromHackerSkin = true;
    }
    
    // Preserve terminal state - must be done before UI updates
    preserveTerminalState();
    
    // Update UI
    updateSkinsUI(
        playerManager.hasAchievement('Rainbow Stuff'),
        playerManager.hasAchievement('Death Master'),
        playerManager.hasAchievement('Paranoid Master'),
        playerManager.hasAchievement('Cosmic Explorer'),
        playerManager.hasAchievement('Hacker Mode')
    );
    
    // Schedule terminal restoration with multiple attempts to ensure it works
    restoreTerminalState();
    
    return skin;
}

// Function to preserve terminal state before skin change
function preserveTerminalState() {
    const terminalContainer = document.getElementById('terminal-container');
    const gameScreen = document.getElementById('game-screen');
    
    // Only preserve state if we're in the game screen
    if (gameScreen && !gameScreen.classList.contains('hidden')) {
        // Check if terminal is currently visible
        if (terminalContainer && !terminalContainer.classList.contains('hidden')) {
            keepTerminalVisible = true;
            console.log('Terminal visibility state preserved');
        }
    }
}

// Function to restore terminal state after skin change
function restoreTerminalState() {
    const terminalContainer = document.getElementById('terminal-container');
    const creativeController = document.getElementById('creative-mode-controller');
    const gameScreen = document.getElementById('game-screen');
    
    // Only restore state if we're in the game screen
    if (gameScreen && !gameScreen.classList.contains('hidden')) {
        // Make multiple attempts to restore terminal visibility
        if (keepTerminalVisible && terminalContainer) {
            // Immediate attempt
            terminalContainer.classList.remove('hidden');
            
            // Multiple delayed attempts at different intervals
            [50, 100, 200, 500].forEach(delay => {
                setTimeout(() => {
                    if (terminalContainer) {
                        terminalContainer.classList.remove('hidden');
                    }
                }, delay);
            });
        }
        
        // Handle creative mode controller visibility
        if (creativeController) {
            if (currentSkin === SKINS.HACKER || switchedFromHackerSkin) {
                // Multiple attempts to ensure creative controller stays visible
                creativeController.style.display = 'block';
                
                [50, 150, 300].forEach(delay => {
                    setTimeout(() => {
                        if (creativeController) {
                            creativeController.style.display = 'block';
                        }
                    }, delay);
                });
            }
        }
    }
}

// Get the current skin
export function getCurrentSkin() {
    return currentSkin;
}

// Get the current skin
export function getCurrentSkinType() {
    return currentSkin;
}

// Check if the current skin is hacker
export function isHackerSkin() {
    return currentSkin === SKINS.HACKER;
}

// Check if the current skin is rainbow
export function isRainbowSkin() {
    return currentSkin === SKINS.RAINBOW;
}

// Check if the current skin is skull
export function isSkullSkin() {
    return currentSkin === SKINS.SKULL;
}

// Check if the current skin is paranoid
export function isParanoidSkin() {
    return currentSkin === SKINS.PARANOID;
}

// Check if the current skin is infinite
export function isInfiniteSkin() {
    return currentSkin === SKINS.INFINITE;
}

// Skull skin: Second chance functionality
// This tracks the last time the second chance was used
let lastSecondChanceTime = 0;

// Check if the skull skin's second chance is available
export function isSecondChanceAvailable() {
    if (!isSkullSkin()) return false;
    
    // Allow one second chance every 20 seconds
    const now = Date.now();
    const twentySeconds = 20 * 1000;
    return (now - lastSecondChanceTime) >= twentySeconds;
}

// Use the second chance
export function useSecondChance() {
    lastSecondChanceTime = Date.now();
    return true;
}

// Paranoid skin: Random movement
// This tracks if the snake should move randomly
let shouldMoveRandomly = false;

// Check if the paranoid skin should trigger random movement
export function shouldTriggerRandomMovement() {
    if (!isParanoidSkin()) return false;
    
    // 5% chance of triggering random movement each second
    if (Math.random() < 0.05) {
        shouldMoveRandomly = true;
        setTimeout(() => { shouldMoveRandomly = false; }, 2000); // Random movement for 2 seconds
    }
    
    return shouldMoveRandomly;
}

// Variables to track mouse position for teleport targeting
let mouseX = -1;
let mouseY = -1;
let teleportTarget = null;

// Infinite skin: Teleport functionality
export function setupTeleport(game) {
    console.log('Setting up teleport for Infinite skin');
    
    // Clear any existing teleport functionality
    if (game.canvas._teleportListener) {
        game.canvas.removeEventListener('click', game.canvas._teleportListener);
        game.canvas._teleportListener = null;
    }
    
    // Simple teleport function - just click to teleport
    game.canvas._teleportListener = function(event) {
        // Only work if using Infinite skin
        if (!isInfiniteSkin()) {
            console.log('Not using Infinite skin, teleport disabled');
            return;
        }
        
        // Only teleport if game is active
        if (game.isGameOver || (game.isPaused === true)) {
            console.log('Game is over or paused, teleport disabled');
            return;
        }
        
        console.log('Teleport click detected');
        
        // Get click position
        const rect = game.canvas.getBoundingClientRect();
        const clickX = event.clientX - rect.left;
        const clickY = event.clientY - rect.top;
        
        // Convert to grid coordinates
        const gridX = Math.floor(clickX / GRID_SIZE);
        const gridY = Math.floor(clickY / GRID_SIZE);
        
        console.log(`Click at (${clickX}, ${clickY}) -> Grid (${gridX}, ${gridY})`);
        
        // Don't teleport if clicking on snake body
        for (let i = 1; i < game.snake.segments.length; i++) {
            const segment = game.snake.segments[i];
            if (segment.x === gridX && segment.y === gridY) {
                console.log('Cannot teleport onto snake body');
                return;
            }
        }
        
        // Store old position for effect
        const oldX = game.snake.head.x;
        const oldY = game.snake.head.y;
        
        console.log(`Teleporting from (${oldX}, ${oldY}) to (${gridX}, ${gridY})`);
        
        // Teleport the snake
        if (typeof game.snake.teleport === 'function') {
            game.snake.teleport(gridX, gridY);
            createTeleportEffect(game, oldX, oldY, gridX, gridY);
        } else {
            // Fallback if teleport method doesn't exist
            console.log('Teleport method not found, using fallback');
            const offsetX = gridX - game.snake.head.x;
            const offsetY = gridY - game.snake.head.y;
            
            // Move all segments
            for (let i = 0; i < game.snake.segments.length; i++) {
                game.snake.segments[i].x += offsetX;
                game.snake.segments[i].y += offsetY;
            }
            
            createTeleportEffect(game, oldX, oldY, gridX, gridY);
        }
    };
    
    // Add the click listener
    game.canvas.addEventListener('click', game.canvas._teleportListener);
    console.log('Teleport click listener added');
}

// Create a visual effect for teleportation
function createTeleportEffect(game, fromX, fromY, toX, toY) {
    console.log('Creating teleport effect');
    
    // Store original context settings
    const ctx = game.ctx;
    const originalGlobalAlpha = ctx.globalAlpha;
    const originalStrokeStyle = ctx.strokeStyle;
    const originalLineWidth = ctx.lineWidth;
    const originalFillStyle = ctx.fillStyle;
    
    // Create a flash at the destination
    ctx.fillStyle = '#FFFFFF';
    ctx.globalAlpha = 0.7;
    ctx.fillRect(toX * GRID_SIZE - GRID_SIZE, toY * GRID_SIZE - GRID_SIZE, 
                GRID_SIZE * 3, GRID_SIZE * 3);
    
    // Draw a line connecting the points
    ctx.globalAlpha = 0.8;
    ctx.strokeStyle = '#00BFFF';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo((fromX + 0.5) * GRID_SIZE, (fromY + 0.5) * GRID_SIZE);
    ctx.lineTo((toX + 0.5) * GRID_SIZE, (toY + 0.5) * GRID_SIZE);
    ctx.stroke();
    
    // Create expanding circles at both locations
    for (let i = 0; i < 3; i++) {
        setTimeout(() => {
            // Redraw the game to clear previous effects
            game.draw();
            
            // Draw destination effect
            ctx.globalAlpha = 0.7 - (i * 0.2);
            ctx.strokeStyle = '#00BFFF';
            ctx.lineWidth = 3;
            
            // Destination circle
            ctx.beginPath();
            ctx.arc(
                (toX + 0.5) * GRID_SIZE,
                (toY + 0.5) * GRID_SIZE,
                (i + 1) * 10,
                0,
                Math.PI * 2
            );
            ctx.stroke();
            
            // Origin circle (smaller)
            ctx.beginPath();
            ctx.arc(
                (fromX + 0.5) * GRID_SIZE,
                (fromY + 0.5) * GRID_SIZE,
                (i + 1) * 5,
                0,
                Math.PI * 2
            );
            ctx.stroke();
            
            // Reset context settings after the last circle
            if (i === 2) {
                ctx.globalAlpha = originalGlobalAlpha;
                ctx.strokeStyle = originalStrokeStyle;
                ctx.lineWidth = originalLineWidth;
                ctx.fillStyle = originalFillStyle;
            }
        }, i * 100);
    }
}

// Terminal functionality
function setupTerminal() {
    const terminalContainer = document.getElementById('terminal-container');
    const closeTerminalButton = document.getElementById('close-terminal');
    const terminalInput = document.getElementById('terminal-input');
    const terminalOutput = document.getElementById('terminal-output');
    
    // Check if terminal should be visible (only after 350,000+ points)
    document.addEventListener('pointsUpdated', (event) => {
        const points = event.detail.points;
        terminalContainer.classList.add('hidden');
    });
    
    // Terminal input
    terminalInput.addEventListener('keydown', (event) => {
        if (event.key === 'Enter') {
            const command = terminalInput.value.trim();
            terminalInput.value = '';
            
            if (command) {
                appendToTerminal(`> ${command}`);
                processCommand(command);
            }
        }
    });
    
    // Process terminal command
    function processCommand(command) {
        const lowerCommand = command.toLowerCase();
        
        switch (lowerCommand) {
            case 'help':
                appendToTerminal('Available commands:\n- help: Show this help\n- clear: Clear terminal\n- unlock: Try to unlock rainbow skin\n- exit: Close terminal');
                break;
            case 'clear':
                terminalOutput.innerHTML = '';
                break;
            case 'exit':
                terminalContainer.classList.add('hidden');
                break;
            case 'unlock':
                if (document.body.classList.contains('terminal-unlocked')) {
                    playerManager.handleGameEvent('rainbow_skin_unlocked');
                    appendToTerminal('Rainbow skin unlocked! 🌈');
                } else {
                    appendToTerminal('Access denied. You need to earn more points first.');
                }
                break;
            case 'unlockhacker()':
            case 'unlockhacker':
                playerManager.handleGameEvent('hacker_mode_unlocked');
                appendToTerminal('Hacker skin unlocked! 👨‍💻');
                // Refresh the skins UI to show the new skin
                refreshSkinsUI();
                break;
            case 'unlockfortest()':
            case 'unlockfortest':
                playerManager.unlockForTest().then(() => {
                    appendToTerminal('All achievements unlocked for testing! 🎮');
                    // Refresh the skins UI to show all unlocked skins
                    refreshSkinsUI();
                });
                break;
            case 'earn.lgbt':
                // Unlock the rainbow skin achievement
                playerManager.handleGameEvent('rainbow_skin_unlocked');
                appendToTerminal('Pride skin unlocked! 🏳️‍🌈');
                // Refresh the skins UI
                refreshSkinsUI();
                break;
            default:
                appendToTerminal(`Unknown command: ${command}`);
        }
    }
    
    // Append text to terminal output
    function appendToTerminal(text) {
        const line = document.createElement('div');
        line.textContent = text;
        terminalOutput.appendChild(line);
        terminalOutput.scrollTop = terminalOutput.scrollHeight;
    }
    
    // Helper function to refresh the skins UI after unlocking achievements
    function refreshSkinsUI() {
        const hasRainbowSkin = playerManager.hasAchievement('Rainbow Stuff');
        const hasSkullSkin = playerManager.hasAchievement('Death Master');
        const hasParanoidSkin = playerManager.hasAchievement('Paranoid Master');
        const hasInfiniteSkin = playerManager.hasAchievement('Cosmic Explorer');
        const hasHackerSkin = playerManager.hasAchievement('Hacker Mode');
        updateSkinsUI(hasRainbowSkin, hasSkullSkin, hasParanoidSkin, hasInfiniteSkin, hasHackerSkin);
    }
    
    // Show terminal
    function showTerminal() {
        terminalContainer.classList.remove('hidden');
        terminalInput.focus();
        appendToTerminal('Terminal activated. Type "help" for available commands.');
    }
}

// Apply skin effects to snake
export function applySkinEffect(segment, index) {
    switch (currentSkin) {
        case SKINS.RAINBOW:
            return applyRainbowEffect(segment, index);
        case SKINS.SKULL:
            return applySkullEffect(segment, index);
        case SKINS.PARANOID:
            return applyParanoidEffect(segment, index);
        case SKINS.INFINITE:
            return applyInfiniteEffect(segment, index);
        case SKINS.HACKER:
            return applyHackerEffect(segment, index);
        default:
            return null;
    }
}

// Apply rainbow effect to snake
function applyRainbowEffect(segment, index) {
    // Generate super vibrant rainbow colors based on time and segment index
    // Use a faster time divisor for more rapid color changes
    const timeOffset = Date.now() / 10;
    
    // Use different color patterns for different segments
    let hue;
    
    // Create different color patterns based on segment position
    if (index % 4 === 0) {
        // Pattern 1: Fast cycling through the spectrum
        hue = (timeOffset + index * 15) % 360;
    } else if (index % 4 === 1) {
        // Pattern 2: Offset cycling
        hue = (timeOffset + index * 25 + 120) % 360;
    } else if (index % 4 === 2) {
        // Pattern 3: Another offset
        hue = (timeOffset + index * 35 + 240) % 360;
    } else {
        // Pattern 4: Reverse direction
        hue = (360 - (timeOffset + index * 20) % 360);
    }
    
    // Increase saturation and brightness for more vibrant colors
    const saturation = 100; // Maximum saturation
    
    // Vary the lightness slightly for more depth
    const lightness = 45 + Math.sin(timeOffset / 100 + index / 2) * 15;
    
    return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
}

// Apply skull effect to snake
function applySkullEffect(segment, index) {
    // Dark gradient for the snake body
    if (index === 0) {
        // Head is slightly lighter
        return '#444';
    } else {
        // Body gets darker towards the tail
        const darkness = Math.max(10, 40 - index * 2);
        return `rgb(${darkness}, ${darkness}, ${darkness})`;
    }
}

// Apply paranoid effect to snake
function applyParanoidEffect(segment, index) {
    // Green with random fluctuations
    const timeOffset = Date.now() / 100;
    const randomFactor = Math.sin(timeOffset + index) * 30;
    
    if (index === 0) {
        // Head is bright green
        return '#00FF00';
    } else {
        // Body has random green fluctuations
        const greenValue = Math.max(0, Math.min(255, 100 + randomFactor));
        return `rgb(0, ${greenValue}, 0)`;
    }
}

// Cosmic-themed colors for the Infinite Snake
const COSMIC_COLORS = [
    '#191970', // Midnight Blue
    '#6A0DAD', // Ultraviolet
    '#FFF8E7', // Cosmic Latte
    '#0B0B0B', // Black Hole Black
    '#C0C0C0', // Starship Silver
    '#F5F5F5', // Milky Way White
    '#B000B5', // Nebula Purple
    '#3434FF', // Galaxy Blue
    '#000000', // Void Black
    '#FF5CCD'  // Supernova Pink
];

// Apply infinite effect to snake
function applyInfiniteEffect(segment, index) {
    // Use cosmic-themed colors
    const timeOffset = Date.now() / 100;
    
    // Determine which cosmic color to use based on segment position and time
    const colorIndex = (index + Math.floor(timeOffset / 200)) % COSMIC_COLORS.length;
    let baseColor = COSMIC_COLORS[colorIndex];
    
    // Add occasional white "stars" (random segments)
    if (Math.random() < 0.01) {
        return '#FFFFFF'; // White star
    }
    
    // For the head, use a special color
    if (index === 0) {
        return '#00BFFF'; // Deep Sky Blue for the head
    }
    
    return baseColor;
}

// Hacker-themed colors
const HACKER_COLORS = [
    '#00FF00', // Matrix Green
    '#32CD32', // Lime Green
    '#228B22', // Forest Green
    '#008000', // Dark Green
    '#006400', // Darker Green
    '#ADFF2F'  // Green Yellow
];

// Apply hacker effect to snake
function applyHackerEffect(segment, index) {
    // Binary pattern effect
    const timeOffset = Date.now() / 150;
    
    // Use different shades of green for a matrix-like effect
    const colorIndex = (index + Math.floor(timeOffset / 150)) % HACKER_COLORS.length;
    let baseColor = HACKER_COLORS[colorIndex];
    
    // Add occasional binary digits (1s and 0s) as random segments
    if (Math.random() < 0.02) {
        return '#FFFFFF'; // White binary digit
    }
    
    // For the head, use a bright green
    if (index === 0) {
        return '#00FF00'; // Bright Matrix Green for the head
    }
    
    return baseColor;
}

// Creative mode controller setup
function setupCreativeModeController() {
    // Check if controller already exists
    if (document.getElementById('creative-mode-controller')) {
        return; // Already set up
    }
    
    // Create controller container
    const controller = document.createElement('div');
    controller.id = 'creative-mode-controller';
    controller.className = 'creative-mode-controller';
    controller.style.display = 'none'; // Hidden by default
    
    // Add controller title
    const title = document.createElement('h3');
    title.textContent = 'Creative Mode';
    controller.appendChild(title);
    
    // Create control inputs
    const controls = [
        { id: 'creative-health', label: 'Health', min: 1, max: 10, default: 3 },
        { id: 'creative-speed', label: 'Speed', min: 1, max: 20, default: 5 },
        { id: 'creative-size', label: 'Size', min: 1, max: 20, default: 3 }
    ];
    
    // Create control elements
    controls.forEach(control => {
        const controlGroup = document.createElement('div');
        controlGroup.className = 'control-group';
        
        const label = document.createElement('label');
        label.textContent = control.label + ':';
        label.setAttribute('for', control.id);
        
        const input = document.createElement('input');
        input.type = 'number';
        input.id = control.id;
        input.min = control.min;
        input.max = control.max;
        input.value = control.default;
        input.step = control.step || 1;
        
        // Add event listeners to update game stats when changed
        input.addEventListener('change', () => {
            updateGameStat(control.id.replace('creative-', ''), input.value);
        });
        
        // Also update when Enter key is pressed
        input.addEventListener('keydown', (event) => {
            if (event.key === 'Enter') {
                updateGameStat(control.id.replace('creative-', ''), input.value);
                // Remove focus from the input to provide visual feedback that the change was applied
                input.blur();
            }
        });
        
        controlGroup.appendChild(label);
        controlGroup.appendChild(input);
        controller.appendChild(controlGroup);
    });
    
    // Add skins button and dropdown to creative mode controller
    const skinsContainer = document.createElement('div');
    skinsContainer.className = 'creative-skins-container';
    
    // Create skins button
    const skinsButton = document.createElement('button');
    skinsButton.id = 'creative-skins-button';
    skinsButton.className = 'creative-skins-button';
    skinsButton.textContent = 'Skins';
    
    // Create skins dropdown
    const skinsDropdown = document.createElement('div');
    skinsDropdown.id = 'creative-skins-dropdown';
    skinsDropdown.className = 'creative-skins-dropdown hidden';
    
    // Add elements to container
    skinsContainer.appendChild(skinsButton);
    skinsContainer.appendChild(skinsDropdown);
    
    // Add container to controller
    controller.appendChild(skinsContainer);
    
    // Add click event to skins button
    skinsButton.addEventListener('click', () => {
        skinsDropdown.classList.toggle('hidden');
        updateCreativeSkinsDropdown(skinsDropdown);
    });
    

    
    // Update input values when creative mode is shown
    const updateInputValues = () => {
        const game = window.snakeGame;
        if (!game) return;
        
        // Update input values to match current game state
        document.getElementById('creative-health').value = game.health;
        document.getElementById('creative-speed').value = game.gameSpeed;
        document.getElementById('creative-size').value = game.snake.segments.length;
        
        // Update the skins dropdown when creative mode is shown
        const skinsDropdown = document.getElementById('creative-skins-dropdown');
        if (skinsDropdown) {
            updateCreativeSkinsDropdown(skinsDropdown);
        }
    };
    
    // Update values when the controller becomes visible
    const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
            if (mutation.type === 'attributes' && 
                mutation.attributeName === 'style' && 
                controller.style.display === 'block') {
                updateInputValues();
            }
        });
    });
    
    observer.observe(controller, { attributes: true });
    
    // Function to update the creative mode skins dropdown
    function updateCreativeSkinsDropdown(dropdown) {
        // Clear existing options
        dropdown.innerHTML = '';
        
        // Get unlocked skins
        const hasRainbowSkin = playerManager.hasAchievement('Rainbow Stuff');
        const hasSkullSkin = playerManager.hasAchievement('Death Master');
        const hasParanoidSkin = playerManager.hasAchievement('Paranoid Master');
        const hasInfiniteSkin = playerManager.hasAchievement('Cosmic Explorer');
        const hasHackerSkin = playerManager.hasAchievement('Hacker Mode');
        
        // Define available skins with their colors
        const availableSkins = [
            { id: SKINS.DEFAULT, name: 'Default', color: '#4CAF50', available: true },
            { id: SKINS.RAINBOW, name: 'Rainbow', color: '#FF9800', available: hasRainbowSkin },
            { id: SKINS.SKULL, name: 'Skull', color: '#FFFFFF', available: hasSkullSkin },
            { id: SKINS.PARANOID, name: 'Paranoid', color: '#FF0000', available: hasParanoidSkin },
            { id: SKINS.INFINITE, name: 'Infinite', color: '#3F51B5', available: hasInfiniteSkin },
            { id: SKINS.HACKER, name: 'Hacker', color: '#00FF00', available: hasHackerSkin }
        ];
        
        // Create options for each available skin
        availableSkins.forEach(skin => {
            if (skin.available) {
                const option = document.createElement('div');
                option.className = 'creative-skin-option';
                if (skin.id === currentSkin) {
                    option.classList.add('selected');
                }
                
                // Create indicator and name elements
                const indicator = document.createElement('span');
                indicator.className = 'creative-skin-option-indicator';
                indicator.style.backgroundColor = skin.color;
                
                const name = document.createElement('span');
                name.className = 'creative-skin-option-name';
                name.textContent = skin.name;
                
                // Add elements to option
                option.appendChild(indicator);
                option.appendChild(name);
                
                // Add click event to change skin
                option.addEventListener('click', () => {
                    selectSkin(skin.id);
                    dropdown.classList.add('hidden');
                    
                    // Update selected state in dropdown
                    document.querySelectorAll('.creative-skin-option').forEach(opt => {
                        opt.classList.remove('selected');
                    });
                    option.classList.add('selected');
                });
                
                dropdown.appendChild(option);
            }
        });
    }
    
    // Function to update game stats
    function updateGameStat(stat, value) {
        // Get the game instance
        const game = window.snakeGame;
        if (!game) return;
        
        // Parse the value as integer
        const numValue = parseInt(value);
        
        // Update the appropriate stat
        switch(stat) {
            case 'health':
                // Set health directly to the new value (not adding to current health)
                game.health = numValue;
                document.getElementById('health').textContent = numValue;
                break;
            case 'speed':
                // Set speed directly to the new value
                game.gameSpeed = numValue;
                document.getElementById('speed').textContent = numValue;
                // Update game loop interval
                if (game.gameLoop) {
                    clearInterval(game.gameLoop);
                    game.gameLoop = setInterval(() => game.update(), game.calculateGameInterval(numValue));
                }
                break;
            case 'size':
                // Update snake size
                const currentSize = game.snake.segments.length;
                const newSize = numValue;
                
                // Reset the snake with the new size
                // First, save the head position and direction
                const headX = game.snake.head.x;
                const headY = game.snake.head.y;
                const direction = game.snake.direction;
                
                // Clear existing segments
                game.snake.segments = [];
                
                // Add head segment
                game.snake.segments.push({ x: headX, y: headY });
                
                // Add body segments in a line based on the direction
                let offsetX = 0;
                let offsetY = 0;
                
                switch (direction) {
                    case 'right':
                        offsetX = -1;
                        break;
                    case 'left':
                        offsetX = 1;
                        break;
                    case 'up':
                        offsetY = 1;
                        break;
                    case 'down':
                        offsetY = -1;
                        break;
                }
                
                // Add remaining segments
                for (let i = 1; i < newSize; i++) {
                    game.snake.segments.push({
                        x: headX + (offsetX * i),
                        y: headY + (offsetY * i)
                    });
                }
                
                console.log(`Snake size updated to ${newSize} segments`);
                break;

        }
    }
    
    // Add controller to game screen
    const gameScreen = document.getElementById('game-screen');
    if (gameScreen) {
        gameScreen.appendChild(controller);
    }
}
