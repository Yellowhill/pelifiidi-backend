FROM node:10
RUN mkdir -p /usr/app
WORKDIR /usr/app
# Install app dependencies
# A wildcard is used to ensure both package.json AND package-lock.json are copied
COPY package*.json ./

RUN npm install
# If you are building your code for production
# RUN npm ci --only=production 

# Bundle app source
COPY . /usr/app
# COPY . .

# EXPOSE 4444

# CMD ["npm", "run", "dev"]