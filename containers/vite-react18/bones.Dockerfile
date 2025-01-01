# Base image for Bridge service
FROM bridge:1.0.0 AS bridge

# Base image for Bridge v2 service
FROM bridge-v2:1.0.0 AS bridge-v2

# Starting with NodeJS image since it's Vite-React Workspace
FROM node:20.8.0-bullseye-slim

# ===========================================
# Setup Bridge and workspace utilities
# ===========================================

# Install required dependencies for workspace setup/execution
RUN apt-get update \
    && apt-get install -y --no-install-recommends nginx supervisor curl neovim lsof \
    && rm -rf /var/lib/apt/lists/*

# Copy the Nginx and Supervisor configuration files
COPY ./nginx.conf /etc/nginx/nginx.conf
COPY ./port-5173-80.conf /etc/nginx/conf.d/port-5173-80.conf
COPY ./supervisord.conf /etc/supervisor/supervisord.conf

# Copy Bridge and install Deno (same version as used in Bridge) to run Bridge
COPY --from=bridge /usr/bridge /usr/bridge
COPY --from=denoland/deno:bin-2.0.6 /deno /usr/local/bin/deno

# Copy Bridge v2 and install Node (same version as used in Bridge v2) to run Bridge v2
COPY --from=bridge-v2 /usr/bridge-v2 /usr/bridge-v2
COPY --from=node:20.8.0-bullseye-slim /usr/local/bin/node /usr/local/bin/node

# Exposed ports that user can use for their work
EXPOSE 80
EXPOSE 3000
EXPOSE 3001
EXPOSE 3002
EXPOSE 3002
EXPOSE 4200
EXPOSE 5173
EXPOSE 8000
EXPOSE 8080

# ===========================================
# Setup workspace project
# ===========================================

# Install pnpm globally
RUN corepack enable && corepack prepare pnpm@9.12.3 --activate

# Set the workspace directory
WORKDIR /usr/workspace

# Copy only files required to install dependencies for better layer caching
COPY package.json pnpm-lock.yaml ./

# Use cache mount to speed up installation of dependencies
RUN --mount=type=cache,target=/root/.pnpm-store \
    pnpm install --frozen-lockfile

# Copy all project files into the workspace directory
COPY . .

# ===========================================
# Workspace final image setup
# ===========================================

# Delete unnecessary files
RUN rm ./nginx.conf ./supervisord.conf ./port-5173-80.conf ./bones.Dockerfile ./.dockerignore

# Run Supervisor to manage the services
CMD ["supervisord", "-c", "/etc/supervisor/supervisord.conf"]
