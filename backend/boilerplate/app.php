<?php

declare(strict_types=1);

use FastRoute\Dispatcher;
use Rajasa\PresensiLabBackend\Core\Response;

require __DIR__ . '/../vendor/autoload.php';

$createContainer = require __DIR__ . '/container.php';
$container = $createContainer();

$dispatcher = require __DIR__ . '/routes.php';

$httpMethod = $_SERVER['REQUEST_METHOD'] ?? 'GET';
$uri = $_SERVER['REQUEST_URI'] ?? '/';

if (false !== $pos = strpos($uri, '?')) {
    $uri = substr($uri, 0, $pos);
}

$routeInfo = $dispatcher->dispatch($httpMethod, $uri);

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