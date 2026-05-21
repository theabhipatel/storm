variable "prefix" {
  type    = string
  default = "storm/dev"
}
variable "secret_names" { type = list(string) }
variable "tags" {
  type    = map(string)
  default = {}
}
