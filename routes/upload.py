from flask import Blueprint, request, jsonify
from services.storage import upload_to_storage, generate_presigned_url
from models.database import get_db_connection
import requests
import os
import json

upload_bp = Blueprint('upload', __name__)

@upload_bp.route('/upload/presigned', methods=['POST'])
def get_presigned_url():
    data = request.json
    filename = data.get('filename', 'video.mp4')
    upload_url, public_url = generate_presigned_url(filename)
    return jsonify({
        "upload_url": upload_url,
        "public_url": public_url
    })

@upload_bp.route('/upload', methods=['POST'])
def upload_video():
    match_data = request.form
    video_url = match_data.get('video_url') # Option to provide URL from direct frontend upload
    
    # Fallback to direct upload if no video_url provided (original behavior)
    if not video_url:
        print("Upload request received. Parsing form data...", flush=True)
        if 'video' not in request.files:
            return jsonify({"error": "No video file"}), 400
        
        file = request.files['video']
        if not file or file.filename == '':
            return jsonify({"error": "No selected file"}), 400
            
        # 1. Upload to Supabase Storage
        video_url = upload_to_storage(file)
    
    # 2. Create match record in DB (Neon)
    conn = get_db_connection()
    cur = conn.cursor()
    cur.execute(
        """
        INSERT INTO matches (title, sport, match_date, venue, status, video_url)
        VALUES (%s, %s, %s, %s, %s, %s)
        RETURNING id
        """,
        (
            match_data.get('match_title'), 
            match_data.get('sport'), 
            match_data.get('match_date') or None, 
            match_data.get('venue') or None,
            'queued',
            video_url
        )
    )
    match_id = cur.fetchone()['id']
    
    # 3. Save Player Roster if provided
    players_raw = match_data.get('players')
    if players_raw:
        try:
            players_list = json.loads(players_raw)
            for p in players_list:
                cur.execute(
                    """
                    INSERT INTO players (match_id, name, jersey_number, position, team)
                    VALUES (%s, %s, %s, %s, %s)
                    """,
                    (match_id, p.get('name'), p.get('jersey_number'), p.get('position'), p.get('team'))
                )
        except Exception as e:
            print(f"Error saving roster: {e}")

    conn.commit()
    cur.close()
    conn.close()
    
    # 4. Trigger Analysis Job
    from services.queue import queue_analysis_job
    queue_analysis_job(str(match_id), video_url)
    
    return jsonify({
        "success": True,
        "match_id": str(match_id),
        "video_url": video_url,
        "message": "Video uploaded and roster saved. Analysis queued."
    }), 200

