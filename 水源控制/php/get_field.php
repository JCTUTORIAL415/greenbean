<?php
header('Content-Type: application/json');
require_once 'db.php';
session_start();

if (!isset($_SESSION['username'])) {
    echo json_encode(['status' => 'error', 'message' => '請先登入']);
    exit;
}

try {
    $db = Database::getInstance();
    $pdo = $db->getConnection();

    $stmt = $pdo->prepare("
        SELECT f.*, 
               (SELECT MAX(time) FROM irrigation_records ir WHERE ir.field_name = f.field_name AND ir.status = '已完成') as last_irrigation
        FROM fields f
        WHERE f.username = ?
    ");
    $stmt->execute([$_SESSION['username']]);
    $fields = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // 動態生成基礎 URL
    $baseUrl = 'http://' . $_SERVER['HTTP_HOST'] . dirname($_SERVER['PHP_SELF']) . '/';

    foreach ($fields as &$field) {
        $stmt = $pdo->prepare("SELECT id, time, duration, repeat_interval, active FROM schedules WHERE device_id = ?");
        $stmt->execute([$field['device_id']]);
        $field['schedules'] = $stmt->fetchAll(PDO::FETCH_ASSOC);

        // 將相對路徑轉為絕對路徑
        if ($field['photo'] && !empty($field['photo'])) {
            $field['photo'] = $baseUrl . $field['photo'];
        } else {
            $field['photo'] = ''; // 確保空值一致性
        }
    }
    unset($field);

    echo json_encode(['status' => 'success', 'fields' => $fields]);
} catch (PDOException $e) {
    echo json_encode(['status' => 'error', 'message' => '資料庫查詢失敗: ' . $e->getMessage()]);
} catch (Exception $e) {
    echo json_encode(['status' => 'error', 'message' => '伺服器錯誤: ' . $e->getMessage()]);
}
?>