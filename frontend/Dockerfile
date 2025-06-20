# --- Стадия сборки (Build Stage) ---
# Используем образ Node.js для установки зависимостей и сборки
FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
# Собираем статические файлы
RUN npm run build

# --- Финальная стадия (Final Stage) ---
# Используем легковесный образ Nginx для раздачи статики
FROM nginx:stable-alpine
# Копируем собранные файлы из стадии сборки в папку веб-сервера
COPY --from=build /app/dist /usr/share/nginx/html
# Копируем нашу конфигурацию Nginx
COPY nginx.conf /etc/nginx/conf.d/default.conf
# Открываем порт 80
EXPOSE 80
# Запускаем Nginx
CMD ["nginx", "-g", "daemon off;"]