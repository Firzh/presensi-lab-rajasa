<?php

declare(strict_types=1);

namespace Rajasa\PresensiSiswa\Tests\Unit;

use Rajasa\PresensiSiswa\Core\HttpException;
use Rajasa\PresensiSiswa\Services\TokenService;
use Rajasa\PresensiSiswa\Support\Config;
use Rajasa\PresensiSiswa\Tests\Support\TestCase;

final class TokenServiceTest extends TestCase
{
    protected function setUp(): void
    {
        parent::setUp();

        $_ENV['APP_ENV'] = 'testing';
        putenv('APP_ENV=testing');

        Config::load(require __DIR__ . '/../../boilerplate/config.php');
    }

    public function test_token_can_be_created_and_parsed(): void
    {
        $service = new TokenService();

        $token = $service->create(1);
        $payload = $service->parse($token);

        $this->assertSame(1, (int) $payload['user_id']);
        $this->assertArrayHasKey('iat', $payload);
        $this->assertArrayHasKey('exp', $payload);
        $this->assertSame(600, (int) $payload['exp'] - (int) $payload['iat']);
    }

    public function test_invalid_token_is_rejected(): void
    {
        $this->expectException(HttpException::class);

        (new TokenService())->parse('token-rusak');
    }

    public function test_expired_token_is_rejected(): void
    {
        $expiredToken = $this->signedToken([
            'user_id' => 1,
            'iat' => time() - 120,
            'exp' => time() - 60,
        ]);

        $this->expectException(HttpException::class);
        $this->expectExceptionMessage('Token sudah kedaluwarsa.');

        (new TokenService())->parse($expiredToken);
    }

    private function signedToken(array $payload): string
    {
        $headerEncoded = $this->base64UrlEncode(json_encode([
            'alg' => 'HS256',
            'typ' => 'JWT',
        ], JSON_THROW_ON_ERROR));
        $payloadEncoded = $this->base64UrlEncode(json_encode($payload, JSON_THROW_ON_ERROR));
        $secret = (string) Config::get('auth.secret');
        $signature = $this->base64UrlEncode(hash_hmac('sha256', $headerEncoded . '.' . $payloadEncoded, $secret, true));

        return $headerEncoded . '.' . $payloadEncoded . '.' . $signature;
    }

    private function base64UrlEncode(string $value): string
    {
        return rtrim(strtr(base64_encode($value), '+/', '-_'), '=');
    }
}
