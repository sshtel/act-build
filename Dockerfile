FROM node:latest

WORKDIR /app
ADD package.json /app/
ADD .gitignore /app/
RUN npm i
ADD gulpfile.js index.js /app/
ADD tasks /app/tasks
ADD bin /app/bin
