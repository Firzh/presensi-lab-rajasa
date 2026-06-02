<?php

declare(strict_types=1);

namespace Rajasa\PresensiSiswa\Core;

final class RequestFactory
{
    public static function fromGlobals(): Request
    {
        return new Request(
            server: $_SERVER,
            queryParams: $_GET,
            postParams: $_POST,
            uploadedFiles: $_FILES,
            rawBodyContent: file_get_contents('php://input') ?: ''
        );
    }

    public static function fromSnapshot(
        array $server,
        array $queryParams = [],
        array $postParams = [],
        array $uploadedFiles = [],
        string $rawBodyContent = ''
    ): Request {
        return new Request(
            server: $server,
            queryParams: $queryParams,
            postParams: $postParams,
            uploadedFiles: $uploadedFiles,
            rawBodyContent: $rawBodyContent
        );
    }
}