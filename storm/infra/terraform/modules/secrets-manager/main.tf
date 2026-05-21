terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.60"
    }
  }
}

# Creates one secret per logical name. Values are populated out-of-band:
#   aws secretsmanager put-secret-value --secret-id <arn> --secret-string <json>
resource "aws_secretsmanager_secret" "this" {
  for_each = toset(var.secret_names)
  name     = "${var.prefix}/${each.value}"
  tags     = var.tags
}
