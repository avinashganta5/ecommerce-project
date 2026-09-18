# ----------------------------
# ShopSphere Product Service
# Docker Image
# ----------------------------

FROM node:20-alpine

# Application directory
WORKDIR /app

# Copy dependency files
COPY package*.json ./

# Install packages
RUN npm install

# Copy project files
COPY . .

# Expose service port
EXPOSE 3002

# Start application
CMD ["npm", "start"]