// Skin manager for Snake Game
import * as playerManager from './playerManager.js';
import { GRID_SIZE } from './components/config.js';

// Available skins
const SKINS = {
    DEFAULT: 'default',
    RAINBOW: 'rainbow',
    SKULL: 'skull',
    PARANOID: 'paranoid',
    INFINITE: 'infinite'
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
    
    // Update UI to reflect unlocked skins
    updateSkinsUI(hasRainbowSkin, hasSkullSkin, hasParanoidSkin, hasInfiniteSkin);
    
    // Set up event listeners
    setupEventListeners();
    
    console.log('Skin manager initialized');
    return currentSkin;
}

// Update the skins UI based on unlocked skins
function updateSkinsUI(hasRainbowSkin, hasSkullSkin, hasParanoidSkin, hasInfiniteSkin) {
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

// Select a skin
export function selectSkin(skin) {
    if (!Object.values(SKINS).includes(skin)) {
        console.error(`Invalid skin: ${skin}`);
        return;
    }
    
    currentSkin = skin;
    console.log(`Selected skin: ${skin}`);
    
    // Update UI
    updateSkinsUI(playerManager.hasAchievement('Rainbow Stuff'));
    
    // Save preference (could be added later)
    
    return skin;
}

// Get the current skin
export function getCurrentSkin() {
    return currentSkin;
}

// Get the current skin
export function getCurrentSkinType() {
    return currentSkin;
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
        if (points >= 350000) {
            document.body.classList.add('terminal-unlocked');
        }
    });
    
    // Show terminal when unlocked
    document.body.addEventListener('click', (event) => {
        if (document.body.classList.contains('terminal-unlocked') && 
            event.ctrlKey && event.altKey) {
            showTerminal();
        }
    });
    
    // Close terminal button
    closeTerminalButton.addEventListener('click', () => {
        terminalContainer.classList.add('hidden');
    });
    
    // Terminal input
    terminalInput.addEventListener('keydown', (event) => {
        if (event.key === 'Enter') {
            const command = terminalInput.value.trim();
            processCommand(command);
            terminalInput.value = '';
        }
    });
    
    // Process terminal command
    function processCommand(command) {
        // Add command to output
        appendToTerminal(`$ ${command}`);
        
        // Process command
        if (command.toLowerCase() === 'earn.lgbt') {
            // Unlock rainbow skin
            appendToTerminal('Unlocking Rainbow Skin...');
            setTimeout(() => {
                playerManager.handleGameEvent('rainbow_skin_unlocked');
                appendToTerminal('Rainbow Skin unlocked! 🌈');
                updateSkinsUI(true);
            }, 1000);
        } else if (command.toLowerCase() === 'help') {
            appendToTerminal('Available commands:');
            appendToTerminal('  help - Does nothing');
            appendToTerminal('  clear - Clears you mind');
            appendToTerminal('  tips(1) - Gives you a hint');
            appendToTerminal('  tips(2) - Gives you another hint');
            appendToTerminal('  .... - A rainbow skin really cool, you should try it');
        } else if (command.toLowerCase() === 'clear') {
            terminalOutput.innerHTML = '';
        } else if (command.toLowerCase() === 'tips(1)') {
            appendToTerminal('What is rainbow and is a comunity?');
        } else if (command.toLowerCase() === 'tips(2)') {
            appendToTerminal('exactly! now get just the 1st 4 letters capital, and add earn. in the beginign');
        } else {
            appendToTerminal(`Command not found: ${command}`);
        }
    }
    
    // Append text to terminal output
    function appendToTerminal(text) {
        const line = document.createElement('div');
        line.textContent = text;
        terminalOutput.appendChild(line);
        terminalOutput.scrollTop = terminalOutput.scrollHeight;
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
