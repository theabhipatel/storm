terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.60"
    }
  }
}

# One IAM role per K8s ServiceAccount via IRSA. The role can be assumed by
# pods running with the given service account in the given namespace, and is
# granted least-privilege access to the listed AWS resources.

locals {
  oidc_host = replace(var.oidc_issuer, "https://", "")
}

resource "aws_iam_role" "this" {
  for_each = var.service_accounts

  name = "${var.cluster_name}-${each.value.name}"

  assume_role_policy = jsonencode({
    Version = "2012-10-17",
    Statement = [{
      Effect    = "Allow",
      Principal = { Federated = var.oidc_provider_arn },
      Action    = "sts:AssumeRoleWithWebIdentity",
      Condition = {
        StringEquals = {
          "${local.oidc_host}:sub" = "system:serviceaccount:${each.value.namespace}:${each.value.name}"
          "${local.oidc_host}:aud" = "sts.amazonaws.com"
        }
      }
    }]
  })

  tags = var.tags
}

resource "aws_iam_role_policy" "inline" {
  for_each = {
    for k, v in var.service_accounts : k => v
    if length(v.inline_policy_statements) > 0
  }

  name = "${each.value.name}-inline"
  role = aws_iam_role.this[each.key].id
  policy = jsonencode({
    Version   = "2012-10-17",
    Statement = each.value.inline_policy_statements,
  })
}
