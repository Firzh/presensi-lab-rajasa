<?php

declare(strict_types=1);

namespace Rajasa\PresensiSiswa\Tests\Support;

use PHPUnit\Framework\TestCase as BaseTestCase;
use Rajasa\PresensiSiswa\Core\RequestContext;
use Rajasa\PresensiSiswa\Core\RequestFactory;

abstract class TestCase extends BaseTestCase
{
    protected function runApp(
        string $method,
        string $uri,
        array $body = [],
        array $headers = [],
        array $server = []
    ): array {
        $_ENV['APP_ENV'] = 'testing';
        putenv('APP_ENV=testing');

        $serverHeaders = [];

        foreach ($headers as $name => $value) {
            $serverHeaders['HTTP_' . strtoupper(str_replace('-', '_', $name))] = $value;
        }

        $queryParams = [];
        $path = $uri;

        $parsedUrl = parse_url($uri);

        if (is_array($parsedUrl)) {
            $path = (string) ($parsedUrl['path'] ?? $uri);

            if (isset($parsedUrl['query'])) {
                parse_str((string) $parsedUrl['query'], $queryParams);
            }
        }

        $serverSnapshot = array_merge([
            'REQUEST_METHOD' => $method,
            'REQUEST_URI' => $uri,
            'CONTENT_TYPE' => 'application/json',
            'HTTP_ACCEPT' => 'application/json',
            'APP_ENV' => 'testing',
        ], $serverHeaders, $server);

        $rawBody = $body === []
            ? ''
            : json_encode($body, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);

        RequestContext::set(RequestFactory::fromSnapshot(
            server: $serverSnapshot,
            queryParams: $queryParams,
            postParams: [],
            uploadedFiles: [],
            rawBodyContent: $rawBody !== false ? $rawBody : ''
        ));

        ob_start();

        try {
            require __DIR__ . '/../../public/index.php';
        } finally {
            RequestContext::clear();
        }

        $content = ob_get_clean();
        $rawContent = (string) $content;
        $statusCode = http_response_code();

        http_response_code(200);

        $json = json_decode($rawContent, true) ?: [];
        $json['__status_code'] = $statusCode ?: 200;
        $json['__raw_content'] = $rawContent;

        return $json;
    }

    protected function loginAndGetToken(
        string $username = 'admin.demo',
        string $password = 'Rajasa@123'
    ): string {
        $response = $this->runApp('POST', '/api/auth/login', [
            'username' => $username,
            'password' => $password,
        ]);

        return (string) ($response['data']['token'] ?? '');
    }
}