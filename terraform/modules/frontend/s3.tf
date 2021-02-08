resource "aws_s3_bucket" "frontend" {
  bucket        = "${var.application_name}${var.bucketname_user_string}-${var.environment}"
  acl           = "public-read"
  force_destroy = true

  versioning {
    enabled = true
  }

  website {
    index_document = "index.html"
    error_document = "index.html"
  }

  logging {
    target_bucket = aws_s3_bucket.frontend_access_logs.id
    target_prefix = "access-log/"
  }

  lifecycle_rule {
    id      = "expire-old-versions-after-N-days"
    enabled = true

    noncurrent_version_expiration {
      days = var.days_to_keep_old_versions
    }
  }

  lifecycle_rule {
    id      = "expire-tagged-files-after-N-days"
    enabled = true

    tags = {
      "DeployLifecycle" = "DeleteMe"
    }

    expiration {
      days = var.days_to_keep_old_versions
    }
  }
}

resource "aws_s3_bucket_public_access_block" "frontend" {
  bucket = aws_s3_bucket.frontend.id

  block_public_acls = false # Needed to allow deployment into this bucket. I don't understand why. 

  # Giving explicit permission to the IAM user doing the deployment doesn't help. 
  # The console still says "bucket and objects not public" (as desired), 
  # and trying to go to the website link for this bucket gives a 403 forbidden (as desired)
  # I wrote up an issue here: https://github.com/multiplegeorges/vue-cli-plugin-s3-deploy/issues/79
  block_public_policy     = true
  ignore_public_acls      = false # Needed to allow bucket hosting to work. Set back to false if we put CloudFront in front of this bucket and no longer want people ot be able to access it directly
  restrict_public_buckets = true
}

resource "aws_s3_bucket" "frontend_access_logs" {
  bucket        = "${var.frontend_access_logs_bucket}${var.bucketname_user_string}-${var.environment}"
  acl           = "log-delivery-write"
  force_destroy = false == var.retain_frontend_access_logs_after_destroy

  lifecycle_rule {
    id      = "expire-logs-after-N-days"
    enabled = true

    prefix = "*"

    expiration {
      days = var.days_to_keep_frontend_access_logs
    }
  }

  server_side_encryption_configuration {
    rule {
      apply_server_side_encryption_by_default {
        # Keep this as AES for consistency with the load balancer access logs (see note there)
        sse_algorithm = "AES256"
      }
    }
  }
}

resource "aws_s3_bucket_public_access_block" "frontend_access_logs" {
  bucket = aws_s3_bucket.frontend_access_logs.id

  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}
