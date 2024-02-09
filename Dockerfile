FROM node:20-alpine

RUN mkdir -p /home/node/wallet-tracker && \
    chown -R node:node /home/node/wallet-tracker

WORKDIR /home/node/wallet-tracker

COPY package.json yarn.lock ./

USER node

RUN yarn install --pure-lockfile

COPY --chown=node:node . .

RUN yarn run build

CMD ["npm", "start"]
