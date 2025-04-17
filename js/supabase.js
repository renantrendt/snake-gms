// Supabase client setup
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm';

// Supabase URL and anon key
const supabaseUrl = 'https://qkkcnozmiaoembwlgotb.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFra2Nub3ptaWFvZW1id2xnb3RiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQ4NTI2NTAsImV4cCI6MjA2MDQyODY1MH0.EegX5pNmDxhrHw5HadwwT-pHWHd-tT6Zvadb_Pt15Iw';

// Create a single supabase client for the entire app
export const supabase = createClient(supabaseUrl, supabaseKey);

// Player management functions
export async function getOrCreatePlayer(username) {
    if (!username || username.trim() === '') {
        throw new Error('Username cannot be empty');
    }
    
    // Check if player exists
    const { data: existingPlayer, error: fetchError } = await supabase
        .from('players')
        .select('*')
        .eq('username', username)
        .single();
    
    if (fetchError && fetchError.code !== 'PGRST116') { // PGRST116 means no rows returned
        console.error('Error fetching player:', fetchError);
        throw fetchError;
    }
    
    // If player exists, update last login and return
    if (existingPlayer) {
        const { data, error: updateError } = await supabase
            .from('players')
            .update({ last_login: new Date().toISOString() })
            .eq('id', existingPlayer.id)
            .select()
            .single();
            
        if (updateError) {
            console.error('Error updating last login:', updateError);
            throw updateError;
        }
        
        return data;
    }
    
    // If player doesn't exist, create new player
    const { data: newPlayer, error: createError } = await supabase
        .from('players')
        .insert([{ username }])
        .select()
        .single();
    
    if (createError) {
        console.error('Error creating player:', createError);
        throw createError;
    }
    
    return newPlayer;
}

// Score management functions
export async function saveScore(playerId, score, level) {
    const { data, error } = await supabase
        .from('scores')
        .insert([{ player_id: playerId, score, level }]);
    
    if (error) {
        console.error('Error saving score:', error);
        throw error;
    }
    
    return data;
}

export async function getTopScores(limit = 10) {
    const { data, error } = await supabase
        .from('scores')
        .select(`
            id,
            score,
            level,
            created_at,
            players (
                username
            )
        `)
        .order('score', { ascending: false })
        .limit(limit);
    
    if (error) {
        console.error('Error fetching top scores:', error);
        throw error;
    }
    
    return data;
}

// Achievement management functions
export async function unlockAchievement(playerId, achievementName) {
    console.log(`Supabase: Attempting to unlock achievement ${achievementName} for player ${playerId}`);
    
    try {
        // First, get the achievement ID
        const { data: achievement, error: achievementError } = await supabase
            .from('achievements')
            .select('id')
            .eq('name', achievementName)
            .single();
        
        if (achievementError) {
            console.error(`Supabase: Error finding achievement ${achievementName}:`, achievementError);
            
            // If the achievement doesn't exist, try to create it
            if (achievementError.code === 'PGRST116') { // No rows returned
                console.log(`Supabase: Achievement ${achievementName} not found, creating it...`);
                
                // Create the achievement
                const { data: newAchievement, error: createError } = await supabase
                    .from('achievements')
                    .insert([{
                        name: achievementName,
                        description: `Achievement: ${achievementName}`,
                        icon_url: '🏆'
                    }])
                    .select()
                    .single();
                
                if (createError) {
                    console.error(`Supabase: Error creating achievement ${achievementName}:`, createError);
                    throw createError;
                }
                
                console.log(`Supabase: Created achievement ${achievementName}:`, newAchievement);
                
                // Use the newly created achievement
                if (newAchievement) {
                    // Then unlock it for the player
                    const { data, error } = await supabase
                        .from('player_achievements')
                        .insert([{ 
                            player_id: playerId, 
                            achievement_id: newAchievement.id 
                        }])
                        .select();
                    
                    if (error) {
                        console.error(`Supabase: Error unlocking new achievement ${achievementName}:`, error);
                        throw error;
                    }
                    
                    console.log(`Supabase: Successfully unlocked new achievement ${achievementName}`);
                    return true;
                }
            } else {
                throw achievementError;
            }
        } else if (achievement) {
            console.log(`Supabase: Found achievement ${achievementName} with ID ${achievement.id}`);
            
            // Then unlock it for the player (if not already unlocked)
            const { data, error } = await supabase
                .from('player_achievements')
                .insert([{ 
                    player_id: playerId, 
                    achievement_id: achievement.id 
                }])
                .select();
            
            if (error) {
                // Check if it's a unique violation (already unlocked)
                if (error.code === '23505') {
                    console.log(`Supabase: Achievement ${achievementName} already unlocked for player ${playerId}`);
                    return true;
                }
                
                console.error(`Supabase: Error unlocking achievement ${achievementName}:`, error);
                throw error;
            }
            
            console.log(`Supabase: Successfully unlocked achievement ${achievementName}`);
            return true;
        }
    } catch (error) {
        console.error(`Supabase: Unexpected error unlocking achievement ${achievementName}:`, error);
        throw error;
    }
    
    return false;
}

export async function getPlayerAchievements(playerId) {
    console.log(`Supabase: Getting achievements for player ${playerId}`);
    
    try {
        const { data, error } = await supabase
            .from('player_achievements')
            .select(`
                earned_at,
                achievements (
                    name,
                    description,
                    icon_url
                )
            `)
            .eq('player_id', playerId);
        
        if (error) {
            console.error('Supabase: Error fetching player achievements:', error);
            throw error;
        }
        
        if (!data || data.length === 0) {
            console.log('Supabase: No achievements found for player');
            return [];
        }
        
        const achievements = data.map(item => {
            if (!item.achievements) {
                console.warn('Supabase: Achievement data missing for item:', item);
                return null;
            }
            
            return {
                name: item.achievements.name,
                description: item.achievements.description,
                icon_url: item.achievements.icon_url,
                earned_at: item.earned_at
            };
        }).filter(a => a !== null);
        
        console.log(`Supabase: Retrieved ${achievements.length} achievements for player ${playerId}:`, achievements);
        return achievements;
    } catch (error) {
        console.error('Supabase: Unexpected error fetching player achievements:', error);
        return [];
    }
}

// Tutorial tracking
export async function markTutorialSeen(playerId) {
    const { data, error } = await supabase
        .from('players')
        .update({ has_seen_tutorial: true })
        .eq('id', playerId);
    
    if (error) {
        console.error('Error marking tutorial as seen:', error);
        throw error;
    }
    
    return true;
}

export async function hasTutorialBeenSeen(playerId) {
    const { data, error } = await supabase
        .from('players')
        .select('has_seen_tutorial')
        .eq('id', playerId)
        .single();
    
    if (error) {
        console.error('Error checking tutorial status:', error);
        throw error;
    }
    
    return data.has_seen_tutorial;
}

// Local storage fallback for offline functionality
export function savePlayerToLocalStorage(player) {
    localStorage.setItem('snake_player', JSON.stringify(player));
}

export function getPlayerFromLocalStorage() {
    const player = localStorage.getItem('snake_player');
    return player ? JSON.parse(player) : null;
}

export function saveTutorialSeenToLocalStorage() {
    localStorage.setItem('snake_tutorial_seen', 'true');
}

export function hasTutorialBeenSeenFromLocalStorage() {
    return localStorage.getItem('snake_tutorial_seen') === 'true';
}
