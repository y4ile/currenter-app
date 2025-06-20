<h1 align="center">
  <br>
  <a href=""><img src="https://i.imgur.com/i0MM4x7.png" alt="crntr" width="600"></a>
  <br>
</h1>

[![forthebadge](https://forthebadge.com/images/badges/docker-container.svg)](https://forthebadge.com)
[![forthebadge](https://forthebadge.com/images/badges/made-with-c-sharp.svg)](https://forthebadge.com)
[![forthebadge](https://forthebadge.com/images/badges/made-with-react.svg)](https://forthebadge.com)

**Currenter** — это полнофункциональное веб-приложение для конвертации валют. Оно предоставляет актуальные курсы валют, требует авторизации пользователей для доступа к функционалу и позволяет выполнять конвертацию между различными валютами.

[![Currenter CI](https://github.com/y4ile/currenter-app/actions/workflows/main.yml/badge.svg)](https://github.com/y4ile/currenter-app/actions/workflows/main.yml)

## 🚀 Основные возможности

* **Аутентификация пользователей**: Регистрация и вход в систему с использованием JWT-токенов.
* **Актуальные курсы**: Автоматическое ежечасное обновление курсов валют из внешнего API (`ExchangeRate-API`).
* **Конвертация валют**: Клиентская логика для быстрой конвертации между любыми валютными парами.
* **Кэширование**: Использование Redis для кэширования курсов валют с целью повышения производительности.
* **Полная контейнеризация**: Все компоненты приложения (Backend, Frontend, DB, Cache) запускаются в Docker-контейнерах.

## 🛠️ Технологический стек

| Категория       | Технология                                                               |
| --------------- | ------------------------------------------------------------------------ |
| **Backend** | .NET (ASP.NET Core), Entity Framework Core, MSSQL              |
| **Frontend** | React, TypeScript, Vite, Tailwind CSS, shadcn/ui, axios        |
| **База данных** | MSSQL Server                                                             |
| **Кэширование** | Redis                                                                    |
| **Инфраструктура** | Docker, Nginx                                       |

## ⚙️ Начало работы

### Требования

* [Docker](https://www.docker.com/products/docker-desktop/)
* [.NET SDK 8.0](https://dotnet.microsoft.com/download/dotnet/8.0) (для локальной разработки бэкенда)
* [Node.js](https://nodejs.org/) (для локальной разработки фронтенда)

### Инструкции по запуску

1.  **Клонируйте репозиторий:**
    ```bash
    git clone https://github.com/y4ile/currenter-app.git
    cd currenter-app
    ```

2.  **Задайте администраторов и изначально доступные валюты:**
    Откройте файлы конфигурации `appsettings.json` и `appsettings.Development.json` в каталоге `backend/Currenter.API/`. Измените список администраторов и изначальных валют:
    ```
    "DefaultCurrencyAccess": [],
    "AdminUsers": []
    ```

2.  **Настройте переменные окружения:**
    Создайте файл `.env` в корневой папке проекта, скопировав содержимое из файла `.env.example`. Заполните его необходимыми секретными данными:
    ```env
    MSSQL_SA_PASSWORD=YourStrongPassword123
    JWT_KEY=YourSuperSecretJwtKey
    EXCHANGERATE_API_KEY=YourApiKeyFromExchangeRateApi
    ```

3.  **Запустите все сервисы с помощью Docker Compose:**
    Эта команда соберет образы для фронтенда и бэкенда и запустит все необходимые контейнеры.
    ```bash
    docker-compose up --build -d
    ```

4.  **Готово!**
    * Frontend-приложение будет доступно по адресу: `http://localhost:8080`
    * Backend API будет доступен по адресу: `http://localhost:7001`

## API Документация

Вся документация по эндпоинтам API доступна через Swagger UI после запуска проекта по адресу `http://localhost:7001/swagger`.

> **Примечание:** По умолчанию Swagger UI доступен только в среде разработки. Чтобы он работал при запуске через Docker, убедитесь, что в файле `docker-compose.yml` для сервиса `backend` установлена переменная окружения `ASPNETCORE_ENVIRONMENT=Development`.

---