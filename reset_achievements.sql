-- SQL to reset and recreate achievements tables

-- First, delete existing player achievements
DELETE FROM player_achievements;

-- Then delete existing achievements
DELETE FROM achievements;

-- Recreate achievements with proper data
INSERT INTO achievements (name, description, icon_url) VALUES
('First Timer', 'Start playing Snake Game for the first time', '🎮'),
('Game Over', 'Die for the first time', '💀'),
('Medium Mode', 'Reach medium difficulty', '🔄'),
('Hardcore', 'Reach hard difficulty', '🔥'),
('Snake Master', 'Reach 100,000 points', '🏆'),
('Real Player', 'Reach 300,000 points', '👑'),
('Credit Reader', 'Find the secret in the credits screen', '📜'),
('Are you ok?', 'Stay in Paranoid Mode for 4 minutes and 30 seconds', '🤪'),
('Rainbow Stuff', 'Unlock the rainbow skin', '🌈'),
('Tutorial Complete', 'Complete the tutorial', '📚'),
('Eternal Death', 'Die 199 times', '💀'),
('Paranoid Master', 'Stay 5min in the Paranoid Mode', '👁️'),
('Infinitely PRO', 'Reach level 38 in Infinite Mode', '🌌');


-- Display the recreated achievements
SELECT * FROM achievements;
