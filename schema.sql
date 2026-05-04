-- Matches table
CREATE TABLE IF NOT EXISTS matches (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  title text,
  sport text,
  match_date date,
  venue text,
  competition text,
  level text,
  home_team text,
  away_team text,
  video_url text,
  status text DEFAULT 'queued',
  players_detected int DEFAULT 0,
  events_tagged int DEFAULT 0,
  frames_analyzed int DEFAULT 0,
  processing_time text,
  created_at timestamp DEFAULT now()
);

-- Players table
CREATE TABLE IF NOT EXISTS players (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  match_id uuid REFERENCES matches(id) ON DELETE CASCADE,
  name text,
  jersey_number int,
  position text,
  team text,
  detection_confidence float,
  appearances int DEFAULT 0,
  created_at timestamp DEFAULT now()
);

-- Events table
CREATE TABLE IF NOT EXISTS events (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  match_id uuid REFERENCES matches(id) ON DELETE CASCADE,
  event_type text,
  player_jersey int,
  player_name text,
  timestamp text,
  confidence float,
  created_at timestamp DEFAULT now()
);
