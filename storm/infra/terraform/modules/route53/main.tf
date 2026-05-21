terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.60"
    }
  }
}

resource "aws_route53_zone" "this" {
  name = var.zone_name
  tags = var.tags
}

resource "aws_route53_record" "alias" {
  for_each = var.alias_records

  zone_id = aws_route53_zone.this.zone_id
  name    = each.key
  type    = "A"

  alias {
    name                   = each.value.dns_name
    zone_id                = each.value.zone_id
    evaluate_target_health = true
  }
}

resource "aws_route53_record" "cname" {
  for_each = var.cname_records

  zone_id = aws_route53_zone.this.zone_id
  name    = each.key
  type    = "CNAME"
  ttl     = 300
  records = [each.value]
}
