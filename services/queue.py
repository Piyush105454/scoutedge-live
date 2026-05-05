import requests
import os
from dotenv import load_dotenv

load_dotenv()

def queue_analysis_job(match_id, video_url):
    """
    Queues a video analysis job via Upstash QStash, or runs locally if configured.
    """
    # Local worker bypass for development
    if os.getenv('USE_LOCAL_WORKER') == 'true':
        print(f"Triggering local processing for match {match_id}...")
        import threading
        from services.processor import process_video
        from models.database import get_db_connection
        import json
        
        def run_local():
            # This mimics the logic in routes/jobs.py but simplified for local
            try:
                # We can call the endpoint logic directly or just the processor
                # For now, let's just trigger a local POST request to our own API
                requests.post(f"http://localhost:5000/api/jobs/process", json={
                    "match_id": match_id,
                    "video_url": video_url
                })
            except Exception as e:
                print(f"Local worker error: {e}")
        
        threading.Thread(target=run_local).start()
        return True

    qstash_token = os.getenv('UPSTASH_QSTASH_TOKEN')
    backend_url = os.getenv('BACKEND_URL')
    
    if not qstash_token or not backend_url:
        print("Error: Missing UPSTASH_QSTASH_TOKEN or BACKEND_URL in .env")
        return False
        
    callback_url = f"{backend_url}/api/jobs/process"
    qstash_url = f"https://qstash.upstash.io/v2/publish/{callback_url}"
    
    headers = {
        "Authorization": f"Bearer {qstash_token}",
        "Content-Type": "application/json"
    }
    
    payload = {
        "match_id": match_id,
        "video_url": video_url
    }
    
    try:
        response = requests.post(qstash_url, headers=headers, json=payload)
        if response.status_code == 201 or response.status_code == 200:
            print(f"Job successfully queued for match {match_id}")
            return True
        else:
            print(f"Failed to queue job: {response.text}")
            return False
    except Exception as e:
        print(f"Exception while queuing job: {e}")
        return False
