<?php

declare(strict_types=1);

namespace Rajasa\PresensiSiswa\Http\Controllers;

use Rajasa\PresensiSiswa\Core\Request;
use Rajasa\PresensiSiswa\Core\Response;
use Rajasa\PresensiSiswa\Http\Middleware\PermissionMiddleware;
use Rajasa\PresensiSiswa\Services\SiswaService;

final class SiswaController
{
    public function __construct(
        private readonly Request $request,
        private readonly PermissionMiddleware $permission,
        private readonly SiswaService $siswaService
    ) {
    }

    public function index(): void
    {
        $this->permission->require('students.read');

        Response::success('Daftar siswa.', $this->siswaService->list([
            'q' => $this->request->input('q', ''),
            'jurusan_id' => $this->request->input('jurusan_id', ''),
            'rombel_id' => $this->request->input('rombel_id', ''),
            'status' => $this->request->input('status', ''),
            'page' => $this->request->input('page', 1),
            'per_page' => $this->request->input('per_page', 10),
        ]));
    }
}