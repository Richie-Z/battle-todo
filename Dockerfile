FROM docker.io/oven/bun:1-alpine AS build
WORKDIR /app
COPY package.json bun.lock ./
RUN bun install --frozen-lockfile
COPY . .
ENV NODE_OPTIONS=--openssl-legacy-provider

RUN bun run build

FROM docker.io/nginxinc/nginx-unprivileged:1.27-alpine AS runtime
COPY --from=build /app/dist /usr/share/nginx/html
COPY .containerize/nginx-spa.conf.template /etc/nginx/templates/default.conf.template
ENV PORT=8080
EXPOSE 8080
