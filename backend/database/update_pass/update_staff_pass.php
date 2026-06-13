<?php
$pdo = new PDO('mysql:host=db;port=3306;dbname=sistem_presensi_siswa_qr', 'root', 'root');
$hash = password_hash('Rajasa@123', PASSWORD_BCRYPT);

// Update staff.demo
$stmt = $pdo->prepare('UPDATE users SET password_hash = ? WHERE username = ?');
$stmt->execute([$hash, 'staff.demo']);
echo 'staff.demo updated: ' . $stmt->rowCount() . PHP_EOL;

// Update intern.demo
$stmt->execute([$hash, 'intern.demo']);
echo 'intern.demo updated: ' . $stmt->rowCount() . PHP_EOL;

echo 'Password: Rajasa@123' . PHP_EOL;
