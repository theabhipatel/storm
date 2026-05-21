variable "name" { type = string }
variable "edge_rate_limit" {
  type    = number
  default = 2000
}
variable "tags" {
  type    = map(string)
  default = {}
}
