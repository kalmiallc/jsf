FROM node:10-alpine

RUN mkdir -p /srv
WORKDIR /srv
ADD . .

RUN ./install.sh

WORKDIR /srv/app

EXPOSE 4200
CMD yarn run startPublic

