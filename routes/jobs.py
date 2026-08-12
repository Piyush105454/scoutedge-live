from flask import Blueprint, request, jsonify
from models.database import get_db_connection
import requests
import os
import tempfile
import shutil
import json

jobs_bp = Blueprint('jobs', __name__)

@jobs_bp.route('/jobs/process', methods=['POST'])
def process_video_job():
    from services.processor import process_video
    data = request.json
    match_id = data.get('match_id')
    video_url = data.get('video_url')
    sample_rate = float(data.get('fps', 1.0))
    
    if not match_id or not video_url:
        return jsonify({"error": "Missing match_id or video_url"}), 400

    tmpdir = tempfile.mkdtemp()
    video_path = os.path.join(tmpdir, "video.mp4")
    
    try:
        # 1. Download video
        print(f"Downloading video from {video_url}...")
        response = requests.get(video_url, stream=True)
        with open(video_path, 'wb') as f:
            shutil.copyfileobj(response.raw, f)
        
        # 2. Update match status & Fetch Team Names
        conn = get_db_connection()
        cur = conn.cursor()
        cur.execute("SELECT home_team, away_team FROM matches WHERE id = %s", (match_id,))
        match_info = cur.fetchone()
        home_team_name = match_info['home_team'] or "Home"
        away_team_name = match_info['away_team'] or "Away"
        
        cur.execute("UPDATE matches SET status = %s WHERE id = %s", ('processing', match_id))
        conn.commit()

        # Incremental Update Callback
        def update_db_progress(current_results, current_metrics):
            try:
                inner_conn = get_db_connection()
                inner_cur = inner_conn.cursor()
                
                # Safety Check: Does the match still exist?
                inner_cur.execute("SELECT id FROM matches WHERE id = %s", (match_id,))
                if not inner_cur.fetchone():
                    print(f"Match {match_id} deleted. Stopping background job.")
                    # We can't easily kill the thread from here, but we can prevent further DB errors
                    # and signal the main loop if needed.
                    return False 

                # Count current events (all tracked players)
                current_events = sum(len(f['players']) for f in current_results['timeline'])
                print(f"DEBUG: Progress Update - Players Found: {len(current_results['players_found'])}, Events Tagged: {current_events}", flush=True)
                
                # Update match
                inner_cur.execute(
                    "UPDATE matches SET frames_analyzed = %s, players_detected = %s, events_tagged = %s, metadata = %s WHERE id = %s",
                    (current_results['frames_analyzed'], len(current_results['players_found']), current_events, json.dumps(current_metrics), match_id)
                )
                
                # Update players
                for dnum, appearances in current_results['players_found'].items():
                    p_meta = {}
                    team = "Unknown"
                    jnum_val = None
                    
                    # Search in current_metrics
                    for tid, m in current_metrics.items():
                        if tid == dnum or str(m.get('jersey_number')) == dnum:
                            p_meta = m
                            team = m.get('team', 'Unknown')
                            jnum_val = m.get('jersey_number')
                            break
                    
                    # We use EXCLUDED for stats, but COALESCE to keep existing name/position if they were pre-filled
                    inner_cur.execute(
                        """
                        INSERT INTO players (match_id, jersey_number, appearances, name, team, metadata)
                        VALUES (%s, %s, %s, %s, %s, %s)
                        ON CONFLICT (match_id, jersey_number) 
                        DO UPDATE SET 
                            appearances = EXCLUDED.appearances,
                            metadata = EXCLUDED.metadata,
                            team = COALESCE(players.team, EXCLUDED.team),
                            name = COALESCE(players.name, EXCLUDED.name)
                        """,
                        (match_id, int(jnum_val) if jnum_val and str(jnum_val).isdigit() else None, appearances, f"Player {dnum}", team, json.dumps(p_meta))
                    )
                
                inner_conn.commit()
                inner_cur.close()
                inner_conn.close()
            except Exception as e:
                print(f"Progress update error: {e}")

        # 3. Process video
        print(f"Processing video for match {match_id} (Teams: {home_team_name} vs {away_team_name})...")
        results = process_video(video_path, on_progress=update_db_progress, sample_rate=sample_rate, teams=(home_team_name, away_team_name))
        
        if not results:
            raise Exception("Processing failed")

        # 4. Final Save
        conn = get_db_connection()
        cur = conn.cursor()
        
        # Calculate actual processing duration
        processing_duration = time.time() - start_time
        
        # Generate a few key clips for the UI
        clips = []
        for frame in results['timeline'][:6]: # Top 6 moments
            timestamp = frame['timestamp']
            p = frame['players'][0] if frame['players'] else None
            player_id = p['display_number'] if p else "Unknown"
            
            clips.append({
                "title": f"Player {player_id} Detected",
                "timestamp": timestamp,
                "thumbnail": f"/static/clips/thumb_{match_id}_{timestamp}.jpg"
            })

        # Final metadata preparation
        final_meta = results.get('player_metrics', {})
        final_meta['processing_time'] = f"{processing_duration:.1f}s"
        final_meta['clips'] = clips
        final_meta['total_frames'] = results.get('total_frames', 0)

        cur.execute(
            "UPDATE matches SET status = %s, frames_analyzed = %s, players_detected = %s, events_tagged = %s, metadata = %s WHERE id = %s",
            ('completed', results['frames_analyzed'], len(results['players_found']), total_events, json.dumps(final_meta), match_id)
        )
        
        # Save only valid jersey number events to timeline
        for frame in results['timeline']:
            timestamp = frame['timestamp']
            for player in frame['players']:
                # Save every detection as an event for the timeline
                event_meta = {
                    "bbox": player.get('bbox'),
                    "team": player.get('team'),
                    "speed": player.get('speed')
                }
                cur.execute(
                    "INSERT INTO events (match_id, event_type, player_jersey, player_name, confidence, timestamp, metadata) VALUES (%s, %s, %s, %s, %s, %s, %s)",
                    (match_id, 'player_detection', player.get('jersey_number'), player.get('display_number'), player['confidence'], str(timestamp), json.dumps(event_meta))
                )
        
        conn.commit()
        cur.close()
        conn.close()
        print(f"Done processing match {match_id}")
        return jsonify({"success": True}), 200

    except Exception as e:
        print(f"Job failed: {e}")
        try:
            conn = get_db_connection()
            cur = conn.cursor()
            cur.execute("UPDATE matches SET status = %s WHERE id = %s", ('failed', match_id))
            conn.commit()
            cur.close()
            conn.close()
        except: pass
        return jsonify({"error": str(e)}), 500
    finally:
        shutil.rmtree(tmpdir)
