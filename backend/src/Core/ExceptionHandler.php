<?php

declare(strict_types=1);

namespace Rajasa\PresensiLabBackend\Core;

use Throwable;

final class ExceptionHandler
{
    public static function handle(Throwable $exception): void
    {
        Response::error('Terjadi kesalahan sistem.', [
            'exception' => $exception->getMessage(),
        ], 500);
    }
}