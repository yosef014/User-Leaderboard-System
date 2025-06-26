FROM node:20-alpine
WORKDIR /app
# netcat
RUN apk add --no-cache netcat-openbsd

COPY package*.json ./
RUN yarn install
COPY . .
RUN yarn build
COPY wait-for-it.sh /usr/local/bin/wait-for-it
RUN chmod +x /usr/local/bin/wait-for-it
EXPOSE 4000
CMD ["wait-for-it", "db:5432", "--", "sh", "-c", "yarn migrate && yarn start"]
