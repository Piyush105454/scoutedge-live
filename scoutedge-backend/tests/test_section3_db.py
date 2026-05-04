import pytest
from models.database import get_db_connection

def test_3_1_insert_match_record():
    """Insert match record"""
    conn = get_db_connection()
    cur = conn.cursor()
    try:
        cur.execute(
            "INSERT INTO matches (title, sport, status) VALUES (%s, %s, %s) RETURNING id",
            ("Test Match", "Football", "test")
        )
        match_id = cur.fetchone()['id']
        conn.commit()
        assert match_id is not None
        
        # Cleanup
        cur.execute("DELETE FROM matches WHERE id = %s", (match_id,))
        conn.commit()
    finally:
        cur.close()
        conn.close()

def test_3_2_read_match_record():
    """Read match record"""
    conn = get_db_connection()
    cur = conn.cursor()
    try:
        cur.execute("SELECT * FROM matches LIMIT 1")
        match = cur.fetchone()
        # Even if empty, it should execute
    finally:
        cur.close()
        conn.close()
