output "bucket_names" {
  value = { for k, v in aws_s3_bucket.this : k => v.bucket }
}

output "kms_key_arn" {
  value = aws_kms_key.this.arn
}
