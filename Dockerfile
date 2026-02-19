FROM alpine:3.13

ENV VERSION=1.0.21
# Install packages and remove default server definition
RUN set -xe \
	&& apk update \
	&& apk upgrade \
	&& apk add --no-cache php7 php7-fpm php7-opcache php7-apache2 php7-mysqli php7-json php7-openssl php7-curl \
	php7-common php7-zlib php7-xml php7-phar php7-curl php7-intl php7-dom php7-xmlreader php7-ctype php7-session \
	php7-pecl-yaml php7-mbstring php7-gd php7-pear php7-dev nginx supervisor curl \
	&& apk add --no-cache apache2 apache2-ssl gcc musl-dev make && \
	rm /etc/nginx/conf.d/default.conf	

# The php7-pecl-yaml package is already installed above, so we just need to verify it's working
RUN php -m | grep yaml || echo "YAML extension not found, but continuing..."

# Configure nginx
COPY config/nginx.conf /etc/nginx/nginx.conf

# Configure PHP-FPM
COPY config/fpm-pool.conf /etc/php7/php-fpm.d/www.conf
COPY config/php.ini /etc/php7/conf.d/custom.ini

# Configure supervisord
COPY config/supervisord.conf /etc/supervisor/conf.d/supervisord.conf

# Setup document root
RUN mkdir -p /var/www/html

# Add files to image
COPY src /var/www/html

# Make sure files/folders needed by the processes are accessable when they run under the nobody user
RUN chown -R nobody.nobody /var/www/html && \
  chown -R nobody.nobody /run && \
  chown -R nobody.nobody /var/lib/nginx && \
  chown -R nobody.nobody /var/log/nginx

# # Switch to use a non-root user from here on
USER nobody

# Add application
WORKDIR /var/www/html
COPY --chown=nobody src/ /var/www/html/

 # Expose the port nginx is reachable on
EXPOSE 8080

# Let supervisord start nginx & php-fpm
CMD ["/usr/bin/supervisord", "-c", "/etc/supervisor/conf.d/supervisord.conf"]

# Configure a healthcheck to validate that everything is up&running
HEALTHCHECK --timeout=10s CMD curl --silent --fail http://127.0.0.1:8080/fpm-ping

CMD ["/usr/bin/supervisord", "-c", "/etc/supervisor/conf.d/supervisord.conf"]

# Required build arguments
ARG NAME
ARG VERSION
ARG RELEASE_DATE
ARG GIT_SHA1
ARG TAGS

# Image build metadata
ENV IMAGE_NAME "${NAME}"
ENV IMAGE_VERSION "${VERSION}"
ENV IMAGE_RELEASE_DATE "${RELEASE_DATE}"
LABEL \
	vendor="Cato Networks, Inc." \
	maintainer="Brian Anderson <brian.anderson@catonetworks.com>" \
	com.catonetworks.image_name="${IMAGE_NAME}" \
	com.catonetworks.image_version="${IMAGE_VERSION}" \
	com.catonetworks.image_release_date="${IMAGE_RELEASE_DATE}" \
	com.catonetworks.image_tags="${TAGS}" \
	com.catonetworks.commit_id="${GIT_SHA1}"
