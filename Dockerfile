# Dockerfile

# Stage 1 - the build process
FROM node:14-alpine as build-deps

WORKDIR /usr/src/app

COPY package*.json ./
RUN npm install

COPY . .

CMD ["node", "main.js"]