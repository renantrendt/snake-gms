import { GRID_SIZE, GRID_WIDTH, GRID_HEIGHT, fruitTypes, getCurrentDifficulty } from './config.js';

export class Food {
    constructor() {
        this.position = { x: 0, y: 0 };
        this.type = 0;
        this.color = '';
        this.points = 0;
        this.name = '';
        this.symbol = null;
        this.image = null;
        this.imageObj = null; // For storing loaded image objects
        
        // Track fruit appearance counts for each level
        this.fruitCounts = {};
        this.resetFruitCounts();
    }
    
    // Reset fruit counts when starting a new game
    resetFruitCounts() {
        this.fruitCounts = {
            // Easy mode - 6 fruits each
            1: 0, 2: 0, 3: 0, 4: 0, 5: 0,
            // Medium mode - 7 fruits each
            6: 0, 7: 0, 8: 0, 9: 0, 10: 0,
            // Hard mode - 3 fruits each (except banana = 1)
            11: 0, 12: 0, 13: 0, 14: 0, 15: 0
        };
    }
    
    // Get max count for a specific level
    getMaxCountForLevel(level) {
        if (level <= 5) return 6;      // Easy mode: 6 fruits each
        if (level <= 10) return 7;     // Medium mode: 7 fruits each
        if (level <= 14) return 3;     // Hard mode (11-14): 3 fruits each
        return 1;                      // Banana (level 15): 1 fruit only
    }
    
    // Create a new food item at random position
    create(snake, level = 1) {
        // Get the fruit for the current level
        const fruitForLevel = fruitTypes.find(fruit => fruit.level === level);
        
        // If we've reached the max count for this level's fruit, use the previous level's fruit
        let selectedFruit = fruitForLevel;
        const maxCount = this.getMaxCountForLevel(level);
        
        if (this.fruitCounts[level] >= maxCount) {
            // If we're at level 1 or all previous levels are maxed out, reset counts
            if (level === 1) {
                this.resetFruitCounts();
            } else {
                // Try to find a previous level that hasn't reached its max
                let prevLevel = level - 1;
                while (prevLevel >= 1 && this.fruitCounts[prevLevel] >= this.getMaxCountForLevel(prevLevel)) {
                    prevLevel--;
                }
                
                if (prevLevel >= 1) {
                    selectedFruit = fruitTypes.find(fruit => fruit.level === prevLevel);
                } else {
                    // If all previous levels are maxed, reset counts for current level
                    this.fruitCounts[level] = 0;
                }
            }
        }
        
        // Increment the count for this fruit's level
        this.fruitCounts[selectedFruit.level]++;
        
        // Define the stats area to avoid (top-left corner)
        const statsAreaWidth = 10; // Width of the stats area in grid cells
        const statsAreaHeight = 6; // Height of the stats area in grid cells
        
        // Add a safety margin around the stats area
        const safetyMargin = 1;
        
        // Create food at random position (ensuring it's not on the snake or in the stats area)
        let newPosition;
        let attempts = 0;
        const maxAttempts = 100; // Prevent infinite loop
        
        do {
            // After many attempts, try to be more selective about position
            if (attempts > 50) {
                // Try to place food in the right or bottom half of the screen
                newPosition = {
                    x: Math.floor(Math.random() * (GRID_WIDTH - statsAreaWidth)) + statsAreaWidth,
                    y: Math.floor(Math.random() * GRID_HEIGHT)
                };
            } else {
                newPosition = {
                    x: Math.floor(Math.random() * GRID_WIDTH),
                    y: Math.floor(Math.random() * GRID_HEIGHT)
                };
            }
            
            attempts++;
            
            // Check if position is in or too close to the stats area
            const isInStatsArea = newPosition.x < (statsAreaWidth + safetyMargin) && 
                                 newPosition.y < (statsAreaHeight + safetyMargin);
            
            // Continue loop if position is on snake or in stats area
            if (snake.isPositionOnSnake(newPosition) || isInStatsArea) {
                continue;
            }
            
            // If we reach here, the position is valid
            break;
            
        } while (attempts < maxAttempts);
        
        // If we couldn't find a valid position after max attempts, place it in a safe default position
        if (attempts >= maxAttempts) {
            newPosition = {
                x: Math.floor(GRID_WIDTH * 0.75),
                y: Math.floor(GRID_HEIGHT * 0.75)
            };
            // Make sure it's not on the snake
            if (snake.isPositionOnSnake(newPosition)) {
                newPosition.x = (newPosition.x + 5) % GRID_WIDTH;
                newPosition.y = (newPosition.y + 5) % GRID_HEIGHT;
            }
        }
        
        this.position = newPosition;
        this.type = fruitTypes.indexOf(selectedFruit);
        this.color = selectedFruit.color;
        this.points = selectedFruit.points;
        this.name = selectedFruit.name;
        this.symbol = selectedFruit.symbol;
        this.image = selectedFruit.image;
        
        // Load image if needed
        if (this.image) {
            this.loadImage(`images/${this.image}`);
        } else {
            this.imageObj = null;
        }
        
        console.log(`Created ${this.name} (Level ${selectedFruit.level}) - Count: ${this.fruitCounts[selectedFruit.level]}/${this.getMaxCountForLevel(selectedFruit.level)}`);
    }



    // Load image for fruits that use images
    loadImage(src) {
        this.imageObj = new Image();
        this.imageObj.src = src;
    }

    // Draw the food on the canvas
    draw(ctx) {
        const x = this.position.x * GRID_SIZE;
        const y = this.position.y * GRID_SIZE;
        
        // If we have an image and it's loaded, draw it
        if (this.imageObj && this.imageObj.complete) {
            ctx.drawImage(this.imageObj, x, y, GRID_SIZE, GRID_SIZE);
        } 
        // If we have a symbol, draw it as text
        else if (this.symbol) {
            ctx.fillStyle = this.color;
            ctx.beginPath();
            const centerX = x + GRID_SIZE / 2;
            const centerY = y + GRID_SIZE / 2;
            const radius = GRID_SIZE / 2 - 2; // Slightly smaller for better appearance
            ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
            ctx.fill();
            
            // Draw the symbol on top
            ctx.fillStyle = '#000'; // Black text
            ctx.font = `${GRID_SIZE * 0.7}px Arial`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(this.symbol, centerX, centerY);
        } 
        // Otherwise, just draw a colored circle
        else {
            ctx.fillStyle = this.color;
            ctx.beginPath();
            const centerX = x + GRID_SIZE / 2;
            const centerY = y + GRID_SIZE / 2;
            const radius = GRID_SIZE / 2 - 2;
            ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
            ctx.fill();
        }
    }

    // Check if the snake has eaten the food
    isEatenBy(snakeHead) {
        return this.position.x === snakeHead.x && this.position.y === snakeHead.y;
    }
    
    // Alias for isEatenBy for compatibility
    isAtPosition(x, y) {
        return this.position.x === x && this.position.y === y;
    }
}
