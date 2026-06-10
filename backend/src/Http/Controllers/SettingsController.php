<?php

declare(strict_types=1);

namespace Rajasa\PresensiSiswa\Http\Controllers;

use Rajasa\PresensiSiswa\Core\Request;
use Rajasa\PresensiSiswa\Core\Response;
use Rajasa\PresensiSiswa\Http\Middleware\PermissionMiddleware;
use Rajasa\PresensiSiswa\Services\SettingsService;

final class SettingsController
{
    public function __construct(
        private readonly Request $request,
        private readonly PermissionMiddleware $permission,
        private readonly SettingsService $settingsService
    ) {
    }

    public function index(): void
    {
        $this->permission->require('konfigurasi.read');

        Response::success('Data pengaturan.', $this->settingsService->dashboard());
    }

    public function backup(): void
    {
        $this->permission->require('konfigurasi.manage');

        Response::success('Backup database berhasil dibuat.', $this->settingsService->createBackup(), 201);
    }

    public function downloadBackup(): void
    {
        $this->permission->require('konfigurasi.read');

        Response::success('File backup.', $this->settingsService->downloadBackup((string) $this->request->input('file', '')));
    }

    public function updateRombelSchedule(): void
    {
        $this->permission->require('konfigurasi.manage');

        Response::success('Jadwal rombel berhasil diperbarui.', $this->settingsService->updateRombelSchedule($this->request->body()));
    }

    public function updateLateRule(): void
    {
        $this->permission->require('konfigurasi.manage');

        Response::success('Aturan keterlambatan berhasil diperbarui.', $this->settingsService->updateLateRule($this->request->body()));
    }
}
