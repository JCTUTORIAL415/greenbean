<?php
session_start();
header('Content-Type: application/json');
require_once 'db.php';

if (!isset($_SESSION['username'])) {
    echo json_encode(['status' => 'error', 'message' => '請先登入']);
    exit;
}

try {
    $db = Database::getInstance();
    $pdo = $db->getConnection();

    // 查詢灌溉紀錄，假設 time 已為 Asia/Taipei
    $stmt = $pdo->prepare("
        SELECT field_name, 
               time, 
               duration, 
               status 
        FROM irrigation_records 
        WHERE username = ? 
        ORDER BY time DESC 
        LIMIT 30
    ");
    $stmt->execute([$_SESSION['username']]);
    $records = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // 格式化時間為 ISO 8601
    foreach ($records as &$record) {
        if ($record['time'] && !empty($record['time'])) {
            $date = new DateTime($record['time'], new DateTimeZone('Asia/Taipei'));
            $record['time'] = $date->format('Y-m-d\TH:i:sP'); // 例如 2025-04-08T00:24:46+08:00
        } else {
            $record['time'] = ''; // 空值時返回空字符串
        }
    }
    unset($record);

    echo json_encode(['status' => 'success', 'records' => $records]);
} catch (PDOException $e) {
    echo json_encode(['status' => 'error', 'message' => '資料庫查詢失敗: ' . $e->getMessage()]);
} catch (Exception $e) {
    echo json_encode(['status' => 'error', 'message' => '伺服器錯誤: ' . $e->getMessage()]);
}
?>