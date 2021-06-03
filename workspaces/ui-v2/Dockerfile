FROM library/nginx:alpine
ARG BUILD_PATH
COPY ${BUILD_PATH}/ /usr/share/nginx/html/
COPY config/nginx/ /etc/nginx/
EXPOSE 80
