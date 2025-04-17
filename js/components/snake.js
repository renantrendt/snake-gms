import { GRID_SIZE } from './config.js';

export class Snake {
    constructor(initialX = 10, initialY = 15) {
        // Create initial snake (3 segments)
        this.segments = [
            { x: initialX, y: initialY },
            { x: initialX - 1, y: initialY },
            { x: initialX - 2, y: initialY }
        ];
        this.direction = 'right';
        this.nextDirection = 'right';
        this.color = '#00FF00'; // Default green color
    }

    // Get the head of the snake
    get head() {
        return this.segments[0];
    }

    // Set the direction of the snake
    setDirection(direction) {
        // Prevent reversing direction directly (can't go right if moving left, etc.)
        if (direction === 'up' && this.direction !== 'down') {
            this.nextDirection = 'up';
        } else if (direction === 'down' && this.direction !== 'up') {
            this.nextDirection = 'down';
        } else if (direction === 'left' && this.direction !== 'right') {
            this.nextDirection = 'left';
        } else if (direction === 'right' && this.direction !== 'left') {
            this.nextDirection = 'right';
        }
    }

    // Move the snake in the current direction
    move() {
        // Check if paranoid skin should trigger random movement
        if (window.skinManager && window.skinManager.shouldTriggerRandomMovement()) {
            // Randomly change direction for paranoid skin
            const directions = ['up', 'down', 'left', 'right'];
            const randomDirection = directions[Math.floor(Math.random() * directions.length)];
            
            // Make sure we don't reverse direction
            if ((randomDirection === 'up' && this.direction !== 'down') ||
                (randomDirection === 'down' && this.direction !== 'up') ||
                (randomDirection === 'left' && this.direction !== 'right') ||
                (randomDirection === 'right' && this.direction !== 'left')) {
                this.nextDirection = randomDirection;
            }
        }
        
        // Update direction
        this.direction = this.nextDirection;
        
        // Calculate new head position
        const newHead = { ...this.head };
        
        switch (this.direction) {
            case 'up':
                newHead.y -= 1;
                break;
            case 'down':
                newHead.y += 1;
                break;
            case 'left':
                newHead.x -= 1;
                break;
            case 'right':
                newHead.x += 1;
                break;
        }
        
        // Add new head
        this.segments.unshift(newHead);
        
        return newHead;
    }

    // Remove the tail segment
    removeTail() {
        return this.segments.pop();
    }

    // Reset the snake to initial position (with initial size)
    reset(initialX = 10, initialY = 15) {
        this.segments = [
            { x: initialX, y: initialY },
            { x: initialX - 1, y: initialY },
            { x: initialX - 2, y: initialY }
        ];
        this.direction = 'right';
        this.nextDirection = 'right';
        // Keep the current color when resetting
    }
    
    // Reposition the snake without changing its size
    reposition(initialX = 10, initialY = 15) {
        // Keep track of the current size
        const currentSize = this.segments.length;
        
        // Create new segments array with the same size
        this.segments = [];
        
        // Add the head
        this.segments.push({ x: initialX, y: initialY });
        
        // Add the body segments in a line to the left
        for (let i = 1; i < currentSize; i++) {
            // Calculate position to avoid going off-screen
            let segX = initialX - i;
            
            // If we would go off-screen to the left, wrap around or change direction
            if (segX < 0) {
                // Place segments below the head instead
                segX = initialX;
                this.segments.push({ x: segX, y: initialY + i });
            } else {
                this.segments.push({ x: segX, y: initialY });
            }
        }
        
        // Reset direction to right
        this.direction = 'right';
        this.nextDirection = 'right';
    }
    
    // Teleport the snake to a new position (for Infinite skin)
    teleport(x, y) {
        if (!this.segments || this.segments.length === 0) return;
        
        // Calculate the offset from current head to new position
        const offsetX = x - this.head.x;
        const offsetY = y - this.head.y;
        
        // Move all segments by the same offset
        for (let i = 0; i < this.segments.length; i++) {
            this.segments[i].x += offsetX;
            this.segments[i].y += offsetY;
        }
        
        // Don't change the direction when teleporting
    }

    // Set the snake color
    setColor(color) {
        this.color = color;
    }

    // Check if a position is occupied by the snake
    isPositionOnSnake(position) {
        return this.segments.some(segment => 
            segment.x === position.x && segment.y === position.y
        );
    }

