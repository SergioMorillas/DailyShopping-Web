# ── Stage 1: Build ───────────────────────────────────────────────────────────
FROM node:24-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

# ── Stage 2: Serve con nginx ──────────────────────────────────────────────────
FROM nginx:1.27-alpine

# Eliminar config por defecto
RUN rm /etc/nginx/conf.d/default.conf

# Copiar el build y la config personalizada
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
