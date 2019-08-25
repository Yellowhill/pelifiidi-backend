FROM node:12-alpine
RUN mkdir -p /usr/pelifiidi

RUN apk add --no-cache openssl

WORKDIR /usr/pelifiidi
# Install app dependencies
# A wildcard is used to ensure both package.json AND package-lock.json are copied
COPY package*.json /usr/pelifiidi/

RUN npm install
RUN npm audit fix
RUN npm install -g prisma
RUN npm install -g nodemon
# If you are building your code for production
# RUN npm ci --only=production 

# Bundle app source
COPY . /usr/pelifiidi/
# CMD ["npm", "run", "dev"]

ENV DOCKERIZE_VERSION v0.6.1
RUN wget https://github.com/jwilder/dockerize/releases/download/$DOCKERIZE_VERSION/dockerize-alpine-linux-amd64-$DOCKERIZE_VERSION.tar.gz \
    && tar -C /usr/local/bin -xzvf dockerize-alpine-linux-amd64-$DOCKERIZE_VERSION.tar.gz \
    && rm dockerize-alpine-linux-amd64-$DOCKERIZE_VERSION.tar.gz

CMD dockerize -wait tcp://prisma-service:4466 -timeout 60m prisma deploy && npm run dev