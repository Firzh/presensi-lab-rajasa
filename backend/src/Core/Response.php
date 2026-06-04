<?php

declare(strict_types=1);

namespace Rajasa\PresensiSiswa\Core;

use JsonException;

final class Response
{
    public function __construct(
        private readonly array $payload,
        private readonly int $statusCode = 200,
        private readonly array $headers = []
    ) {
    }

    public static function make(array $payload, int $statusCode = 200, array $headers = []): self
    {
        return new self($payload, $statusCode, $headers);
    }

    public static function json(array $payload, int $statusCode = 200, array $headers = []): void
    {
        self::make($payload, $statusCode, $headers)->send();
    }

    public static function success(
        string $message,
        array $data = [],
        int $statusCode = 200,
        array $headers = []
    ): void {
        self::json([
            'success' => true,
            'message' => $message,
            'data' => $data,
        ], $statusCode, $headers);
    }

    public static function error(
        string $message,
        array $errors = [],
        int $statusCode = 400,
        array $headers = []
    ): void {
        self::json([
            'success' => false,
            'message' => $message,
            'errors' => $errors,
        ], $statusCode, $headers);
    }

    public function payload(): array
    {
        return $this->payload;
    }

    public function statusCode(): int
    {
        return $this->statusCode;
    }

    public function headers(): array
    {
        return $this->headers;
    }

    public function send(bool $terminate = false): void
    {
        http_response_code($this->statusCode);

        foreach ($this->resolvedHeaders() as $name => $value) {
            $this->sendHeader((string) $name, (string) $value);
        }

        echo $this->encodePayload($this->payload);

        if ($terminate) {
            exit;
        }
    }

    private function resolvedHeaders(): array
    {
        return array_merge([
            'Content-Type' => 'application/json; charset=utf-8',
        ], $this->headers);
    }

    private function encodePayload(array $payload): string
    {
        try {
            return json_encode(
                $payload,
                JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES | JSON_THROW_ON_ERROR
            );
        } catch (JsonException) {
            http_response_code(500);

            $fallback = json_encode([
                'success' => false,
                'message' => 'Gagal membuat response JSON.',
                'errors' => [],
            ], JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);

            return is_string($fallback)
                ? $fallback
                : '{"success":false,"message":"Gagal membuat response JSON.","errors":[]}';
        }
    }

    private function sendHeader(string $name, string $value): void
    {
        header($name . ': ' . $value);
    }
}