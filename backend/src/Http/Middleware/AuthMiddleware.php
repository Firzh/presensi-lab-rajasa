<?php

declare(strict_types=1);

namespace Rajasa\PresensiSiswa\Http\Middleware;

use Rajasa\PresensiSiswa\Core\HttpException;
use Rajasa\PresensiSiswa\Core\Request;
use Rajasa\PresensiSiswa\Models\User;
use Rajasa\PresensiSiswa\Services\AuthService;
use Rajasa\PresensiSiswa\Services\UserActivityService;

final class AuthMiddleware
{
    public function __construct(
        private readonly Request $request,
        private readonly AuthService $authService,
        private readonly UserActivityService $activityService
    ) {
    }

    /**
     * Validate token dan return user. Throw 401 jika token tidak ada atau tidak valid.
     * Saat token expired, catat log session_expired sebelum throw exception.
     */
    public function user(): User
    {
        $token = $this->request->bearerToken();

        if (!$token) {
            throw new HttpException('Token tidak ditemukan.', 401);
        }

        try {
            return $this->authService->userFromToken($token);
        } catch (HttpException $exception) {
            // BUG-05 fix: Catat log session_expired saat token expired
            if ($exception->statusCode() === 401 && str_contains($exception->getMessage(), 'kedaluwarsa')) {
                $userId = $this->extractUserIdFromExpiredToken($token);

                $this->activityService->record(
                    $userId,
                    'session_expired',
                    'auth',
                    'Sesi user berakhir karena token kedaluwarsa.',
                    ['token_prefix' => substr($token, 0, 20) . '...']
                );
            }

            throw $exception;
        }
    }

    /**
     * Coba ekstrak user_id dari token yang sudah expired (tanpa validasi expiry).
     * Digunakan hanya untuk keperluan logging session_expired.
     * Return null jika token tidak bisa diparsing sama sekali.
     */
    private function extractUserIdFromExpiredToken(string $token): ?int
    {
        $parts = explode('.', $token);

        if (count($parts) !== 3) {
            return null;
        }

        try {
            $payloadJson = base64_decode(strtr($parts[1], '-_', '+/'));

            if (!$payloadJson) {
                return null;
            }

            $payload = json_decode($payloadJson, true);

            if (!is_array($payload) || empty($payload['user_id'])) {
                return null;
            }

            return (int) $payload['user_id'];
        } catch (\Throwable) {
            return null;
        }
    }
}