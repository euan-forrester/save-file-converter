# This prevents a circular dependency between aws_lambda_function.email_build_logs and aws_cloudwatch_log_group.build_logs
variable "lambda_function_name" {
  default = "email_build_logs"
}

# Infra to support our lambda function:
# Policies for it to assume a role and to be able to trigger events based on success/failure,
# and also the source file and the lambda function itself

data "aws_iam_policy_document" "assume_role" {
  statement {
    effect = "Allow"

    principals {
      type        = "Service"
      identifiers = ["lambda.amazonaws.com"]
    }

    actions = ["sts:AssumeRole"]
  }
}

resource "aws_iam_role" "iam_for_lambda" {
  name               = "${var.application_name}-${var.environment}-iam_for_lambda"
  assume_role_policy = data.aws_iam_policy_document.assume_role.json

  inline_policy {
    name = "email-logs-lambda-policy-${var.environment}"
    policy = <<POLICY
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "SQSDeadLetterAccessPolicy",
      "Effect": "Allow",
      "Action": [
        "sqs:SendMessage"
      ],
      "Resource": [
        "${aws_sqs_queue.build_dead_letter_queue.arn}"
      ]
    },
    {
      "Sid": "SNSBucketIdentity",
      "Effect": "Allow",
      "Action": [
        "sns:Publish"
      ],
      "Resource": [
        "${var.build_sns_topic_arn}"
      ]
    },
    {
      "Sid": "S3AccessPolicy",
      "Effect": "Allow",
      "Action": [
        "s3:GetObject"
      ],
      "Resource": [
        "arn:aws:s3:::${var.build_logs_bucket_id}${var.build_logs_directory}"
        "arn:aws:s3:::${var.build_logs_bucket_id}${var.build_logs_directory}/*"
      ]
    }
  ]
}
POLICY
  }
}

resource "aws_lambda_permission" "allow_cloudwatch_events" {
  statement_id  = "AllowExecutionFromCloudWatchEvents"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.email_build_logs.function_name
  principal     = "events.amazonaws.com"
  source_arn    = aws_cloudwatch_event_rule.build_complete.arn
}

data "archive_file" "email_logs_lambda_function" {
  type        = "zip"
  source_file = "${path.module}/python/email-logs.py"
  output_path = "${path.module}/python/email-logs.zip"
}

resource "aws_lambda_function" "email_build_logs" {
  filename = data.archive_file.email_logs_lambda_function.output_path
  function_name = var.lambda_function_name
  role = aws_iam_role.iam_for_lambda.arn
  handler = "email-logs.download_logs_and_send_email"
  publish = true

  source_code_hash = data.archive_file.email_logs_lambda_function.output_base64sha256

  runtime = "python3.9"

  environment {
    variables = {
      EMAIL_ADDRESS = var.notifications_email
    }
  }

  depends_on = [
    aws_iam_role_policy_attachment.lambda_logs,
    aws_cloudwatch_log_group.build_logs,
  ]
}

# Infra to respond to our lamdba function:
# If the invocation fails then the input gets put on a dead-letter queue and an alarm is triggered

resource "aws_lambda_function_event_invoke_config" "email_build_logs" {
  function_name = aws_lambda_function.email_build_logs.function_name

  maximum_event_age_in_seconds = 60
  maximum_retry_attempts       = 2

  destination_config {
    on_failure {
      destination = aws_sqs_queue.build_dead_letter_queue.arn
    }

    on_success {
      destination = var.build_sns_topic_arn
    }
  }
}

resource "aws_sqs_queue" "build_dead_letter_queue" {
  name                      = "${var.lambda_function_name}-dead-letter-${var.environment}"
  delay_seconds             = 0
  max_message_size          = 262144  # 256kB
  message_retention_seconds = 1209600 # 14 days
  receive_wait_time_seconds = 0
}

resource "aws_cloudwatch_metric_alarm" "build_dead_letter_queue_items" {
  alarm_name                = "${aws_sqs_queue.build_dead_letter_queue.name} items"
  comparison_operator       = "GreaterThanOrEqualToThreshold"
  evaluation_periods        = "1"
  metric_name               = "ApproximateNumberOfMessagesVisible"
  namespace                 = "AWS/SQS"
  period                    = "300"
  statistic                 = "Maximum"
  threshold                 = "1"
  treat_missing_data        = "ignore" # Maintain alarm state on missing data - sometimes data will just be missing for queues for some reason
  alarm_description         = "Alerts if the build dead-letter queue has items in it"
  alarm_actions             = [var.alarms_sns_topic_arn]
  insufficient_data_actions = [var.alarms_sns_topic_arn]
  ok_actions                = [var.alarms_sns_topic_arn]

  dimensions = {
    QueueName = aws_sqs_queue.build_dead_letter_queue.name
  }
}

# Lambda function automatically write to cloudwatch logs if we give them permission

resource "aws_cloudwatch_log_group" "build_logs" {
  name              = "/aws/lambda/${var.lambda_function_name}"
  retention_in_days = 14
}

# See also the following AWS managed policy: AWSLambdaBasicExecutionRole
data "aws_iam_policy_document" "lambda_logging" {
  statement {
    effect = "Allow"

    actions = [
      "logs:CreateLogGroup",
      "logs:CreateLogStream",
      "logs:PutLogEvents",
    ]

    resources = ["arn:aws:logs:*:*:*"]
  }
}

resource "aws_iam_policy" "lambda_logging" {
  name        = "${var.application_name}-${var.environment}-lambda_logging"
  path        = "/"
  description = "IAM policy for logging from a lambda"
  policy      = data.aws_iam_policy_document.lambda_logging.json
}

resource "aws_iam_role_policy_attachment" "lambda_logs" {
  role       = aws_iam_role.iam_for_lambda.name
  policy_arn = aws_iam_policy.lambda_logging.arn
}