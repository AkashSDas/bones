# ====================================
# ECR setup
# ====================================

resource "aws_ecr_repository" "main" {
  name                 = local.ecr_repo_name
  image_tag_mutability = "MUTABLE"

  image_scanning_configuration {
    scan_on_push = true
  }
}

resource "aws_ecr_lifecycle_policy" "main" {
  repository = aws_ecr_repository.main.name

  policy = jsonencode({
    rules = [
      {

        rulePriority = 1
        description  = "Keep only 3 images per tag"
        selection = {
          countType   = "imageCountMoreThan"
          countNumber = 2
          tagStatus   = "tagged"
          tagPrefixList = [
            # These are tags of images upload the ECR repo

            # These images are the components of the application
            "bridge",
            "bridge-v2",
            "backend",

            # These images are of available workspace
            "workspace-vite-react18"
          ]
        }
        action = {
          type = "expire"
        }
      }
    ]
  })
}

# ====================================
# ECR IAM role, group, and policy
# ====================================

resource "aws_iam_group" "ecr_developers" {
  name = "ecr_developers"
}

resource "aws_iam_group" "ecr_admins" {
  name = "ecr_admins"
}

resource "aws_iam_policy" "ecr_developer_policy" {
  name        = "AmazonECRDeveloperPolicy"
  description = "Provides pull and read-only access to ECR"

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "ecr:BatchCheckLayerAvailability",
          "ecr:GetDownloadUrlForLayer",
          "ecr:BatchGetImage",
          "ecr:ListImages",
          "ecr:DescribeRepositories"
        ]
        Resource = aws_ecr_repository.main.arn
      },
      {
        Effect   = "Allow"
        Action   = "ecr:GetAuthorizationToken"
        Resource = "*"
      }
    ]
  })
}

resource "aws_iam_policy" "ecr_admin_policy" {
  name        = "AmazonECRAdminPolicy"
  description = "Provides full administrative access to ECR"

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect   = "Allow"
        Action   = ["ecr:*"]
        Resource = aws_ecr_repository.main.arn
      },
      {
        Effect   = "Allow"
        Action   = "ecr:GetAuthorizationToken"
        Resource = "*"
      }
    ]
  })
}

resource "aws_iam_group_policy_attachment" "ecr_developers_attachment" {
  group      = aws_iam_group.ecr_developers.name
  policy_arn = aws_iam_policy.ecr_developer_policy.arn
}

resource "aws_iam_group_policy_attachment" "ecr_admins_attachment" {
  group      = aws_iam_group.ecr_admins.name
  policy_arn = aws_iam_policy.ecr_admin_policy.arn
}

resource "aws_iam_user_group_membership" "ecr_developer_membership" {
  user   = aws_iam_user.developer.name
  groups = [aws_iam_group.ecr_developers.name]
}

resource "aws_iam_group_membership" "ecr_manager_membership" {
  name  = "ecr_admins_membership"
  group = aws_iam_group.ecr_admins.name
  users = [aws_iam_user.manager.name]
}

# ====================================
# Output
# ====================================

output "ecr_repository_url" {
  description = "ECR Repository URL for pulling images"
  value       = aws_ecr_repository.main.repository_url
}

output "developer_ecr_login_command" {
  description = "Command for developers to authenticate and pull images"
  value       = "aws ecr get-login-password --region ${local.region} | docker login --username AWS --password-stdin ${aws_ecr_repository.main.repository_url}"
}

output "developer_pull_example" {
  description = "Example command for developers to pull an image"
  value       = "docker pull ${aws_ecr_repository.main.repository_url}:latest"
}

output "admin_push_example" {
  description = "Example command for admins to push an image"
  value       = "docker tag my-image:latest ${aws_ecr_repository.main.repository_url}:latest && docker push ${aws_ecr_repository.main.repository_url}:latest"
}
