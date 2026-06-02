<?php

declare(strict_types=1);

use DI\ContainerBuilder;
use Rajasa\PresensiSiswa\Core\Request;
use Rajasa\PresensiSiswa\Core\RequestContext;
use Rajasa\PresensiSiswa\Core\RequestFactory;

return function (): \Psr\Container\ContainerInterface {
    $builder = new ContainerBuilder();

    $builder->useAutowiring(true);

    $builder->addDefinitions([
        Request::class => fn (): Request => RequestContext::get() ?? RequestFactory::fromGlobals(),
    ]);

    return $builder->build();
};