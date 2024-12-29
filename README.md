# Bones

## Technologies

**Frontend:**

- Vite w/ React, React Router
- TailwindCSS, Radix UI
- React Query
- Vitest, Playwright, Storybook

**Backend:**

- HonoJS
- Drizzle and PostgreSQL
- Docker and Kubernetes
- Vitest
- Stripe

## Setup Workspace Feature

```bash
# Setup KinD cluster
cd ./tasks/setup-kind
task kind:02-create-cluster # assuming `task kind:01-generate-config` was already ran

# Setup DNS `.bones.test`
cd ./tasks/setup-local-dns
task nginx-ingress:setup

# Setup Nginx loadbalancer
helm repo add ingress-nginx https://kubernetes.github.io/ingress-nginx
helm repo update
helm install nginx-ingress ingress-nginx/ingress-nginx \
  --namespace ingress-nginx \
  --create-namespace \
  --set controller.hostPort.enabled=true
cd ./tasks/setup-kind
task kind:03-run-cloud-provider-kind # assuming `task kind:01-generate-config` was already ran
```

## Devbox

- [Search packages for Devbox in NixOS](https://search.nixos.org/packages)

  // =================== Bridge Part ===================

        // // Update Nginx dynamic mapping for the primary service
        // const mappingConfig = `
        // server {
        //     listen 3000;
        //     proxy_pass http://workspace-service-${workspaceId}:80;
        // }`;

        // const fs = require("fs");
        // const path = "/etc/nginx/conf.d/port-mappings.conf";
        // fs.appendFileSync(path, mappingConfig);

        // // Reload Nginx to apply changes
        // const { execSync } = require("child_process");
        // execSync("nginx -s reload");

        // =================== Bridge Part ===================
