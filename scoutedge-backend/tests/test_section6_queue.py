import pytest
import os
import requests
from services.queue import queue_analysis_job

def test_6_1_qstash_message_sent():
    """Test QStash receives message after upload"""
    # We test the queue_analysis_job function which calls QStash
    match_id = "test-6-1"
    video_url = "https://example.com/video.mp4"
    
    success = queue_analysis_job(match_id, video_url)
    assert success is True, "QStash Message Failed. Fix: Check UPSTASH_QSTASH_TOKEN"

def test_6_4_match_status_flow(db_conn):
    """Test match status updates (Manual check of DB)"""
    cur = db_conn.cursor()
    try:
        # Initial status
        cur.execute("INSERT INTO matches (title, status) VALUES (%s, %s) RETURNING id", ("Queue Test", "queued"))
        match_id = cur.fetchone()['id']
        db_conn.commit()
        
        # Simulate processing
        cur.execute("UPDATE matches SET status = %s WHERE id = %s", ("processing", match_id))
        db_conn.commit()
        
        cur.execute("SELECT status FROM matches WHERE id = %s", (match_id,))
        status = cur.fetchone()['status']
        assert status == "processing"
        
        # Cleanup
        cur.execute("DELETE FROM matches WHERE id = %s", (match_id,))
        db_conn.commit()
    finally:
        cur.close()
