import requests
import base64
import os
from dotenv import load_dotenv

load_dotenv()

API_KEY = os.getenv('ROBOFLOW_API_KEY')
# Use values from environment or defaults provided by user
WORKSPACE = os.getenv('ROBOFLOW_WORKSPACE', "piyushs-workspace-nla8w")
WORKFLOW_ID = os.getenv('ROBOFLOW_WORKFLOW_ID', "yolo-world-small-demo")

def detect_players(image_path):
    # convert image to base64
    with open(image_path, 'rb') as f:
        image_b64 = base64.b64encode(f.read()).decode('utf-8')

    # use correct serverless workflow URL
    url = f"https://serverless.roboflow.com/{WORKSPACE}/workflows/{WORKFLOW_ID}"

    payload = {
        "api_key": API_KEY,
        "inputs": {
            "image": {
                "type": "base64",
                "value": image_b64
            },
            "classes": ["person", "player", "athlete"]
        }
    }

    try:
        response = requests.post(
            url,
            headers={"Content-Type": "application/json"},
            json=payload,
            timeout=30
        )

        if response.status_code != 200:
            print(f"Roboflow error: {response.text}")
            return []

        result = response.json()

        players = []
        # extract predictions from workflow output
        outputs = result.get('outputs', [{}])
        predictions = outputs[0].get('predictions', {})
        
        for pred in predictions.get('predictions', []):
            players.append({
                "x": pred.get('x', 0),
                "y": pred.get('y', 0),
                "width": pred.get('width', 0),
                "height": pred.get('height', 0),
                "confidence": round(pred.get('confidence', 0), 2),
                "class": pred.get('class', 'person')
            })
            
        print(f"DEBUG: Roboflow found {len(players)} players.", flush=True)

        return players
    except Exception as e:
        print(f"Roboflow request failed: {e}")
        return []
