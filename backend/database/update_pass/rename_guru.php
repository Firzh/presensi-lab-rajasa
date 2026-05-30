<?php
$pdo = new PDO('mysql:host=db;port=3306;dbname=sistem_presensi_siswa_qr', 'root', 'root');
$stmt = $pdo->prepare('UPDATE users SET username = ? WHERE username = ?');
$stmt->execute(['guru', 'guru.demo']);
echo 'Updated: ' . $stmt->rowCount() . PHP_EOL;
echo 'Username sekarang: guru' . PHP_EOL;
