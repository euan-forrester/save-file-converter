module "build" {
  source = "../build-pipeline-frontend"

  count = var.enable_continuous_deployment ? 1 : 0

  environment              = var.environment
  environment_long_name    = var.environment_long_name
  region                   = var.region
  application_name         = var.application_name
  lambda_function_name     = var.lambda_function_name
  project_github_location  = var.project_github_location
  build_logs_bucket_id     = var.build_logs_bucket_id
  s3_deployment_bucket_arn = aws_s3_bucket.frontend.arn
  buildspec_location       = var.buildspec_location
  file_path                = var.file_path
  build_service_role_arn   = var.build_service_role_arn
  alarms_sns_topic_arn     = var.alarms_sns_topic_arn
  notifications_email      = var.notifications_email
}
