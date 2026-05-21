output "cluster_endpoints" {
  value = { for k, v in aws_rds_cluster.this : k => v.endpoint }
}

output "master_passwords" {
  value     = { for k, v in random_password.master : k => v.result }
  sensitive = true
}
