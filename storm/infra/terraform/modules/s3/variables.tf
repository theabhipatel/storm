variable "name" { type = string }
variable "environment" {
  type    = string
  default = "dev"
}
variable "buckets" { type = list(string) }
variable "tags" {
  type    = map(string)
  default = {}
}
