FROM node:18

ENV port=3000

WORKDIR /home/app

COPY . /home/app

RUN npm install

EXPOSE 3000

CMD [ "node","index.js" ]