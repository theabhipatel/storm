terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.60"
    }
    random = {
      source  = "hashicorp/random"
      version = "~> 3.6"
    }
  }
}

# One Postgres cluster per service. Aurora-Postgres serverless v2 keeps cost
# bounded in dev; switch to provisioned in prod.
locals {
  databases = toset(var.databases)
}

resource "aws_security_group" "this" {
  for_each    = local.databases
  name        = "${var.name}-${each.value}-sg"
  description = "Allow inbound 5432 from VPC"
  vpc_id      = var.vpc_id
  ingress {
    from_port   = 5432
    to_port     = 5432
    protocol    = "tcp"
    cidr_blocks = [var.vpc_cidr_block]
  }
  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
  tags = var.tags
}

resource "aws_db_subnet_group" "this" {
  name       = "${var.name}-pg"
  subnet_ids = var.subnet_ids
  tags       = var.tags
}

resource "random_password" "master" {
  for_each = local.databases
  length   = 24
  special  = false
}

resource "aws_rds_cluster" "this" {
  for_each                = local.databases
  cluster_identifier      = "${var.name}-${each.value}"
  engine                  = "aurora-postgresql"
  engine_version          = var.engine_version
  database_name           = "storm_${each.value}"
  master_username         = "storm_admin"
  master_password         = random_password.master[each.value].result
  db_subnet_group_name    = aws_db_subnet_group.this.name
  vpc_security_group_ids  = [aws_security_group.this[each.value].id]
  storage_encrypted       = true
  backup_retention_period = 7
  skip_final_snapshot     = var.environment != "prod"
  serverlessv2_scaling_configuration {
    min_capacity = 0.5
    max_capacity = 4.0
  }
  enabled_cloudwatch_logs_exports = ["postgresql"]
  tags                            = var.tags
}

resource "aws_rds_cluster_instance" "writer" {
  for_each            = local.databases
  cluster_identifier  = aws_rds_cluster.this[each.value].id
  identifier          = "${var.name}-${each.value}-writer"
  instance_class      = "db.serverless"
  engine              = "aurora-postgresql"
  publicly_accessible = false
  tags                = var.tags
}
