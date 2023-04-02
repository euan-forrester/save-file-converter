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

resource "aws_cloudwatch_event_target" "sqs" {
  rule      = aws_cloudwatch_event_rule.build_complete.name
  target_id = "SendToSQS"
  arn       = aws_sqs_queue.build_complete_queue.arn

  input_transformer {
    input_paths = {
      build-id = "$.detail.build-id",
      project-name = "$.detail.project-name",
      build-status = "$.detail.build-status",
    }
    input_template = <<EOF
{
  "MessageBody": "Hello"
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
  alarm_description         = "Alerts if there is a failure to publish a codebuild event to SQS"
  alarm_actions             = [var.alarms_sns_topic_arn]
  insufficient_data_actions = [var.alarms_sns_topic_arn]
  ok_actions                = [var.alarms_sns_topic_arn]

  dimensions = {
    RuleName = aws_cloudwatch_event_rule.build_complete.name
  }
}
