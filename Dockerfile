FROM node:22-alpine AS builder

WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm install --frozen-lockfile

COPY . .

RUN npm run build

FROM node:22-alpine AS runner

WORKDIR /app

COPY --from=builder /app/package.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
# COPY --from=builder /app/prisma ./prisma
# COPY --from=builder /app/next.config.ts ./next.config.ts

ENV NODE_ENV=production
EXPOSE 3000

CMD ["node", "start_prod.mjs", "npm", "start"]
