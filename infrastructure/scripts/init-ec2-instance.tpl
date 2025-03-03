#!/bin/bash

sudo yum update -y
sudo yum install -y git

sudo amazon-linux-extras enable docker
sudo yum install -y docker
sudo service docker start
sudo systemctl enable docker

# Add the default user to the Docker group
sudo usermod -aG docker ${username}

sudo yum install -y aws-cli

# Display next steps for users after SSHing into the instance
cat <<EOL >>/etc/motd

Welcome to the EC2 Docker Builder Instance!

Available tools:
  - Docker CLI
  - AWS CLI
  - Git

Next Steps:
  1. Authenticate with AWS ECR:
     aws ecr get-login-password --region <your-region> | docker login --username AWS --password-stdin <your-ecr-url>

  2. Clone your repository:
     git clone https://github.com/AkashSDas/bones.git && cd bones

  3. Build and push Docker images:
     docker build -t my-image:latest -f Dockerfile .
     docker tag my-image:latest <your-ecr-url>:latest
     docker push <your-ecr-url>:latest

EOL

# Restart shell to apply group changes
newgrp docker

# Useful commands:
# sudo docker rmi -f $(sudo docker images -aq)  # delete all images
# sudo docker pull <account-id>.dkr.ecr.<region>.amazonaws.com/bones:workspace-vite-react18
# sudo docker run -d -p 80:80 <account-id>.dkr.ecr.<region>.amazonaws.com/bones:workspace-vite-react18
# sudo docker exec -it 818c5ce14124 /bin/bash # Get inside of container
