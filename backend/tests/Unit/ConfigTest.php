<?php

declare(strict_types=1);

namespace Rajasa\PresensiSiswa\Tests\Unit;

use PHPUnit\Framework\TestCase;
use Rajasa\PresensiSiswa\Support\Config;

final class ConfigTest extends TestCase
{
    protected function tearDown(): void
    {
        Config::reset();
    }

    public function test_get_returns_nested_value_using_dot_notation(): void
    {
        Config::load([
            'app' => [
                'debug' => true,
                'name' => 'Rajasa',
            ],
        ]);

        $this->assertTrue(Config::get('app.debug'));
        $this->assertSame('Rajasa', Config::get('app.name'));
    }

    public function test_get_returns_default_when_key_missing(): void
    {
        Config::load([]);

        $this->assertSame('default', Config::get('app.name', 'default'));
    }

    public function test_set_updates_nested_value(): void
    {
        Config::load([]);

        Config::set('app.debug', true);

        $this->assertTrue(Config::get('app.debug'));
    }

    public function test_reset_clears_config(): void
    {
        Config::load([
            'app' => [
                'debug' => true,
            ],
        ]);

        Config::reset();

        $this->assertFalse(Config::get('app.debug', false));
    }

    public function test_typed_getters_return_valid_values(): void
    {
        Config::load([
            'app' => [
                'name' => 'Rajasa',
                'debug' => true,
                'port' => 8080,
                'providers' => ['auth', 'db'],
            ],
        ]);

        $this->assertSame('Rajasa', Config::string('app.name'));
        $this->assertTrue(Config::bool('app.debug'));
        $this->assertSame(8080, Config::int('app.port'));
        $this->assertSame(['auth', 'db'], Config::array('app.providers'));
    }

    public function test_typed_getters_return_default_when_type_invalid(): void
    {
        Config::load([
            'app' => [
                'name' => 123,
                'debug' => 'true',
                'port' => '8080',
                'providers' => 'auth',
            ],
        ]);

        $this->assertSame('default', Config::string('app.name', 'default'));
        $this->assertFalse(Config::bool('app.debug', false));
        $this->assertSame(80, Config::int('app.port', 80));
        $this->assertSame([], Config::array('app.providers'));
    }
}