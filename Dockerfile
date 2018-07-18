FROM spearheadea/tsnode:8.9.4-slim-2.1.4

WORKDIR /app
COPY package.json /app/
COPY .gitignore /app/
RUN npm i
COPY gulpfile.js index.js /app/
COPY tasks /app/tasks
