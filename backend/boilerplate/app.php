<?php

declare(strict_types=1);

use FastRoute\Dispatcher;
use Rajasa\PresensiSiswa\Core\Request;
use Rajasa\PresensiSiswa\Core\Response;
use Rajasa\PresensiSiswa\Support\Config;

require __DIR__ . '/../vendor/autoload.php';

date_default_timezone_set(getenv('APP_TIMEZONE') ?: 'Asia/Jakarta');

Config::load(require __DIR__ . '/config.php');

$createContainer = require __DIR__ . '/container.php';
$container = $createContainer();

$dispatcher = require __DIR__ . '/routes.php';

$request = $container->get(Request::class);

$routeInfo = $dispatcher->dispatch($request->method(), $request->uri());

switch ($routeInfo[0]) {
    case Dispatcher::NOT_FOUND:
        Response::error('Endpoint tidak ditemukan.', [], 404);
        break;

    case Dispatcher::METHOD_NOT_ALLOWED:
        Response::error('Method tidak diizinkan.', [], 405);
        break;

    case Dispatcher::FOUND:
        $handler = $routeInfo[1];
        $vars = $routeInfo[2];

        if (is_string($handler)) {
            $controller = $container->get($handler);
            $controller(...array_values($vars));
            break;
        }

        $handler(...array_values($vars));
        break;
}