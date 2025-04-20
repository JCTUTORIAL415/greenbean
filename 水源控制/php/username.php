<?php
session_start(); // 啟動 session 以獲取 user_id

error_reporting(E_ALL);
ini_set('display_errors', 1);
header('Content-Type: application/json');

// 引入資料庫連線
require_once 'db.php';

// 回應函數
function sendResponse($status, $message, $data = []) {
    $response = ['status' => $status, 'message' => $message];
    if (!empty($data)) {
        $response = array_merge($response, $data);
    }
    echo json_encode($response);
    exit;
}

// 確認 session 是否有 user_id
if (!isset($_SESSION['user_id'])) {
    sendResponse('error', '未登入');
}

// 獲取資料庫連線
$db = Database::getInstance();
$pdo = $db->getConnection();

// 用 user_id 查詢對應的 name
$userId = $_SESSION['user_id'];
try {
    $stmt = $pdo->prepare("SELECT name FROM userslist WHERE id = ? LIMIT 1");
    $stmt->execute([$userId]);
    $row = $stmt->fetch();

    if ($row) {
        sendResponse('success', '查詢成功', [
            'name' => htmlspecialchars($row['name'], ENT_QUOTES, 'UTF-8')
        ]);
    } else {
        sendResponse('error', '查無使用者');
    }
} catch (\PDOException $e) {
    sendResponse('error', '資料庫查詢失敗：' . $e->getMessage());
}
?>