FROM node:10
RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app
# Install app dependencies
# A wildcard is used to ensure both package.json AND package-lock.json are copied
COPY package*.json ./

RUN npm install
# If you are building your code for production
# RUN npm ci --only=production 

# Bundle app source
COPY . /usr/src/app
# COPY . .

# EXPOSE 4444

# CMD ["npm", "run", "dev"]