<?php

declare(strict_types=1);

namespace Rajasa\PresensiSiswa\Http\Controllers;

use Rajasa\PresensiSiswa\Core\Request;
use Rajasa\PresensiSiswa\Core\Response;
use Rajasa\PresensiSiswa\Http\Middleware\PermissionMiddleware;
use Rajasa\PresensiSiswa\Services\JurusanService;

final class JurusanController
{
    public function __construct(
        private readonly Request $request,
        private readonly PermissionMiddleware $permission,
        private readonly JurusanService $jurusanService
    ) {
    }

    public function index(): void
    {
        $this->permission->require('jurusan.read');

        Response::success('Daftar jurusan.', $this->jurusanService->list([
            'q' => $this->request->input('q', ''),
            'status' => $this->request->input('status', ''),
            'page' => $this->request->input('page', 1),
            'per_page' => $this->request->input('per_page', 4),
        ]));
    }

    public function store(): void
    {
        $this->permission->require('jurusan.create');

        Response::success('Jurusan berhasil ditambahkan.', [
            'jurusan' => $this->jurusanService->create($this->request->body()),
        ], 201);
    }

    public function update(string $id): void
    {
        $this->permission->require('jurusan.update');

        Response::success('Jurusan berhasil diperbarui.', [
            'jurusan' => $this->jurusanService->update((int) $id, $this->request->body()),
        ]);
    }

    public function destroy(string $id): void
    {
        $this->permission->require('jurusan.delete');

        Response::success('Jurusan berhasil dinonaktifkan.', [
            'jurusan' => $this->jurusanService->disable((int) $id),
        ]);
    }
}