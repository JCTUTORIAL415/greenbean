<?php
header('Content-Type: application/json');
require_once 'db.php';

try {
    $db = Database::getInstance();
    $pdo = $db->getConnection();

    $templateId = $_POST['templateId'] ?? null;

    if (!$templateId) {
        echo json_encode(['status' => 'error', 'message' => '缺少 templateId 參數']);
        exit;
    }

    $stmt = $pdo->prepare("DELETE FROM schedule_templates WHERE id = ?");
    $stmt->execute([$templateId]);

    if ($stmt->rowCount() > 0) {
        echo json_encode(['status' => 'success', 'message' => '刪除成功']);
    } else {
        echo json_encode(['status' => 'error', 'message' => '找不到該模板']);
    }
} catch (PDOException $e) {
    error_log("delete_schedule_template.php PDO 錯誤: " . $e->getMessage());
    echo json_encode(['status' => 'error', 'message' => '資料庫操作失敗: ' . $e->getMessage()]);
} catch (Exception $e) {
    error_log("delete_schedule_template.php 未知錯誤: " . $e->getMessage());
    echo json_encode(['status' => 'error', 'message' => '伺服器錯誤: ' . $e->getMessage()]);
}
?>