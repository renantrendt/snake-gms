-- Players table to store player information
CREATE TABLE players (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    username VARCHAR(50) NOT NULL UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_login TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    has_seen_tutorial BOOLEAN DEFAULT FALSE
);

-- Scores table to store player scores
CREATE TABLE scores (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    player_id UUID REFERENCES players(id) ON DELETE CASCADE,
    score INTEGER NOT NULL,
    level INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Achievements table to define all possible achievements
CREATE TABLE achievements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL,
    description TEXT NOT NULL,
    icon_url VARCHAR(255)
);

-- Player achievements to track which achievements each player has earned
CREATE TABLE player_achievements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    player_id UUID REFERENCES players(id) ON DELETE CASCADE,
    achievement_id UUID REFERENCES achievements(id) ON DELETE CASCADE,
    earned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(player_id, achievement_id)
);

-- Insert the achievements from your list
INSERT INTO achievements (name, description) VALUES
    ('First Timer', 'Open the game for the first time'),
    ('Game Over', 'Experience your first death'),
    ('Medium Mode', 'Reach Medium difficulty'),
    ('Hard Mode', 'Reach Hard difficulty'),
    ('Snake Master', 'Beat the game'),
    ('Credit Reader', 'Read through all the credits'),
    ('Tutorial Complete', 'Learn how to play the game');
