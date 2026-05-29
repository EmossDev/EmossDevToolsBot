FROM node:22-slim

RUN apt-get update && \
    apt-get install -y php8.2 php8.2-cli --no-install-recommends && \
    rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY . .

RUN npm install -g pnpm@10 && \
    pnpm install --no-frozen-lockfile && \
    pnpm --filter @workspace/api-server run build

EXPOSE 8080

CMD ["bash", "render-start.sh"]