    // Check if the snake has collided with itself
    hasCollidedWithSelf(newHeadPosition = null) {
        // Use the provided position or the current head
        const headToCheck = newHeadPosition || this.head;
        
        // Check against all segments except the head
        for (let i = 1; i < this.segments.length; i++) {
            if (this.segments[i].x === headToCheck.x && this.segments[i].y === headToCheck.y) {
                console.log(`Self collision detected at position: x=${headToCheck.x}, y=${headToCheck.y} with segment ${i}`);
                return true;
            }
        }
        return false;
    }

    // Draw the snake on the canvas
    draw(ctx) {
        // Check if we need to apply skin effects
        const hasSkinManager = window.skinManager !== undefined;
        
        this.segments.forEach((segment, index) => {
            // Check if we should apply skin effects
            if (hasSkinManager) {
                // Get skin color for this segment
                const skinColor = window.skinManager.applySkinEffect(segment, index);
                if (skinColor) {
                    ctx.fillStyle = skinColor;
                } else {
                    // Use the snake's default color with different shades
                    this.applyDefaultColor(ctx, index);
                }
            } else {
                // Use the snake's default color with different shades
                this.applyDefaultColor(ctx, index);
            }
            
            ctx.fillRect(
                segment.x * GRID_SIZE, 
                segment.y * GRID_SIZE, 
                GRID_SIZE, 
                GRID_SIZE
            );
            
            // Add eyes to the head
            if (index === 0) {
                this.drawEyes(ctx, segment);
            }
        });
    }

    // Apply default color with shading
    applyDefaultColor(ctx, index) {
        if (index === 0) {
            // Head is the main color
            ctx.fillStyle = this.color;
        } else {
            // Create a darker shade for the body segments
            // Convert hex to RGB for easier manipulation
            const r = parseInt(this.color.slice(1, 3), 16);
            const g = parseInt(this.color.slice(3, 5), 16);
            const b = parseInt(this.color.slice(5, 7), 16);
            
            // Make it darker based on segment position
            const darkenFactor = Math.max(0.4, 1 - (index * 0.05));
            const segmentColor = `rgb(${Math.floor(r * darkenFactor)}, ${Math.floor(g * darkenFactor)}, ${Math.floor(b * darkenFactor)})`;
            ctx.fillStyle = segmentColor;
        }
    }

    // Draw the snake's eyes
    drawEyes(ctx, headSegment) {
        // Check if we're using paranoid skin (red eyes)
        const isParanoid = window.skinManager && window.skinManager.isParanoidSkin();
        ctx.fillStyle = isParanoid ? '#FF0000' : '#000';
        
        // Position eyes based on direction
        let leftEyeX, leftEyeY, rightEyeX, rightEyeY;
        // Make eyes bigger for paranoid skin
        const eyeSize = isParanoid ? GRID_SIZE / 3 : GRID_SIZE / 5;
        
        switch (this.direction) {
            case 'up':
                leftEyeX = headSegment.x * GRID_SIZE + GRID_SIZE / 4;
                leftEyeY = headSegment.y * GRID_SIZE + GRID_SIZE / 4;
                rightEyeX = headSegment.x * GRID_SIZE + GRID_SIZE * 3/4 - eyeSize;
                rightEyeY = headSegment.y * GRID_SIZE + GRID_SIZE / 4;
                break;
            case 'down':
                leftEyeX = headSegment.x * GRID_SIZE + GRID_SIZE / 4;
                leftEyeY = headSegment.y * GRID_SIZE + GRID_SIZE * 3/4 - eyeSize;
                rightEyeX = headSegment.x * GRID_SIZE + GRID_SIZE * 3/4 - eyeSize;
                rightEyeY = headSegment.y * GRID_SIZE + GRID_SIZE * 3/4 - eyeSize;
                break;
            case 'left':
                leftEyeX = headSegment.x * GRID_SIZE + GRID_SIZE / 4;
                leftEyeY = headSegment.y * GRID_SIZE + GRID_SIZE / 4;
                rightEyeX = headSegment.x * GRID_SIZE + GRID_SIZE / 4;
                rightEyeY = headSegment.y * GRID_SIZE + GRID_SIZE * 3/4 - eyeSize;
                break;
            case 'right':
                leftEyeX = headSegment.x * GRID_SIZE + GRID_SIZE * 3/4 - eyeSize;
                leftEyeY = headSegment.y * GRID_SIZE + GRID_SIZE / 4;
                rightEyeX = headSegment.x * GRID_SIZE + GRID_SIZE * 3/4 - eyeSize;
                rightEyeY = headSegment.y * GRID_SIZE + GRID_SIZE * 3/4 - eyeSize;
                break;
        }
        
        ctx.fillRect(leftEyeX, leftEyeY, eyeSize, eyeSize);
        ctx.fillRect(rightEyeX, rightEyeY, eyeSize, eyeSize);
    }
}
