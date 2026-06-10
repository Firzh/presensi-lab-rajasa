<?php

declare(strict_types=1);

namespace Rajasa\PresensiSiswa\Services;

use Illuminate\Database\Capsule\Manager as DB;

final class UserActivityService
{
    private const DEFAULT_PER_PAGE = 10;
    private const MAX_PER_PAGE = 100;

    public function record(?int $userId, string $activityType, string $moduleName, string $description, array $metadata = []): void
    {
        DB::table('user_activities')->insert([
            'user_id' => $userId,
            'activity_type' => $activityType,
            'module_name' => $moduleName,
            'activity_description' => $description,
            'metadata_json' => $metadata !== [] ? json_encode($metadata, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES) : null,
            'ip_address' => $this->serverValue('REMOTE_ADDR'),
            'user_agent' => $this->serverValue('HTTP_USER_AGENT'),
        ]);
    }

    public function list(array $filters): array
    {
        $keyword = trim((string) ($filters['q'] ?? ''));
        $action = strtolower(trim((string) ($filters['action'] ?? '')));
        $status = strtolower(trim((string) ($filters['status'] ?? '')));
        $page = max(1, (int) ($filters['page'] ?? 1));
        $perPage = min(self::MAX_PER_PAGE, max(1, (int) ($filters['per_page'] ?? self::DEFAULT_PER_PAGE)));

        $query = DB::table('user_activities as a')
            ->leftJoin('users as u', 'u.user_id', '=', 'a.user_id')
            ->leftJoin('guru_staff as gs', 'gs.guru_id', '=', 'u.guru_id')
            ->leftJoin('siswa as s', 's.siswa_id', '=', 'u.siswa_id');

        if ($keyword !== '') {
            $query->where(function ($query) use ($keyword): void {
                $query
                    ->where('u.username', 'like', '%' . $keyword . '%')
                    ->orWhere('gs.nama_lengkap', 'like', '%' . $keyword . '%')
                    ->orWhere('s.nama_lengkap', 'like', '%' . $keyword . '%')
                    ->orWhere('a.activity_type', 'like', '%' . $keyword . '%')
                    ->orWhere('a.module_name', 'like', '%' . $keyword . '%')
                    ->orWhere('a.activity_description', 'like', '%' . $keyword . '%');
            });
        }

        if ($action !== '') {
            $query->where('a.activity_type', 'like', $action . '%');
        }

        if ($status === 'failed') {
            $query->where('a.activity_type', 'like', '%failed%');
        } elseif ($status === 'active') {
            $query->where('a.activity_type', 'not like', '%failed%');
        }

        $total = (clone $query)->count('a.activity_id');
        $offset = ($page - 1) * $perPage;

        $items = $query
            ->orderByDesc('a.activity_id')
            ->offset($offset)
            ->limit($perPage)
            ->get([
                'a.activity_id',
                'a.user_id',
                'u.username',
                'u.user_type',
                'gs.nama_lengkap as guru_nama',
                's.nama_lengkap as siswa_nama',
                'a.activity_type',
                'a.module_name',
                'a.activity_description',
                'a.ip_address',
                'a.created_at',
                DB::raw("(select r.nama_role from user_roles ur join roles r on r.role_id = ur.role_id where ur.user_id = u.user_id and ur.is_active = 1 order by r.level_rank desc limit 1) as role_name"),
            ])
            ->map(fn (object $row): array => $this->formatActivity($row))
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
                'action' => $action !== '' ? $action : null,
                'status' => $status !== '' ? $status : null,
            ],
        ];
    }

    private function formatActivity(object $row): array
    {
        $activity = (string) $row->activity_type;

        return [
            'id' => (int) $row->activity_id,
            'username' => $row->username ?? '-',
            'nama_lengkap' => $row->guru_nama ?? $row->siswa_nama ?? $row->username ?? '-',
            'role' => $row->role_name ?? $this->labelUserType($row->user_type ?? ''),
            'action_type' => $this->labelActivity($activity),
            'module' => $row->module_name ?? '-',
            'status' => str_contains($activity, 'failed') ? 'Failed' : 'Active',
            'waktu' => $this->formatDateTime($row->created_at),
            'ip_address' => $row->ip_address ?? '-',
            'details' => $row->activity_description ?? '-',
        ];
    }

    private function labelActivity(string $activityType): string
    {
        $activityType = str_replace(['_', '-'], ' ', $activityType);

        return ucwords($activityType);
    }

    private function labelUserType(string $userType): string
    {
        return match ($userType) {
            'super_admin' => 'Super Admin',
            'admin' => 'Admin',
            'guru' => 'Guru',
            'staff' => 'Staff',
            'intern' => 'Intern Presensi',
            'siswa' => 'Siswa',
            default => '-',
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

    private function serverValue(string $key): ?string
    {
        $value = $_SERVER[$key] ?? null;

        return is_string($value) && trim($value) !== '' ? trim($value) : null;
    }
}
