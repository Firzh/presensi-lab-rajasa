<?php

declare(strict_types=1);

namespace Rajasa\PresensiSiswa\Tests\Unit;

use PHPUnit\Framework\TestCase;
use Rajasa\PresensiSiswa\Http\Middleware\CorsMiddleware;
use Rajasa\PresensiSiswa\Support\Config;

final class CorsMiddlewareTest extends TestCase
{
    protected function tearDown(): void
    {
        Config::reset();
    }

    public function test_headers_include_allowed_origin_when_origin_is_whitelisted(): void
    {
        Config::load([
            'cors' => [
                'allowed_origins' => ['http://localhost:5173'],
                'allowed_methods' => 'GET,POST,OPTIONS',
                'allowed_headers' => 'Content-Type,Authorization',
            ],
        ]);

        $middleware = new CorsMiddleware();

        $headers = $middleware->headers([
            'HTTP_ORIGIN' => 'http://localhost:5173',
            'REQUEST_METHOD' => 'GET',
        ]);

        $this->assertSame('http://localhost:5173', $headers['Access-Control-Allow-Origin']);
        $this->assertSame('Origin', $headers['Vary']);
        $this->assertSame('GET,POST,OPTIONS', $headers['Access-Control-Allow-Methods']);
        $this->assertSame('Content-Type,Authorization', $headers['Access-Control-Allow-Headers']);
    }

    public function test_headers_do_not_include_origin_when_origin_is_not_whitelisted(): void
    {
        Config::load([
            'cors' => [
                'allowed_origins' => ['http://localhost:5173'],
            ],
        ]);

        $middleware = new CorsMiddleware();

        $headers = $middleware->headers([
            'HTTP_ORIGIN' => 'http://evil.test',
            'REQUEST_METHOD' => 'GET',
        ]);

        $this->assertArrayNotHasKey('Access-Control-Allow-Origin', $headers);
        $this->assertSame('Origin', $headers['Vary']);
    }

    public function test_headers_include_credentials_when_enabled(): void
    {
        Config::load([
            'cors' => [
                'allowed_origins' => ['http://localhost:5173'],
                'allow_credentials' => true,
            ],
        ]);

        $middleware = new CorsMiddleware();

        $headers = $middleware->headers([
            'HTTP_ORIGIN' => 'http://localhost:5173',
            'REQUEST_METHOD' => 'GET',
        ]);

        $this->assertSame('true', $headers['Access-Control-Allow-Credentials']);
    }

    public function test_is_preflight_returns_true_for_options_request(): void
    {
        $middleware = new CorsMiddleware();

        $this->assertTrue($middleware->isPreflight([
            'REQUEST_METHOD' => 'OPTIONS',
        ]));
    }

    public function test_is_preflight_returns_false_for_get_request(): void
    {
        $middleware = new CorsMiddleware();

        $this->assertFalse($middleware->isPreflight([
            'REQUEST_METHOD' => 'GET',
        ]));
    }
}