<?php

declare(strict_types=1);

namespace Rajasa\PresensiSiswa\Models;

use Illuminate\Database\Eloquent\Model;

final class User extends Model
{
    protected $table = 'users';

    protected $primaryKey = 'user_id';

    public $timestamps = true;

    protected $fillable = [
        'username',
        'email',
        'password_hash',
        'user_type',
        'siswa_id',
        'guru_id',
        'status',
        'last_login_at',
    ];

    protected $hidden = [
        'password_hash',
    ];

    protected $casts = [
        'siswa_id' => 'integer',
        'guru_id' => 'integer',
        'last_login_at' => 'datetime',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];
}