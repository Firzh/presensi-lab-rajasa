<?php

declare(strict_types=1);

namespace Rajasa\PresensiSiswa\Services;

use Illuminate\Database\Capsule\Manager as DB;
use Rajasa\PresensiSiswa\Core\HttpException;

final class JurusanService
{
    private const DEFAULT_PER_PAGE = 4;
    private const MAX_PER_PAGE = 100;

    public function list(array $filters): array
    {
        $keyword = trim((string) ($filters['q'] ?? ''));
        $status = trim((string) ($filters['status'] ?? ''));
        $page = max(1, (int) ($filters['page'] ?? 1));
        $perPage = min(self::MAX_PER_PAGE, max(1, (int) ($filters['per_page'] ?? self::DEFAULT_PER_PAGE)));

        $query = DB::table('jurusan as j');

        if ($keyword !== '') {
            $query->where(function ($query) use ($keyword): void {
                $query
                    ->where('j.kode_jurusan', 'like', '%' . $keyword . '%')
                    ->orWhere('j.nama_jurusan', 'like', '%' . $keyword . '%')
                    ->orWhere('j.ketua_jurusan', 'like', '%' . $keyword . '%');
            });
        }

        if ($status !== '') {
            $query->where('j.status', strtolower($status));
        }

        $total = (clone $query)->count('j.jurusan_id');
        $offset = ($page - 1) * $perPage;

        $items = $query
            ->orderBy('j.kode_jurusan')
            ->offset($offset)
            ->limit($perPage)
            ->get([
                'j.jurusan_id',
                'j.kode_jurusan',
                'j.nama_jurusan',
                'j.ketua_jurusan',
                'j.deskripsi_jurusan',
                'j.status',
                'j.created_at',
                'j.updated_at',
                DB::raw('(select count(*) from siswa s where s.jurusan_id_aktif = j.jurusan_id) as total_siswa'),
                DB::raw('(select count(*) from rombel r where r.jurusan_id = j.jurusan_id) as total_rombel'),
            ])
            ->map(fn (object $row): array => $this->formatJurusan($row))
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
                'status' => $status !== '' ? strtolower($status) : null,
            ],
            'options' => [
                'statuses' => $this->statusOptions(),
            ],
        ];
    }

    public function create(array $payload): array
    {
        $data = $this->normalizeCreatePayload($payload);

        $this->ensureKodeIsUnique($data['kode_jurusan']);

        $id = DB::table('jurusan')->insertGetId($data);

        return $this->findById((int) $id);
    }

    public function update(int $id, array $payload): array
    {
        $current = DB::table('jurusan')->where('jurusan_id', $id)->first();

        if (!$current) {
            throw new HttpException('Jurusan tidak ditemukan.', 404);
        }

        $data = $this->normalizeUpdatePayload($payload, $current);

        if (isset($data['kode_jurusan'])) {
            $this->ensureKodeIsUnique($data['kode_jurusan'], $id);
        }

        if ($data !== []) {
            DB::table('jurusan')->where('jurusan_id', $id)->update($data);
        }

        return $this->findById($id);
    }

    public function disable(int $id): array
    {
        $current = DB::table('jurusan')->where('jurusan_id', $id)->first();

        if (!$current) {
            throw new HttpException('Jurusan tidak ditemukan.', 404);
        }

        DB::table('jurusan')->where('jurusan_id', $id)->update([
            'status' => 'nonaktif',
        ]);

        return $this->findById($id);
    }

    private function findById(int $id): array
    {
        $row = DB::table('jurusan as j')
            ->where('j.jurusan_id', $id)
            ->first([
                'j.jurusan_id',
                'j.kode_jurusan',
                'j.nama_jurusan',
                'j.ketua_jurusan',
                'j.deskripsi_jurusan',
                'j.status',
                'j.created_at',
                'j.updated_at',
                DB::raw('(select count(*) from siswa s where s.jurusan_id_aktif = j.jurusan_id) as total_siswa'),
                DB::raw('(select count(*) from rombel r where r.jurusan_id = j.jurusan_id) as total_rombel'),
            ]);

        if (!$row) {
            throw new HttpException('Jurusan tidak ditemukan.', 404);
        }

        return $this->formatJurusan($row);
    }

    private function normalizeCreatePayload(array $payload): array
    {
        $kode = strtoupper(trim((string) ($payload['kode_jurusan'] ?? '')));
        $nama = trim((string) ($payload['nama_jurusan'] ?? ''));

        if ($kode === '') {
            $kode = 'JUR-' . date('YmdHis');
        }

        if ($nama === '') {
            $nama = 'Nama Jurusan Baru';
        }

        return [
            'kode_jurusan' => $kode,
            'nama_jurusan' => $nama,
            'ketua_jurusan' => $this->nullableString($payload['ketua_jurusan'] ?? null),
            'deskripsi_jurusan' => $this->nullableString($payload['deskripsi_jurusan'] ?? null),
            'status' => $this->normalizeStatus($payload['status'] ?? 'aktif'),
        ];
    }

    private function normalizeUpdatePayload(array $payload, object $current): array
    {
        $data = [];

        if (array_key_exists('kode_jurusan', $payload)) {
            $kode = strtoupper(trim((string) $payload['kode_jurusan']));
            $data['kode_jurusan'] = $kode !== '' ? $kode : (string) $current->kode_jurusan;
        }

        if (array_key_exists('nama_jurusan', $payload)) {
            $nama = trim((string) $payload['nama_jurusan']);
            $data['nama_jurusan'] = $nama !== '' ? $nama : (string) $current->nama_jurusan;
        }

        if (array_key_exists('ketua_jurusan', $payload)) {
            $data['ketua_jurusan'] = $this->nullableString($payload['ketua_jurusan']);
        }

        if (array_key_exists('deskripsi_jurusan', $payload)) {
            $data['deskripsi_jurusan'] = $this->nullableString($payload['deskripsi_jurusan']);
        }

        if (array_key_exists('status', $payload)) {
            $data['status'] = $this->normalizeStatus($payload['status']);
        }

        return $data;
    }

    private function ensureKodeIsUnique(string $kode, ?int $exceptId = null): void
    {
        $query = DB::table('jurusan')->where('kode_jurusan', $kode);

        if ($exceptId !== null) {
            $query->where('jurusan_id', '!=', $exceptId);
        }

        if ($query->exists()) {
            throw new HttpException('Kode jurusan sudah digunakan.', 422, [
                'kode_jurusan' => 'Kode jurusan sudah digunakan.',
            ]);
        }
    }

    private function nullableString(mixed $value): ?string
    {
        $normalized = trim((string) ($value ?? ''));

        return $normalized !== '' ? $normalized : null;
    }

    private function normalizeStatus(mixed $value): string
    {
        $status = strtolower(trim((string) $value));

        return in_array($status, ['aktif', 'nonaktif'], true) ? $status : 'aktif';
    }

    private function statusOptions(): array
    {
        return [
            ['value' => 'aktif', 'label' => 'Aktif'],
            ['value' => 'nonaktif', 'label' => 'Nonaktif'],
        ];
    }

    private function formatJurusan(object $row): array
    {
        return [
            'id' => (int) $row->jurusan_id,
            'jurusan_id' => (int) $row->jurusan_id,
            'kode_jurusan' => $row->kode_jurusan,
            'nama_jurusan' => $row->nama_jurusan,
            'ketua_jurusan' => $row->ketua_jurusan,
            'deskripsi_jurusan' => $row->deskripsi_jurusan,
            'status' => $row->status,
            'status_label' => ucfirst((string) $row->status),
            'total_siswa' => (int) ($row->total_siswa ?? 0),
            'total_rombel' => (int) ($row->total_rombel ?? 0),
            'total_ruang_lab' => 0,
            'created_at' => $row->created_at ?? null,
            'updated_at' => $row->updated_at ?? null,
        ];
    }
}