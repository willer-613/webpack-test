FROM centos
RUN yum -y install wget \
  && yum install epel-release \
  && yum install nodejs \
  && yum install npm \
  && yum install yarn 

WORKDIR .
ENV ENV development
ENV HOST 0.0.0.0
RUN yarn init
RUN yarn
CMD ["node","server.js"]