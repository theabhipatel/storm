terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.60"
    }
  }
}

provider "aws" {
  region = var.region
  default_tags {
    tags = {
      project     = "storm"
      environment = "dev"
      managed_by  = "terraform"
    }
  }
}

# us-east-1 provider for CloudFront ACM certs.
provider "aws" {
  alias  = "us_east_1"
  region = "us-east-1"
  default_tags {
    tags = {
      project     = "storm"
      environment = "dev"
      managed_by  = "terraform"
    }
  }
}

locals {
  name = "storm-dev"
  tags = {
    project     = "storm"
    environment = "dev"
  }
}

module "network" {
  source   = "../../modules/network"
  name     = local.name
  region   = var.region
  vpc_cidr = "10.20.0.0/16"
  tags     = local.tags
}

module "eks" {
  source             = "../../modules/eks"
  name               = local.name
  cluster_version    = "1.30"
  private_subnet_ids = module.network.private_app_subnet_ids
  public_subnet_ids  = module.network.public_subnet_ids
  tags               = local.tags
}

module "rds" {
  source         = "../../modules/rds"
  name           = local.name
  environment    = "dev"
  vpc_id         = module.network.vpc_id
  vpc_cidr_block = module.network.vpc_cidr_block
  subnet_ids     = module.network.private_data_subnet_ids
  databases      = ["identity", "catalog", "inventory", "order", "payment", "wishlist", "media"]
  tags           = local.tags
}

module "mongodb" {
  source         = "../../modules/mongodb"
  name           = local.name
  environment    = "dev"
  vpc_id         = module.network.vpc_id
  vpc_cidr_block = module.network.vpc_cidr_block
  subnet_ids     = module.network.private_data_subnet_ids
  tags           = local.tags
}

module "redis" {
  source         = "../../modules/redis"
  name           = local.name
  vpc_id         = module.network.vpc_id
  vpc_cidr_block = module.network.vpc_cidr_block
  subnet_ids     = module.network.private_data_subnet_ids
  tags           = local.tags
}

module "msk" {
  source         = "../../modules/msk"
  name           = local.name
  vpc_id         = module.network.vpc_id
  vpc_cidr_block = module.network.vpc_cidr_block
  subnet_ids     = module.network.private_app_subnet_ids
  tags           = local.tags
}

module "opensearch" {
  source         = "../../modules/opensearch"
  name           = local.name
  vpc_id         = module.network.vpc_id
  vpc_cidr_block = module.network.vpc_cidr_block
  subnet_ids     = module.network.private_app_subnet_ids
  tags           = local.tags
}

module "s3" {
  source      = "../../modules/s3"
  name        = local.name
  environment = "dev"
  buckets     = ["media", "invoices", "backups", "logs", "loki", "tempo", "exports"]
  tags        = local.tags
}

module "acm_alb" {
  source         = "../../modules/acm"
  primary_domain = "storm.dev.example"
  sans           = ["*.storm.dev.example"]
  tags           = local.tags
}

module "acm_cloudfront" {
  source         = "../../modules/acm"
  providers      = { aws = aws.us_east_1 }
  primary_domain = "cdn.storm.dev.example"
  tags           = local.tags
}

module "waf" {
  source          = "../../modules/waf"
  name            = local.name
  edge_rate_limit = 2000
  tags            = local.tags
}

module "alb" {
  source            = "../../modules/alb"
  name              = local.name
  vpc_id            = module.network.vpc_id
  public_subnet_ids = module.network.public_subnet_ids
  certificate_arn   = module.acm_alb.certificate_arn
  web_acl_arn       = module.waf.web_acl_arn
  tags              = local.tags
}

module "cloudfront" {
  source                    = "../../modules/cloudfront"
  providers                 = { aws = aws.us_east_1 }
  name                      = local.name
  media_origin_domain       = "${module.s3.bucket_names["media"]}.s3.${var.region}.amazonaws.com"
  media_aliases             = ["cdn.storm.dev.example"]
  us_east_1_certificate_arn = module.acm_cloudfront.certificate_arn
  tags                      = local.tags
}

module "route53" {
  source    = "../../modules/route53"
  zone_name = "storm.dev.example"
  alias_records = {
    "storm.dev.example" = {
      dns_name = module.alb.dns_name,
      zone_id  = module.alb.zone_id
    }
    "web.storm.dev.example" = {
      dns_name = module.alb.dns_name,
      zone_id  = module.alb.zone_id
    }
    "admin.storm.dev.example" = {
      dns_name = module.alb.dns_name,
      zone_id  = module.alb.zone_id
    }
    "api.storm.dev.example" = {
      dns_name = module.alb.dns_name,
      zone_id  = module.alb.zone_id
    }
    "cdn.storm.dev.example" = {
      dns_name = module.cloudfront.distribution_domain,
      zone_id  = module.cloudfront.distribution_zone_id
    }
  }
  tags = local.tags
}

module "secrets" {
  source = "../../modules/secrets-manager"
  prefix = "storm/dev"
  secret_names = [
    "identity/jwt",
    "identity/google-oauth",
    "payment/razorpay",
    "notification/smtp",
    "notification/twilio",
    "sentry/dsn",
    "grafana/admin",
  ]
  tags = local.tags
}

module "irsa" {
  source            = "../../modules/iam-irsa"
  cluster_name      = module.eks.cluster_name
  oidc_issuer       = module.eks.oidc_issuer
  oidc_provider_arn = module.eks.oidc_provider_arn
  service_accounts = {
    media = {
      name      = "media-service"
      namespace = "storm"
      inline_policy_statements = [
        {
          Effect   = "Allow",
          Action   = ["s3:GetObject", "s3:PutObject", "s3:DeleteObject"],
          Resource = "${module.s3.bucket_names["media"]}/*"
        }
      ]
    },
    notification = {
      name      = "notification-service"
      namespace = "storm"
      inline_policy_statements = [
        { Effect = "Allow", Action = "ses:SendEmail", Resource = "*" },
        { Effect = "Allow", Action = "ses:SendRawEmail", Resource = "*" },
        { Effect = "Allow", Action = "s3:PutObject", Resource = "${module.s3.bucket_names["invoices"]}/*" }
      ]
    },
    external_secrets = {
      name      = "external-secrets"
      namespace = "external-secrets"
      inline_policy_statements = [
        {
          Effect   = "Allow",
          Action   = ["secretsmanager:GetSecretValue", "secretsmanager:DescribeSecret"],
          Resource = "*"
        }
      ]
    },
    loki = {
      name      = "loki"
      namespace = "observability"
      inline_policy_statements = [
        {
          Effect = "Allow",
          Action = ["s3:GetObject", "s3:PutObject", "s3:ListBucket", "s3:DeleteObject"],
          Resource = [
            module.s3.bucket_names["loki"],
            "${module.s3.bucket_names["loki"]}/*"
          ]
        }
      ]
    },
    tempo = {
      name      = "tempo"
      namespace = "observability"
      inline_policy_statements = [
        {
          Effect = "Allow",
          Action = ["s3:GetObject", "s3:PutObject", "s3:ListBucket", "s3:DeleteObject"],
          Resource = [
            module.s3.bucket_names["tempo"],
            "${module.s3.bucket_names["tempo"]}/*"
          ]
        }
      ]
    },
  }
  tags = local.tags
}
