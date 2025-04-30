import { GRID_WIDTH, GRID_HEIGHT, MAX_HEALTH, INITIAL_SPEED, MAX_SPEED, calculateGameInterval, difficultySettings, backgroundColors, fruitTypes, getCurrentDifficulty } from './config.js';
import { Snake } from './snake.js';
import { Food } from './food.js';

export class Game {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext('2d');
        this.snake = new Snake();
        this.food = new Food();
        
        this.score = 0;
        this.health = MAX_HEALTH;
        this.gameSpeed = INITIAL_SPEED;
        this.fruitsEaten = 0;
        this.level = 1;
        this.isGameOver = false;
        this.gameLoop = null;
        this.deathCount = 0; // Track number of deaths for skull skin
        this.paranoidModeTimer = 0; // Track time in paranoid mode
        this.infiniteModeMaxLevel = 0; // Track max level in infinite mode
        
        // Game mode flags
        this.isInfiniteMode = false;
        this.isParanoidMode = false;
        this.randomMovementCounter = 0;
        this.randomMovementChange = 2; // Change direction every 10 updates in paranoid mode
        this.allowPlayerControl = true; // Whether player can control the snake
        this.hasWallCollision = true;   // Whether snake collides with walls
        
        // Current background color
        this.backgroundColor = backgroundColors[1]; // Start with level 1 background
        
        // Set up event listeners
        this.setupEventListeners();
        
