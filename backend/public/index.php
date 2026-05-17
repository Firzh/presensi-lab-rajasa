<?php

header('Content-Type: application/json');

echo json_encode([
    'success' => true,
    'message' => 'Backend API masuk',
    'path' => $_SERVER['REQUEST_URI'] ?? null,
    'method' => $_SERVER['REQUEST_METHOD'] ?? null,
]);