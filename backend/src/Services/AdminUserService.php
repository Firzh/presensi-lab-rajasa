<?php

declare(strict_types=1);

namespace Rajasa\PresensiSiswa\Services;

use Illuminate\Database\Capsule\Manager as DB;
use Rajasa\PresensiSiswa\Core\HttpException;

final class AdminUserService
{
    private const DEFAULT_PER_PAGE = 10;
    private const MAX_PER_PAGE = 100;
    private const VALID_USER_TYPES = ['super_admin', 'admin', 'guru', 'staff', 'intern'];

    public function __construct(private readonly UserActivityService $activityService)
    {
    }

    public function list(array $filters): array
    {
        $keyword = trim((string) ($filters['q'] ?? ''));
        $roleFilter = $this->firstFilledFilter($filters['roles'] ?? '', $filters['role'] ?? '');
        $statusFilter = $this->firstFilledFilter($filters['statuses'] ?? '', $filters['status'] ?? '');
        $userTypeFilter = $this->firstFilledFilter($filters['user_types'] ?? '', $filters['user_type'] ?? '');
        $roles = $this->normalizeRoleSlugList($roleFilter);
        $statuses = $this->normalizeStatusList($statusFilter);
        $userTypes = $this->normalizeUserTypeFilterList($userTypeFilter);
        $hasStudentFilter = in_array('siswa', $roles, true) || in_array('siswa', $userTypes, true);
        $defaultExcludeUserType = ($keyword !== '' || $hasStudentFilter) ? '' : 'siswa';
        $excludeInput = trim((string) ($filters['exclude_user_type'] ?? ''));
        $excludeUserType = $excludeInput !== ''
            ? $this->normalizeUserTypeForFilter($excludeInput)
            : $defaultExcludeUserType;
        $page = max(1, (int) ($filters['page'] ?? 1));
        $perPage = min(self::MAX_PER_PAGE, max(1, (int) ($filters['per_page'] ?? self::DEFAULT_PER_PAGE)));

        $query = DB::table('users as u')
            ->leftJoin('guru_staff as gs', 'gs.guru_id', '=', 'u.guru_id')
            ->leftJoin('siswa as s', 's.siswa_id', '=', 'u.siswa_id');

        if ($excludeUserType !== '') {
            $query->where('u.user_type', '!=', $excludeUserType);
        }

        if ($userTypes !== []) {
            $query->whereIn('u.user_type', $userTypes);
        }

        if ($keyword !== '') {
            $query->where(function ($query) use ($keyword): void {
                $query
                    ->where('u.username', 'like', '%' . $keyword . '%')
                    ->orWhere('u.email', 'like', '%' . $keyword . '%')
                    ->orWhere('gs.nama_lengkap', 'like', '%' . $keyword . '%')
                    ->orWhere('s.nama_lengkap', 'like', '%' . $keyword . '%');
            });
        }

        if ($statuses !== []) {
            $query->whereIn('u.status', $statuses);
        }

        if ($roles !== []) {
            $query->whereExists(function ($query) use ($roles): void {
                $query
                    ->select(DB::raw(1))
                    ->from('user_roles as ur')
                    ->join('roles as r', 'r.role_id', '=', 'ur.role_id')
                    ->whereColumn('ur.user_id', 'u.user_id')
                    ->where('ur.is_active', 1)
                    ->whereIn('r.role_slug', $roles);
            });
        }

        $total = (clone $query)->count('u.user_id');
        $offset = ($page - 1) * $perPage;

        $items = $query
            ->orderBy('u.user_type')
            ->orderBy('u.username')
            ->offset($offset)
            ->limit($perPage)
            ->get($this->selectColumns())
            ->map(fn (object $row): array => $this->formatUser($row))
            ->values()
            ->all();

        return [
            'items' => $items,
            'pagination' => [
                'page' => $page,
                'per_page' => $perPage,
                'total' => (int) $total,
                'total_pages' => max(1, (int) ceil(((int) $total) / $perPage)),
            ],
            'filters' => [
                'q' => $keyword !== '' ? $keyword : null,
                'roles' => $roles,
                'statuses' => $statuses,
                'user_types' => $userTypes,
                'exclude_user_type' => $excludeUserType !== '' ? $excludeUserType : null,
            ],
            'options' => [
                'user_types' => $this->userTypeOptions(),
                'roles' => $this->roleOptions(),
                'statuses' => $this->statusOptions(),
            ],
        ];
    }

