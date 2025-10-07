# ---- Builder Stage ----
# This stage installs all dependencies (including dev) and builds the app
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# ---- Production Stage ----
# This stage creates the final, lean image for running the app
FROM node:18-alpine
WORKDIR /app
# Copy only production dependencies from the builder stage
COPY --from=builder /app/node_modules ./node_modules
# Copy the compiled code from the builder stage
COPY --from=builder /app/dist ./dist
COPY package.json ./package.json

EXPOSE 8000
# This command works because the /dist folder now exists
CMD ["npm", "run", "start:prod"]
