data "tls_certificate" "eks" {
  url = aws_eks_cluster.eks.identity.0.oidc.0.issuer
}

resource "aws_secretsmanager_secret" "app_secrets_initial" {
  name = "${local.env}-app-secrets-initial"
}

resource "aws_secretsmanager_secret" "app_secrets_final" {
  name = "${local.env}-app-secrets-final"
}

resource "aws_secretsmanager_secret_version" "app_secrets_initial" {
  secret_id     = aws_secretsmanager_secret.app_secrets_initial.id
  secret_string = file("${path.module}/values/secrets.json")
}

resource "aws_secretsmanager_secret_version" "app_secrets_final" {
  secret_id = aws_secretsmanager_secret.app_secrets_final.id


  secret_string = jsonencode({
    APP_URL    = "http://api.${local.domain}/api/v1/iam/account/activate"
    CLIENT_URL = "http://${local.domain}"

    ENV       = local.env == "staging" ? "qa" : local.env
    PORT      = local.secrets.PORT
    LOG_LEVEL = local.secrets.LOG_LEVEL

    COOKIE_ENCRYPTION_KEY = local.secrets.COOKIE_ENCRYPTION_KEY
    CORS_ORIGINS          = "http://${local.domain}"

    DB_USERNAME  = local.secrets.DB_USERNAME
    DB_PASSWORD  = local.secrets.DB_PASSWORD
    DB_HOST      = aws_db_proxy.rds_proxy.endpoint
    DB_PORT      = local.secrets.DB_PORT
    DB_NAME      = local.secrets.DB_NAME
    DB_MIGRATING = local.secrets.DB_MIGRATING
    DB_SEEDING   = local.secrets.DB_SEEDING
    username     = local.secrets.DB_USERNAME
    password     = local.secrets.DB_PASSWORD

    REDIS_HOST = aws_elasticache_cluster.redis.cache_nodes[0].address
    REDIS_PORT = local.secrets.REDIS_PORT

    SMTP_HOST     = local.secrets.SMTP_HOST
    SMTP_PORT     = local.secrets.SMTP_PORT
    SMTP_USERNAME = local.secrets.SMTP_USERNAME
    SMTP_PASSWORD = local.secrets.SMTP_PASSWORD
    FROM_EMAIL    = local.secrets.FROM_EMAIL

    ACCESS_TOKEN_SECRET       = local.secrets.ACCESS_TOKEN_SECRET
    REFRESH_TOKEN_SECRET      = local.secrets.REFRESH_TOKEN_SECRET
    ACCESS_TOKEN_AGE          = local.secrets.ACCESS_TOKEN_AGE
    REFRESH_TOKEN_AGE         = local.secrets.REFRESH_TOKEN_AGE
    REFRESH_TOKEN_AGE_IN_DATE = local.secrets.REFRESH_TOKEN_AGE_IN_DATE

    WORKSPACE_EXPOSED_PORTS = local.secrets.WORKSPACE_EXPOSED_PORTS
    WORKSPACE_DOMAIN_SUFFIX = "workspace.${local.domain}"

    K8S_CLUSTER_API_URL = aws_eks_cluster.eks.endpoint
  })

  depends_on = [aws_db_proxy.rds_proxy, aws_elasticache_cluster.redis]
}

resource "aws_iam_openid_connect_provider" "eks" {
  client_id_list  = ["sts.amazonaws.com"]
  thumbprint_list = [data.tls_certificate.eks.certificates.0.sha1_fingerprint]
  url             = aws_eks_cluster.eks.identity.0.oidc.0.issuer
}

resource "aws_iam_policy" "external_secrets" {
  name        = "ExternalSecretsPolicy"
  description = "Policy for External Secrets to access AWS Secrets Manager"

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "secretsmanager:GetSecretValue",
          "secretsmanager:DescribeSecret",
          "secretsmanager:ListSecrets",
          "secretsmanager:GetResourcePolicy",
          "secretsmanager:ListSecretVersionIds"
        ]
        Resource = [
          aws_secretsmanager_secret.app_secrets_initial.arn,
          aws_secretsmanager_secret.app_secrets_final.arn
        ]
      }
    ]
  })
}

resource "aws_iam_role" "external_secrets" {
  name = "external-secrets-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Principal = {
          Federated = aws_iam_openid_connect_provider.eks.arn
        }
        Action = "sts:AssumeRoleWithWebIdentity"
        Condition = {
          "StringEquals" = {
            "${replace(aws_eks_cluster.eks.identity.0.oidc.0.issuer, "https://", "")}:sub" = "system:serviceaccount:bones:external-secrets-sa"
          }
        }
      }
    ]
  })
}

resource "aws_iam_role_policy_attachment" "external_secrets_attach" {
  policy_arn = aws_iam_policy.external_secrets.arn
  role       = aws_iam_role.external_secrets.name
}
