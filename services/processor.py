import cv2
import os
import math
import time
from services.detection import detect_players
from services.ocr import read_jersey_number
import numpy as np

class SimpleTracker:
    def __init__(self):
        self.next_id = 1
        self.objects = {} # id -> {pos, team, jnum, last_seen}

    def update(self, current_detections, timestamp):
        new_objects = {}
        for det in current_detections:
            best_id = None
            min_dist = 150 # pixels
            for obj_id, obj_data in self.objects.items():
                if det['team'] != "Unknown" and obj_data['team'] != "Unknown" and det['team'] != obj_data['team']:
                    continue
                dist = math.sqrt((det['x']-obj_data['pos']['x'])**2 + (det['y']-obj_data['pos']['y'])**2)
                if dist < min_dist:
                    min_dist = dist
                    best_id = obj_id
            
            if best_id is not None:
                self.objects[best_id].update({
                    'pos': {'x': det['x'], 'y': det['y']}, 
                    'last_seen': timestamp, 
                    'team': det['team'] if det['team'] != "Unknown" else self.objects[best_id]['team']
                })
                # Upgrade to jersey number if found
                if det['jnum']: self.objects[best_id]['jnum'] = det['jnum']
                new_objects[best_id] = self.objects[best_id]
                del self.objects[best_id]
            else:
                obj_id = f"T{self.next_id}"
                self.next_id += 1
                new_objects[obj_id] = {'pos': {'x': det['x'], 'y': det['y']}, 'team': det['team'], 'jnum': det['jnum'], 'last_seen': timestamp}
        
        for obj_id, obj_data in self.objects.items():
            if timestamp - obj_data['last_seen'] < 10:
                new_objects[obj_id] = obj_data
        self.objects = new_objects
        return self.objects

def process_video(video_path, on_progress=None):
    cap = cv2.VideoCapture(video_path)
    if not cap.isOpened(): return None
    fps = cap.get(cv2.CAP_PROP_FPS) or 30
    frame_interval = int(fps * 3) 
    
    player_stats = {}
    tracker = SimpleTracker()
    results = {"total_frames": 0, "frames_analyzed": 0, "players_found": {}, "timeline": [], "player_metrics": {}, "clips": []}
    
    frame_count = 0
    PIXELS_TO_METERS = 0.02
    clips_dir = "static/clips"
    os.makedirs(clips_dir, exist_ok=True)
    
    while cap.isOpened():
        ret, frame = cap.read()
        if not ret: break
        results['total_frames'] += 1
        
        if frame_count % frame_interval == 0:
            timestamp = round(frame_count / fps, 2)
            print(f"STRICT-MODE: Analyzing {timestamp}s...", flush=True)
            
            h, w = frame.shape[:2]
            if w > 1280: frame = cv2.resize(frame, (1280, int(h * (1280 / w))))
            
            frame_path = f"temp_{frame_count}.jpg"
            cv2.imwrite(frame_path, frame)
            
            try:
                players = detect_players(frame_path)
                players = sorted(players, key=lambda x: x['confidence'], reverse=True)[:10]
            except: players = []

            frame_result = {"timestamp": timestamp, "players": []}
            current_detections = []
            
            for p in players:
                info = read_jersey_number(frame_path, p)
                current_detections.append({
                    'x': p['x'], 'y': p['y'], 
                    'team': info.get('team', 'Unknown') if info else 'Unknown',
                    'jnum': info.get('jersey_number') if info else None,
                    'confidence': p['confidence'],
                    'bbox': p
                })
            
            tracked_objects = tracker.update(current_detections, timestamp)
            
            for obj_id, obj in tracked_objects.items():
                if obj['last_seen'] == timestamp:
                    jnum = obj['jnum']
                    
                    # STRICT FILTER: Only show players with a Jersey Number
                    # If no jersey number, we track them internally but don't add to results['players_found']
                    if not jnum:
                        continue
                        
                    final_id = str(jnum)
                    player_data = {"confidence": 0.9, "jersey_number": jnum, "display_number": final_id, "team": obj['team'], "bbox": obj['pos'], "speed": 0, "x": obj['pos']['x'], "y": obj['pos']['y']}
                    
                    if final_id not in player_stats:
                        player_stats[final_id] = {'last_pos': obj['pos'], 'last_time': timestamp, 'distance': 0, 'top_speed': 0, 'heat_points': [], 'team': obj['team'], 'jersey_number': jnum}
                    else:
                        stats = player_stats[final_id]
                        dist_px = math.sqrt((obj['pos']['x']-stats['last_pos']['x'])**2 + (obj['pos']['y']-stats['last_pos']['y'])**2)
                        dist_m = dist_px * PIXELS_TO_METERS
                        time_diff = timestamp - stats['last_time']
                        if 0 < time_diff < 10:
                            speed_kmh = (dist_m / time_diff) * 3.6
                            if speed_kmh < 40:
                                player_data['speed'] = round(speed_kmh, 2)
                                stats['distance'] += dist_m
                                if speed_kmh > stats['top_speed']: stats['top_speed'] = round(speed_kmh, 2)
                        stats['last_pos'] = obj['pos']; stats['last_time'] = timestamp
                    
                    player_stats[final_id]['heat_points'].append(obj['pos'])
                    if final_id not in results['players_found']: results['players_found'][final_id] = 0
                    results['players_found'][final_id] += 1
                    frame_result['players'].append(player_data)

            if len(results['clips']) < 5 and any(p['jersey_number'] for p in frame_result['players']):
                cv2.imwrite(os.path.join(clips_dir, f"clip_{int(timestamp)}.jpg"), frame)
                results['clips'].append({"timestamp": timestamp, "thumbnail": f"/static/clips/clip_{int(timestamp)}.jpg", "title": f"Key Moment {timestamp}s"})

            results['timeline'].append(frame_result)
            results['frames_analyzed'] += 1
            if os.path.exists(frame_path): os.remove(frame_path)
            if on_progress:
                on_progress(results, {tid: {"total_distance": round(s['distance'], 2), "top_speed": s['top_speed'], "heat_points": s['heat_points'][-20:], "team": s['team'], "jersey_number": s['jersey_number']} for tid, s in player_stats.items()})
        
        frame_count += 1
    
    for tid, stats in player_stats.items():
        results['player_metrics'][tid] = {"total_distance": round(stats['distance'], 2), "top_speed": stats['top_speed'], "avg_speed": round((stats['distance'] / (results['total_frames']/fps)) * 3.6, 2) if results['total_frames'] > 0 else 0, "heat_points": stats['heat_points'][:100], "team": stats['team'], "jersey_number": stats['jersey_number']}
    cap.release()
    return results
