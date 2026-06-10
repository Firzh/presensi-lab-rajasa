<?php

declare(strict_types=1);

namespace Rajasa\PresensiSiswa\Http\Controllers;

use Rajasa\PresensiSiswa\Core\Request;
use Rajasa\PresensiSiswa\Core\Response;
use Rajasa\PresensiSiswa\Http\Middleware\PermissionMiddleware;
use Rajasa\PresensiSiswa\Services\AdminUserService;

final class AdminUserController
{
    public function __construct(
        private readonly Request $request,
        private readonly PermissionMiddleware $permission,
        private readonly AdminUserService $adminUserService
    ) {
    }

    public function index(): void
    {
        $this->permission->require('users.read');

        Response::success('Daftar users.', $this->adminUserService->list([
            'q' => $this->request->input('q', ''),
            'role' => $this->request->input('role', ''),
            'roles' => $this->request->input('roles', ''),
            'status' => $this->request->input('status', ''),
            'statuses' => $this->request->input('statuses', ''),
            'user_type' => $this->request->input('user_type', ''),
            'user_types' => $this->request->input('user_types', ''),
            'exclude_user_type' => $this->request->input('exclude_user_type', ''),
            'page' => $this->request->input('page', 1),
            'per_page' => $this->request->input('per_page', 10),
        ]));
    }

    public function store(): void
    {
        $this->permission->require('users.create');

        Response::success('User berhasil ditambahkan.', [
            'user' => $this->adminUserService->create($this->request->body()),
        ], 201);
    }

    public function update(string $id): void
    {
        $this->permission->require('users.update');

        Response::success('User berhasil diperbarui.', [
            'user' => $this->adminUserService->update((int) $id, $this->request->body()),
        ]);
    }
}
