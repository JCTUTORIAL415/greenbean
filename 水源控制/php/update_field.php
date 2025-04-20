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

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    sendResponse('error', '僅支援 POST 請求');
}

if (!isset($_SESSION['username'])) {
    sendResponse('error', '請先登入');
}

$originalDeviceId = $_POST['originalDeviceId'] ?? '';
$fieldName = $_POST['fieldName'] ?? '';
$deviceId = $_POST['deviceId'] ?? '';
$area = $_POST['area'] ?? '';
$photo = $_FILES['fieldPhoto'] ?? null;

if (!$originalDeviceId || !$fieldName || !$deviceId || !$area) {
    sendResponse('error', '缺少必要欄位');
}

$db = Database::getInstance();
$pdo = $db->getConnection();

// 檢查名稱是否重複（排除當前田區）
$stmt = $pdo->prepare("SELECT COUNT(*) FROM fields WHERE field_name = ? AND username = ? AND device_id != ?");
$stmt->execute([$fieldName, $_SESSION['username'], $originalDeviceId]);
if ($stmt->fetchColumn() > 0) {
    sendResponse('error', '田區名稱已存在');
}

// 檢查設備 ID 是否重複（排除當前田區）
$stmt = $pdo->prepare("SELECT COUNT(*) FROM fields WHERE device_id = ? AND username = ? AND device_id != ?");
$stmt->execute([$deviceId, $_SESSION['username'], $originalDeviceId]);
if ($stmt->fetchColumn() > 0) {
    sendResponse('error', '設備 ID 已存在');
}

// 處理照片上傳
$photoPath = '';
if ($photo && $photo['error'] === UPLOAD_ERR_OK) {
    $uploadDir = 'uploads/';
    if (!is_dir($uploadDir)) {
        mkdir($uploadDir, 0777, true);
    }
    // 使用時間戳和隨機 ID 替換原始檔案名，避免中文字符問題
    $fileExtension = pathinfo($photo['name'], PATHINFO_EXTENSION);
    $safeFileName = uniqid() . '-' . time() . '.' . $fileExtension;
    $photoPath = $uploadDir . $safeFileName;
    if (!move_uploaded_file($photo['tmp_name'], $photoPath)) {
        sendResponse('error', '照片上傳失敗');
    }
}

try {
    $stmt = $pdo->prepare("UPDATE fields SET field_name = ?, device_id = ?, area_value = ?, area_unit = ?, photo = IF(? = '', photo, ?) WHERE device_id = ? AND username = ?");
    list($areaValue, $areaUnit) = explode(' ', $area);
    $stmt->execute([$fieldName, $deviceId, $areaValue, $areaUnit, $photoPath, $photoPath, $originalDeviceId, $_SESSION['username']]);
    if ($stmt->rowCount() > 0) {
        sendResponse('success', '田區更新成功');
    } else {
        sendResponse('error', '未找到要更新的田區');
    }
} catch (PDOException $e) {
    sendResponse('error', '資料庫錯誤：' . $e->getMessage());
}
?>