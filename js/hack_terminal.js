// Hack terminal implementation for Snake Game
import { unlockForTest } from './playerManager.js';
import * as playerManager from './playerManager.js';

// Add the global console commands
window.unlockHacker = function() {
    console.log('Unlocking Hacker Mode...');
    playerManager.handleGameEvent('hacker_mode_unlocked');
    return 'Hacker Mode unlocked! 👨‍💻';
};

window.unlockForTest = async function() {
    try {
        console.log('Unlocking all achievements for testing...');
        const result = await unlockForTest();
        return result;
    } catch (error) {
        console.error('Error in test unlock:', error);
        return 'Error: ' + error.message;
    }
};

// LGBT Pride skin unlock
window['earn.LGBT'] = function() {
    console.log('Unlocking Rainbow Skin...');
    playerManager.handleGameEvent('rainbow_skin_unlocked');
    return 'Pride skin unlocked! 🏳️‍🌈';
};

console.log('Hack terminal loaded! Available commands: unlockHacker(), unlockForTest(), earn.LGBT()');
