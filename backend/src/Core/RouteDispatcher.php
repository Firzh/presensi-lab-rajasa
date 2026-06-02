<?php

declare(strict_types=1);

namespace Rajasa\PresensiSiswa\Core;

use FastRoute\Dispatcher;
use Psr\Container\ContainerInterface;

final class RouteDispatcher
{
    public function __construct(
        private readonly Dispatcher $dispatcher,
        private readonly ContainerInterface $container
    ) {
    }

    public function dispatch(Request $request): void
    {
        $routeInfo = $this->dispatcher->dispatch($request->method(), $request->uri());

        switch ($routeInfo[0]) {
            case Dispatcher::NOT_FOUND:
                throw new HttpException('Endpoint tidak ditemukan.', 404);

            case Dispatcher::METHOD_NOT_ALLOWED:
                throw new HttpException('Method tidak diizinkan.', 405);

            case Dispatcher::FOUND:
                $this->callHandler($routeInfo[1], $routeInfo[2]);
                return;

            default:
                throw new HttpException('Status route tidak valid.', 500);  
        }
    }

    private function callHandler(mixed $handler, array $vars = []): void
    {
        if (is_string($handler)) {
            $controller = $this->container->get($handler);
            $result = $controller(...array_values($vars));
            $this->sendIfResponse($result);
            return;
        }

        if (
            is_array($handler)
            && count($handler) === 2
            && is_string($handler[0])
            && is_string($handler[1])
        ) {
            $controller = $this->container->get($handler[0]);
            $method = $handler[1];

            if (!method_exists($controller, $method)) {
                throw new HttpException('Method controller tidak ditemukan.', 500);
            }

            $result = $controller->{$method}(...array_values($vars));
            $this->sendIfResponse($result);
            return;
        }

        if (is_callable($handler)) {
            $result = $handler(...array_values($vars));
            $this->sendIfResponse($result);
            return;
        }

        throw new HttpException('Handler route tidak valid.', 500);
    }

    private function sendIfResponse(mixed $result): void
    {
        if ($result instanceof Response) {
            $result->send();
        }
    }
}