# TODO: use a custom user (like Deno provides user deno but had a lot of issues)

# Build stage using a fuller image to install dependencies and create users
FROM denoland/deno:2.0.6 AS build

# Specify a non-root working directory
WORKDIR /usr/bridge

# Set Deno install location to a directory we can cache
ENV DENO_INSTALL_ROOT="/usr/bridge/.deno"
ENV PATH="$DENO_INSTALL_ROOT/bin:$PATH"

# Copy deno configuration files (deno.lock and deno.json) without bind mounts
COPY deno.lock .
COPY deno.json .

# Copy the src directory before running deno cache (also with correct permissions)
COPY ./src /usr/bridge/src

# Cache dependencies (ensure deno.lock and deno.json are available)
RUN --mount=type=cache,target=/usr/bridge/.deno \
    deno cache ./src/index.ts

# Use the distroless image for the final minimal image
FROM denoland/deno:distroless-2.0.6

# Specify working directory for the application
WORKDIR /usr/bridge

# Set Deno install location to a directory we can cache
ENV DENO_INSTALL_ROOT="/usr/bridge/.deno"
ENV PATH="$DENO_INSTALL_ROOT/bin:$PATH"

# Copy application files (already with correct user and group from build stage)
COPY --from=build /usr/bridge/src /usr/bridge/src

# Copy deno json (to make things like relative imports working)
COPY --from=build /usr/bridge/deno.json /usr/bridge/deno.json

# Expose the application port
EXPOSE 4000

# Run the application with the correct permission flags
CMD ["run", "--allow-all", "./src/index.ts"]

