<?php
header('Content-Type: application/json');
require_once 'db.php'; // 載入你的 db.php

try {
    // 獲取資料庫連接
    $db = Database::getInstance();
    $pdo = $db->getConnection();

    // 獲取 POST 資料
    $deviceId = $_POST['deviceId'] ?? null;
    $time = $_POST['time'] ?? null;
    $duration = $_POST['duration'] ?? null;
    $repeat = $_POST['repeat'] ?? null;
    $active = $_POST['active'] ?? 1;

    // 驗證必填欄位
    if (!$deviceId || !$time || !$duration || !$repeat) {
        echo json_encode(['status' => 'error', 'message' => '缺少必填欄位']);
        exit;
    }

    // 插入排程資料
    $stmt = $pdo->prepare("INSERT INTO schedules (device_id, time, duration, repeat_interval, active) VALUES (?, ?, ?, ?, ?)");
    $stmt->execute([$deviceId, $time, $duration, $repeat, $active]);
    $scheduleId = $pdo->lastInsertId();

    // 返回成功結果
    echo json_encode(['status' => 'success', 'message' => '新增成功', 'scheduleId' => $scheduleId]);
} catch (PDOException $e) {
    // 返回 JSON 錯誤訊息
    error_log("add_schedule.php 錯誤: " . $e->getMessage()); // 記錄到日誌
    echo json_encode(['status' => 'error', 'message' => '資料庫操作失敗: ' . $e->getMessage()]);
} catch (Exception $e) {
    error_log("add_schedule.php 未知錯誤: " . $e->getMessage());
    echo json_encode(['status' => 'error', 'message' => '伺服器錯誤: ' . $e->getMessage()]);
}
?>