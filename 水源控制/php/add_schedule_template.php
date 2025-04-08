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

if (strlen($_SESSION['username']) > 50) {
    sendResponse('error', '使用者名稱過長');
}

$templateName = $_POST['templateName'] ?? '';
$templateTime = $_POST['templateTime'] ?? '';
$templateDuration = $_POST['templateDuration'] ?? '';
$templateRepeat = $_POST['templateRepeat'] ?? '';
$templateCustomDays = $_POST['templateCustomDays'] ?? null;

if (!$templateName || !$templateTime || !$templateDuration || !$templateRepeat) {
    sendResponse('error', '缺少必要欄位');
}

$db = Database::getInstance();
$pdo = $db->getConnection();

// 檢查使用者是否存在於 userslist
$stmt = $pdo->prepare("SELECT COUNT(*) FROM userslist WHERE username = ?");
$stmt->execute([$_SESSION['username']]);
if ($stmt->fetchColumn() == 0) {
    sendResponse('error', '使用者不存在');
}

// 檢查模板名稱是否重複
$stmt = $pdo->prepare("SELECT COUNT(*) FROM schedule_templates WHERE name = ? AND username = ?");
$stmt->execute([$templateName, $_SESSION['username']]);
if ($stmt->fetchColumn() > 0) {
    sendResponse('error', '模板名稱已存在');
}

try {
    $stmt = $pdo->prepare("INSERT INTO schedule_templates (name, time, duration, repeat_interval, custom_days, username) VALUES (?, ?, ?, ?, ?, ?)");
    $stmt->execute([$templateName, $templateTime, $templateDuration, $templateRepeat, $templateCustomDays, $_SESSION['username']]);
    sendResponse('success', '模板新增成功');
} catch (PDOException $e) {
    sendResponse('error', '資料庫錯誤：' . $e->getMessage());
}
?>