    public function create(array $payload): array
    {
        $data = $this->normalizeCreatePayload($payload);
        $roleSlug = $this->normalizeRoleSlug($payload['role_slug'] ?? $payload['role'] ?? $data['user_type']);

        return DB::transaction(function () use ($data, $roleSlug): array {
            $this->ensureUsernameIsUnique($data['username']);
            $this->ensureEmailIsUnique($data['email']);

            $guruId = $this->ensureGuruStaff($data['username'], $data['nama_lengkap'], $data['email'], $data['user_type']);

            $userId = DB::table('users')->insertGetId([
                'username' => $data['username'],
                'email' => $data['email'],
                'password_hash' => password_hash($data['password'], PASSWORD_BCRYPT),
                'user_type' => $data['user_type'],
                'siswa_id' => null,
                'guru_id' => $guruId,
                'status' => $data['status'],
            ]);

            $this->syncRole((int) $userId, $roleSlug);
            $this->activityService->record((int) $userId, 'create_user', 'manage-users', 'Admin membuat akun user.');

            return $this->findById((int) $userId);
        });
    }

    public function update(int $id, array $payload): array
    {
        $current = DB::table('users')->where('user_id', $id)->first();

        if (!$current) {
            throw new HttpException('User tidak ditemukan.', 404);
        }

        if ((string) $current->user_type === 'siswa') {
            throw new HttpException('User siswa tidak dikelola dari halaman ini.', 422);
        }

        $data = $this->normalizeUpdatePayload($payload, $current);
        $roleSlug = $this->normalizeRoleSlug($payload['role_slug'] ?? $payload['role'] ?? '');

        return DB::transaction(function () use ($id, $data, $payload, $current, $roleSlug): array {
            if (isset($data['username'])) {
                $this->ensureUsernameIsUnique($data['username'], $id);
            }

            if (array_key_exists('email', $data)) {
                $this->ensureEmailIsUnique($data['email'], $id);
            }

            $namaLengkap = trim((string) ($payload['nama_lengkap'] ?? ''));
            $nextUserType = $data['user_type'] ?? (string) $current->user_type;
            $nextUsername = $data['username'] ?? (string) $current->username;
            $nextEmail = array_key_exists('email', $data) ? $data['email'] : $current->email;

            $guruId = $current->guru_id !== null
                ? (int) $current->guru_id
                : $this->ensureGuruStaff($nextUsername, $namaLengkap !== '' ? $namaLengkap : $nextUsername, $nextEmail, $nextUserType);

            $guruUpdate = [];
            if ($namaLengkap !== '') {
                $guruUpdate['nama_lengkap'] = $namaLengkap;
            }
            if (array_key_exists('email', $data)) {
                $guruUpdate['email'] = $nextEmail;
            }
            if (isset($data['user_type'])) {
                $guruUpdate['jenis_user'] = $this->guruStaffType($nextUserType);
            }
            if (isset($data['status'])) {
                $guruUpdate['status'] = $data['status'];
            }

            if ($guruUpdate !== []) {
                DB::table('guru_staff')->where('guru_id', $guruId)->update($guruUpdate);
            }

            $data['guru_id'] = $guruId;

            if ($data !== []) {
                DB::table('users')->where('user_id', $id)->update($data);
            }

            if ($roleSlug !== '') {
                $this->syncRole($id, $roleSlug);
            }

            $this->activityService->record($id, 'update_user', 'manage-users', 'Admin memperbarui akun user.');

            return $this->findById($id);
        });
    }

