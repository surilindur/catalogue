FROM node:20-alpine as build

WORKDIR /opt/catalogue

COPY . .

RUN corepack enable && yarn install --immutable && yarn build

FROM gcr.io/distroless/nodejs20-debian12

WORKDIR /opt/catalogue

COPY --from=build /opt/catalogue/package.json ./package.json
COPY --from=build /opt/catalogue/bin ./bin
COPY --from=build /opt/catalogue/src ./src
COPY --from=build /opt/catalogue/config ./config
COPY --from=build /opt/catalogue/components ./components
COPY --from=build /opt/catalogue/node_modules ./node_modules

CMD [ "./bin/catalogue.js" ]

ENV NODE_ENV production
