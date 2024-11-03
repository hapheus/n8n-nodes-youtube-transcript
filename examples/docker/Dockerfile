ARG NODE_VERSION=20
FROM n8nio/base:${NODE_VERSION}

RUN apk add --no-cache \
  chromium \
  nss \
  freetype \
  harfbuzz \
  ca-certificates \
  ttf-freefont \
  su-exec

ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=false
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser

RUN npm install -g puppeteer n8n && \
  npm cache clean --force

EXPOSE 5678

USER node

CMD ["n8n"]
