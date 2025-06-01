<?php
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

// 資料庫連線設定，請改成你自己的
$host    = 'localhost';
$db      = 'gaiyas_satelite';  // ← 改這裡
$user    = 'root';
$pass    = '';
$charset = 'utf8mb4';

// 一定要有 $
$dsn = "mysql:host=$host;dbname=$db;charset=$charset";

$options = [
    PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
];

try {
    $pdo = new PDO($dsn, $user, $pass, $options);
} catch (PDOException $e) {
    exit('DB 連線失敗: ' . $e->getMessage());
}
