<?php

declare(strict_types=1);

use Illuminate\Database\Capsule\Manager as Capsule;
use Rajasa\PresensiSiswa\Support\Config;

return function (): Capsule {
    $capsule = new Capsule();

    $capsule->addConnection([
        'driver' => Config::get('database.driver', 'mysql'),
        'host' => Config::get('database.host', 'db'),
        'port' => Config::int('database.port', 3306),
        'database' => Config::string('database.database'),
        'username' => Config::string('database.username'),
        'password' => Config::string('database.password'),
        'charset' => Config::string('database.charset', 'utf8mb4'),
        'collation' => Config::string('database.collation', 'utf8mb4_unicode_ci'),
        'prefix' => '',
    ]);

    $capsule->setAsGlobal();
    $capsule->bootEloquent();

    return $capsule;
};