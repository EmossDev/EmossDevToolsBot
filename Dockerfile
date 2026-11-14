FROM node:22-slim

RUN apt-get update && apt-get install -y \
    php \
    php-cli \
    php-mbstring \
    php-xml \
    php-curl \
    caddy \
    curl \
    && rm -rf /var/lib/apt/lists/*

RUN npm install -g pnpm

WORKDIR /app
COPY . .

COPY start-cloud.sh /app/start-cloud.sh
RUN chmod +x /app/start-cloud.sh

EXPOSE 10000
CMD ["/app/start-cloud.sh"]
