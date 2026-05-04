from flask import Blueprint, jsonify, request
from models.database import get_db_connection

matches_bp = Blueprint('matches', __name__)

@matches_bp.route('/matches', methods=['GET'])
def get_matches():
    conn = get_db_connection()
    cur = conn.cursor()
    cur.execute('SELECT * FROM matches ORDER BY created_at DESC')
    matches = cur.fetchall()
    cur.close()
    conn.close()
    return jsonify(matches), 200

@matches_bp.route('/matches/<match_id>', methods=['GET'])
def get_match(match_id):
    import uuid
    # validate UUID format first
    try:
        uuid.UUID(match_id)
    except ValueError:
        return jsonify({
            "error": "Invalid match ID format"
        }), 404

    try:
        conn = get_db_connection()
        cur = conn.cursor()
        
        # Get match
        cur.execute('SELECT * FROM matches WHERE id = %s', (match_id,))
        match = cur.fetchone()
        
        if not match:
            cur.close()
            conn.close()
            return jsonify({
                "error": "Match not found"
            }), 404
            
        # Get players
        cur.execute('SELECT * FROM players WHERE match_id = %s', (match_id,))
        players = cur.fetchall()
        
        # Get events
        cur.execute('SELECT * FROM events WHERE match_id = %s', (match_id,))
        events = cur.fetchall()
        
        cur.close()
        conn.close()
        
        return jsonify({
            "match": match,
            "players": players,
            "events": events
        }), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@matches_bp.route('/matches/<match_id>', methods=['DELETE'])
def delete_match(match_id):
    conn = get_db_connection()
    cur = conn.cursor()
    cur.execute('DELETE FROM matches WHERE id = %s', (match_id,))
    conn.commit()
    cur.close()
    conn.close()
    return jsonify({"success": True}), 200
