from services.ocr import read_jersey_number
import os

# Create a dummy image for testing if one doesn't exist
# In a real scenario, you'd use a real player image
import cv2
import numpy as np

dummy_img = np.zeros((500, 500, 3), dtype=np.uint8)
cv2.putText(dummy_img, "10", (220, 250), cv2.FONT_HERSHEY_SIMPLEX, 2, (255, 255, 255), 3)
cv2.imwrite("test_player.jpg", dummy_img)

# test with a sample player box
test_box = {
    "x": 250,
    "y": 250,
    "width": 100,
    "height": 200
}

print("Testing OCR.space API...")
result = read_jersey_number("test_player.jpg", test_box)
print(f"Result: {result}")

# cleanup
if os.path.exists("test_player.jpg"):
    os.remove("test_player.jpg")
