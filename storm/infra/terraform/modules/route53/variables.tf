variable "zone_name" { type = string }
variable "alias_records" {
  type    = map(object({ dns_name = string, zone_id = string }))
  default = {}
}
variable "cname_records" {
  type    = map(string)
  default = {}
}
variable "tags" {
  type    = map(string)
  default = {}
}
