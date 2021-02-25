# I predict this will be a low-usage application, so let's get an email whenever someone actually uses it
resource "aws_cloudwatch_metric_alarm" "s3_access" {
  count = var.enable_alarms ? 1 : 0 # Don't create this if we turn off alarms (e.g. for dev)

  alarm_name                = "${var.topic_name} S3 access - ${var.environment}"
  comparison_operator       = "GreaterThanOrEqualToThreshold"
  evaluation_periods        = "1"
  metric_name               = "GetRequests"
  namespace                 = "AWS/S3"
  period                    = "300"
  statistic                 = "Sum"
  threshold                 = var.s3_access_alarm_threshold
  treat_missing_data        = "notBreaching"
  alarm_description         = "Alerts if someone downloads index.html from our bucket"
  alarm_actions             = [aws_sns_topic.alarms.arn]
  insufficient_data_actions = [aws_sns_topic.alarms.arn]
  ok_actions                = [aws_sns_topic.alarms.arn]

  dimensions = {
    BucketName = var.bucket_name
    FilterId = var.bucket_metrics_filter_id # "RequestsIndexHtml" # var.bucket_metrics_filter_id
  }
}