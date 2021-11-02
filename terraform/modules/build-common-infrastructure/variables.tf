variable "environment" {
}

variable "environment_long_name" {
}

variable "region" {
}

variable "project_github_location" {
}

variable "build_logs_bucket" {
}

variable "bucketname_user_string" {
}

variable "retain_build_logs_after_destroy" {
  type = bool
}

variable "days_to_keep_build_logs" {
}

variable "s3_deployment_bucket_arn" {
}

variable "cloudfront_distribution_arn" {
}

variable "topic_name" {
}

variable "notifications_email" {
}
