# It is highly recommended that you manually create a static public IP
# and use it in the NAT gateway. In future if clients ask for webhook or something 
# similar then you can easily provide and whitelist this IP address, otherwise
# it will be created an managed by NAT gateway

resource "aws_eip" "nat" {
  domain = "vpc"

  tags = {
    Name = "${local.env}-nat"
  }
}

# Make sure to add NAT gateway in one of the public subnets with a default route 
# to the internet gateway
resource "aws_nat_gateway" "nat" {
  allocation_id = aws_eip.nat.id
  subnet_id     = aws_subnet.public_zone1.id

  tags = {
    Name = "${local.env}-nat"
  }

  depends_on = [aws_internet_gateway.igw]
}
