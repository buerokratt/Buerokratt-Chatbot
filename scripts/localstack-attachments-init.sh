#!/bin/bash

# Wait for LocalStack to be ready
echo "Waiting for LocalStack S3 to be ready..."
until awslocal s3 ls 2>/dev/null; do
  sleep 1
done

echo "Creating buckets..."
awslocal s3 mb s3://quarantine 2>/dev/null || echo "Quarantine bucket already exists"
awslocal s3 mb s3://attachments 2>/dev/null || echo "Attachments bucket already exists"

echo "Configuring CORS for quarantine bucket..."
awslocal s3api put-bucket-cors --bucket quarantine --cors-configuration '{
  "CORSRules": [
    {
      "AllowedOrigins": ["*"],
      "AllowedMethods": ["GET", "PUT", "POST", "DELETE", "HEAD"],
      "AllowedHeaders": ["*"],
      "ExposeHeaders": ["ETag", "x-amz-request-id"],
      "MaxAgeSeconds": 3600
    }
  ]
}'

echo "Configuring CORS for attachments bucket..."
awslocal s3api put-bucket-cors --bucket attachments --cors-configuration '{
  "CORSRules": [
    {
      "AllowedOrigins": ["*"],
      "AllowedMethods": ["GET", "PUT", "POST", "DELETE", "HEAD"],
      "AllowedHeaders": ["*"],
      "ExposeHeaders": ["ETag", "x-amz-request-id"],
      "MaxAgeSeconds": 3600
    }
  ]
}'

echo "LocalStack S3 initialization complete!"
