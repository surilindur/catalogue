FROM node:current-alpine

ADD . /opt/catalogue

WORKDIR /opt/catalogue

RUN corepack enable && yarn install --immutable && yarn build

ENTRYPOINT [ "node", "bin/catalogue.js" ]
