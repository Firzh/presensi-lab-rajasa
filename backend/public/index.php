<?php

declare(strict_types=1);

use Dotenv\Dotenv;
use Rajasa\PresensiSiswa\Core\ExceptionHandler;
use Rajasa\PresensiSiswa\Support\Config;

try {
    require __DIR__ . '/../boilerplate/app.php';
} catch (Throwable $exception) {
    require_once __DIR__ . '/../vendor/autoload.php';

    if (file_exists(__DIR__ . '/../.env')) {
        Dotenv::createImmutable(__DIR__ . '/..')->safeLoad();
    }

    if (class_exists(Config::class)) {
        try {
            Config::load(require __DIR__ . '/../boilerplate/config.php');
        } catch (Throwable) {
            // Keep original exception as the primary error.
        }
    }

    if (class_exists(ExceptionHandler::class)) {
        ExceptionHandler::handle($exception);
        return;
    }

    http_response_code(500);
    header('Content-Type: application/json; charset=utf-8');

    echo json_encode([
        'success' => false,
        'message' => 'Terjadi kesalahan sistem.',
        'errors' => [],
    ], JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
}