        // Set initial snake color
        this.updateSnakeColor();
    }
    
    // Initialize the game
    init() {
        // Set canvas dimensions (using the values from HTML)
        // this.canvas.width = GRID_WIDTH * 20;
        // this.canvas.height = GRID_HEIGHT * 20;
        
        // Reset game state
        this.reset();
        
        // Draw initial state
        this.draw();
        
        // Start game loop
        this.start();
    }
    
    // Update the snake color based on current level
    updateSnakeColor() {
        // Find the fruit type for the current level
        const fruitForLevel = fruitTypes.find(fruit => fruit.level === this.level);
        
        if (fruitForLevel && fruitForLevel.snakeColor) {
            // Set the snake color
            this.snake.setColor(fruitForLevel.snakeColor);
        }
    }
    
    // Set up event listeners
    setupEventListeners() {
        // Keyboard controls
        document.addEventListener('keydown', (event) => {
            this.handleKeyPress(event);
        });
        
        // Restart button
        document.getElementById('restart-button').addEventListener('click', () => {
            this.reset();
            this.start();
        });
        
        // Set up teleport functionality for Infinite skin
        if (window.skinManager) {
            window.skinManager.setupTeleport(this);
        }
        
        // Speed display is already defined in HTML
    }
    
    // Handle keyboard input
    handleKeyPress(event) {
        // Ignore keyboard input if player control is disabled (Paranoid mode)
        if (!this.allowPlayerControl) {
            return;
        }
        
        const key = event.key;
        
        // Handle arrow keys
        if (key.includes('Arrow')) {
            this.snake.setDirection(key.replace('Arrow', '').toLowerCase());
            return;
        }
        
        // Handle WASD keys
        switch(key.toLowerCase()) {
            case 'w':
                this.snake.setDirection('up');
                break;
            case 'a':
                this.snake.setDirection('left');
                break;
            case 's':
                this.snake.setDirection('down');
                break;
            case 'd':
                this.snake.setDirection('right');
                break;
        }
    }
    
    // Start the game loop
    start() {
        if (this.gameLoop) clearInterval(this.gameLoop);
        
        const interval = calculateGameInterval(this.gameSpeed);
        
        this.gameLoop = setInterval(() => this.update(), interval);
    }
    
    // Reset the game state
    reset() {
        this.snake.reset();
        this.score = 0;
        this.health = MAX_HEALTH;
        this.level = 1;
        this.gameSpeed = INITIAL_SPEED;
        this.fruitsEaten = 0;
        this.isGameOver = false;
        
        // Reset game mode flags
        this.isInfiniteMode = false;
        this.isParanoidMode = false;
        this.randomMovementCounter = 0;
        this.allowPlayerControl = true;
        this.hasWallCollision = true;
        
        // Reset food fruit counts
        if (this.food) {
            this.food.resetFruitCounts();
        } else {
            this.food = new Food();
        }
        
        // Hide game over screen if visible
        document.getElementById('game-over').classList.add('hidden');
        
        // Update UI
        this.updateScore();
        this.updateHealth();
        this.updateLevel();
        this.updateSpeed();
        this.updateDifficulty('easy');
        
        // Set initial background color
        this.backgroundColor = backgroundColors[1];
        
        // Set snake color
        this.updateSnakeColor();
        
        // Create initial food
        this.food.create(this.snake, this.level);
        
        console.log('Game reset - Initial speed:', this.gameSpeed);
    }
    
    // Main game update function
    update() {
        if (this.isGameOver) return;
        
        // Track time in paranoid mode for achievement
        if (this.isParanoidMode) {
            this.paranoidModeTimer += calculateGameInterval(this.gameSpeed) / 1000; // Convert ms to seconds
            
            // Check if player has been in paranoid mode for 5 minutes (300 seconds)
            if (this.paranoidModeTimer >= 300 && window.playerManager) {
                window.playerManager.unlockAchievement('Paranoid Master');
            }
        }
        
        // Track level in infinite mode for achievement
        if (this.isInfiniteMode && this.level > this.infiniteModeMaxLevel) {
            this.infiniteModeMaxLevel = this.level;
            
            // Check if player has reached level 38 in infinite mode
            if (this.infiniteModeMaxLevel >= 38 && window.playerManager) {
                window.playerManager.unlockAchievement('Cosmic Explorer');
            }
        }
        
        // Move snake
        const newHead = this.snake.move();
        
        // Handle screen wrapping for infinite and paranoid modes
        if (this.isInfiniteMode || this.isParanoidMode) {
            // Wrap horizontally and vertically
            if (newHead.x < 0) newHead.x = GRID_WIDTH - 1;
            if (newHead.x >= GRID_WIDTH) newHead.x = 0;
            if (newHead.y < 0) newHead.y = GRID_HEIGHT - 1;
            if (newHead.y >= GRID_HEIGHT) newHead.y = 0;
            
            // Update snake head position
            this.snake.head.x = newHead.x;
            this.snake.head.y = newHead.y;
            
            // Check for self-collision in infinite mode only
            // In Paranoid mode, we allow the snake to pass through itself
            if (this.isInfiniteMode && this.snake.hasCollidedWithSelf()) {
                this.handleCollision();
                return;
            }
        } else {
            // Normal mode - check for wall and self collisions
            if (this.isCollision(newHead)) {
                this.handleCollision();
                return;
            }
        }
        
        // Check if food is eaten
        let foodEaten = false;
        if (!this.isParanoidMode) {
            // Normal food handling for normal mode
            if (this.food && this.food.isAtPosition(newHead.x, newHead.y)) {
                this.handleFoodEaten(false); // Regular collection
                foodEaten = true;
            }
            // Special food handling for infinite skin - collect food within 5 blocks of any snake segment
            else if (window.skinManager && window.skinManager.isInfiniteSkin() && this.isFoodWithinSnakeRange()) {
                this.handleFoodEaten(true); // Range collection
                foodEaten = true;
                // Show the collection effect
                this.createRangeCollectionEffect();
            }
        } else {
            // Paranoid mode food handling
            this.randomMovementCounter++;
            
            // Randomly show/hide food
            if (Math.random() < 0.05) { // 5% chance each update
                this.food.create(this.snake, this.level);
            }
            
            // Check if food is eaten in paranoid mode
            if (this.food && this.food.isAtPosition(newHead.x, newHead.y)) {
                this.handleFoodEaten();
                foodEaten = true;
            }
        }
        
        // Remove tail if no food was eaten
        if (!foodEaten) {
            this.snake.removeTail();
        }
        
        // Draw the updated game state
        this.draw();
    }
    
    // Check for collisions with walls or self
    isCollision(position) {
        // Skip collision detection in paranoid mode
        if (this.isParanoidMode) {
            return false;
        }
        
        // Handle wall boundaries
        if (position.x < 0 || position.x >= GRID_WIDTH || 
            position.y < 0 || position.y >= GRID_HEIGHT) {
            
            // In infinite mode, wrap around instead of collision
            if (this.isInfiniteMode) {
                // Wrap the snake's head position
                this.wrapSnakePosition(position);
                return false;
            } else if (this.hasWallCollision) {
                // Normal mode: wall collision
                console.log(`Wall collision at position: x=${position.x}, y=${position.y}`);
                return true;
            }
        }
        
        // Self collision (infinite mode skips this check)
        if (!this.isInfiniteMode && this.snake.hasCollidedWithSelf()) {
            return true;
        }
        
        return false;
    }
    
    // Wrap the snake position around the screen in infinite mode
    wrapSnakePosition(position) {
        // Wrap horizontally
        if (position.x < 0) {
            position.x = GRID_WIDTH - 1;
        } else if (position.x >= GRID_WIDTH) {
            position.x = 0;
        }
        
        // Wrap vertically
        if (position.y < 0) {
            position.y = GRID_HEIGHT - 1;
        } else if (position.y >= GRID_HEIGHT) {
            position.y = 0;
        }
    }
    
    // Handle collision
    handleCollision() {
        // In Paranoid mode, the snake is immortal and should never reach this point
        // This is just a safety check
        if (this.isParanoidMode) {
            console.log('Collision in Paranoid mode - snake is immortal');
            // Do nothing - don't reposition the snake
            return;
        }
        
        // Check if skull skin's second chance is available
        if (window.skinManager && window.skinManager.isSkullSkin() && window.skinManager.isSecondChanceAvailable()) {
            // Use second chance and restore lives
            window.skinManager.useSecondChance();
            this.health = MAX_HEALTH;
            this.updateHealth();
            
            // Visual effect for second chance
            this.showSecondChanceEffect();
            
            // Reposition snake without changing its size
            this.snake.reposition();
            return;
        }
        
        // Increment death counter for skull skin achievement
        this.deathCount++;
        
        // Check if player has died 199 times (for skull skin)
        if (this.deathCount >= 199) {
            // Unlock the skull skin achievement
            if (window.playerManager) {
                window.playerManager.unlockAchievement('Death Master');
            }
        }
        
        // Reduce health
        this.health--;
        this.updateHealth();
        
        // Check if game over
        if (this.health <= 0) {
            this.gameOver();
        } else {
            // Reposition snake without changing its size
            this.snake.reposition();
        }
    }
    
    // Handle food eaten
    handleFoodEaten(isRangeCollection = false) {
        // Add points based on the fruit type
        this.score += this.food.points;
        
        // Increase fruits eaten counter
        this.fruitsEaten++;
        
        // Get current difficulty settings based on level
        const difficulty = getCurrentDifficulty(this.level);
        const settings = difficultySettings[difficulty];
        
        // Set snake color based on the eaten fruit's snake color
        const fruitType = fruitTypes[this.food.type];
        if (fruitType && fruitType.snakeColor) {
            this.snake.setColor(fruitType.snakeColor);
            console.log(`Snake color changed to ${fruitType.snakeColor} after eating ${fruitType.name}`);
        }
        
        // Check for score-based achievements
        if (this.score >= 100000) {
            playerManager.handleGameEvent('high_score', this.score);
        }
        
        // Check if we should grow the snake based on the fruitsPerGrowth setting
        const shouldGrow = this.fruitsEaten % settings.fruitsPerGrowth === 0;
        
        // For range collection with infinite skin, always grow by exactly 1 segment
        if (isRangeCollection && window.skinManager && window.skinManager.isInfiniteSkin()) {
            // We already added one segment in the move method, so no need to add more
            // But also don't remove the tail
            console.log(`Snake grew by 1 block after range collection in infinite skin mode`);
        } else if (shouldGrow) {
            // We already added one segment in the move method, so we need to add (growthBlocksPerFruit - 1) more
            const extraGrowth = settings.growthBlocksPerFruit - 1;
            for (let i = 0; i < extraGrowth; i++) {
                // Add a new segment at the same position as the tail
                // This will create the illusion of growth as the snake moves
                const tail = this.snake.segments[this.snake.segments.length - 1];
                this.snake.segments.push({...tail});
            }
            console.log(`Snake grew by ${settings.growthBlocksPerFruit} blocks after eating ${settings.fruitsPerGrowth} fruits in ${difficulty} mode`);
        } else {
            // Remove the tail segment that was added in the move method since we don't want to grow
            this.snake.removeTail();
            console.log(`No growth after eating ${this.fruitsEaten % settings.fruitsPerGrowth}/${settings.fruitsPerGrowth} fruits in ${difficulty} mode`);
        }
        
        
        // Apply speed increase based on fruits eaten, but skip for range collection
        if (!isRangeCollection && this.fruitsEaten % settings.fruitsForSpeedIncrease === 0) {
            // Apply speed increase but cap at MAX_SPEED
            this.gameSpeed = Math.min(MAX_SPEED, this.gameSpeed + settings.speedIncreaseAmount);
            clearInterval(this.gameLoop);
            this.gameLoop = setInterval(() => this.update(), calculateGameInterval(this.gameSpeed));
            this.updateSpeed();
            console.log(`Speed increased to ${this.gameSpeed} after eating ${this.fruitsEaten} fruits`);
        }
        
        // Check for level increase (every 600 points)
        if (this.score % 600 === 0) {
            const newLevel = this.level + 1;
            
            // Check if we're transitioning to a new difficulty level
            const currentDifficulty = getCurrentDifficulty(this.level);
            const newDifficulty = getCurrentDifficulty(newLevel);
            
            console.log(`LEVEL TRANSITION: Score ${this.score}, Level ${this.level} -> ${newLevel}, Difficulty ${currentDifficulty} -> ${newDifficulty}`);
            
            // Explicitly check for the specific level transitions that should trigger dialogs
            const isTransitionToMedium = this.level === 5 && newLevel === 6;
            const isTransitionToHard = this.level === 10 && newLevel === 11;
            
            // Show dialog for medium or hard transitions, but skip for range collection
            if ((isTransitionToMedium || isTransitionToHard) && !isRangeCollection) {
                // We're transitioning to a new difficulty - show prompt
                this.pause(); // Pause the game during prompt
                
                const startNewDifficulty = () => {
                    // User chose to start fresh with new difficulty
                    if (newDifficulty === 'medium') {
                        // Start at level 6 with speed 8 and 3 lives
                        this.level = 6;
                        this.gameSpeed = 8;
                        this.health = 3;
                    } else if (newDifficulty === 'hard') {
                        // Start at level 12 with speed 12 and 2 lives
                        this.level = 12;
                        this.gameSpeed = 12;
                        this.health = 2;
                    }
                    
                    // Update snake position
                    this.snake.reposition();
                    
                    // Update display
                    this.updateLevel();
                    this.updateSpeed();
                    this.updateHealth();
                    this.updateDifficulty(newDifficulty);
                    
                    // Update background color
                    this.backgroundColor = backgroundColors[this.level];
                    
                    // Resume game
                    this.resume();
                };
                
                const continueCurrentProgress = () => {
                    // User chose to continue with current progress
                    this.level = newLevel;
                    
                    // Each level adds 2 more to the speed, but cap at MAX_SPEED
                    this.gameSpeed = Math.min(MAX_SPEED, this.gameSpeed + 2);
                    
                    // Update display
                    this.updateLevel();
                    this.updateSpeed();
                    this.updateDifficulty(newDifficulty);
                    
                    // Update background color
                    this.backgroundColor = backgroundColors[this.level];
                    
                    // Resume game
                    this.resume();
                };
                
                // Remove any existing transition dialogs first
                const existingDialogs = document.querySelectorAll('.transition-dialog');
                existingDialogs.forEach(dialog => {
                    document.body.removeChild(dialog);
                });
                
                // Create and show the transition dialog
                const transitionDialog = document.createElement('div');
                transitionDialog.className = 'transition-dialog';
                transitionDialog.id = 'difficulty-transition-dialog';
                transitionDialog.innerHTML = `
                    <div class="transition-content">
                        <h2>New Difficulty: ${newDifficulty.charAt(0).toUpperCase() + newDifficulty.slice(1)}</h2>
                        <p>Do you want to continue from where you're at, or start over in ${newDifficulty} mode?</p>
                        <div class="transition-buttons">
                            <button id="continue-progress">Continue Progress</button>
                            <button id="start-fresh">Start Fresh</button>
                        </div>
                    </div>
                `;
                
                // Make sure the dialog is visible
                transitionDialog.style.display = 'flex';
                
                document.body.appendChild(transitionDialog);
                console.log('Transition dialog created and appended to body');
                
                // Add event listeners to buttons with error handling
                const continueButton = document.getElementById('continue-progress');
                if (continueButton) {
                    continueButton.addEventListener('click', () => {
                        try {
                            if (transitionDialog.parentNode) {
                                document.body.removeChild(transitionDialog);
                            }
                            continueCurrentProgress();
                        } catch (error) {
                            console.error('Error in continue button handler:', error);
                        }
                    });
                } else {
                    console.error('Continue progress button not found');
                }
                
                const startFreshButton = document.getElementById('start-fresh');
                if (startFreshButton) {
                    startFreshButton.addEventListener('click', () => {
                        try {
                            if (transitionDialog.parentNode) {
                                document.body.removeChild(transitionDialog);
                            }
                            startNewDifficulty();
                        } catch (error) {
                            console.error('Error in start fresh button handler:', error);
                        }
                    });
                } else {
                    console.error('Start fresh button not found');
                }
                
                return; // Stop processing here until user makes a choice
            }
            
            // Normal level progression (no difficulty change)
            this.level++;
            
            // Each level adds 2 more to the speed, but cap at MAX_SPEED
            this.gameSpeed = Math.min(MAX_SPEED, this.gameSpeed + 2);
            clearInterval(this.gameLoop);
            this.gameLoop = setInterval(() => this.update(), calculateGameInterval(this.gameSpeed));
            
            // Update level display
            this.updateLevel();
            this.updateSpeed();
            
            // Update background color for the new level
            this.backgroundColor = backgroundColors[this.level];
            console.log(`Level up to ${this.level}! New background color: ${this.backgroundColor}`);
        }
        
        this.updateScore();
        
        // Create new food based on current level
        this.food.create(this.snake, this.level);
    }
    
    // Draw the game state
    draw() {
        // Clear canvas with dark background
        this.ctx.fillStyle = '#222';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Draw colored background with opacity
        if (this.backgroundColor) {
            this.ctx.globalAlpha = 0.2; // Set opacity
            this.ctx.fillStyle = this.backgroundColor;
            this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
            this.ctx.globalAlpha = 1.0; // Reset opacity
        }
        
        // Draw snake
        this.snake.draw(this.ctx);
        
        // Draw food (skip in paranoid mode)
        if (!this.isParanoidMode) {
            this.food.draw(this.ctx);
        }
        
        // Draw mode indicator
        if (this.isInfiniteMode || this.isParanoidMode) {
            this.ctx.font = '16px Arial';
            this.ctx.fillStyle = 'white';
            this.ctx.textAlign = 'center';
            
            if (this.isInfiniteMode) {
                this.ctx.fillText('INFINITE MODE', this.canvas.width / 2, 30);
            } else if (this.isParanoidMode) {
                this.ctx.fillText('PARANOID MODE', this.canvas.width / 2, 30);
            }
        }
    }
    
    // Update score display
    updateScore() {
        document.getElementById('score').textContent = this.score;
        document.getElementById('final-score').textContent = this.score;
    }
    
    // Update health display
    updateHealth() {
        document.getElementById('health').textContent = this.health;
    }
    
    // Update level display
    updateLevel() {
        const previousLevel = parseInt(document.getElementById('level').textContent) || 0;
        const newLevel = this.level;
        
        // Update the display
        document.getElementById('level').textContent = newLevel;
        
        // Check for specific level transitions that should trigger difficulty dialogs
        if (previousLevel === 5 && newLevel === 6) {
            console.log('MEDIUM DIFFICULTY TRANSITION DETECTED');
            this.showDifficultyTransitionDialog('medium');
        } else if (previousLevel === 10 && newLevel === 11) {
            console.log('HARD DIFFICULTY TRANSITION DETECTED');
            this.showDifficultyTransitionDialog('hard');
        }
    }
    
    // Update speed display
    updateSpeed() {
        document.getElementById('speed').textContent = this.gameSpeed;
    }
    
    // Show difficulty transition dialog
    showDifficultyTransitionDialog(newDifficulty) {
        // Pause the game during the dialog
        this.pause();
        
        // Remove any existing transition dialogs
        const existingDialogs = document.querySelectorAll('.transition-dialog');
        existingDialogs.forEach(dialog => {
            if (dialog.parentNode) {
                dialog.parentNode.removeChild(dialog);
            }
        });
        
        // Create the dialog
        const transitionDialog = document.createElement('div');
        transitionDialog.className = 'transition-dialog';
        transitionDialog.id = 'difficulty-transition-dialog';
        transitionDialog.innerHTML = `
            <div class="transition-content">
                <h2>New Difficulty: ${newDifficulty.charAt(0).toUpperCase() + newDifficulty.slice(1)}</h2>
                <p>Do you want to continue from where you're at, or start over in ${newDifficulty} mode?</p>
                <div class="transition-buttons">
                    <button id="continue-progress">Continue Progress</button>
                    <button id="start-fresh">Start Fresh</button>
                </div>
            </div>
        `;
        
        // Ensure the dialog is visible
        transitionDialog.style.display = 'flex';
        transitionDialog.style.zIndex = '1000';
        
        // Add to the document
        document.body.appendChild(transitionDialog);
        console.log('Difficulty transition dialog created and displayed');
        
        // Set up the continue progress option
        const continueProgress = () => {
            // Remove the dialog
            if (transitionDialog.parentNode) {
                transitionDialog.parentNode.removeChild(transitionDialog);
            }
            
            // Continue with current progress
            // Each level adds 2 more to the speed, but cap at MAX_SPEED
            this.gameSpeed = Math.min(MAX_SPEED, this.gameSpeed + 2);
            
            // Update display
            this.updateSpeed();
            this.updateDifficulty(newDifficulty);
            
            // Update background color
            this.backgroundColor = backgroundColors[this.level];
            
            // Resume game
            this.resume();
        };
        
        // Set up the start fresh option
        const startFresh = () => {
            // Remove the dialog
            if (transitionDialog.parentNode) {
                transitionDialog.parentNode.removeChild(transitionDialog);
            }
            
            // Set up based on difficulty
            if (newDifficulty === 'medium') {
                // Start at level 6 with speed 8 and 3 lives
                this.level = 6;
                this.gameSpeed = 8;
                this.health = 3;
            } else if (newDifficulty === 'hard') {
                // Start at level 12 with speed 12 and 2 lives
                this.level = 12;
                this.gameSpeed = 12;
                this.health = 2;
            }
            
            // Update snake position
            this.snake.reposition();
            
            // Update display
            this.updateLevel();
            this.updateSpeed();
            this.updateHealth();
            this.updateDifficulty(newDifficulty);
            
            // Update background color
            this.backgroundColor = backgroundColors[this.level];
            
            // Resume game
            this.resume();
        };
        
        // Add button event listeners
        const continueButton = document.getElementById('continue-progress');
        if (continueButton) {
            continueButton.addEventListener('click', continueProgress);
        }
        
        const startFreshButton = document.getElementById('start-fresh');
        if (startFreshButton) {
            startFreshButton.addEventListener('click', startFresh);
        }
    }
    
    // Update difficulty display
    updateDifficulty(difficulty) {
        const difficultyElement = document.getElementById('difficulty');
        if (difficultyElement) {
            // Capitalize first letter of difficulty
            const displayText = difficulty.charAt(0).toUpperCase() + difficulty.slice(1);
            difficultyElement.textContent = displayText;
        }
    }
    
    // Game over
    gameOver() {
        this.isGameOver = true;
        clearInterval(this.gameLoop);
        document.getElementById('game-over').classList.remove('hidden');
    }
    
    // Show visual effect for second chance (skull skin)
    showSecondChanceEffect() {
        // Create a flash effect
        const originalFillStyle = this.ctx.fillStyle;
        const originalGlobalAlpha = this.ctx.globalAlpha;
        
        // White flash
        this.ctx.fillStyle = '#FFFFFF';
        this.ctx.globalAlpha = 0.7;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Reset canvas properties
        this.ctx.fillStyle = originalFillStyle;
        this.ctx.globalAlpha = originalGlobalAlpha;
        
        // Show text notification
        this.ctx.font = 'bold 24px Arial';
        this.ctx.fillStyle = '#FF0000';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('SECOND CHANCE!', this.canvas.width / 2, this.canvas.height / 2);
        
        // Draw skull icon
        this.ctx.font = '36px Arial';
        this.ctx.fillText('💀', this.canvas.width / 2, this.canvas.height / 2 - 40);
    }
    
    // Make calculateGameInterval available as a method for pause/resume
    calculateGameInterval(speed) {
        return calculateGameInterval(speed);
    }
    
    // Check if food is within range of any snake segment (for Infinite skin)
    isFoodWithinSnakeRange() {
        // Only apply this feature for Infinite skin
        if (!window.skinManager || !window.skinManager.isInfiniteSkin()) {
            return false;
        }
        
        // Don't check too frequently to avoid performance issues
        // Only check every 3 game updates
        if (!this._lastRangeCheck) {
            this._lastRangeCheck = 0;
        }
        
        this._lastRangeCheck++;
        if (this._lastRangeCheck < 3) {
            return false;
        }
        
        this._lastRangeCheck = 0;
        
        const foodPos = this.food.position;
        const range = 5; // 5-block range for collection
        
        // Check only head and every 3rd segment to improve performance
        for (let i = 0; i < this.snake.segments.length; i += 3) {
            const segment = this.snake.segments[i];
            
            // Calculate Manhattan distance between segment and food
            const distance = Math.abs(segment.x - foodPos.x) + Math.abs(segment.y - foodPos.y);
            
            // If within range, food can be collected
            if (distance <= range) {
                // Store the segment that collected the food
                this._rangeCollectionSegment = segment;
                return true;
            }
        }
        
        return false;
    }
    
    // Create a visual effect for range collection
    createRangeCollectionEffect() {
        // Only create effect if we have a segment that collected food
        if (!this._rangeCollectionSegment || !this.food) {
            return;
        }
        
        const segment = this._rangeCollectionSegment;
        const foodPos = this.food.position;
        
        // Store original context settings
        const ctx = this.ctx;
        const originalGlobalAlpha = ctx.globalAlpha;
        const originalStrokeStyle = ctx.strokeStyle;
        const originalLineWidth = ctx.lineWidth;
        
        // Create a line connecting the segment to the food
        ctx.beginPath();
        ctx.moveTo((segment.x + 0.5) * GRID_SIZE, (segment.y + 0.5) * GRID_SIZE);
        ctx.lineTo((foodPos.x + 0.5) * GRID_SIZE, (foodPos.y + 0.5) * GRID_SIZE);
        ctx.strokeStyle = '#00BFFF'; // Deep Sky Blue
        ctx.lineWidth = 2;
        ctx.globalAlpha = 0.6;
        ctx.stroke();
        
        // Reset context settings
        ctx.globalAlpha = originalGlobalAlpha;
        ctx.strokeStyle = originalStrokeStyle;
        ctx.lineWidth = originalLineWidth;
        
        // Clear the segment reference
        this._rangeCollectionSegment = null;
    }
}
