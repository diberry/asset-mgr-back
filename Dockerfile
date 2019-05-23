# specify the node base image with your desired version node:<version>
FROM node:10
# replace this with your application's default port

RUN npm install -g pm2

WORKDIR /app
ENV PATH /app/node_modules/.bin:$PATH
COPY package.json /app/package.json
RUN npm install

COPY . /app

EXPOSE 3005

ENTRYPOINT ["pm2", "--no-daemon", "start"]

CMD ["pm2.apiServer.config.json"]