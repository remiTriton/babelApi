FROM node:16-alpine

WORKDIR /node-back

COPY . .

RUN npm ci

EXPOSE 3001

