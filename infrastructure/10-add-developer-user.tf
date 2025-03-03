data "aws_caller_identity" "current" {}

resource "aws_iam_user" "developer" {
  name = "developer"
}

resource "aws_iam_policy" "eks_developer" {
  name = "AmazonEKSDeveloperPolicy"

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "eks:DescribeCluster",
          "eks:ListClusters"
        ],
        Resource = "arn:aws:eks:${local.region}:${data.aws_caller_identity.current.account_id}:cluster/${aws_eks_cluster.eks.name}"
      }
    ]
  })
}

resource "aws_iam_user_policy_attachment" "eks_developer" {
  user       = aws_iam_user.developer.name
  policy_arn = aws_iam_policy.eks_developer.arn
}

resource "aws_eks_access_entry" "developer" {
  cluster_name      = aws_eks_cluster.eks.name
  principal_arn     = aws_iam_user.developer.arn
  kubernetes_groups = ["my-viewer"]
}
