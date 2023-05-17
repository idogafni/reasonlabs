# Specify the base image
FROM node:18.14.2-alpine

# Set the working directory in the container
WORKDIR /reasonlabs

# Copy the application files to the container
COPY . .

# Install dependencies
RUN npm install

# Expose the port the application will run on
EXPOSE 3000

# Set the command to run the application
CMD [ "npm", "start" ]

