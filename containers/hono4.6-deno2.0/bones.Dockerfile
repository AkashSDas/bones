# Base image for Bridge service
FROM bridge:1.0.0 AS bridge
# FROM <aws_account_id>.dkr.ecr.<your-region>.amazonaws.com/bones:bridge AS bridge

# Base image for Bridge v2 service
FROM bridge-v2:1.0.0 AS bridge-v2
# FROM <aws_account_id>.dkr.ecr.<your-region>.amazonaws.com/bones:bridge-v2 AS bridge-v2

# Starting with an Alpine-based Deno image that includes a shell and apk package manager
FROM denoland/deno:alpine-2.0.6

# ===========================================
# Setup Bridge and workspace utilities
# ===========================================

# Install required dependencies for workspace setup/execution
RUN apk update \
    && apk add --no-cache nginx supervisor curl neovim lsof python3 make g++ \
    && rm -rf /var/lib/apt/lists/*

# Copy the Nginx and Supervisor configuration files
COPY ./nginx.conf /etc/nginx/nginx.conf
COPY ./port-8000-80.conf /etc/nginx/conf.d/port-8000-80.conf
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

# Set the workspace directory
WORKDIR /usr/workspace

# Set Deno install location to a directory we can cache
ENV DENO_INSTALL_ROOT="/usr/bridge/.deno"
ENV PATH="$DENO_INSTALL_ROOT/bin:$PATH"

# Copy deno configuration files (deno.lock and deno.json) without bind mounts
COPY deno.lock .
COPY deno.json .

# Copy all project files into the workspace directory
COPY . .

# Cache dependencies (ensure deno.lock and deno.json are available)
RUN --mount=type=cache,target=/usr/bridge/.deno \
    deno cache ./main.ts

# ===========================================
# Workspace final image setup
# ===========================================

# Delete unnecessary files
RUN rm ./nginx.conf ./supervisord.conf ./port-8000-80.conf ./bones.Dockerfile ./.dockerignore

# Run Supervisor to manage the services
CMD ["supervisord", "-c", "/etc/supervisor/supervisord.conf"]
