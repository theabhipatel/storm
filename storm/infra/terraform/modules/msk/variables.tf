variable "name" { type = string }
variable "kafka_version" {
  type    = string
  default = "3.6.0"
}
variable "broker_instance_type" {
  type    = string
  default = "kafka.m5.large"
}
variable "vpc_id" { type = string }
variable "vpc_cidr_block" { type = string }
variable "subnet_ids" { type = list(string) }
variable "tags" {
  type    = map(string)
  default = {}
}
