import cv2
import os
import easyocr
import numpy as np
from dotenv import load_dotenv

load_dotenv()

# Initialize EasyOCR reader (singleton)
# This will use GPU if available, otherwise CPU
print("Initializing EasyOCR reader...")
reader = easyocr.Reader(['en'], gpu=True)

def crop_jersey_region(image_path, player_box):
    img = cv2.imread(image_path)
    if img is None:
        return None
    
    x_center = int(player_box['x'])
    y_center = int(player_box['y'])
    w = int(player_box['width'])
    h = int(player_box['height'])
    
    # Calculate top-left from center
    # crop torso — middle section of player box (15% to 65% of height)
    # This skips the head and the legs
    x1 = max(0, x_center - w // 2)
    y1 = max(0, y_center - h // 2 + int(h * 0.15)) # Skip head (top 15%)
    x2 = min(img.shape[1], x_center + w // 2)
    y2 = min(img.shape[0], y_center - h // 2 + int(h * 0.65)) # End at lower torso (65%)
    
    crop = img[y1:y2, x1:x2]
    
    if crop.size == 0:
        return None
        
    return crop

from services.team_detector import detect_team

def get_player_team(image_path, player_box):
    crop = crop_jersey_region(image_path, player_box)
    if crop is None: return "Unknown"
    return detect_team(crop)

def read_jersey_number(image_path, player_box):
    # step 1 — crop jersey area
    crop = crop_jersey_region(
        image_path, player_box
    )
    
    if crop is None:
        return None
    
    # Detect team color first (always works even if OCR fails)
    team = detect_team(crop)
    
    try:
        # step 2 — call EasyOCR
        results = reader.readtext(crop)
        
        # step 3 — extract jersey number
        for (bbox, text, prob) in results:
            numbers_only = ''.join(filter(str.isdigit, text))
            if numbers_only:
                number_str = numbers_only[:2]
                if number_str:
                    number = int(number_str)
                    if 1 <= number <= 99:
                        return {
                            "jersey_number": number,
                            "raw_text": text,
                            "confidence": float(prob),
                            "team": team
                        }
    except Exception as e:
        print(f"EasyOCR error: {e}")
    
    # Return team even if jersey number not found
    return {"jersey_number": None, "team": team}
