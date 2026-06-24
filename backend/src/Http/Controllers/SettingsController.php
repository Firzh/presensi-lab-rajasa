<?php

declare(strict_types=1);

namespace Rajasa\PresensiSiswa\Http\Controllers;

use Rajasa\PresensiSiswa\Core\Request;
use Rajasa\PresensiSiswa\Core\Response;
use Rajasa\PresensiSiswa\Http\Middleware\AuthMiddleware;
use Rajasa\PresensiSiswa\Http\Middleware\PermissionMiddleware;
use Rajasa\PresensiSiswa\Services\SettingsService;

final class SettingsController
{
    public function __construct(
        private readonly Request $request,
        private readonly AuthMiddleware $auth,
        private readonly PermissionMiddleware $permission,
        private readonly SettingsService $settingsService
    ) {
    }

        public function previewBackupImport(): void
    {
        $this->permission->require('konfigurasi.manage');

        Response::success(
            'Preview import backup.',
            $this->settingsService->previewBackupImport(
                $this->request->file('file'),
                (string) $this->request->input('file_path', '')
            )
        );
    }

    public function importBackup(): void
    {
        $this->permission->require('konfigurasi.manage');

        $userId = (int) $this->auth->user()->user_id;

        Response::success(
            'Import backup selesai.',
            $this->settingsService->importBackupDataOnly(
                $this->request->file('file'),
                (string) $this->request->input('file_path', ''),
                $userId
            )
        );
    }

    public function index(): void
    {
        $this->permission->require('konfigurasi.read');

        Response::success('Data pengaturan.', $this->settingsService->dashboard());
    }

    public function backup(): void
    {
        $this->permission->require('konfigurasi.manage');

        // Extra fix: pass user_id ke settingsService agar log mencatat siapa yang backup
        $userId = (int) $this->auth->user()->user_id;

        Response::success('Backup database berhasil dibuat.', $this->settingsService->createBackup($userId), 201);
    }

    public function downloadBackup(): void
    {
        $this->permission->require('konfigurasi.read');

        Response::success('File backup.', $this->settingsService->downloadBackup((string) $this->request->input('file', '')));
    }

    public function updateRombelSchedule(): void
    {
        $this->permission->require('konfigurasi.manage');

        // Extra fix: pass user_id ke settingsService agar log mencatat siapa yang mengubah
        $userId = (int) $this->auth->user()->user_id;

        Response::success('Jadwal rombel berhasil diperbarui.', $this->settingsService->updateRombelSchedule($this->request->body(), $userId));
    }

    public function updateLateRule(): void
    {
        $this->permission->require('konfigurasi.manage');

        // Extra fix: pass user_id ke settingsService agar log mencatat siapa yang mengubah
        $userId = (int) $this->auth->user()->user_id;

        Response::success('Aturan keterlambatan berhasil diperbarui.', $this->settingsService->updateLateRule($this->request->body(), $userId));
    }
}
