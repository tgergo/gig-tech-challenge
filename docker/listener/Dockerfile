FROM node:12.16.2-buster-slim

# DEPLOY
WORKDIR /usr/src/app
COPY dist /usr/src/app
COPY package.json /usr/src/app
COPY package-lock.json /usr/src/app
RUN apt-get update
RUN npm install
CMD [ "node", "listener/main.js" ]
