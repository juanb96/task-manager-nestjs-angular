# --- Frontend build ---
FROM node:24-alpine AS frontend-build
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm ci
COPY frontend/ ./
RUN npm run build -- --configuration production

# --- Backend build ---
FROM node:24-alpine AS backend-build
WORKDIR /app/backend
COPY backend/package*.json ./
RUN npm ci
COPY backend/ ./
RUN npm run build

# --- Runtime ---
FROM node:24-alpine
WORKDIR /app

COPY backend/package*.json ./
RUN npm ci --omit=dev

COPY --from=backend-build /app/backend/dist ./dist
COPY --from=frontend-build /app/frontend/dist/frontend/browser ./public

ENV PORT=3000
ENV DB_PATH=/app/data/tasks.sqlite

EXPOSE 3000
CMD ["node", "dist/main.js"]
