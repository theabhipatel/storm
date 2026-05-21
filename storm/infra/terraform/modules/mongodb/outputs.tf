output "endpoint" { value = aws_docdb_cluster.this.endpoint }
output "master_password" {
  value     = random_password.master.result
  sensitive = true
}
