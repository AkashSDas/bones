data "local_file" "secrets" {
  filename = "${path.module}/values/secrets.json"
}

locals {
  env           = "staging"
  region        = "us-east-1"
  zone1         = "us-east-1a"
  zone2         = "us-east-1b"
  eks_name      = "bones"
  eks_version   = "1.32"
  ecr_repo_name = "bones"
  secrets       = jsondecode(data.local_file.secrets.content)
}
