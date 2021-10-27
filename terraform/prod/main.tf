module "frontend" {
  source = "../modules/frontend"

  environment           = var.environment
  environment_long_name = var.environment_long_name
  region                = var.region

  bucketname_user_string = var.bucketname_user_string

  application_name   = var.application_name

  days_to_keep_old_versions = 1

  frontend_access_logs_bucket               = "${var.application_name}-frontend-access-logs"
  retain_frontend_access_logs_after_destroy = true # For prod we don't want to lose logs after doing a terraform destroy
  days_to_keep_frontend_access_logs         = 90

  use_custom_domain     = true
  application_domain    = var.application_domain
  zone_id               = var.route_53_zone_id

  project_github_location = var.project_github_location
  build_logs_bucket_id    = module.build-common-infrastructure.build_logs_bucket_id
  buildspec_location      = "frontend/buildspec.yml"
  file_path               = "frontend/*"
  build_service_role_arn  = module.build-common-infrastructure.build_service_role_arn
}

module "build-common-infrastructure" {
  source = "../modules/build-common-infrastructure"

  environment           = var.environment
  environment_long_name = var.environment_long_name
  region                = var.region

  project_github_location  = var.project_github_location
  s3_deployment_bucket_arn = module.frontend.s3_deployment_bucket_arn

  build_logs_bucket               = "${var.application_name}-build-logs"
  bucketname_user_string          = var.bucketname_user_string
  retain_build_logs_after_destroy = true # For prod we don't want to lose logs, even after a terraform destroy
  days_to_keep_build_logs         = 90
}

module "alarms" {
  source = "../modules/alarms"

  environment       = var.environment
  region            = var.region

  topic_name        = var.application_name
  alarms_email      = var.alarms_email

  bucket_name       = module.frontend.bucket_name
  bucket_metrics_filter_id = module.frontend.bucket_metrics_filter_id
  s3_access_alarm_threshold = 1

  enable_alarms     = false
}

module "dashboard" {
  source = "../modules/dashboard"

  environment       = var.environment
  region            = var.region

  application_name  = var.application_name

  bucket_name       = module.frontend.bucket_name
  bucket_metrics_filter_id = module.frontend.bucket_metrics_filter_id
}