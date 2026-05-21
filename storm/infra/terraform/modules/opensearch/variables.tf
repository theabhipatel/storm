variable "name" { type = string }
variable "engine_version" {
  type    = string
  default = "OpenSearch_2.11"
}
variable "vpc_id" { type = string }
variable "vpc_cidr_block" { type = string }
variable "subnet_ids" { type = list(string) }
variable "tags" {
  type    = map(string)
  default = {}
}
