FROM node:20.8.0-bullseye-slim AS build
RUN apt-get update \
    && apt-get install -y --no-install-recommends python3 make g++ \
    && rm -rf /var/lib/apt/lists/*
RUN npm install -g pnpm
WORKDIR /usr/bridge-v2
COPY pnpm-lock.yaml ./
COPY package.json ./
RUN pnpm install
COPY ./src /usr/bridge-v2/src

FROM node:20.8.0-bullseye-slim
RUN apt-get update \
    && apt-get install -y --no-install-recommends python3 make g++ \
    && rm -rf /var/lib/apt/lists/*
RUN npm install -g pnpm
WORKDIR /usr/bridge-v2
COPY --from=build /usr/bridge-v2/node_modules /usr/bridge-v2/node_modules
COPY --from=build /usr/bridge-v2/pnpm-lock.yaml /usr/bridge-v2/pnpm-lock.yaml
COPY --from=build /usr/bridge-v2/package.json /usr/bridge-v2/package.json
COPY --from=build /usr/bridge-v2/src /usr/bridge-v2/src
EXPOSE 4001
CMD ["node", "src/index.js"]
