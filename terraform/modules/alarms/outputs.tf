output "sns_topic_arn" {
  value       = aws_sns_topic.alarms.arn
  description = "ARN alarms SNS topic"
}
