# Use a Node.js base image for the build stage
FROM node:20-alpine AS build

# Install pnpm globally
RUN npm install -g pnpm

# Set a non-root working directory
WORKDIR /usr/bridge-v2

# Copy package manager lockfile and package.json
COPY pnpm-lock.yaml ./
COPY package.json ./

# Install dependencies (production only)
RUN pnpm install --prod

# Copy the source code
COPY ./src /usr/bridge-v2/src

# Use a smaller runtime image for the final image
FROM node:20-alpine

# Install pnpm globally
RUN npm install -g pnpm

# Set a non-root working directory
WORKDIR /usr/bridge-v2

# Copy the installed dependencies from the build stage
COPY --from=build /usr/bridge-v2/node_modules /usr/bridge-v2/node_modules
COPY --from=build /usr/bridge-v2/pnpm-lock.yaml /usr/bridge-v2/pnpm-lock.yaml
COPY --from=build /usr/bridge-v2/package.json /usr/bridge-v2/package.json

# TODO: This has to be optimized
RUN pnpm install

# Copy the source code
COPY --from=build /usr/bridge-v2/src /usr/bridge-v2/src

# Expose the application port
EXPOSE 4001

# Command to run the application
CMD ["node", "src/index.js"]
