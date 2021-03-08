provider "aws" {
  # Certificates need to be in us-east-1
  # https://github.com/hashicorp/terraform/issues/10957
  region = "us-east-1"
  alias  = "use1"
}

resource "aws_acm_certificate" "cert" {
  provider          = aws.use1
  count             = var.use_custom_domain ? 1 : 0
  domain_name       = var.application_domain
  validation_method = "DNS"

  options {
    certificate_transparency_logging_preference = "ENABLED"
  }
}

resource "aws_route53_record" "cert_validation" {
  count   = var.use_custom_domain ? 1 : 0
  zone_id = var.zone_id
  name    = aws_acm_certificate.cert[count.index].domain_validation_options.0.resource_record_name
  type    = aws_acm_certificate.cert[count.index].domain_validation_options.0.resource_record_type
  records = [aws_acm_certificate.cert[count.index].domain_validation_options.0.resource_record_value]
  ttl     = 60
}

resource "aws_acm_certificate_validation" "cert" {
  provider                = aws.use1
  count                   = var.use_custom_domain ? 1 : 0
  certificate_arn         = aws_acm_certificate.cert[count.index].arn
  validation_record_fqdns = [aws_route53_record.cert_validation[count.index].fqdn]

  timeouts {
    create = "24h" # Validation can take hours: https://aws.amazon.com/blogs/security/easier-certificate-validation-using-dns-with-aws-certificate-manager/
  }
}

resource "aws_route53_record" "cloudfront-ipv4" {
  count   = var.use_custom_domain ? 1 : 0
  name    = "" # This is the subdomain, so we'll leave this blank
  zone_id = var.zone_id
  type    = "A"

  alias {
    zone_id = element(concat(aws_cloudfront_distribution.application.*.hosted_zone_id, [""]), 0)
    name = element(concat(aws_cloudfront_distribution.application.*.domain_name, [""]), 0)
    evaluate_target_health = false
  }
}

resource "aws_route53_record" "cloudfront-ipv6" {
  count   = var.use_custom_domain ? 1 : 0
  name    = "" # This is the subdomain, so we'll leave this blank
  zone_id = var.zone_id
  type    = "AAAA"

  alias {
    zone_id = element(concat(aws_cloudfront_distribution.application.*.hosted_zone_id, [""]), 0)
    name = element(concat(aws_cloudfront_distribution.application.*.domain_name, [""]), 0)
    evaluate_target_health = false
  }
}