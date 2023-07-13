FROM node:current-alpine as build

WORKDIR /opt/catalogue

COPY . .

RUN yarn install --ignore-engines --frozen-lockfile

FROM node:current-alpine

WORKDIR /opt/catalogue

COPY --from=build /opt/catalogue/package.json ./package.json
COPY --from=build /opt/catalogue/engines ./engines
COPY --from=build /opt/catalogue/packages ./packages
COPY --from=build /opt/catalogue/node_modules ./node_modules
COPY --from=build /opt/catalogue/out-fragments/http/localhost_3000 /opt/catalogue-data

EXPOSE 3000

ENTRYPOINT [ "node", "./node_modules/@solid/community-server/bin/server.js" ]

ENV NODE_ENV production
ENV CSS_CONFIG /opt/catalogue/engines/catalogue-config/config/server/default.json
ENV CSS_ROOT_FILE_PATH /opt/catalogue-data
