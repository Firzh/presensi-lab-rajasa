<?php

declare(strict_types=1);

namespace Rajasa\PresensiSiswa\Tests\Unit;

use PHPUnit\Framework\TestCase;
use Rajasa\PresensiSiswa\Core\Response;

final class ResponseTest extends TestCase
{
    public function test_response_exposes_payload_status_code_and_headers_without_output_buffering(): void
    {
        $response = Response::make([
            'success' => true,
            'message' => 'Berhasil.',
            'data' => [
                'id' => 1,
            ],
        ], 201, [
            'Location' => '/api/items/1',
        ]);

        $this->assertSame(201, $response->statusCode());
        $this->assertSame([
            'success' => true,
            'message' => 'Berhasil.',
            'data' => [
                'id' => 1,
            ],
        ], $response->payload());
        $this->assertSame([
            'Location' => '/api/items/1',
        ], $response->headers());
    }
}