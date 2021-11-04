output "build_service_role_arn" {
  value       = aws_iam_role.build_common_infrastructure.arn
  description = "ARN for the role which is used to run builds"
}

output "build_logs_bucket_id" {
  value       = aws_s3_bucket.build_logs.id
  description = "ID of the bucket that will contain our build logs"
}

output "sns_topic_arn" {
  value       = aws_sns_topic.builds.arn
  description = "ARN for the SNS topic used to receive build events"
}
