# Base image for Bridge service
FROM bridge:1.0.0 AS bridge

# Starting with Go image since it's a Go Workspace
FROM golang:1.23-bullseye AS go-base

# ===========================================
# Setup Bridge and workspace utilities
# ===========================================

# Install required dependencies for workspace setup/execution
RUN apt-get update \
    && apt-get install -y --no-install-recommends nginx supervisor curl neovim lsof \
    && rm -rf /var/lib/apt/lists/*

# Copy the Nginx and Supervisor configuration files
COPY ./nginx.conf /etc/nginx/nginx.conf
COPY ./port-8000-80.conf /etc/nginx/conf.d/port-8000-80.conf
COPY ./supervisord.conf /etc/supervisor/supervisord.conf

# Copy Bridge and install Deno (same version as used in Bridge) to run Bridge
COPY --from=bridge /usr/bridge /usr/bridge
COPY --from=denoland/deno:bin-2.0.6 /deno /usr/local/bin/deno

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

# Workspace directory
WORKDIR /usr/workspace

# Copy only files required to install dependencies (better layer caching)
COPY go.mod ./

# Use cache mount to speed up install of existing dependencies
RUN --mount=type=cache,target=/go/pkg/mod \
    --mount=type=cache,target=/root/.cache/go-build \
    go mod download

# Copy all files
COPY . .

# ===========================================
# Workspace final image setup
# ===========================================

# Delete unnescessary files
RUN rm ./nginx.conf ./supervisord.conf ./port-8000-80.conf

# Run Supervisor to manage the services
CMD ["supervisord", "-c", "/etc/supervisor/supervisord.conf"]
