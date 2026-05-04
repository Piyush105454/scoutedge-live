const BASE_URL = 'http://localhost:5000/api'

export interface Match {
  id: string;
  title: string;
  sport: string;
  status: string;
  created_at: string;
  venue?: string;
  competition?: string;
  players_detected: number;
  events_tagged: number;
  frames_analyzed: number;
  processing_time?: string;
  video_url: string;
  metadata?: any;
}

export interface Player {
  id: string;
  name: string;
  jersey_number: string;
  sport: string;
  position: string;
  team: string;
  appearances: number;
  detection_confidence: number;
  metadata?: any;
}

export interface MatchDetail extends Match {
  players: any[];
  events: any[];
}

// Get all matches
export const getMatches = async (): Promise<Match[]> => {
  const res = await fetch(`${BASE_URL}/matches`)
  return res.json()
}

// Get single match
export const getMatch = async (id: string): Promise<{ match: Match; players: any[]; events: any[] }> => {
  const res = await fetch(`${BASE_URL}/matches/${id}`)
  return res.json()
}

// Upload video + match data
export const uploadMatch = async (formData: FormData): Promise<any> => {
  const res = await fetch(`${BASE_URL}/upload`, {
    method: 'POST',
    body: formData  // FormData object
  })
  return res.json()
}

// Delete match
export const deleteMatch = async (id: string): Promise<any> => {
  const res = await fetch(`${BASE_URL}/matches/${id}`, {
    method: 'DELETE'
  })
  return res.json()
}

// Get all players
export const getPlayers = async (): Promise<Player[]> => {
  const res = await fetch(`${BASE_URL}/players`)
  return res.json()
}
