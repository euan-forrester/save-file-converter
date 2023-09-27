module "frontend" {
  source = "../modules/frontend"

  environment           = var.environment
  environment_long_name = var.environment_long_name
  region                = var.region

  bucketname_user_string = var.bucketname_user_string

  application_name      = var.application_name

  days_to_keep_old_versions = 1

  frontend_access_logs_bucket               = "${var.application_name}-frontend-access-logs"
  retain_frontend_access_logs_after_destroy = false # For dev, we don't care about retaining these logs after doing a terraform destroy
  days_to_keep_frontend_access_logs         = 1

  use_custom_domain     = false
  application_domain    = var.application_domain
  zone_id               = var.route_53_zone_id

  enable_continuous_deployment = false
}

module "alarms" {
  source = "../modules/alarms"

  environment       = var.environment
  region            = var.region

  topic_name        = var.application_name
  notifications_email = var.notifications_email

  enable_alarms     = false
}
