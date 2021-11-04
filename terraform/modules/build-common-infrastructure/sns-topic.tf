# Based on https://stephenmann.io/post/setting-up-monitoring-and-alerting-on-amazon-aws-with-terraform/

resource "aws_sns_topic" "builds" {
  name            = "${var.topic_name}-${var.environment}"
  delivery_policy = <<EOF
{
  "http": {
    "defaultHealthyRetryPolicy": {
      "minDelayTarget": 20,
      "maxDelayTarget": 20,
      "numRetries": 3,
      "numMaxDelayRetries": 0,
      "numNoDelayRetries": 0,
      "numMinDelayRetries": 0,
      "backoffFunction": "linear"
    },
    "disableSubscriptionOverrides": false,
    "defaultThrottlePolicy": {
      "maxReceivesPerSecond": 1
    }
  }
}
EOF

  provisioner "local-exec" {
    command = "aws sns subscribe --topic-arn ${self.arn} --protocol email --notification-endpoint ${var.notifications_email} --region ${var.region}"
  }
}

# EventBridge is supposed to automatically create a policy on the SNS topic: https://docs.aws.amazon.com/eventbridge/latest/userguide/eb-troubleshooting.html#eb-sns-permissions-persist
# but it doesn't seem to in our case.
# So adding it manually, based on: https://serverlessland.com/patterns/eventbridge-sns
resource "aws_sns_topic_policy" "default" {
  arn = aws_sns_topic.builds.arn

  policy = data.aws_iam_policy_document.sns_builds_topic_policy.json
}

data "aws_iam_policy_document" "sns_builds_topic_policy" {
  policy_id = "__default_policy_ID"

  statement {
    actions = [
      "SNS:Publish"
    ]

    effect = "Allow"

    principals {
      type        = "Service"
      identifiers = ["events.amazonaws.com"]
    }

    resources = [
      aws_sns_topic.builds.arn,
    ]

    sid = "__default_statement_ID"
  }
}
