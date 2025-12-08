FROM node:20-alpine

WORKDIR /app

# Copy package files
COPY package.json ./

# Install dependencies (don't use --production during build)
RUN npm install

# Copy application code
COPY . .

# Remove dev dependencies after build
RUN npm prune --production

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Start application
CMD ["node", "server.js"]
