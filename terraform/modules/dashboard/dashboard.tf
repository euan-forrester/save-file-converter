resource "aws_cloudwatch_dashboard" "main" {
  dashboard_name = "${var.application_name}-${var.environment}"

  dashboard_body = <<EOF
  {
    "widgets": [
       {
          "x":0,
          "y":0,
          "width":24,
          "height":6,
          "type":"metric",
          "properties": {
              "metrics": [
                  [
                      "AWS/S3",
                      "GetRequests",
                      "BucketName",
                      "${var.bucket_name}",
                      "FilterId",
                      "${var.bucket_metrics_filter_id}"
                  ]
              ],
              "period":300,
              "stat":"Average",
              "region":"${var.region}",
              "title":"S3 bucket requests of index.html"
          }
       }
    ]
  }
EOF
}
