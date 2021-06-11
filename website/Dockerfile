FROM 513974440343.dkr.ecr.us-east-1.amazonaws.com/nodejs-base:latest as build

ARG APP_NAME=docs
RUN mkdir -p /tmp/$APP_NAME
WORKDIR /tmp/$APP_NAME
COPY . .
RUN yarn install
RUN yarn build

FROM library/nginx:alpine

COPY --from=build --chown=nginx:nginx /tmp/docs/build/ /usr/share/nginx/html/
COPY etc/nginx/conf.d/ /etc/nginx/conf.d/
EXPOSE 80
