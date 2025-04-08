<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json");

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

$username = $_POST['username'] ?? '';
$password = $_POST['password'] ?? '';
$name     = $_POST['name'] ?? '';
$phone    = $_POST['phone'] ?? '';
$region   = $_POST['region'] ?? '';

if (empty($username) || empty($password) || empty($name) || empty($phone) || empty($region)) {
    sendResponse('error', '請填寫所有欄位');
}

$db = Database::getInstance();
$pdo = $db->getConnection();

try {
    $stmt = $pdo->prepare("SELECT * FROM userslist WHERE username = ?");
    $stmt->execute([$username]);
    if ($stmt->rowCount() > 0) {
        sendResponse('error', '用戶名已存在');
    }

    $hashedPassword = password_hash($password, PASSWORD_DEFAULT);

    $stmt = $pdo->prepare("INSERT INTO userslist (username, password, name, phone, region) VALUES (?, ?, ?, ?, ?)");
    $stmt->execute([$username, $hashedPassword, $name, $phone, $region]);

    sendResponse('success', '註冊成功');
} catch (PDOException $e) {
    sendResponse('error', '資料庫錯誤：' . $e->getMessage());
}
?>