# Container image that runs your code
FROM node:latest

# install basics

# RUN apt update
# RUN apt-get install -y git default-jre sudo apt-utils apt-transport-https
# RUN npm install -g @oclif/dev-cli
# RUN "deb https://dl.bintray.com/sbt/debian /" | sudo tee -a /etc/apt/sources.list.d/sbt.list
# RUN curl -sL "https://keyserver.ubuntu.com/pks/lookup?op=get&search=0x2EE0EA64E40A89B84B2DF73499E82A75642AC823" | sudo apt-key add
# RUN apt update
# RUN apt-get install -y sbt
# RUN apt-get install ruby-full -y
# RUN gem install deb-s3

# Copies your code file from your action repository to the filesystem path `/` of the container
COPY entrypoint.sh /entrypoint.sh

# Code file to execute when the docker container starts up (`entrypoint.sh`)
ENTRYPOINT ["/entrypoint.sh"]
