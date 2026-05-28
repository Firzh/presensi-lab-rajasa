<?php

declare(strict_types=1);

namespace Rajasa\PresensiSiswa\Tests\Unit;

use PHPUnit\Framework\TestCase;
use Rajasa\PresensiSiswa\Models\User;

final class UserModelTest extends TestCase
{
    public function test_user_model_uses_expected_table_primary_key_and_timestamps(): void
    {
        $user = new User();

        $this->assertSame('users', $user->getTable());
        $this->assertSame('user_id', $user->getKeyName());
        $this->assertTrue($user->usesTimestamps());
    }

    public function test_user_model_uses_expected_fillable_fields(): void
    {
        $user = new User();

        $this->assertSame([
            'username',
            'email',
            'password_hash',
            'user_type',
            'siswa_id',
            'guru_id',
            'status',
            'last_login_at',
        ], $user->getFillable());
    }

    public function test_user_model_hides_password_hash(): void
    {
        $user = new User();

        $this->assertSame([
            'password_hash',
        ], $user->getHidden());
    }

    public function test_user_model_casts_expected_fields(): void
    {
        $user = new User();

        $casts = $user->getCasts();

        $this->assertSame('integer', $casts['siswa_id']);
        $this->assertSame('integer', $casts['guru_id']);
        $this->assertSame('datetime', $casts['last_login_at']);
        $this->assertSame('datetime', $casts['created_at']);
        $this->assertSame('datetime', $casts['updated_at']);
    }
}