# Bones AWS Infrastructure

## Getting Started

```bash
aws sts get-caller-identity # Initially this will be user who has ran `terraform apply`
```

```bash
mkdir ./infrastructure/output
cd ./infrastructure

terraform init
terraform plan -out=./output/setup
terraform apply ./output/setup
```

Use the following command to change kubeconfig:

```bash
aws eks update-kubeconfig \
    --region us-east-1 \
    --name staging-bones
```

Apply `developer` cluster role:

```bash
cd ./infrastructure/kubernetes
kubectl apply -f 1-developer-role

# Go to AWS Console -> IAM -> Users -> Developer (newly created) -> Generate Access and Secret keys
# You've to delete them before running `terraform destroy` else the command will keep failing

aws configure --profile developer
aws sts get-caller-identity --profile developer

aws eks update-kubeconfig \
    --region us-east-1 \
    --name staging-bones \
    --profile developer

# Developer should be able to run these commands and see results
kubectl get pods 
kubectl auth can-i get pods
kubectl auth can-i "*" "*" # If its answer is yes then you're admin. So this should be no

# Check local kubernetes config
kubectl config view --minify # See user used to connect to EKS
```

Apply `admin` cluster role:

```bash
# Go back to root user (or whatever you used for running `terraform apply`)
aws eks update-kubeconfig \
    --region us-east-1 \
    --name staging-bones

cd ./infrastructure/kubernetes
kubectl apply -f 2-admin-role                                 

# Go to AWS Console -> IAM -> Users -> Manager (newly created) -> Generate Access and Secret keys
# You've to delete them before running `terraform destroy` else the command will keep failing

aws configure --profile manager
aws sts get-caller-identity --profile manager
aws sts assume-role \
    --role-arn arn:aws:iam::<account-id>:role/staging-bones-eks-admin \
    --role-session-name manager-session \
    --profile manager

# Create another AWS profile manually
vim ~/.aws/config

# Add the following content in it:
# ...others
[profile eks-admin]
role-arn arn:aws:iam::<account-id>:role/staging-bones 
source_profile = manager

aws eks update-kubeconfig \
    --region us-east-1 \
    --name staging-bones \
    --profile eks-admin

# Developer should be able to run these commands and see results
kubectl get pods 
kubectl auth can-i get pods
kubectl auth can-i "*" "*" # If its answer is yes then you're admin.
```

If you're re-running `terraform apply` then you'll get error for secret manager (since it gets scheduled to be deleted). To force delete run the following command:

```bash
aws secretsmanager delete-secret --secret-id staging-app-secrets --force-delete-without-recovery
```

Following is a combined setup of environment variables, backend deployment (with horizontal scaling), and frontend deployment:

```bash
# Go inside all of the files in the following folders inside of ./infrastructure/kubernetes:
# - 3-environment-variables
# - 4-backend-deployment
# - 5-frontend-deployment
# Look for <account-id>, secret manager arn (inside of 1-external-secrets), deployments, domains, ports, ecr repo, etc. Update all of them accordingly and then run the following commands:

kubectl apply -f 3-environment-variables
kubectl apply -f 4-backend-deployment
kubectl apply -f 5-frontend-deployment
```

## Backend and Workspace Container Images

AWS ECR repository can created with the Terraform code in this module but uploading these workspace container images to ECR, that should be done in an EC2 (has much better bandwidth and low latency -- if EC2 and ECR repository are in same location). This EC2 setup is done in `/infrastructure/13-ecr-ec2-builder.tf`. Once the EC2 instance is created, you can SSH into it and setup AWS CLI (should be already if using Amazon Linux) and Docker. After that, just clone this codebase their and go to `/container/<any-workspace>` and create an image and upload it to the AWS ECR repository.

Upload workspace starting container images in AWS ECR. Inside of `/containers` workspace code is present with each having their Dockerfile as `bones.Dockerfile`, and `README.workspace.md` specifies the steps for create image.

Once the image is created then it can be uploaded to the repository in AWS ECR. Be mindful of the registry name in ECR and image name, so that you can update the backend code to send workspace container images with correct names.

There will be only one repository named `bones` (inside of ECR) and inside that we'll store all of the workspace container images separated by tags. So repository URL will be something like this:

```bash
# Registry name in AWS ECR
<account-id>.dkr.ecr.us-east-1.amazonaws.com/bones

# Container image specified will look something like this. Here it's `workspace-vite-react18`
<account-id>.dkr.ecr.us-east-1.amazonaws.com/bones:workspace-vite-react18
```

Make sure that AWS CLI and Docker are installed and configured. Login to ECR:

```bash
# https://stackoverflow.com/questions/77687319/cant-push-docker-image-to-amazon-ecr-fails-with-no-basic-auth-credentials
aws ecr get-login-password \
    --region us-east-1 |
    docker login \
        --username AWS \
        --password-stdin <account-id>.dkr.ecr.us-east-1.amazonaws.com
```

Check the created `bones` repository in AWS ECR:

```bash
aws ecr describe-repositories --repository-names bones
```

Go inside of `/containers/<any-workspace>` and create an image by following `README.workspace.md` instructions. Let's say you've created a image named `workspace` with `vite-react18` tag, then this will be following way to push image to ECR repository.

Before running docker build in these container images, update the `bones.Dockerfile` bridge images source:

```diff
- FROM bridge:1.0.0 AS bridge
+ FROM <aws_account_id>.dkr.ecr.<your-region>.amazonaws.com/bones:bridge AS bridge

- FROM bones:bridge-v2 AS bridge-v2
+ FROM <aws_account_id>.dkr.ecr.<your-region>.amazonaws.com/bones:bridge-v2 AS bridge-v2
```

```bash
# docker tag <image-name>:<tag> <account-id>.dkr.ecr.us-east-1.amazonaws.com/<repo-name>:<image-tag-inside-of-repo>
docker tag workspace:vite-react18 <account-id>.dkr.ecr.us-east-1.amazonaws.com/bones:workspace-vite-react18

# docker push <account-id>.dkr.ecr.us-east-1.amazonaws.com/<repo-name>:<image-tag-inside-of-repo>
docker push <account-id>.dkr.ecr.us-east-1.amazonaws.com/bones:workspace-vite-react18
```

### Push backend and bridge (v1, v2) images

SSH into the docker builder EC2 instance:

```bash
ssh -i "ec2_entry.pem" ec2-user@ec2-<public-ip>.compute-1.amazonaws.com           
cd ./bones/

cd ./bones/backend/
docker build -t backend -f Dockerfile .
docker tag backend <account-id>.dkr.ecr.us-east-1.amazonaws.com/bones:backend
docker push <account-id>.dkr.ecr.us-east-1.amazonaws.com/bones:backend

cd ./bones/bridge/
docker build -t bridge:1.0.0 -f Dockerfile 
docker tag bridge:1.0.0 <account-id>.dkr.ecr.us-east-1.amazonaws.com/bones:bridge

cd ./bones/bridge-v2/
docker build -t bridge-v2:1.0.0 -f Dockerfile .
docker tag bridge-v2:1.0.0 <account-id>.dkr.ecr.us-east-1.amazonaws.com/bones:bridge-v2

# Similarly build and push -- frontend, and any container images

aws ecr list-images --repository-name bones
```
