<?php

declare(strict_types=1);

use DI\ContainerBuilder;
use Rajasa\PresensiSiswa\Core\Request;

return function (): \Psr\Container\ContainerInterface {
    $builder = new ContainerBuilder();

    $builder->useAutowiring(true);

    $builder->addDefinitions([
        Request::class => function (): Request {
            $rawBody = '';

            if (array_key_exists('__TEST_RAW_BODY', $GLOBALS)) {
                $rawBody = (string) $GLOBALS['__TEST_RAW_BODY'];
            } else {
                $rawBody = file_get_contents('php://input') ?: '';
            }

            return new Request(
                server: $_SERVER,
                queryParams: $_GET,
                postParams: $_POST,
                uploadedFiles: $_FILES,
                rawBodyContent: $rawBody
            );
        },
    ]);

    return $builder->build();
};