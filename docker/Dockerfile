FROM node:18-alpine

WORKDIR /app

RUN apk add --no-cache ffmpeg

COPY package*.json ./

RUN npm ci

COPY . .

RUN mkdir -p /var/hls logs

EXPOSE 8000 1935 9090

CMD ["npm", "run", "dev"]