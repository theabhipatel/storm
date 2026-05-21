terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.60"
    }
  }
}

resource "aws_wafv2_web_acl" "this" {
  name        = "${var.name}-waf"
  description = "Storm edge WAF (managed + custom rate limit)"
  scope       = "REGIONAL"
  default_action {
    allow {}
  }

  visibility_config {
    cloudwatch_metrics_enabled = true
    sampled_requests_enabled   = true
    metric_name                = "${var.name}-waf"
  }

  rule {
    name     = "AWSManagedCore"
    priority = 1
    statement {
      managed_rule_group_statement {
        vendor_name = "AWS"
        name        = "AWSManagedRulesCommonRuleSet"
      }
    }
    override_action {
      none {}
    }
    visibility_config {
      cloudwatch_metrics_enabled = true
      sampled_requests_enabled   = true
      metric_name                = "AWSManagedCore"
    }
  }

  rule {
    name     = "AWSManagedKnownBadInputs"
    priority = 2
    statement {
      managed_rule_group_statement {
        vendor_name = "AWS"
        name        = "AWSManagedRulesKnownBadInputsRuleSet"
      }
    }
    override_action {
      none {}
    }
    visibility_config {
      cloudwatch_metrics_enabled = true
      sampled_requests_enabled   = true
      metric_name                = "AWSManagedKnownBadInputs"
    }
  }

  rule {
    name     = "AWSManagedSQLi"
    priority = 3
    statement {
      managed_rule_group_statement {
        vendor_name = "AWS"
        name        = "AWSManagedRulesSQLiRuleSet"
      }
    }
    override_action {
      none {}
    }
    visibility_config {
      cloudwatch_metrics_enabled = true
      sampled_requests_enabled   = true
      metric_name                = "AWSManagedSQLi"
    }
  }

  rule {
    name     = "AWSManagedLinux"
    priority = 4
    statement {
      managed_rule_group_statement {
        vendor_name = "AWS"
        name        = "AWSManagedRulesLinuxRuleSet"
      }
    }
    override_action {
      none {}
    }
    visibility_config {
      cloudwatch_metrics_enabled = true
      sampled_requests_enabled   = true
      metric_name                = "AWSManagedLinux"
    }
  }

  rule {
    name     = "EdgeRateLimit"
    priority = 10
    action {
      block {}
    }
    statement {
      rate_based_statement {
        limit              = var.edge_rate_limit
        aggregate_key_type = "IP"
      }
    }
    visibility_config {
      cloudwatch_metrics_enabled = true
      sampled_requests_enabled   = true
      metric_name                = "EdgeRateLimit"
    }
  }

  tags = var.tags
}
