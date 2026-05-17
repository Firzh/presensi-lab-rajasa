<?php

declare(strict_types=1);

use Rajasa\PresensiSiswa\Core\ExceptionHandler;
use Rajasa\PresensiSiswa\Support\Config;

try {
    require __DIR__ . '/../boilerplate/app.php';
} catch (Throwable $exception) {
    require __DIR__ . '/../vendor/autoload.php';

    if (class_exists(Config::class) && method_exists(Config::class, 'load')) {
        Config::load(require __DIR__ . '/../boilerplate/config.php');
    }

    ExceptionHandler::handle($exception);
}