    private function normalizeCreatePayload(array $payload): array
    {
        $username = trim((string) ($payload['username'] ?? ''));
        $password = (string) ($payload['password'] ?? '');
        $namaLengkap = trim((string) ($payload['nama_lengkap'] ?? ''));
        $userType = $this->normalizeUserType($payload['user_type'] ?? $payload['tipe_user'] ?? $payload['role'] ?? 'admin');

        if ($username === '') {
            throw new HttpException('Validasi gagal.', 422, ['username' => 'Username wajib diisi.']);
        }

        if ($password === '') {
            throw new HttpException('Validasi gagal.', 422, ['password' => 'Password wajib diisi.']);
        }

        if ($namaLengkap === '') {
            throw new HttpException('Validasi gagal.', 422, ['nama_lengkap' => 'Nama lengkap wajib diisi.']);
        }

        return [
            'username' => $username,
            'password' => $password,
            'nama_lengkap' => $namaLengkap,
            'email' => $this->nullableString($payload['email'] ?? null),
            'user_type' => $userType,
            'status' => $this->normalizeStatus($payload['status'] ?? 'aktif'),
        ];
    }

    private function normalizeUpdatePayload(array $payload, object $current): array
    {
        $data = [];

        if (array_key_exists('username', $payload)) {
            $username = trim((string) $payload['username']);
            if ($username === '') {
                throw new HttpException('Validasi gagal.', 422, ['username' => 'Username wajib diisi.']);
            }
            $data['username'] = $username;
        }

        if (array_key_exists('email', $payload)) {
            $data['email'] = $this->nullableString($payload['email']);
        }

        if (array_key_exists('password', $payload) && trim((string) $payload['password']) !== '') {
            $data['password_hash'] = password_hash((string) $payload['password'], PASSWORD_BCRYPT);
        }

        if (array_key_exists('user_type', $payload) || array_key_exists('tipe_user', $payload)) {
            $data['user_type'] = $this->normalizeUserType($payload['user_type'] ?? $payload['tipe_user']);
        }

        if (array_key_exists('status', $payload)) {
            $data['status'] = $this->normalizeStatus($payload['status']);
        }

        if ((string) ($data['user_type'] ?? $current->user_type) === 'siswa') {
            throw new HttpException('User siswa tidak dikelola dari halaman ini.', 422);
        }

        return $data;
    }

    private function findById(int $id): array
    {
        $row = DB::table('users as u')
            ->leftJoin('guru_staff as gs', 'gs.guru_id', '=', 'u.guru_id')
            ->leftJoin('siswa as s', 's.siswa_id', '=', 'u.siswa_id')
            ->where('u.user_id', $id)
            ->first($this->selectColumns());

        if (!$row) {
            throw new HttpException('User tidak ditemukan.', 404);
        }

        return $this->formatUser($row);
    }

    private function selectColumns(): array
    {
        return [
            'u.user_id',
            'u.username',
            'u.email',
            'u.user_type',
            'u.status',
            'u.last_login_at',
            'u.created_at',
            'u.updated_at',
            'gs.guru_id',
            'gs.nama_lengkap as guru_nama',
            's.nama_lengkap as siswa_nama',
            DB::raw("(select r.role_slug from user_roles ur join roles r on r.role_id = ur.role_id where ur.user_id = u.user_id and ur.is_active = 1 order by r.level_rank desc limit 1) as role_slug"),
            DB::raw("(select r.nama_role from user_roles ur join roles r on r.role_id = ur.role_id where ur.user_id = u.user_id and ur.is_active = 1 order by r.level_rank desc limit 1) as role_name"),
        ];
    }

    private function formatUser(object $row): array
    {
        $status = (string) $row->status;
        $userType = (string) $row->user_type;
        $roleSlug = $row->role_slug ?? $this->defaultRoleForUserType($userType);

        return [
            'id' => (int) $row->user_id,
            'user_id' => (int) $row->user_id,
            'username' => $row->username,
            'email' => $row->email,
            'nama_lengkap' => $row->guru_nama ?? $row->siswa_nama ?? $row->username,
            'role' => $row->role_name ?? $this->labelRole($roleSlug),
            'role_slug' => $roleSlug,
            'tipe_user' => $userType,
            'user_type' => $userType,
            'tipe_user_label' => $this->labelUserType($userType),
            'jurusan' => '-',
            'status' => $this->labelStatus($status),
            'status_raw' => $status,
            'valid_hingga' => '-',
            'login_terakhir' => $this->formatDateTime($row->last_login_at),
            'catatan' => '',
            'created_at' => $row->created_at,
            'updated_at' => $row->updated_at,
        ];
    }

