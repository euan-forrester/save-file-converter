#!/bin/bash

# Taken from https://oneuptime.com/blog/post/2026-02-12-deploy-vuejs-app-to-aws-s3-and-cloudfront/view

echo "Uploading assets to S3..."
aws s3 sync dist/ s3://$VUE_APP_S3D_BUCKET \
  --delete \
  --cache-control "public, max-age=31536000, immutable" \
  --exclude "index.html"

echo "Uploading index.html..."
aws s3 cp dist/index.html s3://$VUE_APP_S3D_BUCKET/index.html \
  --cache-control "public, max-age=0, must-revalidate"

if [[ "$VUE_APP_S3D_ENABLE_CLOUDFRONT" == "true" ]]; then

  echo "Invalidating CloudFront cache for index.html..."
  INVALIDATION_ID=$(aws cloudfront create-invalidation \
    --distribution-id $VUE_APP_S3D_CLOUDFRONT_ID \
    --paths "/index.html" \
    --query 'Invalidation.Id' \
    --output text)

  echo "Invalidation $INVALIDATION_ID created. Waiting for completion..."
  aws cloudfront wait invalidation-completed \
    --distribution-id $VUE_APP_S3D_CLOUDFRONT_ID \
    --id $INVALIDATION_ID

fi

echo "Deployment complete!"