import easyocr
import os

def download():
    print("Pre-downloading EasyOCR models...")
    # This downloads the models to ~/.EasyOCR/model
    reader = easyocr.Reader(['en'], gpu=False)
    print("Models downloaded successfully.")

if __name__ == "__main__":
    download()
