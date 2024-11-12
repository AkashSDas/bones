# This is local docker image for bridge service
FROM bridge:latest AS bridge

# Base go image
FROM golang:1.23-bullseye AS go-base

# Copy bridge
COPY --from=bridge /usr/bridge /usr/bridge

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

CMD ["bash"]