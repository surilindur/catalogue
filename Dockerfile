FROM node:20-alpine as build

WORKDIR /opt/catalogue

COPY . .

RUN corepack enable && corepack prepare yarn@stable --activate
RUN yarn install --immutable

FROM gcr.io/distroless/nodejs20-debian11

WORKDIR /opt/catalogue

COPY --from=build /opt/catalogue/package.json ./package.json
COPY --from=build /opt/catalogue/engines ./engines
COPY --from=build /opt/catalogue/packages ./packages
COPY --from=build /opt/catalogue/node_modules ./node_modules
COPY --from=build /opt/catalogue/out-fragments/http/localhost_3000 /opt/catalogue-data

EXPOSE 3000

CMD [ "./node_modules/@solid/community-server/bin/server.js" ]

ENV NODE_ENV production
ENV CSS_CONFIG /opt/catalogue/engines/catalogue-config/config/server/default.json
ENV CSS_ROOT_FILE_PATH /opt/catalogue-data
