<?php

declare(strict_types=1);

function send_json(array $payload, int $status = 200): void
{
    http_response_code($status);
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode($payload, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    exit;
}

$origin = $_SERVER['HTTP_ORIGIN'] ?? '';
$allowedOrigins = [
    'http://localhost:3000',
    'http://127.0.0.1:3000',
    'http://localhost:8080',
    'http://127.0.0.1:8080',
];

if (in_array($origin, $allowedOrigins, true)) {
    header("Access-Control-Allow-Origin: {$origin}");
    header('Access-Control-Allow-Credentials: true');
}

header('Access-Control-Allow-Headers: Content-Type, X-Requested-With');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');

if (($_SERVER['REQUEST_METHOD'] ?? 'GET') === 'OPTIONS') {
    http_response_code(204);
    exit;
}

session_set_cookie_params([
    'lifetime' => 60 * 60 * 8,
    'path' => '/',
    'httponly' => true,
    'samesite' => 'Lax',
]);

if (session_status() !== PHP_SESSION_ACTIVE) {
    session_start();
}

function db(): PDO
{
    static $pdo = null;

    if ($pdo instanceof PDO) {
        return $pdo;
    }

    $host = getenv('DB_HOST') ?: 'db';
    $port = getenv('DB_PORT') ?: '3306';
    $database = getenv('DB_DATABASE') ?: 'sistem_absensi_lab_qr';
    $username = getenv('DB_USERNAME') ?: 'root';
    $password = getenv('DB_PASSWORD') ?: 'root';

    $dsn = "mysql:host={$host};port={$port};dbname={$database};charset=utf8mb4";

    $pdo = new PDO($dsn, $username, $password, [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        PDO::ATTR_EMULATE_PREPARES => false,
    ]);

    return $pdo;
}

function read_json_body(): array
{
    $raw = file_get_contents('php://input') ?: '';
    $data = json_decode($raw, true);

    if (!is_array($data)) {
        send_json([
            'ok' => false,
            'message' => 'Payload JSON tidak valid.',
        ], 400);
    }

    return $data;
}

function role_priority(string $roleSlug): int
{
    return match ($roleSlug) {
        'super_admin' => 10,
        'admin_akademik' => 20,
        'operator_lab' => 30,
        'guru_pengawas' => 40,
        'siswa' => 50,
        default => 999,
    };
}

function dashboard_path(?string $roleSlug): string
{
    return match ($roleSlug) {
        'super_admin' => '/dashboard/admin',
        'admin_akademik' => '/dashboard/admin',
        'operator_lab' => '/dashboard/operator',
        'guru_pengawas' => '/dashboard/guru',
        'siswa' => '/dashboard/siswa',
        default => '/dashboard',
    };
}

function get_user_payload(PDO $pdo, int $userId): ?array
{
    $stmt = $pdo->prepare("
        SELECT
            u.user_id,
            u.username,
            u.user_type,
            u.siswa_id,
            u.guru_id,
            u.status,
            u.valid_until,
            u.last_login,
            COALESCE(s.nama_lengkap, gs.nama_lengkap, u.username) AS nama_lengkap,
            s.nisn,
            s.nis,
            s.kelas_aktif,
            gs.nip,
            gs.jabatan
        FROM users u
        LEFT JOIN siswa s ON s.siswa_id = u.siswa_id
        LEFT JOIN guru_staff gs ON gs.guru_id = u.guru_id
        WHERE u.user_id = :user_id
        LIMIT 1
    ");

    $stmt->execute(['user_id' => $userId]);
    $user = $stmt->fetch();

    if (!$user) {
        return null;
    }

    $roleStmt = $pdo->prepare("
        SELECT
            r.role_id,
            r.nama_role,
            r.role_slug
        FROM user_roles ur
        INNER JOIN roles r ON r.role_id = ur.role_id
        WHERE ur.user_id = :user_id
          AND ur.is_active = 1
        ORDER BY r.role_id ASC
    ");

    $roleStmt->execute(['user_id' => $userId]);
    $roles = $roleStmt->fetchAll();

    usort($roles, function (array $a, array $b): int {
        return role_priority($a['role_slug']) <=> role_priority($b['role_slug']);
    });

    $primaryRoleSlug = $roles[0]['role_slug'] ?? null;
    $primaryRoleName = $roles[0]['nama_role'] ?? null;

    return [
        'user_id' => (int) $user['user_id'],
        'username' => $user['username'],
        'nama_lengkap' => $user['nama_lengkap'],
        'user_type' => $user['user_type'],
        'status' => $user['status'],
        'valid_until' => $user['valid_until'],
        'last_login' => $user['last_login'],
        'siswa_id' => $user['siswa_id'] !== null ? (int) $user['siswa_id'] : null,
        'guru_id' => $user['guru_id'] !== null ? (int) $user['guru_id'] : null,
        'nisn' => $user['nisn'],
        'nis' => $user['nis'],
        'kelas_aktif' => $user['kelas_aktif'],
        'nip' => $user['nip'],
        'jabatan' => $user['jabatan'],
        'roles' => $roles,
        'primary_role_slug' => $primaryRoleSlug,
        'primary_role_name' => $primaryRoleName,
        'dashboard_path' => dashboard_path($primaryRoleSlug),
    ];
}

function require_auth(): int
{
    $userId = $_SESSION['auth_user_id'] ?? null;

    if (!$userId) {
        send_json([
            'ok' => false,
            'message' => 'Belum login.',
        ], 401);
    }

    return (int) $userId;
}

try {
    $method = $_SERVER['REQUEST_METHOD'] ?? 'GET';
    $path = parse_url($_SERVER['REQUEST_URI'] ?? '/', PHP_URL_PATH) ?: '/';
    $path = preg_replace('#^/index\.php#', '', $path) ?: '/';

    if ($method === 'GET' && $path === '/api/health') {
        send_json([
            'ok' => true,
            'message' => 'API backend aktif.',
        ]);
    }

    if ($method === 'POST' && $path === '/api/login') {
        $data = read_json_body();

        $username = trim((string) ($data['username'] ?? ''));
        $password = (string) ($data['password'] ?? '');

        if ($username === '' || $password === '') {
            send_json([
                'ok' => false,
                'message' => 'Username dan password wajib diisi.',
            ], 422);
        }

        $pdo = db();

        $stmt = $pdo->prepare("
            SELECT
                user_id,
                username,
                password_hash,
                status,
                valid_until
            FROM users
            WHERE username = :username
            LIMIT 1
        ");

        $stmt->execute(['username' => $username]);
        $loginUser = $stmt->fetch();

        if (!$loginUser || !password_verify($password, $loginUser['password_hash'])) {
            usleep(250000);
            send_json([
                'ok' => false,
                'message' => 'Username atau password salah.',
            ], 401);
        }

        if ($loginUser['status'] !== 'aktif') {
            send_json([
                'ok' => false,
                'message' => 'Akun tidak aktif.',
            ], 403);
        }

        if (!empty($loginUser['valid_until']) && strtotime($loginUser['valid_until']) < time()) {
            send_json([
                'ok' => false,
                'message' => 'Masa berlaku akun sudah berakhir.',
            ], 403);
        }

        $pdo->prepare("
            UPDATE users
            SET last_login = NOW()
            WHERE user_id = :user_id
        ")->execute(['user_id' => $loginUser['user_id']]);

        $payload = get_user_payload($pdo, (int) $loginUser['user_id']);

        if (!$payload) {
            send_json([
                'ok' => false,
                'message' => 'Data user tidak ditemukan.',
            ], 404);
        }

        session_regenerate_id(true);
        $_SESSION['auth_user_id'] = $payload['user_id'];
        $_SESSION['auth_user'] = $payload;

        send_json([
            'ok' => true,
            'message' => 'Login berhasil.',
            'user' => $payload,
        ]);
    }

    if ($method === 'GET' && $path === '/api/me') {
        $pdo = db();
        $userId = require_auth();
        $payload = get_user_payload($pdo, $userId);

        if (!$payload) {
            session_destroy();
            send_json([
                'ok' => false,
                'message' => 'Session tidak valid.',
            ], 401);
        }

        $_SESSION['auth_user'] = $payload;

        send_json([
            'ok' => true,
            'user' => $payload,
        ]);
    }

    if ($method === 'POST' && $path === '/api/logout') {
        $_SESSION = [];

        if (ini_get('session.use_cookies')) {
            $params = session_get_cookie_params();

            setcookie(session_name(), '', time() - 42000, $params['path'], $params['domain'] ?? '', $params['secure'] ?? false, $params['httponly'] ?? true);
        }

        session_destroy();

        send_json([
            'ok' => true,
            'message' => 'Logout berhasil.',
        ]);
    }

    // ─── Siswa: Tabel Presensi (dengan filter & pagination) ──────────────────
    if ($method === 'GET' && $path === '/api/siswa/presensi') {
        $pdo    = db();
        $userId = require_auth();

        // Verify siswa role and get siswa_id
        $userRow = $pdo->prepare('SELECT siswa_id FROM users WHERE user_id = :uid AND user_type = "siswa" LIMIT 1');
        $userRow->execute(['uid' => $userId]);
        $siswaRow = $userRow->fetch();

        if (!$siswaRow || !$siswaRow['siswa_id']) {
            send_json(['ok' => false, 'message' => 'Akses ditolak. Bukan akun siswa.'], 403);
        }

        $siswaId = (int) $siswaRow['siswa_id'];

        // ── Pagination params ──
        $page    = max(1, (int) ($_GET['page']     ?? 1));
        $perPage = max(1, min(100, (int) ($_GET['per_page'] ?? 10)));
        $offset  = ($page - 1) * $perPage;

        // ── Filter params ──
        $filter    = $_GET['filter']     ?? 'semua';   // semua|hadir|terlambat|alpha|sakit|izin|date_range
        $dateStart = $_GET['date_start'] ?? null;
        $dateEnd   = $_GET['date_end']   ?? null;

        // ── Build WHERE clause ──
        $where  = ['p.siswa_id = :siswa_id', "p.validasi = 'valid'"];
        $params = ['siswa_id' => $siswaId];

        $validStatuses = ['hadir', 'terlambat', 'alpha', 'sakit', 'izin'];

        if (in_array($filter, $validStatuses, true)) {
            $where[]          = 'p.status = :status';
            $params['status'] = $filter;
        } elseif ($filter === 'date_range') {
            if ($dateStart) {
                $where[]              = 'p.tanggal >= :date_start';
                $params['date_start'] = $dateStart;
            }
            if ($dateEnd) {
                $where[]            = 'p.tanggal <= :date_end';
                $params['date_end'] = $dateEnd;
            }
        }

        $whereSQL = 'WHERE ' . implode(' AND ', $where);

        // ── Total count ──
        $countStmt = $pdo->prepare("SELECT COUNT(*) FROM presensi p {$whereSQL}");
        $countStmt->execute($params);
        $total = (int) $countStmt->fetchColumn();

        // ── Data rows ──
        $dataStmt = $pdo->prepare("
            SELECT
                p.presensi_id,
                p.tanggal,
                p.waktu_masuk,
                p.waktu_keluar,
                p.status,
                p.kelas_snapshot    AS kelas,
                p.jurusan_snapshot  AS jurusan,
                r.nama_ruangan      AS ruangan,
                p.keterangan
            FROM presensi p
            LEFT JOIN ruangan r ON r.ruangan_id = p.ruangan_id
            {$whereSQL}
            ORDER BY p.tanggal DESC, p.presensi_id DESC
            LIMIT :limit OFFSET :offset
        ");

        $dataStmt->bindValue(':limit',  $perPage, PDO::PARAM_INT);
        $dataStmt->bindValue(':offset', $offset,  PDO::PARAM_INT);
        foreach ($params as $key => $val) {
            $dataStmt->bindValue(":{$key}", $val);
        }
        $dataStmt->execute();
        $rows = $dataStmt->fetchAll();

        send_json([
            'ok'   => true,
            'data' => $rows,
            'meta' => [
                'total'       => $total,
                'page'        => $page,
                'per_page'    => $perPage,
                'total_pages' => (int) ceil($total / $perPage),
            ],
        ]);
    }

    // ─── Siswa: Kalender Akademik (PDF) ──────────────────────────────────────
    if ($method === 'GET' && $path === '/api/siswa/kalender-akademik') {
        require_auth();

        /**
         * PDF files are stored at:
         *   backend/server/kalender-akademik/<filename>.pdf
         *
         * The directory is auto-created by the backend when a file is uploaded.
         * If no PDF exists, the API returns ok=true with pdf_url=null so the
         * frontend can display an informational empty-state container.
         */
        $pdfDir  = __DIR__ . '/../server/kalender-akademik/';
        $pdfUrl  = null;
        $pdfName = null;

        if (is_dir($pdfDir)) {
            $files = glob($pdfDir . '*.pdf');
            if ($files && count($files) > 0) {
                // Use the most recently modified PDF
                usort($files, fn($a, $b) => filemtime($b) <=> filemtime($a));
                $pdfFile = $files[0];
                $pdfName = basename($pdfFile);

                // Build a publicly accessible URL
                $scheme   = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off') ? 'https' : 'http';
                $host     = $_SERVER['HTTP_HOST'] ?? 'localhost:8080';
                $pdfUrl   = "{$scheme}://{$host}/server/kalender-akademik/{$pdfName}";
            }
        }

        send_json([
            'ok'       => true,
            'pdf_url'  => $pdfUrl,
            'pdf_name' => $pdfName,
        ]);
    }

    // ─── Siswa: Dashboard Stats ───────────────────────────────────────────────
    if ($method === 'GET' && $path === '/api/siswa/dashboard') {
        $pdo    = db();
        $userId = require_auth();

        // Verify user is siswa
        $userRow = $pdo->prepare('SELECT siswa_id FROM users WHERE user_id = :uid AND user_type = "siswa" LIMIT 1');
        $userRow->execute(['uid' => $userId]);
        $siswaRow = $userRow->fetch();

        if (!$siswaRow || !$siswaRow['siswa_id']) {
            send_json(['ok' => false, 'message' => 'Akses ditolak. Bukan akun siswa.'], 403);
        }

        $siswaId = (int) $siswaRow['siswa_id'];

        // Count each attendance status for this student
        $stmt = $pdo->prepare("
            SELECT
                SUM(status = 'hadir')     AS tepat_waktu,
                SUM(status = 'terlambat') AS terlambat,
                SUM(status = 'sakit')     AS sakit,
                SUM(status = 'izin')      AS izin,
                SUM(status = 'alpha')     AS alpha
            FROM presensi
            WHERE siswa_id = :siswa_id
              AND validasi  = 'valid'
        ");
        $stmt->execute(['siswa_id' => $siswaId]);
        $counts = $stmt->fetch();

        send_json([
            'ok'   => true,
            'data' => [
                'tepat_waktu' => (int) ($counts['tepat_waktu'] ?? 0),
                'terlambat'   => (int) ($counts['terlambat']   ?? 0),
                'sakit'       => (int) ($counts['sakit']       ?? 0),
                'izin'        => (int) ($counts['izin']        ?? 0),
                'alpha'       => (int) ($counts['alpha']       ?? 0),
            ],
        ]);
    }

    send_json([
        'ok' => false,
        'message' => 'Route tidak ditemukan.',
        'path' => $path,
    ], 404);
} catch (Throwable $error) {
    send_json([
        'ok' => false,
        'message' => 'Terjadi error pada server.',
        'error' => $error->getMessage(),
    ], 500);
}
