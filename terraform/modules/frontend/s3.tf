resource "aws_s3_bucket" "frontend" {
  bucket        = "${var.application_name}${var.bucketname_user_string}-${var.environment}"
  force_destroy = true
}

resource "aws_s3_bucket_logging" "frontend" {
  bucket = aws_s3_bucket.frontend.bucket

  target_bucket = aws_s3_bucket.frontend_access_logs.bucket
  target_prefix = "access-log/"
}

resource "aws_s3_bucket_lifecycle_configuration" "frontend" {
  bucket = aws_s3_bucket.frontend.id

  rule {
    id = "expire-old-versions-after-N-days"

    filter {}

    noncurrent_version_expiration {
      noncurrent_days = 90
    }

    status = "Enabled"
  }

  rule {
    id = "expire-tagged-files-after-N-days"

    filter {
      tag {
        key = "DeployLifecycle"
        value = "DeleteMe"
      }
    }

    expiration {
      days = var.days_to_keep_old_versions
    }

    status = "Enabled"
  }
}

resource "aws_s3_bucket_metric" "frontend" {
  bucket = aws_s3_bucket.frontend.bucket
  name   = "GetRequests"

  filter {
    prefix = "index.html"
  }
}

resource "aws_s3_bucket_versioning" "frontend" {
  bucket = aws_s3_bucket.frontend.id

  versioning_configuration {
    status = "Enabled"
  }
}

resource "aws_s3_bucket_website_configuration" "frontend" {
  bucket = aws_s3_bucket.frontend.id

  index_document {
    suffix = "index.html"
  }

  error_document {
    key = "index.html"
  }
}

resource "aws_s3_bucket_acl" "frontend" {
  bucket = aws_s3_bucket.frontend.id
  acl    = "public-read"
}

resource "aws_s3_bucket_public_access_block" "frontend" {
  bucket = aws_s3_bucket.frontend.id

  block_public_acls = false # Needed to allow deployment into this bucket. I don't understand why.

  # Giving explicit permission to the IAM user doing the deployment doesn't help.
  # The console still says "bucket and objects not public" (as desired),
  # and trying to go to the website link for this bucket gives a 403 forbidden (as desired)
  # I wrote up an issue here: https://github.com/multiplegeorges/vue-cli-plugin-s3-deploy/issues/79
  block_public_policy     = true
  ignore_public_acls      = var.use_custom_domain # Need to be able to access this bucket publicly in dev if there's no CloudFront in front of it
  restrict_public_buckets = true
}

# We need to give the cloudfront user the ability to read from this bucket, and our current
# user the ability to write to it

# Setting the acl to "bucket-owner-full-control" gives the *account* owner full control, but no control
# to the IAM user who created the bucket. That's the same IAM user who will be deploying files
# into this bucket, so it needs an individual permission

data "aws_caller_identity" "current" {
}

data "aws_iam_policy_document" "allow_cloudfront_and_current_user" {
  statement {
    actions   = ["s3:GetObject"]
    resources = ["${aws_s3_bucket.frontend.arn}/*"]

    principals {
      type        = "AWS"
      identifiers = [aws_cloudfront_origin_access_identity.origin_access_identity.iam_arn]
    }
  }

  statement {
    actions   = ["s3:ListBucket"]
    resources = [aws_s3_bucket.frontend.arn]

    principals {
      type        = "AWS"
      identifiers = [aws_cloudfront_origin_access_identity.origin_access_identity.iam_arn]
    }
  }
}

resource "aws_s3_bucket_policy" "frontend_cloudfront_current_user" {
  bucket = aws_s3_bucket.frontend.id
  policy = data.aws_iam_policy_document.allow_cloudfront_and_current_user.json
}

resource "aws_s3_bucket" "frontend_access_logs" {
  bucket        = "${var.frontend_access_logs_bucket}${var.bucketname_user_string}-${var.environment}"
  force_destroy = false == var.retain_frontend_access_logs_after_destroy
}

resource "aws_s3_bucket_lifecycle_configuration" "frontend_access_logs" {
  bucket = aws_s3_bucket.frontend_access_logs.id

  rule {
    id = "expire-logs-after-N-days"

    filter {}

    expiration {
      days = var.days_to_keep_frontend_access_logs
    }

    status = "Enabled"
  }
}

resource "aws_s3_bucket_acl" "frontend_access_logs" {
  bucket = aws_s3_bucket.frontend_access_logs.id
  acl    = "log-delivery-write"
}

# It looks like service side encryption has become the default, and this is no long needed: https://docs.aws.amazon.com/AmazonS3/latest/userguide/default-encryption-faq.html
resource "aws_s3_bucket_server_side_encryption_configuration" "frontend_access_logs" {
  bucket = aws_s3_bucket.frontend_access_logs.id

  rule {
    apply_server_side_encryption_by_default {
      # Keep this as AES for consistency with the load balancer access logs (see note there)
      sse_algorithm = "AES256"
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
