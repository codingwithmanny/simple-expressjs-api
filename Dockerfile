# base image
FROM alpine

# port exposed
EXPOSE 5000

# copy current directory into /mnt
COPY . /mnt

# install dependencies
RUN apk update && \
    apk add nodejs && \
    apk add npm && \
    apk add build-base && \
    apk add python && \
    cd mnt && \
    npm install && \
    apk del build-base && \
    apk del python && \
    apk del npm;

# command executed at run
CMD ["/bin/sh", "-c", "cd /mnt; node index.js;"]
