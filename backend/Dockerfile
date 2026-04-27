FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --omit=dev

COPY src ./src
RUN mkdir -p /app/uploads

EXPOSE 5000
CMD ["node", "src/scripts/startProduction.js"]
