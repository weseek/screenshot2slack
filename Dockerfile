FROM node:22-bookworm

# Chromium + CJKフォントを一括インストール
RUN apt-get update && apt-get install -y \
    chromium \
    fonts-noto-cjk \
    fonts-noto-cjk-extra \
    fonts-ipafont-gothic \
    fonts-ipafont-mincho \
    && fc-cache -fv \
    && rm -rf /var/lib/apt/lists/*

# Puppeteerの設定
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true \
    PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium

# Add CJK fonts
RUN apt-get update \
 && apt-get install -y \
      fonts-takao

WORKDIR /app/screenshot2slack

COPY . .
RUN yarn install

ENTRYPOINT ["node", "/app/screenshot2slack/main.js"]
