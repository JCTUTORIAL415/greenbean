<?php
header('Content-Type: application/json');
require_once 'db.php'; // 載入你的 db.php

try {
    // 獲取資料庫連接
    $db = Database::getInstance();
    $pdo = $db->getConnection();

    // 獲取 POST 資料
    $templateId = $_POST['templateId'] ?? null;
    $deviceIds = isset($_POST['deviceIds']) ? json_decode($_POST['deviceIds'], true) : null;

    // 驗證輸入
    if (!$templateId || !$deviceIds || !is_array($deviceIds)) {
        echo json_encode(['status' => 'error', 'message' => '缺少或無效的 templateId 或 deviceIds']);
        exit;
    }

    // 獲取模板資料
    $stmt = $pdo->prepare("SELECT time, duration, repeat_interval FROM schedule_templates WHERE id = ?");
    $stmt->execute([$templateId]);
    $template = $stmt->fetch();

    if (!$template) {
        echo json_encode(['status' => 'error', 'message' => '模板不存在']);
        exit;
    }

    // 為每個 deviceId 插入排程
    $schedules = [];
    $stmt = $pdo->prepare("INSERT INTO schedules (device_id, time, duration, repeat_interval, active) VALUES (?, ?, ?, ?, 1)");
    foreach ($deviceIds as $deviceId) {
        $stmt->execute([$deviceId, $template['time'], $template['duration'], $template['repeat_interval']]);
        $schedules[$deviceId] = ['id' => $pdo->lastInsertId()];
    }

    // 返回成功結果
    echo json_encode(['status' => 'success', 'message' => '套用成功', 'schedules' => $schedules]);
} catch (PDOException $e) {
    error_log("apply_schedule_template.php PDO 錯誤: " . $e->getMessage());
    echo json_encode(['status' => 'error', 'message' => '資料庫操作失敗: ' . $e->getMessage()]);
} catch (Exception $e) {
    error_log("apply_schedule_template.php 未知錯誤: " . $e->getMessage());
    echo json_encode(['status' => 'error', 'message' => '伺服器錯誤: ' . $e->getMessage()]);
}
?>