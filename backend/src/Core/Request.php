<?php

declare(strict_types=1);

namespace Rajasa\PresensiSiswa\Core;

final class Request
{
    private ?array $cachedBody = null;

    public function __construct(
        private readonly array $server,
        private readonly array $queryParams,
        private readonly array $postParams,
        private readonly array $uploadedFiles,
        private readonly string $rawBodyContent
    ) {
    }

    public function file(string $key): ?array
    {
        return $this->uploadedFiles[$key] ?? null;
    }

    public function method(): string
    {
        return strtoupper((string) ($this->server['REQUEST_METHOD'] ?? 'GET'));
    }

    public function uri(): string
    {
        $uri = (string) ($this->server['REQUEST_URI'] ?? '/');

        if (false !== $pos = strpos($uri, '?')) {
            return substr($uri, 0, $pos);
        }

        return $uri;
    }

    public function query(): array
    {
        return $this->queryParams;
    }

    public function body(): array
    {
        if ($this->cachedBody !== null) {
            return $this->cachedBody;
        }

        $contentType = (string) $this->header('Content-Type', '');

        if (str_contains(strtolower($contentType), 'application/json')) {
            $raw = $this->rawBodyContent;

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

        return $this->cachedBody = $this->postParams;
    }

    public function input(string $key, mixed $default = null): mixed
    {
        return $this->body()[$key] ?? $this->query()[$key] ?? $default;
    }

    public function header(string $key, mixed $default = null): mixed
    {
        $normalized = strtoupper(str_replace('-', '_', $key));

        $candidates = [
            'HTTP_' . $normalized,
            'REDIRECT_HTTP_' . $normalized,
            $normalized,
            'REDIRECT_' . $normalized,
        ];

        foreach ($candidates as $candidate) {
            if (array_key_exists($candidate, $this->server)) {
                return is_string($this->server[$candidate])
                    ? trim($this->server[$candidate])
                    : $this->server[$candidate];
            }
        }

        return $default;
    }

    public function bearerToken(): ?string
    {
        $authorization = $this->header('Authorization');

        if (!is_string($authorization)) {
            return null;
        }

        if (!preg_match('/^Bearer\s+(.+)$/i', trim($authorization), $matches)) {
            return null;
        }

        return trim($matches[1]);
    }
}