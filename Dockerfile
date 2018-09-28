FROM node:latest

WORKDIR /app
COPY package.json /app/
COPY .gitignore /app/
RUN npm i
COPY gulpfile.js index.js /app/
COPY tasks /app/tasks
