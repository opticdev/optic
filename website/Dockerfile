FROM 513974440343.dkr.ecr.us-east-1.amazonaws.com/nodejs-base:latest as build

ARG APP_NAME=docs
RUN mkdir -p /tmp/$APP_NAME
WORKDIR /tmp/$APP_NAME

COPY . .

# the build script depends on dev dependencies, and the default from the upstream image is
# set to "production". so set this to "dev" to install all deps
RUN NODE_ENV=dev yarn install

RUN yarn build

FROM library/nginx:alpine
COPY --from=build /tmp/docs/build/ /usr/share/nginx/html/
COPY etc/nginx/conf.d/ /etc/nginx/conf.d/
EXPOSE 80
