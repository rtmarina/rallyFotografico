# Usar la imagen oficial de PHP
FROM php:7.4-apache

# Establecer el directorio de trabajo
WORKDIR /var/www/html

# Copiar los archivos de la aplicación al contenedor
COPY . .

# Instalar extensiones necesarias para manejo de imágenes
RUN docker-php-ext-install gd

# Crear el directorio de uploads
RUN mkdir -p /var/www/html/uploads

# Asignar permisos al directorio de uploads
RUN chown -R www-data:www-data /var/www/html/uploads
