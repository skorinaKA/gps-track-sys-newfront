# Стадия сборки
FROM node:18-alpine as build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Стадия продакшн
FROM nginx:alpine
# COPY --from=build /app/build /usr/share/nginx/html
# Копирование кастомной конфигурации nginx (если нужна)
# COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]