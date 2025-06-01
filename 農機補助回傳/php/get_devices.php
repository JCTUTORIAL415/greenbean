<?php
session_start();
header('Content-Type: application/json; charset=utf-8');

// 1. 檢查是否已登入
if (!isset($_SESSION['user_id']) || !isset($_SESSION['company'])) {
    http_response_code(401);
    echo json_encode([
        'success' => false,
        'message' => '尚未登入'
    ], JSON_UNESCAPED_UNICODE);
    exit;
}

$company = $_SESSION['company'];

// 2. 載入 db.php，確保 $pdo 是正確連線物件
require __DIR__ . '/db.php';

try {
    // 3. 撈出該 company 底下所有設備
    $stmt = $pdo->prepare("
        SELECT 
            device_name, 
            machine_id, 
            satellite_id, 
            status, 
            latest_lat, 
            latest_lng, 
            expiry_date, 
            cultivated AS cultivated_area 
        FROM devices 
        WHERE company = ?
        ORDER BY created_at DESC
    ");
    $stmt->execute([$company]);
    $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // 4. 回傳 JSON 格式
    echo json_encode([
        'success' => true,
        'devices' => $rows
    ], JSON_UNESCAPED_UNICODE);
    exit;

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => '資料庫錯誤：' . $e->getMessage()
    ], JSON_UNESCAPED_UNICODE);
    exit;
}
