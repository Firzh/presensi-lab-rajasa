<?php

declare(strict_types=1);

namespace Rajasa\PresensiSiswa\Tests\Unit;

use PHPUnit\Framework\TestCase;
use Rajasa\PresensiSiswa\Support\Env;

final class EnvTest extends TestCase
{
    protected function tearDown(): void
    {
        unset(
            $_ENV['TEST_ENV_STRING'],
            $_ENV['TEST_ENV_BOOL'],
            $_ENV['TEST_ENV_INT'],
            $_ENV['TEST_ENV_FLOAT'],
            $_ENV['TEST_ENV_INVALID_BOOL'],
            $_ENV['TEST_ENV_INVALID_INT'],
            $_ENV['TEST_ENV_INVALID_FLOAT']
        );
    }

    public function test_get_returns_default_when_missing(): void
    {
        $this->assertSame('default', Env::get('TEST_ENV_MISSING', 'default'));
    }

    public function test_string_returns_trimmed_value(): void
    {
        $_ENV['TEST_ENV_STRING'] = '  rajasa  ';

        $this->assertSame('rajasa', Env::string('TEST_ENV_STRING'));
    }

    public function test_bool_parses_valid_boolean(): void
    {
        $_ENV['TEST_ENV_BOOL'] = 'true';

        $this->assertTrue(Env::bool('TEST_ENV_BOOL'));
    }

    public function test_bool_returns_default_for_invalid_boolean(): void
    {
        $_ENV['TEST_ENV_INVALID_BOOL'] = 'maybe';

        $this->assertTrue(Env::bool('TEST_ENV_INVALID_BOOL', true));
    }

    public function test_int_parses_valid_integer(): void
    {
        $_ENV['TEST_ENV_INT'] = '123';

        $this->assertSame(123, Env::int('TEST_ENV_INT'));
    }

    public function test_int_returns_default_for_invalid_integer(): void
    {
        $_ENV['TEST_ENV_INVALID_INT'] = 'abc';

        $this->assertSame(99, Env::int('TEST_ENV_INVALID_INT', 99));
    }

    public function test_float_parses_valid_float(): void
    {
        $_ENV['TEST_ENV_FLOAT'] = '12.5';

        $this->assertSame(12.5, Env::float('TEST_ENV_FLOAT'));
    }

    public function test_float_returns_default_for_invalid_float(): void
    {
        $_ENV['TEST_ENV_INVALID_FLOAT'] = 'abc';

        $this->assertSame(1.5, Env::float('TEST_ENV_INVALID_FLOAT', 1.5));
    }
}