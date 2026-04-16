# Bank Sampah Sankara

<p align="center"><a href="https://laravel.com" target="_blank"><img src="https://raw.githubusercontent.com/laravel/art/master/logo-lockup/5%20SVG/2%20CMYK/1%20Full%20Color/laravel-logolockup-cmyk-red.svg" width="400" alt="Laravel Logo"></a></p>

<p align="center">
<a href="https://github.com/laravel/framework/actions"><img src="https://github.com/laravel/framework/workflows/tests/badge.svg" alt="Build Status"></a>
<a href="https://packagist.org/packages/laravel/framework"><img src="https://img.shields.io/packagist/dt/laravel/framework" alt="Total Downloads"></a>
<a href="https://packagist.org/packages/laravel/framework"><img src="https://img.shields.io/packagist/v/laravel/framework" alt="Latest Stable Version"></a>
<a href="https://packagist.org/packages/laravel/framework"><img src="https://img.shields.io/packagist/l/laravel/framework" alt="License"></a>
</p>

## About Laravel

Laravel is a web application framework with expressive, elegant syntax. We believe development must be an enjoyable and creative experience to be truly fulfilling. Laravel takes the pain out of development by easing common tasks used in many web projects, such as:

- [Simple, fast routing engine](https://laravel.com/docs/routing).
- [Powerful dependency injection container](https://laravel.com/docs/container).
- Multiple back-ends for [session](https://laravel.com/docs/session) and [cache](https://laravel.com/docs/cache) storage.
- Expressive, intuitive [database ORM](https://laravel.com/docs/eloquent).
- Database agnostic [schema migrations](https://laravel.com/docs/migrations).
- [Robust background job processing](https://laravel.com/docs/queues).
- [Real-time event broadcasting](https://laravel.com/docs/broadcasting).

Laravel is accessible, powerful, and provides tools required for large, robust applications.

## Learning Laravel

Laravel has the most extensive and thorough [documentation](https://laravel.com/docs) and video tutorial library of all modern web application frameworks, making it a breeze to get started with the framework. You can also check out [Laravel Learn](https://laravel.com/learn), where you will be guided through building a modern Laravel application.

If you don't feel like reading, [Laracasts](https://laracasts.com) can help. Laracasts contains thousands of video tutorials on a range of topics including Laravel, modern PHP, unit testing, and JavaScript. Boost your skills by digging into our comprehensive video library.

## Laravel Sponsors

We would like to extend our thanks to the following sponsors for funding Laravel development. If you are interested in becoming a sponsor, please visit the [Laravel Partners program](https://partners.laravel.com).

### Premium Partners

- **[Vehikl](https://vehikl.com)**
- **[Tighten Co.](https://tighten.co)**
- **[Kirschbaum Development Group](https://kirschbaumdevelopment.com)**
- **[64 Robots](https://64robots.com)**
- **[Curotec](https://www.curotec.com/services/technologies/laravel)**
- **[DevSquad](https://devsquad.com/hire-laravel-developers)**
- **[Redberry](https://redberry.international/laravel-development)**
- **[Active Logic](https://activelogic.com)**

## Contributing

Thank you for considering contributing to the Laravel framework! The contribution guide can be found in the [Laravel documentation](https://laravel.com/docs/contributions).

## Code of Conduct

In order to ensure that the Laravel community is welcoming to all, please review and abide by the [Code of Conduct](https://laravel.com/docs/contributions#code-of-conduct).

## Security Vulnerabilities

If you discover a security vulnerability within Laravel, please send an e-mail to Taylor Otwell via [taylor@laravel.com](mailto:taylor@laravel.com). All security vulnerabilities will be promptly addressed.

## License

The Laravel framework is open-sourced software licensed under the [MIT license](https://opensource.org/licenses/MIT).
# bank-sampah-kabta

## Docker deployment

This repository includes a lightweight Docker setup intended for a small VPS and easy future scaling.

Services included in [compose.yaml](/home/ahadi/Kerja/Projek/bank-sampah/compose.yaml):
- `app`: Laravel PHP-FPM application
- `queue`: Laravel queue worker
- `scheduler`: Laravel scheduler worker
- `nginx`: public web server
- `db`: MariaDB database

### First-time setup

1. Copy [.env.docker.example](/home/ahadi/Kerja/Projek/bank-sampah/.env.docker.example) to `.env.docker`.
2. Fill in `APP_KEY`, `APP_URL`, `DB_PASSWORD`, and `DB_ROOT_PASSWORD`.
3. Build and start the stack:

```bash
docker compose --env-file .env.docker up -d --build
```

4. Generate the app key if needed:

```bash
docker compose --env-file .env.docker exec app php artisan key:generate
```

5. Run migrations:

```bash
docker compose --env-file .env.docker exec app php artisan migrate --force
```

### Useful commands

```bash
docker compose --env-file .env.docker logs -f
docker compose --env-file .env.docker exec app php artisan optimize
docker compose --env-file .env.docker exec app php artisan queue:restart
docker compose --env-file .env.docker exec app php artisan storage:link
```

### Repeatable deploy script

This repository now includes [scripts/deploy-docker.sh](/home/ahadi/Kerja/Projek/bank-sampah/scripts/deploy-docker.sh) to make production deploys more consistent.

Standard deploy on the server:

```bash
git pull origin main
scripts/deploy-docker.sh build
```

Fast fallback deploy when the VPS is too weak for a full image rebuild:

```bash
git pull origin main
scripts/deploy-docker.sh sync
```

Important notes for `sync` mode:
- use it only when PHP/composer and image-level dependencies have not changed
- this mode syncs the current checkout into the running `app`, `queue`, and `scheduler` containers, then runs migrations and restarts services
- it is an operational fallback, not a replacement for proper image-based deploys

Recommended rule of thumb:
- use `build` for normal deploys
- use `sync` only as an operational fallback

### Production volume layout

Production uses a named Docker volume for `/var/www/html/public` instead of binding `./public` from the host.

Why this is better:
- Nginx and PHP read the same public files from Docker-managed storage
- deploys no longer depend on host files under `./public`
- app assets bundled in the image are copied into the shared public volume during container startup

### Notes for a 1 GB VPS

- Keep this stack minimal and avoid adding Redis, phpMyAdmin, or Portainer for now.
- Run only one queue worker until the VPS is upgraded.
- Build frontend assets inside the image and avoid running Vite dev server in production.
- Web and mobile clients can share this same Laravel backend/API.
