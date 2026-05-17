<?php

declare(strict_types=1);

namespace Rajasa\PresensiSiswa\Core;

use Rajasa\PresensiSiswa\Support\Config;
use Throwable;

final class ExceptionHandler
{
    public static function handle(Throwable $exception): void
    {
        $debug = Config::get('app.debug', false);

        Response::error('Terjadi kesalahan sistem.', $debug ? [
            'exception' => $exception::class,
            'message' => $exception->getMessage(),
        ] : [], 500);
    }
}