FROM node:20-alpine

WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY src ./src

ENV PORT=3001
ENV DB_DIR=/data

EXPOSE 3001

CMD ["npm", "start"]
