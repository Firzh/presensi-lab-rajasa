<?php

declare(strict_types=1);

namespace Rajasa\PresensiSiswa\Core;

use Rajasa\PresensiSiswa\Support\Config;
use Throwable;

final class ExceptionHandler
{
    public static function handle(Throwable $exception): void
    {
        if ($exception instanceof HttpException) {
            Response::json(self::httpExceptionPayload($exception), $exception->statusCode());
            return;
        }

        Response::json(self::serverErrorPayload($exception), 500);
    }

    private static function httpExceptionPayload(HttpException $exception): array
    {
        $payload = [
            'success' => false,
            'message' => $exception->getMessage(),
            'errors' => $exception->errors(),
        ];

        if ($exception->errorCode() !== null) {
            $payload['code'] = $exception->errorCode();
        }

        return $payload;
    }

    private static function serverErrorPayload(Throwable $exception): array
    {
        $debug = Config::get('app.debug', false);

        return [
            'success' => false,
            'message' => 'Terjadi kesalahan sistem.',
            'code' => 'SERVER_ERROR',
            'errors' => $debug ? [
                'exception' => $exception::class,
                'message' => $exception->getMessage(),
            ] : [],
        ];
    }
}