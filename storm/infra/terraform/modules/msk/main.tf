terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.60"
    }
  }
}

resource "aws_security_group" "this" {
  name        = "${var.name}-msk-sg"
  description = "Allow inbound Kafka traffic from VPC"
  vpc_id      = var.vpc_id
  ingress {
    from_port   = 9092
    to_port     = 9098
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

resource "aws_msk_cluster" "this" {
  cluster_name           = var.name
  kafka_version          = var.kafka_version
  number_of_broker_nodes = 3

  broker_node_group_info {
    instance_type   = var.broker_instance_type
    client_subnets  = var.subnet_ids
    security_groups = [aws_security_group.this.id]
    storage_info {
      ebs_storage_info { volume_size = 100 }
    }
  }

  client_authentication {
    tls {}
    sasl { iam = true }
  }
  encryption_info {
    encryption_in_transit {
      client_broker = "TLS"
      in_cluster    = true
    }
  }
  open_monitoring {
    prometheus {
      jmx_exporter { enabled_in_broker = true }
      node_exporter { enabled_in_broker = true }
    }
  }
  tags = var.tags
}
