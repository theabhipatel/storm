variable "primary_domain" { type = string }
variable "sans" {
  type    = list(string)
  default = []
}
variable "tags" {
  type    = map(string)
  default = {}
}
