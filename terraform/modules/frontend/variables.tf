variable "environment" {
}

variable "environment_long_name" {
}

variable "region" {
}

variable "days_to_keep_old_versions" {
}

variable "application_name" {
}

variable "frontend_access_logs_bucket" {
}

variable "retain_frontend_access_logs_after_destroy" {
  type = bool
}

variable "days_to_keep_frontend_access_logs" {
}

variable "bucketname_user_string" {
}

variable "use_custom_domain" {
  type = bool
}

variable "application_domain" {
}

variable "zone_id" {
}

variable "enable_continuous_deployment" {
  type = bool
}

variable "project_github_location" {
  default = ""
}

variable "build_logs_bucket_id" {
  default = ""
}

variable "buildspec_location" {
  default = ""
}

variable "file_path" {
  default = ""
}

variable "build_service_role_arn" {
  default = ""
}

variable "notifications_email" {
}

variable "alarms_sns_topic_arn" {
  default = ""
}

variable "lambda_function_name" {
}
