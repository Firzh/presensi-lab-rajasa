<?php

declare(strict_types=1);

namespace Rajasa\PresensiSiswa\Tests\Unit;

use PHPUnit\Framework\TestCase;
use Rajasa\PresensiSiswa\Core\HttpException;
use Rajasa\PresensiSiswa\Core\Request;

final class RequestTest extends TestCase
{
    public function test_request_reads_method_uri_query_and_json_body_without_superglobals(): void
    {
        $request = new Request(
            server: [
                'REQUEST_METHOD' => 'POST',
                'REQUEST_URI' => '/api/test?page=1',
                'CONTENT_TYPE' => 'application/json',
            ],
            queryParams: [
                'page' => '1',
            ],
            postParams: [],
            uploadedFiles: [],
            rawBodyContent: '{"name":"Rajasa"}'
        );

        $this->assertSame('POST', $request->method());
        $this->assertSame('/api/test', $request->uri());
        $this->assertSame('1', $request->query()['page']);
        $this->assertSame('Rajasa', $request->input('name'));
    }

    public function test_request_reads_authorization_bearer_token_without_superglobals(): void
    {
        $request = new Request(
            server: [
                'REQUEST_METHOD' => 'GET',
                'REQUEST_URI' => '/api/me',
                'HTTP_AUTHORIZATION' => 'Bearer token-123',
            ],
            queryParams: [],
            postParams: [],
            uploadedFiles: [],
            rawBodyContent: ''
        );

        $this->assertSame('token-123', $request->bearerToken());
    }

    public function test_request_rejects_invalid_json_body(): void
    {
        $request = new Request(
            server: [
                'REQUEST_METHOD' => 'POST',
                'REQUEST_URI' => '/api/test',
                'CONTENT_TYPE' => 'application/json',
            ],
            queryParams: [],
            postParams: [],
            uploadedFiles: [],
            rawBodyContent: '{"invalid":'
        );

        $this->expectException(HttpException::class);

        $request->body();
    }
}