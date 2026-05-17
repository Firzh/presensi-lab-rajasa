<?php

declare(strict_types=1);

namespace Rajasa\PresensiSiswa\Core;

final class Request
{
    private ?array $cachedBody = null;

    public function method(): string
    {
        return strtoupper($_SERVER['REQUEST_METHOD'] ?? 'GET');
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
        if ($this->cachedBody !== null) {
            return $this->cachedBody;
        }

        $contentType = $_SERVER['CONTENT_TYPE'] ?? '';

        if (str_contains($contentType, 'application/json')) {
            $raw = file_get_contents('php://input') ?: '';

            if ($raw === '') {
                return $this->cachedBody = [];
            }

            $decoded = json_decode($raw, true);

            if (!is_array($decoded)) {
                throw new HttpException('Body JSON tidak valid.', 422, [
                    'body' => 'Format JSON tidak bisa dibaca.',
                ]);
            }

            return $this->cachedBody = $decoded;
        }

        return $this->cachedBody = $_POST;
    }

    public function input(string $key, mixed $default = null): mixed
    {
        return $this->body()[$key] ?? $this->query()[$key] ?? $default;
    }
}