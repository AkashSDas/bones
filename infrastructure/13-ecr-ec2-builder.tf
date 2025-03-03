# ==============================================================
# Variables
# ==============================================================

variable "ec2_docker_instance_ssh_key_pair" {
  description = "SSH key pair name for EC2 access"
  type        = string
  default     = "ec2_entry"
}

variable "ec2_instance_type" {
  description = "Instance type for the EC2 instance"
  type        = string
  default     = "t2.micro"
}

variable "trusted_cidr" {
  description = "CIDR block for trusted incoming SSH requests"
  type        = string
  default     = "0.0.0.0/0" # Not recommended, update for production
}

# ==============================================================
# IAM Role and Policy for EC2
# ==============================================================

resource "aws_iam_role" "ec2_docker_role" {
  name = "EC2DockerECRRole"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Principal = {
          Service = "ec2.amazonaws.com"
        }
        Action = "sts:AssumeRole"
      }
    ]
  })
}

resource "aws_iam_instance_profile" "ec2_instance_profile" {
  name = "EC2DockerInstanceProfile"
  role = aws_iam_role.ec2_docker_role.name
}

# ==============================================================
# Security Group for EC2 with IAM-based SSH Restriction
# ==============================================================

resource "aws_security_group" "docker_instance_sg" {
  name        = "docker_instance_sg"
  description = "Security group for Docker EC2 instance"

  ingress {
    from_port   = 22
    to_port     = 22
    protocol    = "tcp"
    cidr_blocks = [var.trusted_cidr] # Consider limiting this to known IPs
  }

  ingress {
    from_port   = 2376
    to_port     = 2376
    protocol    = "tcp"
    cidr_blocks = [var.trusted_cidr]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
}

# ==============================================================
# EC2 Instance
# ==============================================================

resource "aws_instance" "docker_instance" {
  ami                  = "ami-0c614dee691cbbf37"
  instance_type        = var.ec2_instance_type
  key_name             = var.ec2_docker_instance_ssh_key_pair
  security_groups      = [aws_security_group.docker_instance_sg.name]
  iam_instance_profile = aws_iam_instance_profile.ec2_instance_profile.name

  user_data = templatefile("${path.module}/scripts/init-ec2-instance.tpl", {
    username  = "ec2-user"
    ssh_group = "ecr_admins"
    # ssh_group = "ecr_developers ecr_admins"
  })

  tags = {
    Name = "ec2-docker-builder"
  }
}

# ==============================================================
# Restrict SSH Access to IAM Groups
# ==============================================================

resource "aws_iam_policy" "ssh_restrict_policy" {
  name        = "SSHAccessRestrictionPolicy"
  description = "Restricts SSH access to EC2 for specific IAM groups"

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect   = "Deny"
        Action   = "ec2-instance-connect:SendSSHPublicKey"
        Resource = "arn:aws:ec2:*:*:instance/${aws_instance.docker_instance.id}"
        Condition = {
          "StringNotLike" : {
            "aws:PrincipalArn" : [
              "arn:aws:iam::*:group/ecr_admins",
              # "arn:aws:iam::*:group/ecr_developers"
            ]
          }
        }
      }
    ]
  })
}

resource "aws_iam_group_policy_attachment" "ssh_restrict_ecr_admins" {
  group      = aws_iam_group.ecr_admins.name
  policy_arn = aws_iam_policy.ssh_restrict_policy.arn
}

# resource "aws_iam_group_policy_attachment" "ssh_restrict_ecr_developers" {
#   group      = aws_iam_group.ecr_developers.name
#   policy_arn = aws_iam_policy.ssh_restrict_policy.arn
# }

# ==============================================================
# Output
# ==============================================================

output "public_ip" {
  description = "Public IP of EC2 instance (used for building and pushing Docker images to ECR)"
  value       = aws_instance.docker_instance.public_ip
}

output "dns_name" {
  description = "Public DNS of EC2 instance (used for building and pushing Docker images to ECR)"
  value       = aws_instance.docker_instance.public_dns
}
