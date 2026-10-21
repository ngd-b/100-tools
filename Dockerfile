ARG SITE_URL
ARG SITE_INDEXABLE=true

# --- Build stage ---
FROM node:22-alpine AS builder
ARG SITE_URL
ARG SITE_INDEXABLE
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
ENV NEXT_TELEMETRY_DISABLED=1
ENV SITE_URL=${SITE_URL}
ENV SITE_INDEXABLE=${SITE_INDEXABLE}
RUN npm run build

# --- Production stage ---
FROM node:22-alpine AS runner
ARG SITE_URL
ARG SITE_INDEXABLE
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV SITE_URL=${SITE_URL}
ENV SITE_INDEXABLE=${SITE_INDEXABLE}

RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

# Copy standalone output
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["node", "server.js"]
