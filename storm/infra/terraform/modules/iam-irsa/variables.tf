variable "cluster_name" { type = string }
variable "oidc_issuer" { type = string }
variable "oidc_provider_arn" { type = string }

variable "service_accounts" {
  # `inline_policy_statements` is intentionally typed as `any` so each role
  # can have a heterogeneous statement shape (e.g. Resource may be a single
  # string or a list of strings, depending on the policy).
  type    = any
  default = {}
}

variable "tags" {
  type    = map(string)
  default = {}
}
