rm -rf /var/www/html/**.*
rm -rf /var/www/html/assets
npm run build:dev
cp -r ./dist/**.* /var/www/html/
cp -r ./dist/assets /var/www/html/
