<?php
session_start();

// 檢查使用者是否登入
if (!isset($_SESSION['username'])) {
    header('Content-Type: application/json');
    echo json_encode(['status' => 'error', 'message' => '使用者未登入']);
    exit;
}

ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

header('Content-Type: application/json');

// 引入資料庫連線
require 'db.php';

// 響應函數
function sendResponse($status, $message, $data = null) {
    $response = ['status' => $status, 'message' => $message];
    if ($data !== null) {
        $response = array_merge($response, $data);
    }
    echo json_encode($response);
    exit;
}

// 獲取並驗證輸入
$input = file_get_contents('php://input');
$data = json_decode($input, true);
$deviceId = $data['deviceId'] ?? '';

if (empty($deviceId)) {
    sendResponse('error', '缺少設備 ID');
}

// 資料庫操作
try {
    $db = Database::getInstance();
    $conn = $db->getConnection();
    $username = $_SESSION['username'];

    // 先查詢田區是否存在並獲取照片路徑
    $stmt = $conn->prepare("SELECT photo FROM fields WHERE device_id = :device_id AND username = :username");
    $stmt->bindParam(':device_id', $deviceId);
    $stmt->bindParam(':username', $username);
    $stmt->execute();
    $field = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$field) {
        sendResponse('error', '田區不存在或無權限');
    }

    // 刪除照片檔案（如果存在）
    if (!empty($field['photo']) && file_exists($field['photo'])) {
        unlink($field['photo']);
    }

    // 從資料庫中刪除田區
    $stmt = $conn->prepare("DELETE FROM fields WHERE device_id = :device_id AND username = :username");
    $stmt->bindParam(':device_id', $deviceId);
    $stmt->bindParam(':username', $username);

    if ($stmt->execute()) {
        $affectedRows = $stmt->rowCount();
        if ($affectedRows > 0) {
            sendResponse('success', '田區刪除成功');
        } else {
            sendResponse('error', '無田區被刪除');
        }
    }
} catch (PDOException $e) {
    sendResponse('error', '資料庫錯誤：' . $e->getMessage());
}
?>