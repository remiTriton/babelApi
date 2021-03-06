FROM node:16-alpine

WORKDIR /node-back

COPY . .

RUN npm ci

CMD npm run start

EXPOSE 3001

