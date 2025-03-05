data "aws_lb" "eks_alb" {
  tags = {
    "service.k8s.aws/stack" = "ingress/external-ingress-nginx-controller"
  }
}


resource "aws_route53_zone" "main" {
  name = local.domain
}

resource "aws_route53_record" "frontend" {
  zone_id = aws_route53_zone.main.zone_id
  name    = local.domain
  type    = "A"

  alias {
    name                   = data.aws_lb.eks_alb.dns_name
    zone_id                = data.aws_lb.eks_alb.zone_id
    evaluate_target_health = true
  }
}

resource "aws_route53_record" "backend" {
  zone_id = aws_route53_zone.main.zone_id
  name    = "api.${local.domain}"
  type    = "A"

  alias {
    name                   = data.aws_lb.eks_alb.dns_name
    zone_id                = data.aws_lb.eks_alb.zone_id
    evaluate_target_health = true
  }
}

resource "aws_route53_record" "workspace" {
  zone_id = aws_route53_zone.main.zone_id
  name    = "*.workspace.${local.domain}"
  type    = "A"

  alias {
    name                   = data.aws_lb.eks_alb.dns_name
    zone_id                = data.aws_lb.eks_alb.zone_id
    evaluate_target_health = true
  }
}
