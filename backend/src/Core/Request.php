<?php

declare(strict_types=1);

namespace Rajasa\PresensiSiswa\Core;

final class Request
{
    public function method(): string
    {
        return $_SERVER['REQUEST_METHOD'] ?? 'GET';
    }

    public function uri(): string
    {
        $uri = $_SERVER['REQUEST_URI'] ?? '/';

        if (false !== $pos = strpos($uri, '?')) {
            return substr($uri, 0, $pos);
        }

        return $uri;
    }

    public function query(): array
    {
        return $_GET;
    }

    public function body(): array
    {
        $raw = file_get_contents('php://input');

        if (!$raw) {
            return $_POST;
        }

        $decoded = json_decode($raw, true);

        return is_array($decoded) ? $decoded : $_POST;
    }

    public function input(string $key, mixed $default = null): mixed
    {
        return $this->body()[$key] ?? $this->query()[$key] ?? $default;
    }
}