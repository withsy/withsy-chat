FROM node:22-alpine AS base

FROM base AS builder
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

FROM base AS prod_deps
WORKDIR /app
COPY package*.json ./
RUN npm install --omit=dev --frozen-lockfile

FROM base AS runner
WORKDIR /app
COPY --from=prod_deps /app/node_modules ./node_modules
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/package.json ./
COPY --from=builder /app/next.config.ts ./
COPY --from=builder /app/gcp ./gcp
ENV NODE_ENV=production
EXPOSE 3000
CMD ["node", "--experimental-transform-types", "--disable-warning=ExperimentalWarning", "gcp/run.mts", "npm", "start"]
