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

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    sendResponse('error', '僅支援 POST 請求');
}

$username = $_POST['username'] ?? '';
$password = $_POST['password'] ?? '';
$rememberMe = isset($_POST['rememberMe']) && $_POST['rememberMe'] === '1';

if (empty($username) || empty($password)) {
    sendResponse('error', '請輸入帳號與密碼');
}

$db = Database::getInstance();
$pdo = $db->getConnection();

try {
    $stmt = $pdo->prepare("SELECT * FROM userslist WHERE username = ?");
    $stmt->execute([$username]);
    $user = $stmt->fetch(PDO::FETCH_ASSOC);

    if ($user) {
        if (password_verify($password, $user['password'])) {
            $_SESSION['user_id'] = $user['id'];
            $_SESSION['username'] = $user['username'];
            $responseData = [];

            if ($rememberMe) {
                $responseData['user_id'] = $user['id']; // 返回 user_id 給前端
            }

            sendResponse('success', '登入成功', $responseData);
        } else {
            sendResponse('error', '密碼錯誤');
        }
    } else {
        sendResponse('error', '用戶名不存在');
    }
} catch (PDOException $e) {
    sendResponse('error', '資料庫錯誤：' . $e->getMessage());
}
?>