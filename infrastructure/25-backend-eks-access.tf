resource "aws_iam_role" "eks_backend_role" {
  name = "eks-backend-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Effect = "Allow"
      Principal = {
        Federated = aws_iam_openid_connect_provider.eks.arn
      }
      Action = "sts:AssumeRoleWithWebIdentity"
      Condition = {
        StringEquals = {
          "${replace(aws_iam_openid_connect_provider.eks.url, "https://", "")}:sub" = "system:serviceaccount:bones:eks-access-sa"
        }
      }
    }]
  })
}

resource "aws_iam_policy" "eks_backend_policy" {
  name        = "eks-backend-full-access"
  description = "Allows backend pods full access to EKS"

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Effect   = "Allow"
      Action   = "eks:*" # Allows all EKS actions
      Resource = "*"
      }, {
      Effect   = "Allow"
      Action   = "iam:PassRole"
      Resource = "*"
      }, {
      Effect = "Allow"
      Action = [
        "ec2:DescribeInstances",
        "ec2:DescribeVpcs",
        "ec2:DescribeSubnets",
        "ec2:DescribeSecurityGroups"
      ]
      Resource = "*"
      }, {
      Effect   = "Allow"
      Action   = "sts:GetCallerIdentity"
      Resource = "*"
    }]
  })
}


resource "aws_iam_role_policy_attachment" "eks_backend_attach" {
  role       = aws_iam_role.eks_backend_role.name
  policy_arn = aws_iam_policy.eks_backend_policy.arn
}
