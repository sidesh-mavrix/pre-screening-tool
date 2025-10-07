# ---- Build Stage ----
# Build the React application
FROM node:18-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
# We don't need to pass the URL here anymore, as the proxy will handle it
RUN npm run build

# ---- Production Stage ----
# Serve the app with Nginx
FROM nginx:stable-alpine
# Copy the built React app to Nginx's public folder
COPY --from=build /app/build /usr/share/nginx/html
# Remove the default Nginx configuration
RUN rm /etc/nginx/conf.d/default.conf
# Copy our custom Nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
