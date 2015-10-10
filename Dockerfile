FROM node:0.12.7

ENV PHANTOMJS_VERSION 1.9.7
RUN wget --no-check-certificate -q -O - https://bitbucket.org/ariya/phantomjs/downloads/phantomjs-$PHANTOMJS_VERSION-linux-x86_64.tar.bz2 | tar xvjC /opt
RUN ln -s /opt/phantomjs-$PHANTOMJS_VERSION-linux-x86_64/bin/phantomjs /usr/bin/phantomjs

ADD . /usr/screenshot-as-a-service
WORKDIR /usr/screenshot-as-a-service
RUN npm install

EXPOSE 3000

ENTRYPOINT node app
