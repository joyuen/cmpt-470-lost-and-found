FROM node:alpine
RUN apk --no-cache add git
WORKDIR /app
ADD package.json /app
RUN npm install
ADD . /

ENTRYPOINT [ "npm run" ]
