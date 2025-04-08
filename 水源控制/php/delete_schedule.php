<?php
header('Content-Type: application/json');
require_once 'db.php'; // 使用 require_once 確保檔案只載入一次

try {
    // 獲取資料庫連接
    $db = Database::getInstance();
    $pdo = $db->getConnection();

    // 獲取 POST 資料並驗證
    $deviceId = $_POST['deviceId'] ?? null;
    $scheduleId = $_POST['scheduleId'] ?? null;

    if (!$deviceId || !$scheduleId) {
        echo json_encode(['status' => 'error', 'message' => '缺少必要參數：deviceId 或 scheduleId']);
        exit;
    }

    // 執行刪除操作
    $stmt = $pdo->prepare("DELETE FROM schedules WHERE id = ? AND device_id = ?");
    $stmt->execute([$scheduleId, $deviceId]);

    if ($stmt->rowCount() > 0) {
        echo json_encode(['status' => 'success', 'message' => '刪除成功']);
    } else {
        echo json_encode(['status' => 'error', 'message' => '找不到該排程']);
    }
} catch (PDOException $e) {
    // 記錄錯誤並返回 JSON
    error_log("delete_schedule.php PDO 錯誤: " . $e->getMessage());
    echo json_encode(['status' => 'error', 'message' => '資料庫操作失敗: ' . $e->getMessage()]);
} catch (Exception $e) {
    error_log("delete_schedule.php 未知錯誤: " . $e->getMessage());
    echo json_encode(['status' => 'error', 'message' => '伺服器錯誤: ' . $e->getMessage()]);
}
?>