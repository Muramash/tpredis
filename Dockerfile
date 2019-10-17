FROM node:10.16.3-alpine

RUN apk update

RUN apk add python2

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install --no-bin-links

COPY . .

CMD [ "npm", "start" ]