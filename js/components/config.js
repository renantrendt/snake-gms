// Game Constants
export const GRID_SIZE = 20; // Size of each grid cell in pixels
export const GRID_WIDTH = 40; // Number of cells horizontally (800px / 20px = 40)
export const GRID_HEIGHT = 30; // Number of cells vertically (600px / 20px = 30)
export const INITIAL_SPEED = 5; // Initial movement speed value
export const MAX_SPEED = 21; // Maximum speed cap
export const MAX_HEALTH = 30000000; // Starting health

// Background colors for each level
export const backgroundColors = {
    // Easy Mode (Levels 1-5)
    1: '#E6E6FA', // Lavender
    2: '#008080', // Teal
    3: '#800000', // Maroon
    4: '#F5F5DC', // Beige
    5: '#40E0D0', // Turquoise
    
    // Medium Mode (Levels 6-10)
    6: '#FF7F50', // Coral
    7: '#808000', // Olive
    8: '#000080', // Navy
    9: '#98FB98', // Mint
    10: '#36454F', // Charcoal
    
    // Hard Mode (Levels 11-15)
    11: '#C8A2C8', // Lilac
    12: '#FFFFF0', // Ivory
    13: '#CCCCFF', // Periwinkle
    14: '#DC143C', // Crimson Red
    15: '#191970'  // Midnight Blue
};

// Fruit types with different point values, colors, and images
export const fruitTypes = [
    // Easy Mode (Levels 1-5)
    { name: 'Orange', color: '#FFA500', points: 100, symbol: '🍊', level: 1, image: null, snakeColor: '#FF0000' }, // Red snake
    { name: 'Mango', color: '#FFB347', points: 100, symbol: '🥭', level: 2, image: null, snakeColor: '#0000FF' }, // Blue snake
    { name: 'Grapes', color: '#800080', points: 100, symbol: '🍇', level: 3, image: null, snakeColor: '#00FF00' }, // Green snake
    { name: 'Blueberry', color: '#0000FF', points: 100, symbol: '🫐', level: 4, image: null, snakeColor: '#FFFF00' }, // Yellow snake
    { name: 'Watermelon', color: '#FF3030', points: 200, symbol: '🍉', level: 5, image: null, snakeColor: '#800080' }, // Purple snake
    
    // Medium Mode (Levels 6-10)
    { name: 'Apple', color: '#FF0000', points: 100, symbol: '🍎', level: 6, image: null, snakeColor: '#CD7F32' }, // Bronze snake
    { name: 'Pineapple', color: '#FFFF00', points: 100, symbol: '🍍', level: 7, image: null, snakeColor: '#4B0082' }, // Indigo snake
    { name: 'Strawberry', color: '#FF69B4', points: 100, symbol: '🍓', level: 8, image: null, snakeColor: '#00FFFF' }, // Cyan snake
    { name: 'Peach', color: '#FFDAB9', points: 100, symbol: '🍑', level: 9, image: null, snakeColor: '#FF00FF' }, // Magenta snake
    { name: 'Blackberry', color: '#000080', points: 100, symbol: '🫐', level: 10, image: null, snakeColor: '#FFBF00' }, // Amber snake
    
    // Hard Mode (Levels 11-15)
    { name: 'Passion Fruit', color: '#9370DB', points: 300, symbol: null, level: 11, image: 'images__1_-removebg-preview.png', snakeColor: '#50C878' }, // Emerald snake
    { name: 'Papaya', color: '#FFA07A', points: 300, symbol: null, level: 12, image: 'Untitled-removebg-preview.png', snakeColor: '#708090' }, // Slate snake
    { name: 'Starfruit', color: '#FFD700', points: 300, symbol: '★', level: 13, image: null, snakeColor: '#FFDB58' }, // Mustard snake
    { name: 'Dragon Fruit', color: '#FF1493', points: 500, symbol: null, level: 14, image: 'how-to-draw-a-dragon-dfruit-feat-removebg-preview.png', snakeColor: '#F0F8FF' }, // Ice Blue snake
    { name: 'Banana', color: '#FFFF00', points: 7777, symbol: '🍌', level: 15, image: null, snakeColor: '#39FF14' }  // Electric Lime snake
];

// Difficulty settings for different level ranges
export const difficultySettings = {
    easy: {
        levelRange: [1, 5],
        pointsPerLevel: 600,
        fruitsForSpeedIncrease: 3,
        speedIncreaseAmount: 1,
        growthBlocksPerFruit: 1,  // Grow by 1 block per 3 fruits in easy mode
        fruitsPerGrowth: 3       // Need to eat 3 fruits to grow by 1 block
    },
    medium: {
        levelRange: [6, 10],
        pointsPerLevel: 700,
        fruitsForSpeedIncrease: 2,
        speedIncreaseAmount: 1,
        growthBlocksPerFruit: 1,  // Grow by 1 block per 2 fruits in medium mode
        fruitsPerGrowth: 2       // Need to eat 2 fruits to grow by 1 block
    },
    hard: {
        levelRange: [11, 15],
        pointsPerLevel: 900,
        fruitsForSpeedIncrease: 1,
        speedIncreaseAmount: 0.5,
        growthBlocksPerFruit: 1,  // Grow by 1 block per fruit in hard mode
        fruitsPerGrowth: 1       // Need to eat 1 fruit to grow by 1 block
    }
};

// Function to convert speed value to interval in milliseconds
export function calculateGameInterval(speed) {
    // Convert speed to interval (higher speed = lower interval)
    return Math.max(30, 200 - (speed * 6));
}

// Function to get current difficulty based on level
export function getCurrentDifficulty(level) {
    if (level <= 5) return 'easy';
    if (level <= 10) return 'medium';
    return 'hard';
}
