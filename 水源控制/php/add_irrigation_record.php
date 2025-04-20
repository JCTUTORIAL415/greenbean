<?php
header('Content-Type: application/json');
ob_start();

require 'db.php';
session_start();

// 使用 Database 類獲取 PDO 實例
$db = Database::getInstance();
$pdo = $db->getConnection();

file_put_contents('record_log.txt', date('Y-m-d H:i:s') . " - db.php 載入完成, PDO 是否存在: " . (isset($pdo) ? '是' : '否') . "\n", FILE_APPEND);

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    echo json_encode(['status' => 'error', 'message' => '僅支援 POST 請求']);
    exit;
}

if (!isset($_SESSION['username'])) {
    echo json_encode(['status' => 'error', 'message' => '請先登入']);
    exit;
}

if (strlen($_SESSION['username']) > 50) {
    echo json_encode(['status' => 'error', 'message' => '使用者名稱過長']);
    exit;
}

$data = json_decode(file_get_contents('php://input'), true);
if (json_last_error() !== JSON_ERROR_NONE) {
    echo json_encode(['status' => 'error', 'message' => '無效的 JSON 資料']);
    exit;
}

$fieldName = $data['field'] ?? '';
$time = $data['time'] ?? '';
$duration = $data['duration'] ?? '';
$status = $data['status'] ?? '';

file_put_contents('record_log.txt', date('Y-m-d H:i:s') . " - Received data: " . print_r($data, true) . "\n", FILE_APPEND);

if (!$fieldName || !$time || !$duration || $status !== '已完成') {
    echo json_encode(['status' => 'error', 'message' => '缺少必要欄位或狀態無效']);
    exit;
}

// 使用 DateTime 解析時間並確保為 Asia/Taipei
try {
    $dateTime = new DateTime($time); // 輸入應為 2025-04-08T00:24:46+08:00
    $dateTime->setTimezone(new DateTimeZone('Asia/Taipei')); // 確保時區
    $timeFormatted = $dateTime->format('Y-m-d H:i:s'); // 轉為 MySQL 格式，例如 2025-04-08 00:24:46
} catch (Exception $e) {
    file_put_contents('error_log.txt', date('Y-m-d H:i:s') . " - 時間解析失敗: " . $e->getMessage() . "\n", FILE_APPEND);
    echo json_encode(['status' => 'error', 'message' => '時間格式無效: ' . $e->getMessage()]);
    exit;
}

try {
    if (!isset($pdo) || !$pdo instanceof PDO) {
        throw new Exception('資料庫連線未初始化');
    }

    $stmt = $pdo->prepare("INSERT INTO irrigation_records (field_name, time, duration, status, username) VALUES (?, ?, ?, ?, ?)");
    $stmt->execute([$fieldName, $timeFormatted, $duration, $status, $_SESSION['username']]);

    // 保留最新的 30 筆紀錄
    $stmt = $pdo->prepare("
        DELETE FROM irrigation_records 
        WHERE username = ? 
        AND id NOT IN (
            SELECT id FROM (
                SELECT id FROM irrigation_records 
                WHERE username = ? 
                ORDER BY time DESC 
                LIMIT 30
            ) AS temp
        )
    ");
    $stmt->execute([$_SESSION['username'], $_SESSION['username']]);

    echo json_encode(['status' => 'success', 'message' => '灌溉紀錄新增成功']);
} catch (Exception $e) {
    file_put_contents('error_log.txt', date('Y-m-d H:i:s') . " - " . $e->getMessage() . "\n", FILE_APPEND);
    echo json_encode(['status' => 'error', 'message' => '伺服器錯誤: ' . $e->getMessage()]);
} catch (Error $e) {
    file_put_contents('error_log.txt', date('Y-m-d H:i:s') . " - Fatal Error: " . $e->getMessage() . "\n", FILE_APPEND);
    echo json_encode(['status' => 'error', 'message' => '伺服器內部錯誤']);
}

ob_end_flush();
?>