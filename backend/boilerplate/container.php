<?php

declare(strict_types=1);

use DI\ContainerBuilder;

return function (): \Psr\Container\ContainerInterface {
    $builder = new ContainerBuilder();

    $builder->addDefinitions([
        //
    ]);

    return $builder->build();
};