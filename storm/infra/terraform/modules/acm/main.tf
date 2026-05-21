terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.60"
    }
  }
}

resource "aws_acm_certificate" "this" {
  domain_name               = var.primary_domain
  subject_alternative_names = var.sans
  validation_method         = "DNS"
  lifecycle { create_before_destroy = true }
  tags = var.tags
}
