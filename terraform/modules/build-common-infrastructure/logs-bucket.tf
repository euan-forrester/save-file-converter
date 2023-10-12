resource "aws_s3_bucket" "build_logs" {
  bucket        = "${var.build_logs_bucket}${var.bucketname_user_string}-${var.environment}"
  force_destroy = false == var.retain_build_logs_after_destroy

  lifecycle_rule {
    id      = "expire-logs-after-N-days"
    enabled = true

    prefix = "*"

    expiration {
      days = var.days_to_keep_build_logs
    }
  }
}

resource "aws_s3_bucket_server_side_encryption_configuration" "build_logs" {
  bucket = aws_s3_bucket.build_logs.id 

  rule {
    apply_server_side_encryption_by_default {
      # Keep this as AES for consistency with the load balancer access logs (see note there)
      sse_algorithm = "AES256"
    }
  }
}

resource "aws_s3_bucket_public_access_block" "build_logs" {
  bucket = aws_s3_bucket.build_logs.id

  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

# This disables ACLs on the bucket
resource "aws_s3_bucket_ownership_controls" "build_logs" {
  bucket = aws_s3_bucket.build_logs.id

  rule {
    object_ownership = "BucketOwnerEnforced"
  }
}
