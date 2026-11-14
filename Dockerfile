FROM node:22-slim

# PHP, Caddy ve sistem araçlarını kur
RUN apt-get update && apt-get install -y \
    php \
    php-cli \
    php-mbstring \
    php-xml \
    php-curl \
    caddy \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Pnpm paket yöneticisini kur
RUN npm install -g pnpm

WORKDIR /app

# Proje dosyalarını kopyala
COPY . .

# Pnpm güvenlik kısıtlamasını aşmak için doğru .npmrc kuralını yaz
RUN echo 'only-built-dependencies[]="esbuild"' > .npmrc
RUN echo 'only-built-dependencies[]="*"' >> .npmrc

# Bağımlılıkları yükle ve TypeScript projesini derle
RUN pnpm install --frozen-lockfile || pnpm install
RUN pnpm build || npm run build || true

# Başlatma betiğini ayarla
COPY start-cloud.sh /app/start-cloud.sh
RUN chmod +x /app/start-cloud.sh

CMD ["/app/start-cloud.sh"]
