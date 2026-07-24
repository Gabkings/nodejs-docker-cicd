
# --- Stage 1: Install dependencies ---
FROM node:18-alpine AS builder

WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

RUN npm ci 


COPY . .

# --- Stage 2: Build the application ---
FROM node:18-alpine AS runner

# Create a non-root user -- running as root is not recommended
RUN addgroup -g 1001 -S nodejs && adduser -S nodeuser -u 1001 

WORKDIR /app

# Copy only the necessary files from the builder stage
COPY --from=builder /app/src ./src

RUN chown -R nodeuser:nodejs /app

USER nodeuser

EXPOSE 3000


HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider  http://localhost:3000/health || exit 1



CMD ["node", "src/index.js"]

