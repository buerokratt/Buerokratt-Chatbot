FROM node:22.18.0-bookworm-slim@sha256:752ea8a2f758c34002a0461bd9f1cee4f9a3c36d48494586f60ffce1fc708e0e AS build
WORKDIR /app
COPY GUI/package*.json ./
RUN npm ci --legacy-peer-deps --ignore-scripts --no-audit --no-fund
COPY GUI/ ./
COPY ci/central/backoffice.env /app/.env.development
COPY ci/central/fix-history-selection.cjs /tmp/fix-history-selection.cjs
RUN node /tmp/fix-history-selection.cjs
RUN NODE_OPTIONS=--max-old-space-size=1536 ./node_modules/.bin/vite build --mode=development
FROM nginx:1.25.4-alpine@sha256:a8b39bd9cf0f83869a2162827a0caf6137ddf759d50a171451b335cecc87d236 AS runtime
COPY --from=build /app/build/ /usr/share/nginx/html/chat/
COPY ci/central/static.conf /etc/nginx/conf.d/default.conf
COPY ci/central/login.html /usr/share/nginx/html/login.html
