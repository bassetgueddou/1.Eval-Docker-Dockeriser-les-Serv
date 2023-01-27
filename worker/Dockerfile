FROM node:16.14.0

WORKDIR /app
COPY . .

RUN yarn

ENV MULT=true \
    ADD=true 
EXPOSE 8080

CMD ["node", "main.js"]
