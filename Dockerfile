FROM docker.io/node:14.17-alpine
LABEL maintainer Lyas Spiehler

RUN mkdir -p /var/node/printer-reporter

ADD . /var/node/printer-reporter/

WORKDIR /var/node/printer-reporter

RUN npm install

EXPOSE 3000/tcp

CMD ["node", "index.js"]