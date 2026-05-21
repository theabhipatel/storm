terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.60"
    }
  }
}

resource "aws_kms_key" "this" {
  description             = "${var.name}-s3"
  deletion_window_in_days = 30
  enable_key_rotation     = true
  tags                    = var.tags
}

locals {
  buckets = toset(var.buckets)
}

resource "aws_s3_bucket" "this" {
  for_each = local.buckets
  bucket   = "${var.name}-${each.value}-${var.environment}"
  tags     = merge(var.tags, { purpose = each.value })
}

resource "aws_s3_bucket_versioning" "this" {
  for_each = local.buckets
  bucket   = aws_s3_bucket.this[each.value].id
  versioning_configuration { status = "Enabled" }
}

resource "aws_s3_bucket_server_side_encryption_configuration" "this" {
  for_each = local.buckets
  bucket   = aws_s3_bucket.this[each.value].id
  rule {
    apply_server_side_encryption_by_default {
      sse_algorithm     = "aws:kms"
      kms_master_key_id = aws_kms_key.this.arn
    }
  }
}

resource "aws_s3_bucket_public_access_block" "this" {
  for_each                = local.buckets
  bucket                  = aws_s3_bucket.this[each.value].id
  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}
