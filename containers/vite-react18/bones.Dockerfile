# Base image for Bridge service
FROM bridge:1.0.0 AS bridge

# Starting with NodeJS image since it's Vite-React Workspace
FROM node:20.8.0-bullseye-slim

# ===========================================
# Setup Bridge and workspace utilities
# ===========================================

# Install required dependencies for workspace setup/execution
RUN apt-get update \
    && apt-get install -y --no-install-recommends nginx supervisor curl neovim \
    && rm -rf /var/lib/apt/lists/*

# Copy the Nginx and Supervisor configuration files
COPY ./nginx.conf /etc/nginx/nginx.conf
COPY ./supervisord.conf /etc/supervisor/supervisord.conf

# Copy Bridge and install Deno (same version as used in Bridge) to run Bridge
COPY --from=bridge /usr/bridge /usr/bridge
COPY --from=denoland/deno:bin-2.0.6 /deno /usr/local/bin/deno

# Expose the port Nginx will serve on
EXPOSE 80

# Expose other ports that user can use for their work
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

# Delete unnescessary files
RUN rm ./nginx.conf ./supervisord.conf

# Run Supervisor to manage the services
CMD ["supervisord", "-c", "/etc/supervisor/supervisord.conf"]
