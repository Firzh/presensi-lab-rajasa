<?php

declare(strict_types=1);

namespace Rajasa\PresensiSiswa\Http\Middleware;

use Rajasa\PresensiSiswa\Support\Config;

final class CorsMiddleware
{
    public function handle(?array $server = null): void
    {
        $server ??= $_SERVER;

        foreach ($this->headers($server) as $name => $value) {
            header($name . ': ' . $value);
        }

        if (($server['REQUEST_METHOD'] ?? '') === 'OPTIONS') {
            http_response_code(204);
            exit;
        }
    }

    public function headers(?array $server = null): array
    {
        $server ??= $_SERVER;

        $origin = (string) ($server['HTTP_ORIGIN'] ?? '');
        $allowedOrigins = Config::array('cors.allowed_origins', []);

        $headers = [
            'Vary' => 'Origin',
            'Access-Control-Allow-Methods' => Config::string(
                'cors.allowed_methods',
                'GET,POST,PUT,PATCH,DELETE,OPTIONS'
            ),
            'Access-Control-Allow-Headers' => Config::string(
                'cors.allowed_headers',
                'Content-Type,Authorization,X-Requested-With'
            ),
        ];

        if ($origin !== '' && in_array($origin, $allowedOrigins, true)) {
            $headers['Access-Control-Allow-Origin'] = $origin;
        }

        if (Config::bool('cors.allow_credentials', false)) {
            $headers['Access-Control-Allow-Credentials'] = 'true';
        }

        return $headers;
    }

    public function isPreflight(?array $server = null): bool
    {
        $server ??= $_SERVER;

        return ($server['REQUEST_METHOD'] ?? '') === 'OPTIONS';
    }
}