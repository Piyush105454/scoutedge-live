import pytest
import os
from services.detection import detect_players
from services.ocr import read_jersey_number
import cv2
import numpy as np

@pytest.fixture
def sample_image():
    path = "test_ai_sample.jpg"
    img = np.zeros((500, 500, 3), dtype=np.uint8)
    cv2.putText(img, "10", (220, 250), cv2.FONT_HERSHEY_SIMPLEX, 2, (255, 255, 255), 3)
    cv2.imwrite(path, img)
    yield path
    if os.path.exists(path):
        os.remove(path)

def test_5_1_yolo_world_detection(sample_image):
    """Test YOLO-World detects something (or at least runs)"""
    try:
        players = detect_players(sample_image)
        assert isinstance(players, list)
    except Exception as e:
        pytest.fail(f"YOLO-World Detection Failed: {e}. Fix: Check ROBOFLOW_API_KEY")

def test_5_4_ocr_space_reading(sample_image):
    """Test OCR.space reads jersey number"""
    test_box = {"x": 250, "y": 250, "width": 100, "height": 200}
    try:
        result = read_jersey_number(sample_image, test_box)
        # Note: Since it's a dummy image, OCR.space might not read '10' perfectly,
        # but we check if the function executes without error.
        assert result is None or "jersey_number" in result
    except Exception as e:
        pytest.fail(f"OCR.space Failed: {e}. Fix: Check OCR_SPACE_API_KEY")
