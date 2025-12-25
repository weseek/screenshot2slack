FROM mcr.microsoft.com/devcontainers/base:bookworm

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
