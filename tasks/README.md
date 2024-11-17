# Tasks

Reusable tasks for the project (like [Makefile](https://www.gnu.org/software/make/manual/make.html)).

**IMPORTANT: `cd` inside the directory where tasks are located and then run them**

## See all images in control panel or worker node

[Stackoverflow](https://stackoverflow.com/questions/60487792/kind-cluster-how-to-see-docker-images-that-are-loaded)

## Add Ingress-Nginx Controller

```bash
# Add the NGINX Ingress Helm Repository
helm repo add ingress-nginx https://kubernetes.github.io/ingress-nginx
helm repo update

# Install the NGINX Ingress Controller
helm install nginx-ingress ingress-nginx/ingress-nginx \
  --namespace ingress-nginx \
  --create-namespace \
  --set controller.hostPort.enabled=true

# This command will:
# - Install the NGINX Ingress Controller
# - Set up an Ingress Controller to listen to resources across the cluster

# Verify that the NGINX Ingress Controller is running
kubectl get pods -n ingress-nginx

# Get the External IP (optional for DNS Configuration)
# If your cluster is exposed externally (e.g., on a cloud provider), you can find the external IP of the NGINX Ingress Controller's service to configure DNS for access:
kubectl get svc -n ingress-nginx

# Remove everything
kubectl delete namespace ingress-nginx
helm uninstall nginx-ingress
```

## Command to get inside a workspace container

```bash
kubectl exec -it <pod-name> bash --namespace <namespace-name>
```
