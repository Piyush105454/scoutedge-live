import pytest
import os
import boto3
from dotenv import load_dotenv

load_dotenv()

@pytest.fixture
def s3_client():
    return boto3.client(
        's3',
        endpoint_url=os.getenv('SUPABASE_ENDPOINT'),
        aws_access_key_id=os.getenv('SUPABASE_ACCESS_KEY'),
        aws_secret_access_key=os.getenv('SUPABASE_SECRET_KEY'),
        region_name='us-east-1'
    )

def test_4_1_upload_small_video(s3_client):
    """Test Upload small test video"""
    bucket = os.getenv('SUPABASE_BUCKET')
    test_filename = "test_small_video.txt" # Using txt for speed in test
    content = b"Small video content simulation"
    
    try:
        s3_client.put_object(Bucket=bucket, Key=test_filename, Body=content)
        # Check if exists
        s3_client.head_object(Bucket=bucket, Key=test_filename)
        # Cleanup
        s3_client.delete_object(Bucket=bucket, Key=test_filename)
    except Exception as e:
        pytest.fail(f"Storage Upload Failed: {e}. Fix: Check SUPABASE_BUCKET and permissions")

def test_4_3_get_public_url():
    """Test Public URL construction"""
    public_url = os.getenv('SUPABASE_PUBLIC_URL')
    assert public_url is not None
    assert "supabase.co" in public_url
