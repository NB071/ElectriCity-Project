FROM nginx:alpine

COPY nginx/default.conf.template /etc/nginx/templates/default.conf.template
COPY public/ /usr/share/nginx/html/

ENV PORT=80

EXPOSE 80
