# Use the Nginx image from Docker Hub
FROM nginx

# Remove the default Nginx configuration file
RUN rm /etc/nginx/conf.d/default.conf
RUN ls -a
# Replace it with your custom configuration file
COPY ./nginx/nginx.conf /etc/nginx/conf.d/
