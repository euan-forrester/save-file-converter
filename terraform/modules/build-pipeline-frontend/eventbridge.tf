# Based on https://docs.aws.amazon.com/codebuild/latest/userguide/sample-build-notifications.html

resource "aws_cloudwatch_event_rule" "build_complete" {
  name        = "${var.application_name}-frontend-${var.environment}-codebuild"
  description = "Capture each codebuild success or failure event"

  event_pattern = <<EOF
{
  "source": [ 
    "aws.codebuild"
  ], 
  "detail-type": [
    "CodeBuild Build State Change"
  ],
  "detail": {
    "build-status": [
      "SUCCEEDED", 
      "FAILED",
      "STOPPED" 
    ],
    "project-name": [
      "${aws_codebuild_project.frontend.name}"
    ]
  }  
}
EOF
}

# Here is an example output object from CodeBuild, to see the structure:
# https://github.com/awsdocs/aws-codebuild-user-guide/blob/main/doc_source/sample-build-notifications.md#sample-build-notifications-ref

# Supposedly we can grab the guid for the logs from $.detail.additional-information.logs.stream-name, but it doesn't seem to be populated.
# We'll just have to parse it out of the build-id instead

resource "aws_cloudwatch_event_target" "lambda" {
  rule      = aws_cloudwatch_event_rule.build_complete.name
  target_id = "SendToLambda"
  arn       = aws_lambda_function.email_build_logs.arn

  input_transformer {
    input_paths = {
      build-id = "$.detail.build-id",
      project-name = "$.detail.project-name",
      build-status = "$.detail.build-status",
    }
    input_template = <<EOF
{
  "ProjectName": "<project-name>",
  "BuildStatus": "<build-status>",
  "BuildId": "<build-id>",
  "LogsBucketId": "${var.build_logs_bucket_id}",
  "LogsDirectory": "${var.build_logs_directory}"
}
EOF
  }
}

resource "aws_cloudwatch_metric_alarm" "codebuild_eventbridge_failedinvocations" {
  alarm_name                = "${var.application_name} CodeBuild EventBridge FailedInvocations - ${var.environment}"
  comparison_operator       = "GreaterThanOrEqualToThreshold"
  evaluation_periods        = "1"
  metric_name               = "FailedInvocations"
  namespace                 = "AWS/Events"
  period                    = "300"
  statistic                 = "Sum"
  threshold                 = "1"
  treat_missing_data        = "notBreaching"
  alarm_description         = "Alerts if EventBridge fails to publish a codebuild event to lambda"
  alarm_actions             = [var.alarms_sns_topic_arn]
  insufficient_data_actions = [var.alarms_sns_topic_arn]
  ok_actions                = [var.alarms_sns_topic_arn]

  dimensions = {
    RuleName = aws_cloudwatch_event_rule.build_complete.name
  }
}
