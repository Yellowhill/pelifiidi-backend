FROM node:10
# RUN mkdir -p /usr/pelifiidi
WORKDIR /usr/pelifiidi
# Install app dependencies
# A wildcard is used to ensure both package.json AND package-lock.json are copied
COPY package*.json /usr/pelifiidi/

RUN npm install
RUN npm install -g prisma
# If you are building your code for production
# RUN npm ci --only=production 

# Bundle app source
COPY . /usr/pelifiidi/
# CMD ["npm", "run", "dev"]