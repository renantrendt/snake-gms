// Test utility to unlock all achievements
import { unlockForTest } from './playerManager.js';

// Expose the function to the global scope for console access
window.unlockForTest = async function() {
    try {
        const result = await unlockForTest();
        console.log('Test unlock complete:', result);
        return result;
    } catch (error) {
        console.error('Error in test unlock:', error);
        return 'Error: ' + error.message;
    }
};

console.log('Unlock test utility loaded! Type unlockForTest() in the console to unlock all achievements.');
