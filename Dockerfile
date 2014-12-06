FROM debian:wheezy

RUN apt-get update -y \
&& apt-get install wget curl -y -q \
&& curl -sL https://deb.nodesource.com/setup | bash - \
&& apt-get install nodejs build-essential chrpath libssl-dev libxft-dev libfreetype6 libfreetype6-dev libfontconfig1 libfontconfig1-dev -y -q \
&& apt-get clean

RUN cd ~/ && wget https://bitbucket.org/ariya/phantomjs/downloads/phantomjs-1.9.7-linux-x86_64.tar.bz2 \
&& mv ~/phantomjs-1.9.7-linux-x86_64.tar.bz2 /usr/local/share/ \
&& cd /usr/local/share \
&& tar xvjf phantomjs-1.9.7-linux-x86_64.tar.bz2 \
&& ln -sf /usr/local/share/phantomjs-1.9.7-linux-x86_64/bin/phantomjs /usr/bin/phantomjs \
&& rm phantomjs-1.9.7-linux-x86_64.tar.bz2

ADD . /screenshot-as-a-service
RUN rm -rf /screenshot-as-a-service/.git && cd /screenshot-as-a-service && npm install
WORKDIR /screenshot-as-a-service
CMD ["node", "/screenshot-as-a-service/app"]
