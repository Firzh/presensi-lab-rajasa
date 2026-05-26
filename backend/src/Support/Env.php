<?php

declare(strict_types=1);

namespace Rajasa\PresensiSiswa\Support;

final class Env
{
    public static function get(string $key, mixed $default = null): mixed
    {
        $value = $_ENV[$key] ?? $_SERVER[$key] ?? getenv($key);

        return $value === false || $value === null || $value === ''
            ? $default
            : $value;
    }

    public static function bool(string $key, bool $default = false): bool
    {
        $value = self::get($key, null);

        if ($value === null) {
            return $default;
        }

        $result = filter_var($value, FILTER_VALIDATE_BOOLEAN, FILTER_NULL_ON_FAILURE);

        return $result ?? $default;
    }

    public static function int(string $key, int $default = 0): int
    {
        $value = self::get($key, null);

        if ($value === null || filter_var($value, FILTER_VALIDATE_INT) === false) {
            return $default;
        }

        return (int) $value;
    }

    public static function string(string $key, string $default = ''): string
    {
        $value = self::get($key, null);

        if ($value === null) {
            return $default;
        }

        return trim((string) $value);
    }

    public static function float(string $key, float $default = 0.0): float
    {
        $value = self::get($key, null);

        if ($value === null || filter_var($value, FILTER_VALIDATE_FLOAT) === false) {
            return $default;
        }

        return (float) $value;
    }
}