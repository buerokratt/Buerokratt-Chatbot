FROM node:22.0.0-alpine

WORKDIR /app

COPY package.json package-lock.json /app/

RUN npm install

COPY . /app/

EXPOSE 4040

CMD ["npm", "run", "dev"]
