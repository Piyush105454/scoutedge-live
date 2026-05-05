import cv2
import os
import numpy as np
from dotenv import load_dotenv

load_dotenv()

import gc

def get_reader():
    global _reader
    if _reader is None:
        import easyocr
        print("Initializing EasyOCR reader (Lazy-RAM-Optimized)...")
        # Ensure gpu=False and model_storage_directory is ephemeral /tmp
        _reader = easyocr.Reader(['en'], gpu=False, model_storage_directory='/tmp/easyocr')
    return _reader

def clear_ocr_memory():
    global _reader
    if _reader is not None:
        print("Clearing OCR memory...")
        del _reader
        _reader = None
        gc.collect()

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
        
    # RAM OPTIMIZATION: Convert to grayscale and shrink
    # Large images kill the RAM on 512MB plan
    crop = cv2.cvtColor(crop, cv2.COLOR_BGR2GRAY)
    
    # Max height of 128px is plenty for jersey numbers
    if crop.shape[0] > 128:
        scale = 128 / crop.shape[0]
        crop = cv2.resize(crop, (0,0), fx=scale, fy=scale)
        
    return crop

from services.team_detector import detect_team

def get_player_team(image_path, player_box):
    crop = crop_jersey_region(image_path, player_box)
    if crop is None: return "Unknown"
    return detect_team(crop)

def read_jersey_number(image_path, player_box):
    # step 1 — crop jersey area (COLOR)
    img = cv2.imread(image_path)
    if img is None: return {"jersey_number": None, "team": "Unknown"}
    
    x_center, y_center = int(player_box['x']), int(player_box['y'])
    w, h = int(player_box['width']), int(player_box['height'])
    
    x1, y1 = max(0, x_center - w // 2), max(0, y_center - h // 2 + int(h * 0.15))
    x2, y2 = min(img.shape[1], x_center + w // 2), min(img.shape[0], y_center - h // 2 + int(h * 0.65))
    
    color_crop = img[y1:y2, x1:x2]
    if color_crop.size == 0: return {"jersey_number": None, "team": "Unknown"}
    
    # Detect team color FIRST (using color image)
    team = detect_team(color_crop)
    
    # Now optimize for OCR (Grayscale + Shrink)
    ocr_crop = cv2.cvtColor(color_crop, cv2.COLOR_BGR2GRAY)
    if ocr_crop.shape[0] > 128:
        scale = 128 / ocr_crop.shape[0]
        ocr_crop = cv2.resize(ocr_crop, (0,0), fx=scale, fy=scale)
    
    try:
        # step 2 — call EasyOCR
        reader = get_reader()
        results = reader.readtext(ocr_crop)
        
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
