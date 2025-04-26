<?php
session_start();
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

$userId = $_POST['user_id'] ?? '';
if (empty($userId)) {
    sendResponse('error', '缺少 user_id');
}

$db = Database::getInstance();
$pdo = $db->getConnection();

try {
    $stmt = $pdo->prepare("SELECT * FROM userslist WHERE id = ?");
    $stmt->execute([$userId]);
    $user = $stmt->fetch(PDO::FETCH_ASSOC);

    if ($user) {
        $_SESSION['user_id'] = $user['id'];
        $_SESSION['username'] = $user['username'];
        sendResponse('success', '自動登入成功');
    } else {
        sendResponse('error', '無效的使用者 ID');
    }
} catch (PDOException $e) {
    sendResponse('error', '資料庫錯誤：' . $e->getMessage());
}
?>