    private function ensureGuruStaff(string $username, string $namaLengkap, ?string $email, string $userType): int
    {
        $existing = DB::table('guru_staff')->where('nip', $username)->first();

        if ($existing) {
            DB::table('guru_staff')->where('guru_id', $existing->guru_id)->update([
                'nama_lengkap' => $namaLengkap,
                'email' => $email,
                'jenis_user' => $this->guruStaffType($userType),
                'status' => 'aktif',
            ]);

            return (int) $existing->guru_id;
        }

        return (int) DB::table('guru_staff')->insertGetId([
            'nip' => $username,
            'nama_lengkap' => $namaLengkap,
            'email' => $email,
            'jenis_user' => $this->guruStaffType($userType),
            'status' => 'aktif',
        ]);
    }

    private function syncRole(int $userId, string $roleSlug): void
    {
        $roleSlug = $roleSlug !== '' ? $roleSlug : 'admin';
        $role = DB::table('roles')->where('role_slug', $roleSlug)->first();

        if (!$role) {
            throw new HttpException('Role tidak ditemukan.', 422, ['role' => 'Role tidak tersedia di database.']);
        }

        DB::table('user_roles')->where('user_id', $userId)->update(['is_active' => 0]);
        DB::table('user_roles')->updateOrInsert(
            ['user_id' => $userId, 'role_id' => (int) $role->role_id],
            ['is_active' => 1]
        );
    }

    private function ensureUsernameIsUnique(string $username, ?int $exceptId = null): void
    {
        $query = DB::table('users')->where('username', $username);

        if ($exceptId !== null) {
            $query->where('user_id', '!=', $exceptId);
        }

        if ($query->exists()) {
            throw new HttpException('Username sudah digunakan.', 422, ['username' => 'Username sudah digunakan.']);
        }
    }

    private function ensureEmailIsUnique(?string $email, ?int $exceptId = null): void
    {
        if ($email === null) {
            return;
        }

        $query = DB::table('users')->where('email', $email);

        if ($exceptId !== null) {
            $query->where('user_id', '!=', $exceptId);
        }

        if ($query->exists()) {
            throw new HttpException('Email sudah digunakan.', 422, ['email' => 'Email sudah digunakan.']);
        }
    }

    private function normalizeUserType(mixed $value): string
    {
        $normalized = strtolower(trim((string) $value));
        $normalized = str_replace([' ', '-'], '_', $normalized);

        $mapped = match ($normalized) {
            'operator' => 'staff',
            'intern_presensi' => 'intern',
            default => $normalized,
        };

        return in_array($mapped, self::VALID_USER_TYPES, true) ? $mapped : 'admin';
    }

    private function firstFilledFilter(mixed $primary, mixed $fallback): mixed
    {
        if (is_array($primary)) {
            return $primary !== [] ? $primary : $fallback;
        }

        return trim((string) $primary) !== '' ? $primary : $fallback;
    }

    private function normalizeList(mixed $value, callable $normalizer): array
    {
        $rawItems = is_array($value) ? $value : explode(',', (string) $value);
        $items = [];

        foreach ($rawItems as $rawItem) {
            $normalized = $normalizer($rawItem);

            if ($normalized !== '' && !in_array($normalized, $items, true)) {
                $items[] = $normalized;
            }
        }

        return $items;
    }

    private function normalizeRoleSlugList(mixed $value): array
    {
        return $this->normalizeList($value, fn (mixed $item): string => $this->normalizeRoleSlug($item));
    }

    private function normalizeStatusList(mixed $value): array
    {
        return $this->normalizeList($value, fn (mixed $item): string => $this->normalizeStatus($item));
    }

    private function normalizeUserTypeFilterList(mixed $value): array
    {
        return $this->normalizeList($value, fn (mixed $item): string => $this->normalizeUserTypeForFilter($item));
    }

