FROM node:16-alpine AS builder

WORKDIR /usr/app

COPY . .

RUN npm install -g tsc
RUN yarn install
RUN yarn build
RUN yarn install --production


FROM node:16-alpine AS runtime

WORKDIR /usr/app

COPY package.json ./
COPY --from=builder /usr/app/build ./build
COPY --from=builder /usr/app/node_modules ./node_modules

CMD ["node", "--experimental-specifier-resolution=node", "./build/index.js"]
