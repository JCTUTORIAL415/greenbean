<?php
session_start();
header('Content-Type: application/json');

require 'db.php';

function sendResponse($status, $message, $data = null) {
    $response = ['status' => $status, 'message' => $message];
    if ($data !== null) {
        $response = array_merge($response, $data);
    }
    echo json_encode($response);
    exit;
}

if (!isset($_SESSION['username'])) {
    sendResponse('error', '未登入');
}

if (strlen($_SESSION['username']) > 50) {
    sendResponse('error', '使用者名稱過長');
}

$db = Database::getInstance();
$pdo = $db->getConnection();

try {
    $stmt = $pdo->prepare("SELECT id, name, time, duration, repeat_interval, custom_days FROM schedule_templates WHERE username = ? ORDER BY time ASC");
    $stmt->execute([$_SESSION['username']]);
    $templates = $stmt->fetchAll(PDO::FETCH_ASSOC);
    sendResponse('success', '排程模板載入成功', ['templates' => $templates]);
} catch (PDOException $e) {
    sendResponse('error', '資料庫錯誤：' . $e->getMessage());
}
?>