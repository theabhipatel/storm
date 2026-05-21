variable "name" { type = string }
variable "environment" {
  type    = string
  default = "dev"
}
variable "vpc_id" { type = string }
variable "vpc_cidr_block" { type = string }
variable "subnet_ids" { type = list(string) }
variable "engine_version" {
  type    = string
  default = "16.4"
}
variable "databases" { type = list(string) }
variable "tags" {
  type    = map(string)
  default = {}
}
