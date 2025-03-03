resource "aws_secretsmanager_secret" "app_secrets" {
  name = "${local.env}-app-secrets"
}

resource "aws_secretsmanager_secret_version" "app_secrets_version" {
  secret_id     = aws_secretsmanager_secret.app_secrets.id
  secret_string = jsonencode(local.secrets)
}
