<?php

declare(strict_types=1);

namespace Rajasa\PresensiSiswa\Tests\Support;

use PHPUnit\Framework\TestCase as BaseTestCase;

abstract class TestCase extends BaseTestCase
{
    protected function runApp(string $method, string $uri, array $server = []): array
    {
        $_GET = [];
        $_POST = [];
        $_SERVER = array_merge([
            'REQUEST_METHOD' => $method,
            'REQUEST_URI' => $uri,
            'CONTENT_TYPE' => 'application/json',
        ], $server);

        ob_start();

        require __DIR__ . '/../../public/index.php';

        $content = ob_get_clean();

        return json_decode((string) $content, true) ?: [];
    }
}