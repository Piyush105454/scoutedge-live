from flask import Blueprint, jsonify
from models.database import get_db_connection

players_bp = Blueprint('players', __name__)

@players_bp.route('/players', methods=['GET'])
def get_players():
    conn = get_db_connection()
    cur = conn.cursor()
    cur.execute('SELECT * FROM players')
    players = cur.fetchall()
    cur.close()
    conn.close()
    return jsonify(players), 200

@players_bp.route('/players/<player_id>', methods=['GET'])
def get_player(player_id):
    conn = get_db_connection()
    cur = conn.cursor()
    cur.execute('SELECT * FROM players WHERE id = %s', (player_id,))
    player = cur.fetchone()
    cur.close()
    conn.close()
    return jsonify(player), 200
