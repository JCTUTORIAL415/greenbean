<?php
session_start();
error_reporting(E_ALL);
ini_set('display_errors', 1);
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

// 1. 檢查是否為 POST 請求
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    sendResponse('error', '僅支援 POST 請求');
}

// 2. 檢查使用者是否已登入 (session)
if (!isset($_SESSION['username'])) {
    file_put_contents('debug_input.txt', "[ERROR] session username not set\n", FILE_APPEND);
    sendResponse('error', '請先登入');
}
$oldUsername = trim($_SESSION['username']);

// 3. 從前端接收要更新的新資料
$rawInput = file_get_contents("php://input");
file_put_contents('debug_input.txt', "Raw input:\n" . $rawInput . "\n", FILE_APPEND);

if (empty($_POST)) {
    parse_str($rawInput, $_POST);
}
file_put_contents('debug_input.txt', "Parsed _POST:\n" . print_r($_POST, true) . "\n", FILE_APPEND);

$newName = isset($_POST['newName']) ? trim($_POST['newName']) : '';

file_put_contents('debug_input.txt', "oldUsername: {$oldUsername}, newName: {$newName}\n", FILE_APPEND);

if (empty($newName)) {
    sendResponse('error', '請輸入新名稱');
}

// 4. 獲取資料庫連線
try {
    $db = Database::getInstance();
    $pdo = $db->getConnection();
    file_put_contents('debug_input.txt', "Database connected\n", FILE_APPEND);
} catch (PDOException $e) {
    file_put_contents('debug_input.txt', "[ERROR] DB connect fail: " . $e->getMessage() . "\n", FILE_APPEND);
    sendResponse('error', '資料庫連線失敗：' . $e->getMessage());
}

// 5. 準備並執行更新
try {
    $sql = "UPDATE userslist SET name = ? WHERE username = ?";
    $stmt = $pdo->prepare($sql);
    $params = [$newName, $oldUsername];
    file_put_contents('debug_input.txt', "SQL: {$sql}\nParams: " . print_r($params, true) . "\n", FILE_APPEND);

    if ($stmt->execute($params)) {
        $affectedRows = $stmt->rowCount();
        file_put_contents('debug_input.txt', "Affected rows: {$affectedRows}\n", FILE_APPEND);

        if ($affectedRows > 0) {
            $_SESSION['display_name'] = $newName;
            sendResponse('success', "使用者名稱更新成功，更新了 {$affectedRows} 筆資料");
        } else {
            sendResponse('success', '更新成功，但名稱未改變');
        }
    }
} catch (PDOException $e) {
    file_put_contents('debug_input.txt', "[ERROR] SQL execute fail: " . $e->getMessage() . "\n", FILE_APPEND);
    sendResponse('error', '使用者名稱更新失敗：' . $e->getMessage());
}
?>