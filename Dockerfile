FROM node:20

WORKDIR /opt/catalogue

ADD . .

RUN yarn install --ignore-engines --frozen-lockfile

EXPOSE 3000

ENTRYPOINT [ "./node_modules/.bin/community-solid-server", "-f", "./out-fragments/http/localhost_3000", "-c", "./engines/catalogue-config/config/server/default.json" ]
