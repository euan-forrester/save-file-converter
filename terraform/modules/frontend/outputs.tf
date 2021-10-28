output "bucket_name" {
  value       = aws_s3_bucket.frontend.bucket
  description = "Name of the bucket that was created to serve frontend files from"
}

output "bucket_metrics_filter_id" {
  value       = aws_s3_bucket_metric.frontend.name
  description = "FilterId of the filter used on the bucket metrics"
}

output "s3_deployment_bucket_arn" {
  value       = aws_s3_bucket.frontend.arn
  description = "The ARN of the bucket that hosts our deployment"
}

output "cloudfront_distribution_arn" {
  value       = element(concat(aws_cloudfront_distribution.application.*.arn, [""]), 0)
  description = "The ARN of the Cloudfront distribution that fronts our deployment"
}
