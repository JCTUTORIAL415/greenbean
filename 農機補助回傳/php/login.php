<?php
session_start();
header('Content-Type: application/json; charset=utf-8');
require 'db.php';  // 請確認這個檔案內正確建立了 $pdo 物件連線

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => '只接受 POST']);
    exit;
}

// 取 POST 上來的 username、password
$username = trim($_POST['loginUsername'] ?? '');
$password = $_POST['loginPassword'] ?? '';

// 檢查有無此使用者，並同時撈出 company 欄位
$stmt = $pdo->prepare('SELECT id, password_hash, company FROM users WHERE username = ?');
$stmt->execute([$username]);
$user = $stmt->fetch(PDO::FETCH_ASSOC);

if ($user && password_verify($password, $user['password_hash'])) {
    // 驗證成功，把 user_id 和 company 存進 session
    $_SESSION['user_id']  = $user['id'];
    $_SESSION['company']  = $user['company'];

    // 回傳 JSON，key 叫 company
    echo json_encode([
        'success' => true,
        'company' => $user['company']
    ], JSON_UNESCAPED_UNICODE);
    exit;
} else {
    // 驗證失敗
    echo json_encode([
        'success' => false,
        'message' => '帳號或密碼錯誤'
    ], JSON_UNESCAPED_UNICODE);
    exit;
}
