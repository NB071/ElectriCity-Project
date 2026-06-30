FROM node:20-alpine

# Set the working directory
WORKDIR /app

# Copy package.json and package-lock.json to install dependencies
COPY package.json package-lock.json ./

# Install dependencies
RUN npm ci

# Copy the rest of the application code
COPY . .

# Expose the port
EXPOSE 5000

# Start the development server (uses nodemon)
CMD ["npm", "start"]
