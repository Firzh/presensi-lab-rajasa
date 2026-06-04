<?php

declare(strict_types=1);

namespace Rajasa\PresensiSiswa\Core;

final class RequestContext
{
    private static ?Request $request = null;

    public static function set(Request $request): void
    {
        self::$request = $request;
    }

    public static function get(): ?Request
    {
        return self::$request;
    }

    public static function clear(): void
    {
        self::$request = null;
    }
}