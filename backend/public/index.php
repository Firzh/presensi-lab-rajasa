<?php

declare(strict_types=1);

use Rajasa\PresensiLabBackend\Core\ExceptionHandler;

try {
    require __DIR__ . '/../boilerplate/app.php';
} catch (Throwable $exception) {
    require __DIR__ . '/../vendor/autoload.php';

    ExceptionHandler::handle($exception);
}