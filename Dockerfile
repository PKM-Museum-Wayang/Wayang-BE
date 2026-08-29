# ── Build stage ──
FROM node:22-alpine AS build

LABEL maintainer="Nicolaus Reva Sagraha <nicolaussagraha14@gmail.com>"

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .

RUN npx prisma generate
RUN npx prisma migrate deploy
RUN npx prisma db seed

# ── Runtime stage ──
FROM node:22-alpine

WORKDIR /app

ENV NODE_ENV=production

COPY package*.json ./
RUN npm ci --omit=dev

COPY --from=build /app/dist ./dist
COPY --from=build /app/prisma ./prisma

# Folder gambar wayang/kegiatan yang di-upload — mount sebagai volume
# di produksi supaya isinya tidak hilang tiap kali image di-rebuild.
RUN mkdir -p storage

EXPOSE 3000

CMD ["node", "dist/main"]
