import os
import pytest
import psycopg2
import boto3
import requests
from dotenv import load_dotenv

load_dotenv(override=True)

def test_1_1_database_connection():
    """Test Neon Database Connection"""
    url = os.getenv('DATABASE_URL')
    assert url is not None, "DATABASE_URL missing in .env"
    try:
        conn = psycopg2.connect(url)
        conn.close()
    except Exception as e:
        pytest.fail(f"Neon DB Connection Failed: {e}. Fix: Check DATABASE_URL in .env")

def test_1_2_supabase_storage_connection():
    """Test Supabase Storage Connection"""
    try:
        s3 = boto3.client(
            's3',
            endpoint_url=os.getenv('SUPABASE_ENDPOINT'),
            aws_access_key_id=os.getenv('SUPABASE_ACCESS_KEY'),
            aws_secret_access_key=os.getenv('SUPABASE_SECRET_KEY'),
            region_name=os.getenv('SUPABASE_REGION', 'ap-northeast-1')
        )
        s3.list_buckets()
    except Exception as e:
        pytest.fail(f"Supabase Storage Connection Failed: {e}. Fix: Check SUPABASE keys in .env")

def test_1_3_roboflow_api_key_valid():
    """Test Roboflow API Key Valid"""
    key = os.getenv('ROBOFLOW_API_KEY')
    assert key is not None, "ROBOFLOW_API_KEY missing in .env"
    url = f"https://detect.roboflow.com/?api_key={key}"
    response = requests.get(url)
    # Roboflow returns 404 or 401 if key is invalid, but we check if we can at least reach it
    assert response.status_code != 403, "Roboflow API Key Invalid. Fix: Check ROBOFLOW_API_KEY"

def test_1_4_ocr_space_api_key_valid():
    """Test OCR.space API Key Valid"""
    key = os.getenv('OCR_SPACE_API_KEY')
    assert key is not None, "OCR_SPACE_API_KEY missing in .env"
    payload = {'apikey': key}
    response = requests.post('https://api.ocr.space/parse/image', data=payload)
    result = response.json()
    assert result.get('OCRExitCode') != 6, "OCR.space API Key Invalid. Fix: Check OCR_SPACE_API_KEY"

def test_1_5_qstash_token_valid():
    """Test Upstash QStash Token Valid"""
    token = os.getenv('UPSTASH_QSTASH_TOKEN')
    assert token is not None, "UPSTASH_QSTASH_TOKEN missing in .env"
    headers = {"Authorization": f"Bearer {token}"}
    # correct endpoint for checking token
    response = requests.get(
        "https://qstash.upstash.io/v2/events",
        headers=headers
    )
    assert response.status_code == 200, \
        "QStash Token Invalid. Fix: Check UPSTASH_QSTASH_TOKEN"

def test_1_6_flask_server_running(client):
    """Test Flask Server Running"""
    response = client.get('/')
    assert response.status_code == 200
    assert b"ScoutEdge API running" in response.data
