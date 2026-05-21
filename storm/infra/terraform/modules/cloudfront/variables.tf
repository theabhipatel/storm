variable "name" { type = string }
variable "media_origin_domain" { type = string }
variable "media_aliases" {
  type    = list(string)
  default = []
}
variable "us_east_1_certificate_arn" { type = string }
variable "tags" {
  type    = map(string)
  default = {}
}
