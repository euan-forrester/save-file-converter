variable "build_logs_directory" {
  default = "/frontend"
}

resource "aws_codebuild_project" "frontend" {
  name          = "${var.application_name}-frontend-${var.environment}"
  description   = "Builds the ${var.environment} frontend"
  build_timeout = "5"
  service_role  = var.build_service_role_arn
  badge_enabled = true

  artifacts {
    type = "NO_ARTIFACTS"
  }

  cache {
    type  = "LOCAL"
    modes = ["LOCAL_SOURCE_CACHE"]
  }

  environment {
    compute_type                = "BUILD_GENERAL1_SMALL"
    image                       = "aws/codebuild/standard:6.0"
    type                        = "LINUX_CONTAINER"
    image_pull_credentials_type = "CODEBUILD"

    environment_variable {
      name  = "ENVIRONMENT"
      value = var.environment_long_name
    }
  }

  logs_config {
    cloudwatch_logs {
      status = "DISABLED"
    }

    s3_logs {
      status   = "ENABLED"
      location = "${var.build_logs_bucket_id}${var.build_logs_directory}"
    }
  }

  source {
    type            = "GITHUB"
    location        = var.project_github_location
    buildspec       = var.buildspec_location
    git_clone_depth = 1
  }

  tags = {
    Environment = var.environment
  }
  # It would be preferable to have these builds happen in our own VPC, but the machines have to
  # be on a private subnet with access to the Internet, which requires a NAT, which incurs billing charges.
  # So just have them be in the default VPC instead
}

resource "aws_codebuild_webhook" "frontend" {
  project_name = aws_codebuild_project.frontend.name

  filter_group {
    filter {
      type    = "EVENT"
      pattern = "PUSH"
    }

    filter {
      type    = "HEAD_REF"
      pattern = "main"
    }

    filter {
      type    = "FILE_PATH"
      pattern = var.file_path
    }
  }
}

