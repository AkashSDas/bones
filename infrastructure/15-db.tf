# ==================================
# Security groups
# ==================================

resource "aws_security_group" "rds_sg" {
  vpc_id = aws_vpc.main.id
  name   = "${local.env}-rds-sg"

  ingress {
    from_port   = 5432
    to_port     = 5432
    protocol    = "tcp"
    cidr_blocks = ["10.0.0.0/16"]
  }

  ingress {
    from_port = 5432
    to_port   = 5432
    protocol  = "tcp"
    security_groups = [
      aws_security_group.docker_instance_sg.id,
    ]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name = "${local.env}-rds-sg"
  }
}
resource "aws_security_group" "redis_sg" {
  vpc_id = aws_vpc.main.id
  name   = "${local.env}-redis-sg"

  ingress {
    from_port   = 6379
    to_port     = 6379
    protocol    = "tcp"
    cidr_blocks = ["10.0.0.0/16"]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
}

# ==================================
# Postgres
# ==================================

resource "aws_db_subnet_group" "rds_subnet_group" {
  name       = "${local.env}-rds-subnet-group"
  subnet_ids = [aws_subnet.private_zone1.id, aws_subnet.private_zone2.id]

  tags = {
    Name = "${local.env}-rds-subnet-group"
  }
}

resource "aws_db_parameter_group" "postgres17" {
  name        = "${local.env}-postgres17"
  family      = "postgres17"
  description = "Custom parameter group for PostgreSQL 17"

  parameter {
    name  = "log_statement"
    value = "all"
  }
}

resource "aws_db_instance" "postgres" {
  identifier            = "${local.env}-postgres"
  engine                = "postgres"
  instance_class        = "db.t3.micro" # Cheaper instance
  allocated_storage     = 5             # Minimum storage for dev/test
  max_allocated_storage = 20

  vpc_security_group_ids = [aws_security_group.rds_sg.id]
  db_subnet_group_name   = aws_db_subnet_group.rds_subnet_group.name
  multi_az               = false # No multi-AZ for dev/test
  publicly_accessible    = true
  storage_encrypted      = false

  username = jsondecode(aws_secretsmanager_secret_version.app_secrets_initial.secret_string)["DB_USERNAME"]
  password = jsondecode(aws_secretsmanager_secret_version.app_secrets_initial.secret_string)["DB_PASSWORD"]

  skip_final_snapshot     = true
  backup_retention_period = 0 # Minimum for cost savings
  parameter_group_name    = aws_db_parameter_group.postgres17.name

  tags = {
    Name = "${local.env}-postgres"
    Env  = "Dev"
  }

  depends_on = [aws_secretsmanager_secret_version.app_secrets_initial]
}

resource "aws_iam_role" "rds_proxy_role" {
  name = "${local.env}-rds-proxy-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Principal = {
          Service = "rds.amazonaws.com"
        }
        Action = "sts:AssumeRole"
      }
    ]
  })
}

resource "aws_iam_policy" "rds_proxy_access" {
  name        = "${local.env}-eks-rds-proxy-access"
  description = "Allow EKS nodes to access RDS proxy and secrets"

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "secretsmanager:GetSecretValue"
        ]
        Resource = aws_secretsmanager_secret.app_secrets_final.arn
      },
      {
        Effect = "Allow"
        Action = [
          "rds-db:connect"
        ]
        Resource = "arn:aws:rds-db:${local.region}:${data.aws_caller_identity.current.account_id}:dbuser/${aws_db_instance.postgres.identifier}/${local.secrets.DB_USERNAME}"
      }
    ]
  })
}

resource "aws_iam_role_policy_attachment" "rds_proxy_attachment" {
  role       = aws_iam_role.rds_proxy_role.name
  policy_arn = aws_iam_policy.rds_proxy_access.arn
}

resource "aws_iam_role_policy_attachment" "eks_rds_proxy_access" {
  policy_arn = aws_iam_policy.rds_proxy_access.arn
  role       = aws_iam_role.nodes.name
}

resource "aws_db_proxy" "rds_proxy" {
  name                   = "${local.env}-rds-proxy"
  engine_family          = "POSTGRESQL"
  role_arn               = aws_iam_role.rds_proxy_role.arn
  vpc_subnet_ids         = [aws_subnet.private_zone1.id, aws_subnet.private_zone2.id]
  vpc_security_group_ids = [aws_security_group.rds_sg.id]
  require_tls            = false

  auth {
    description = "RDS Proxy Authentication"
    secret_arn  = aws_secretsmanager_secret.app_secrets_final.arn
    iam_auth    = "DISABLED"
  }
}

resource "aws_db_proxy_default_target_group" "rds_proxy_tg" {
  db_proxy_name = aws_db_proxy.rds_proxy.name

  connection_pool_config {
    connection_borrow_timeout    = 120
    max_connections_percent      = 100
    max_idle_connections_percent = 50
    init_query                   = "SET statement_timeout = '30s'"
  }
}

resource "aws_db_proxy_target" "rds_proxy_target" {
  db_proxy_name          = aws_db_proxy.rds_proxy.name
  target_group_name      = aws_db_proxy_default_target_group.rds_proxy_tg.name
  db_instance_identifier = aws_db_instance.postgres.identifier
}

# ==================================
# Redis
# ==================================

resource "aws_elasticache_subnet_group" "redis_subnet_group" {
  name       = "${local.env}-redis-subnet-group"
  subnet_ids = [aws_subnet.private_zone1.id, aws_subnet.private_zone2.id]
}

resource "aws_elasticache_cluster" "redis" {
  cluster_id      = "${local.env}-redis"
  engine          = "redis"
  node_type       = "cache.t3.micro" # Cheapest option
  num_cache_nodes = 1

  parameter_group_name = "default.redis7"
  subnet_group_name    = aws_elasticache_subnet_group.redis_subnet_group.name
  security_group_ids   = [aws_security_group.redis_sg.id]

  apply_immediately        = true
  snapshot_retention_limit = 0 # Disable snapshots to save cost

  tags = {
    Name = "${local.env}-redis"
    Env  = "Dev"
  }
}

resource "aws_iam_policy" "redis_access" {
  name        = "${local.env}-eks-redis-access"
  description = "Allow EKS nodes to access ElastiCache Redis"

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "elasticache:DescribeCacheClusters",
          "elasticache:DescribeReplicationGroups"
        ]
        Resource = aws_elasticache_cluster.redis.arn
      }
    ]
  })
}

resource "aws_iam_role_policy_attachment" "eks_redis_access" {
  policy_arn = aws_iam_policy.redis_access.arn
  role       = aws_iam_role.nodes.name
}
