import boto3
from boto3.s3.transfer import TransferConfig
import os
import re
import urllib.parse
from dotenv import load_dotenv

load_dotenv()

def get_storage_client():
    return boto3.client(
        's3',
        endpoint_url=os.getenv('SUPABASE_ENDPOINT'),
        aws_access_key_id=os.getenv('SUPABASE_ACCESS_KEY'),
        aws_secret_access_key=os.getenv('SUPABASE_SECRET_KEY'),
        region_name=os.getenv('SUPABASE_REGION', 'ap-northeast-1')
    )

def sanitize_filename(filename):
    # Remove characters that are not alphanumeric, dot, dash, or underscore
    # Replace spaces and special chars with underscores
    filename = re.sub(r'[^a-zA-Z0-9._-]', '_', filename)
    # Remove multiple underscores
    filename = re.sub(r'_+', '_', filename)
    return filename

def upload_to_storage(file, filename=None):
    if filename is None:
        filename = file.filename
    
    # Sanitize the filename to prevent S3 InvalidKey errors
    filename = sanitize_filename(filename)
    
    s3 = get_storage_client()
    bucket = os.getenv('SUPABASE_BUCKET')
    
    # Configure multipart upload for larger files
    # 5MB chunk size, 8MB threshold for multipart
    config = TransferConfig(
        multipart_threshold=8 * 1024 * 1024,
        multipart_chunksize=5 * 1024 * 1024,
        use_threads=True
    )
    
    try:
        s3.upload_fileobj(file, bucket, filename, Config=config)
    except Exception as e:
        error_msg = str(e)
        if "EntityTooLarge" in error_msg:
            raise Exception(
                "File too large for Supabase. "
                "The default limit is 50MB for free projects. "
                "Go to Supabase Dashboard > Storage > Settings to increase the 'Global file size limit'."
            )
        raise e
    
    # Construct the public URL - URL encode the filename part
    return f"{os.getenv('SUPABASE_PUBLIC_URL')}/{encoded_filename}"

def generate_presigned_url(filename):
    filename = sanitize_filename(filename)
    s3 = get_storage_client()
    bucket = os.getenv('SUPABASE_BUCKET')
    
    url = s3.generate_presigned_url(
        'put_object',
        Params={
            'Bucket': bucket,
            'Key': filename,
            'ContentType': 'video/mp4' # Or detect from extension
        },
        ExpiresIn=3600 # 1 hour
    )
    
    # Also return the final public URL
    encoded_filename = urllib.parse.quote(filename)
    public_url = f"{os.getenv('SUPABASE_PUBLIC_URL')}/{encoded_filename}"
    
    return url, public_url

