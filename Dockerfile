FROM alpine:latest

RUN echo "Asia/shanghai" >> /etc/timezone

COPY ./main /bin/kk-logic

RUN chmod +x /bin/kk-logic

COPY ./config /config

COPY ./app.ini /app.ini

COPY ./lib/lua /lib/lua

COPY ./web /web

COPY ./static /static

COPY ./view /view

ENV LUA_PATH /lib/lua/?.lua;;

ENV KK_ENV_CONFIG /config/env.ini

VOLUME /config

CMD kk-logic $KK_ENV_CONFIG

