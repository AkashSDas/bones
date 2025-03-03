FROM node:20-alpine AS build
WORKDIR /app
COPY package.json pnpm-lock.yaml ./
RUN npm install -g pnpm@9.12.2 && pnpm install
COPY . .
RUN pnpm run build

FROM node:20-alpine
WORKDIR /app
COPY --from=build /app/dist ./dist
COPY --from=build /app/package.json ./
COPY --from=build /app/pnpm-lock.yaml ./
RUN npm install -g pnpm@9.12.2 \
    && pnpm install --prod --ignore-scripts

EXPOSE 5050
ENV NODE_ENV=staging

CMD ["node", "dist/src/index.js"]
