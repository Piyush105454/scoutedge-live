import os
from services.queue import queue_analysis_job
from dotenv import load_dotenv

load_dotenv()

def test_qstash():
    print("Testing Upstash QStash Queue...")
    
    # Mock data
    match_id = "test-match-123"
    video_url = "https://example.com/test-video.mp4"
    
    success = queue_analysis_job(match_id, video_url)
    
    if success:
        print("SUCCESS: Job successfully pushed to QStash.")
        print(f"Check your QStash dashboard at Upstash to see the message to: {os.getenv('BACKEND_URL')}/api/jobs/process")
    else:
        print("ERROR: Failed to push job to QStash. Check your credentials and BACKEND_URL.")

if __name__ == '__main__':
    test_qstash()
