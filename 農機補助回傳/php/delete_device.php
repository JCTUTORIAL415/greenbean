<?php
session_start();
header('Content-Type: application/json; charset=utf-8');

// 1. 確認使用者已登入（必要時才做此檢查，否則可略過）
if (!isset($_SESSION['user_id'])) {
    http_response_code(401);
    echo json_encode([
        'success' => false,
        'message' => '尚未登入'
    ], JSON_UNESCAPED_UNICODE);
    exit;
}

// 2. 載入資料庫連線（請確認 db.php 內正確建立了 $pdo 物件）
require __DIR__ . '/db.php';

// 3. 只接受 POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode([
        'success' => false,
        'message' => '只接受 POST 方法'
    ], JSON_UNESCAPED_UNICODE);
    exit;
}

// 4. 讀取前端送來的 JSON body，並解碼
$body = file_get_contents('php://input');
$data = json_decode($body, true);

if (
    !isset($data['device_id']) ||
    trim($data['device_id']) === ''
) {
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'message' => '參數不足：請提供 device_id'
    ], JSON_UNESCAPED_UNICODE);
    exit;
}

// 這裡的 device_id，對應前端傳過來的 satellite_id
$satelliteId = trim($data['device_id']);

// 5. 執行刪除：DELETE FROM devices WHERE satellite_id = ?
try {
    $stmt = $pdo->prepare('DELETE FROM devices WHERE satellite_id = ?');
    $stmt->execute([$satelliteId]);

    if ($stmt->rowCount() === 0) {
        // 沒有任何列被刪除，代表找不到對應的 satellite_id
        echo json_encode([
            'success' => false,
            'message' => '刪除失敗：找不到指定的設備或已經被刪除'
        ], JSON_UNESCAPED_UNICODE);
        exit;
    }

    echo json_encode([
        'success' => true,
        'message' => '刪除成功'
    ], JSON_UNESCAPED_UNICODE);
    exit;

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => '資料庫錯誤: ' . $e->getMessage()
    ], JSON_UNESCAPED_UNICODE);
    exit;
}
