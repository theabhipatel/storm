terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.60"
    }
  }
}

resource "aws_security_group" "this" {
  name        = "${var.name}-os-sg"
  description = "Allow HTTPS to OpenSearch from VPC"
  vpc_id      = var.vpc_id
  ingress {
    from_port   = 443
    to_port     = 443
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

resource "aws_opensearch_domain" "this" {
  domain_name    = var.name
  engine_version = var.engine_version

  cluster_config {
    instance_type            = "m6g.large.search"
    instance_count           = 3
    dedicated_master_enabled = true
    dedicated_master_type    = "m6g.large.search"
    dedicated_master_count   = 3
    zone_awareness_enabled   = true
    zone_awareness_config { availability_zone_count = 3 }
  }

  ebs_options {
    ebs_enabled = true
    volume_type = "gp3"
    volume_size = 100
  }

  vpc_options {
    subnet_ids         = slice(var.subnet_ids, 0, 3)
    security_group_ids = [aws_security_group.this.id]
  }

  node_to_node_encryption { enabled = true }
  encrypt_at_rest { enabled = true }
  domain_endpoint_options {
    enforce_https       = true
    tls_security_policy = "Policy-Min-TLS-1-2-2019-07"
  }
  tags = var.tags
}
