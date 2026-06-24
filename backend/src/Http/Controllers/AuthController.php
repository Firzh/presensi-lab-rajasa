<?php

declare(strict_types=1);

namespace Rajasa\PresensiSiswa\Http\Controllers;

use Rajasa\PresensiSiswa\Core\HttpException;
use Rajasa\PresensiSiswa\Core\Request;
use Rajasa\PresensiSiswa\Core\Response;
use Rajasa\PresensiSiswa\Http\Middleware\AuthMiddleware;
use Rajasa\PresensiSiswa\Services\AuthService;
use Rajasa\PresensiSiswa\Services\UserActivityService;

final class AuthController
{
    public function __construct(
        private readonly Request $request,
        private readonly AuthService $authService,
        // BUG-03 + BUG-06 fix: inject auth middleware dan activity service
        private readonly AuthMiddleware $auth,
        private readonly UserActivityService $activityService
    ) {
    }

    public function login(): void
    {
        $username = trim((string) $this->request->input('username', ''));
        $password = (string) $this->request->input('password', '');

        if ($username === '' || $password === '') {
            throw new HttpException('Validasi gagal.', 422, [
                'username' => 'Username wajib diisi.',
                'password' => 'Password wajib diisi.',
            ]);
        }

        Response::success('Login berhasil.', $this->authService->login($username, $password));
    }

    /**
     * BUG-03 fix: Endpoint logout sekarang:
     * 1. Wajib memiliki token valid (BUG-06 fix: endpoint tidak bisa diakses tanpa token)
     * 2. Mencatat log logout dengan user_id yang benar
     * 3. Jika token tidak ada atau tidak valid, throw 401
     */
    public function logout(): void
    {
        $user = $this->auth->user(); // Throw 401 jika token tidak ada atau tidak valid

        $this->activityService->record(
            (int) $user->user_id,
            'logout',
            'auth',
            'User berhasil logout.',
            ['username' => $user->username]
        );

        Response::success('Logout berhasil.', [
            'note' => 'Token stateless. Hapus token di sisi client.',
        ]);
    }
}