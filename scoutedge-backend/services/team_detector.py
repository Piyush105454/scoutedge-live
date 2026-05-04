import cv2
import numpy as np

def detect_team(crop):
    """
    Detects the team based on the dominant color of the jersey crop.
    Returns 'Home' or 'Away' based on color heuristics.
    For this demo, we'll use a simple Blue vs Not-Blue logic (India vs Australia).
    """
    if crop is None or crop.size == 0:
        return "Unknown"
        
    # Resize to speed up
    small_crop = cv2.resize(crop, (30, 30))
    
    # Calculate average color (BGR)
    avg_color = np.mean(small_crop, axis=(0, 1))
    b, g, r = avg_color
    
    # India (Blue) vs Australia (Yellow/Green)
    # Blue: High B, lower R and G
    # Yellow: High R and G, lower B
    
    if b > r + 20 and b > g + 20:
        return "India" # Blue team
    elif r > b + 20 and g > b + 20:
        return "Australia" # Yellow team
    else:
        # Fallback to Home/Away based on general brightness or custom rules
        if r + g + b > 400: # Bright (often Australia yellow)
            return "Australia"
        else:
            return "India"

def get_team_color_hex(team_name):
    if team_name == "India":
        return "#00529B" # Blue
    elif team_name == "Australia":
        return "#FFCD00" # Yellow
    return "#888888"
