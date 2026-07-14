FROM nginx:alpine

COPY nginx/default.conf.template /etc/nginx/templates/default.conf.template
COPY public/ /usr/share/nginx/html/

ENV PORT=80
# Railway private DNS for the Express service (override in Railway vars if renamed)
ENV BACKEND_UPSTREAM=http://backend--express.railway.internal:8080

EXPOSE 80
