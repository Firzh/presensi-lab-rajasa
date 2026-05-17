<?php

declare(strict_types=1);

use Rajasa\PresensiSiswa\Support\Env;

return [
    'app' => [
        'name' => Env::get('APP_NAME', 'Presensi Siswa Rajasa'),
        'env' => Env::get('APP_ENV', 'local'),
        'debug' => Env::bool('APP_DEBUG', true),
        'url' => Env::get('APP_URL', 'http://localhost:8080'),
        'timezone' => Env::get('APP_TIMEZONE', 'Asia/Jakarta'),
    ],

    'cors' => [
        'allowed_origins' => array_map('trim', explode(',', Env::get('CORS_ALLOWED_ORIGINS', 'http://localhost:3000,http://localhost:8080'))),
        'allowed_methods' => Env::get('CORS_ALLOWED_METHODS', 'GET,POST,PUT,PATCH,DELETE,OPTIONS'),
        'allowed_headers' => Env::get('CORS_ALLOWED_HEADERS', 'Content-Type,Authorization,X-Requested-With'),
    ],

    'presensi' => [
        'session_timeout_minutes' => Env::int('PRESENSI_SESSION_TIMEOUT_MINUTES', 20),
        'max_jam_per_sesi' => Env::int('PRESENSI_MAX_JAM_PER_SESI', 3),
    ],
];