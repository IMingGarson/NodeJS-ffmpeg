FROM node:16-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install && npm cache clean --force
ENV PATH=/app/node_modules/.bin:$PATH

COPY . .

RUN apk update
RUN apk add
RUN apk add ffmpeg

EXPOSE ${PORT}

CMD ["npm", "run", "serve"]