    private function normalizeUserTypeForFilter(mixed $value): string
    {
        $normalized = strtolower(trim((string) $value));
        $normalized = str_replace([' ', '-'], '_', $normalized);

        $mapped = match ($normalized) {
            'operator' => 'staff',
            'intern_presensi' => 'intern',
            default => $normalized,
        };

        return in_array($mapped, array_merge(['siswa'], self::VALID_USER_TYPES), true) ? $mapped : '';
    }

    private function normalizeRoleSlug(mixed $value): string
    {
        $normalized = strtolower(trim((string) $value));
        $normalized = str_replace([' ', '-'], '_', $normalized);

        return match ($normalized) {
            '', 'pilih_filter' => '',
            'operator', 'staff' => 'staff',
            'intern' => 'intern_presensi',
            'superadmin' => 'super_admin',
            'super_admin', 'admin', 'guru', 'siswa', 'intern_presensi' => $normalized,
            default => 'admin',
        };
    }

    private function defaultRoleForUserType(string $userType): string
    {
        return match ($userType) {
            'super_admin' => 'super_admin',
            'guru' => 'guru',
            'staff' => 'staff',
            'intern' => 'intern_presensi',
            'siswa' => 'siswa',
            default => 'admin',
        };
    }

    private function normalizeStatus(mixed $value): string
    {
        $status = strtolower(trim((string) $value));

        if ($status === 'aktif' || $status === 'active') {
            return 'aktif';
        }

        if ($status === 'nonaktif' || $status === 'inactive') {
            return 'nonaktif';
        }

        return $status === 'suspended' ? 'suspended' : 'aktif';
    }

    private function nullableString(mixed $value): ?string
    {
        $normalized = trim((string) ($value ?? ''));

        return $normalized !== '' ? $normalized : null;
    }

    private function guruStaffType(string $userType): string
    {
        return match ($userType) {
            'guru' => 'guru',
            'staff' => 'staff',
            'intern' => 'intern',
            default => 'admin',
        };
    }

    private function labelStatus(string $status): string
    {
        return match ($status) {
            'aktif' => 'Aktif',
            'nonaktif' => 'Nonaktif',
            'suspended' => 'Suspended',
            default => ucfirst($status),
        };
    }

    private function labelUserType(string $userType): string
    {
        return match ($userType) {
            'super_admin' => 'Super Admin',
            'admin' => 'Admin',
            'guru' => 'Guru',
            'staff' => 'Staff',
            'intern' => 'Intern',
            default => ucfirst($userType),
        };
    }

    private function labelRole(?string $roleSlug): string
    {
        return match ($roleSlug) {
            'super_admin' => 'Super Admin',
            'admin' => 'Admin',
            'guru' => 'Guru',
            'staff' => 'Staff',
            'intern_presensi' => 'Intern Presensi',
            'siswa' => 'Siswa',
            default => 'Admin',
        };
    }

    private function formatDateTime(mixed $value): string
    {
        if (!$value) {
            return '-';
        }

        $timestamp = strtotime((string) $value);

        return $timestamp ? date('d/m/y H:i', $timestamp) : (string) $value;
    }

    private function userTypeOptions(): array
    {
        return [
            ['value' => 'super_admin', 'label' => 'Super Admin'],
            ['value' => 'admin', 'label' => 'Admin'],
            ['value' => 'guru', 'label' => 'Guru'],
            ['value' => 'staff', 'label' => 'Staff'],
            ['value' => 'intern', 'label' => 'Intern'],
            ['value' => 'siswa', 'label' => 'Siswa'],
        ];
    }

    private function roleOptions(): array
    {
        return [
            ['value' => 'super_admin', 'label' => 'Super Admin'],
            ['value' => 'admin', 'label' => 'Admin'],
            ['value' => 'guru', 'label' => 'Guru'],
            ['value' => 'staff', 'label' => 'Staff'],
            ['value' => 'intern_presensi', 'label' => 'Intern Presensi'],
            ['value' => 'siswa', 'label' => 'Siswa'],
        ];
    }

    private function statusOptions(): array
    {
        return [
            ['value' => 'aktif', 'label' => 'Aktif'],
            ['value' => 'nonaktif', 'label' => 'Nonaktif'],
            ['value' => 'suspended', 'label' => 'Suspended'],
        ];
    }
}
