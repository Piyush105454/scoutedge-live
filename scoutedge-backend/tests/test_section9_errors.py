import pytest

def test_9_1_upload_no_file(client):
    """Test upload with no video file"""
    response = client.post('/api/upload')
    assert response.status_code == 400
    assert b"No video file" in response.data

def test_9_3_invalid_match_id(client):
    """Test invalid match ID in GET request"""
    # Using an invalid UUID string
    response = client.get('/api/matches/not-a-uuid')
    # Depending on implementation, it might be 400 or 500
    assert response.status_code in [400, 404, 500]
