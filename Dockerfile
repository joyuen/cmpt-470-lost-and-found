FROM node:alpine

WORKDIR /app
ADD package.json /app
RUN npm install
ADD . /

ENTRYPOINT [ "npm run" ]
