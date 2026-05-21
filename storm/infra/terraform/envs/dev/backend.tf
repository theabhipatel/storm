terraform {
  required_version = ">= 1.6.0"

  # The S3 backend bucket and DynamoDB lock table must already exist.
  # See INFRA-SETUP.md (root) for one-time bootstrap commands.
  backend "s3" {
    bucket         = "storm-tfstate"
    key            = "envs/dev/terraform.tfstate"
    region         = "ap-south-1"
    dynamodb_table = "storm-tflock"
    encrypt        = true
  }
}
