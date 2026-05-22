FROM node:20-alpine

WORKDIR /app

RUN apk add --no-cache python3 make g++ curl

COPY package.json ./
RUN npm install --omit=optional

COPY tsconfig.json ./
COPY index.ts ./
COPY data.ts ./

CMD ["npx", "tsx", "index.ts"]
