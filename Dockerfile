FROM node:16-alpine

WORKDIR /babelApi

COPY ["package.json", "package-lock.json*", "./"]

RUN npm install

COPY . .

CMD npm run start

EXPOSE 3001

