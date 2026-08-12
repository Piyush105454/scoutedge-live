import cv2
import numpy as np

def detect_team(crop):
    """
    Detects the team based on dominant color.
    Returns 'Home', 'Away', or 'Neutral'.
    """
    if crop is None or crop.size == 0:
        return "Unknown"
        
    small_crop = cv2.resize(crop, (30, 30))
    avg_color = np.mean(small_crop, axis=(0, 1))
    b, g, r = avg_color
    
    # Simple color logic for Home/Away
    # Home is usually Blue/Green (High B or G)
    # Away is usually Yellow/Red/White (High R)
    
    if b > r + 15 and b > g + 5:
        return "Home" # Blue-ish
    elif r > b + 15 and g > b + 15:
        return "Away" # Yellow-ish
    elif g > b + 15 and g > r + 10:
        return "Home" # Green-ish
    elif r > b + 20 and g < r - 20:
        return "Away" # Red-ish
    
    if r + g + b > 600: return "Away" # White/Bright
    return "Neutral"

def get_team_color_hex(team_name):
    team_name = team_name.lower() if team_name else ""
    if "india" in team_name or "blue" in team_name:
        return "#00529B" # Blue
    elif "australia" in team_name or "yellow" in team_name or "gold" in team_name:
        return "#FFCD00" # Yellow
    elif "away" in team_name or "red" in team_name:
        return "#E21D48" # Red
    elif "home" in team_name or "green" in team_name:
        return "#16A34A" # Green
    elif "simulation" in team_name:
        return "#7C3AED" # Purple
    return "#94A3B8" # Gray/Slate
