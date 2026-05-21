variable "name" { type = string }
variable "cluster_version" {
  type    = string
  default = "1.30"
}
variable "private_subnet_ids" { type = list(string) }
variable "public_subnet_ids" { type = list(string) }
variable "tags" {
  type    = map(string)
  default = {}
}
