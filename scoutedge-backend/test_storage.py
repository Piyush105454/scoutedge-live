import boto3
import os
from dotenv import load_dotenv

load_dotenv()

def test_supabase_storage():
    print("Testing Supabase Storage Connection...")
    try:
        s3 = boto3.client(
            's3',
            endpoint_url=os.getenv('SUPABASE_ENDPOINT'),
            aws_access_key_id=os.getenv('SUPABASE_ACCESS_KEY'),
            aws_secret_access_key=os.getenv('SUPABASE_SECRET_KEY'),
            region_name='us-east-1'
        )
        
        # Try to list buckets (requires service_role key)
        response = s3.list_buckets()
        print("Buckets found:")
        for bucket in response['Buckets']:
            print(f" - {bucket['Name']}")
            
        bucket_name = os.getenv('SUPABASE_BUCKET')
        if any(b['Name'] == bucket_name for b in response['Buckets']):
            print(f"SUCCESS: Bucket '{bucket_name}' exists.")
        else:
            print(f"WARNING: Bucket '{bucket_name}' not found. Please create it in Supabase dashboard.")
            
    except Exception as e:
        print(f"ERROR: Could not connect to Supabase Storage: {e}")
        print("Note: Ensure you have added the 'service_role' key to SUPABASE_SECRET_KEY in .env")

if __name__ == '__main__':
    test_supabase_storage()
