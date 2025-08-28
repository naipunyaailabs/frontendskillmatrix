# Use official Node.js image as build environment
FROM node:20-alpine AS builder

# Set working directory
WORKDIR /app

# Install dependencies
COPY package.json package-lock.json* ./
RUN npm ci

# Copy source code
COPY . .

# Set environment variable for backend URL
ARG VITE_BACKEND_URL
ENV VITE_BACKEND_URL=${VITE_BACKEND_URL}

# Build the Vite app
RUN npm run build

# Production image
FROM node:20-alpine

# Set working directory
WORKDIR /app

# Copy built assets from builder
COPY --from=builder /app/dist ./dist

# Install serve package globally
RUN npm install -g serve

# Expose port 3000 (default serve port)
EXPOSE 3000

# Start the preview server
CMD ["serve", "-s", "dist", "-l", "3000"]