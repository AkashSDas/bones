resource "aws_subnet" "private_zone1" {
  vpc_id            = aws_vpc.main.id
  cidr_block        = "10.0.0.0/19"
  availability_zone = local.zone1

  tags = {
    Name = "${local.env}-private-${local.zone1}"

    # This is a specail tag that is used by EKS to create private load balancers,
    # in case you want to expose your serivce internally within the VPC 
    "kubernetes.io/role/internal-elb" = "1"

    # This is optional but is useful if you want to provision multiple EKS cluster 
    # in the same AWS account
    "kubernetes.io/cluster/${local.env}-${local.eks_name}" = "owned" # or shared
  }
}

resource "aws_subnet" "private_zone2" {
  vpc_id            = aws_vpc.main.id
  cidr_block        = "10.0.32.0/19"
  availability_zone = local.zone2

  tags = {
    Name = "${local.env}-private-${local.zone2}"

    # This is a specail tag that is used by EKS to create private load balancers,
    # in case you want to expose your serivce internally within the VPC 
    "kubernetes.io/role/internal-elb" = "1"

    # This is optional but is useful if you want to provision multiple EKS cluster 
    # in the same AWS account
    "kubernetes.io/cluster/${local.env}-${local.eks_name}" = "owned" # or shared
  }
}

resource "aws_subnet" "public_zone1" {
  vpc_id                  = aws_vpc.main.id
  cidr_block              = "10.0.64.0/19"
  availability_zone       = local.zone1
  map_public_ip_on_launch = true

  tags = {
    Name = "${local.env}-public-${local.zone1}"

    "kubernetes.io/role/elb" = "1"

    # This is optional but is useful if you want to provision multiple EKS cluster 
    # in the same AWS account
    "kubernetes.io/cluster/${local.env}-${local.eks_name}" = "owned" # or shared
  }
}

resource "aws_subnet" "public_zone2" {
  vpc_id                  = aws_vpc.main.id
  cidr_block              = "10.0.96.0/19"
  availability_zone       = local.zone2
  map_public_ip_on_launch = true

  tags = {
    Name = "${local.env}-public-${local.zone2}"

    "kubernetes.io/role/elb" = "1"

    # This is optional but is useful if you want to provision multiple EKS cluster 
    # in the same AWS account
    "kubernetes.io/cluster/${local.env}-${local.eks_name}" = "owned" # or shared
  }
}
