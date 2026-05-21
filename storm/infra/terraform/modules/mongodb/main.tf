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

resource "aws_security_group" "this" {
  name        = "${var.name}-docdb-sg"
  description = "Allow inbound 27017 from VPC"
  vpc_id      = var.vpc_id
  ingress {
    from_port   = 27017
    to_port     = 27017
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

resource "aws_docdb_subnet_group" "this" {
  name       = "${var.name}-docdb"
  subnet_ids = var.subnet_ids
  tags       = var.tags
}

resource "random_password" "master" {
  length  = 24
  special = false
}

resource "aws_docdb_cluster" "this" {
  cluster_identifier      = "${var.name}-notification-logs"
  master_username         = "storm_admin"
  master_password         = random_password.master.result
  db_subnet_group_name    = aws_docdb_subnet_group.this.name
  vpc_security_group_ids  = [aws_security_group.this.id]
  backup_retention_period = 7
  storage_encrypted       = true
  skip_final_snapshot     = var.environment != "prod"
  tags                    = var.tags
}

resource "aws_docdb_cluster_instance" "writer" {
  count              = 1
  cluster_identifier = aws_docdb_cluster.this.id
  identifier         = "${var.name}-notification-logs-1"
  instance_class     = "db.t4g.medium"
  tags               = var.tags
}
