# Use the official Nginx image as the base
FROM nginx:latest

# Remove default Nginx static content and replace it with your project
RUN rm -rf /usr/share/nginx/html/*

# Copy your project files into the container
COPY . /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose port 80
EXPOSE 80

# Start Nginx server
CMD ["nginx", "-g", "daemon off;"]
