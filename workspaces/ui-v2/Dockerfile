FROM library/nginx:alpine
ARG APP
COPY build-${APP}/ /usr/share/nginx/html/
COPY config/nginx/ /etc/nginx/
EXPOSE 80
