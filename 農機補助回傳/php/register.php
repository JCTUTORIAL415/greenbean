<?php
// 開發階段顯示所有錯誤
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

// 回傳 JSON
header('Content-Type: application/json; charset=utf-8');

// 引入 PDO 連線設定
require __DIR__ . '/db.php';

// 僅接受 POST 請求
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode([
        'success' => false,
        'message' => '只接受 POST'
    ], JSON_UNESCAPED_UNICODE);
    exit;
}

// 接收並 trim 欄位
$username = trim($_POST['registerUsername'] ?? '');
$password = $_POST['registerPassword'] ?? '';
$phone    = trim($_POST['registerPhone'] ?? '');
$company  = trim($_POST['registerCompany'] ?? '');

// 欄位驗證
if ($username === '' || strlen($password) < 6) {
    echo json_encode([
        'success' => false,
        'message' => '帳號不可為空，密碼需至少 6 碼'
    ], JSON_UNESCAPED_UNICODE);
    exit;
}
if (!preg_match('/^[0-9]{10}$/', $phone)) {
    echo json_encode([
        'success' => false,
        'message' => '電話格式錯誤，請輸入 10 碼數字'
    ], JSON_UNESCAPED_UNICODE);
    exit;
}
if ($company === '') {
    echo json_encode([
        'success' => false,
        'message' => '請填寫廠商名稱'
    ], JSON_UNESCAPED_UNICODE);
    exit;
}

// 檢查帳號是否已存在
$stmt = $pdo->prepare('SELECT id FROM users WHERE username = ?');
$stmt->execute([$username]);
if ($stmt->fetch()) {
    echo json_encode([
        'success' => false,
        'message' => '帳號已被註冊'
    ], JSON_UNESCAPED_UNICODE);
    exit;
}

// 寫入新用戶
$passwordHash = password_hash($password, PASSWORD_DEFAULT);
$stmt = $pdo->prepare(
    'INSERT INTO users (username, password_hash, phone, company, display_name)
     VALUES (?, ?, ?, ?, ?)'
);
$stmt->execute([
    $username,
    $passwordHash,
    $phone,
    $company,
    $username  // 預設 display_name 為 username
]);

echo json_encode([
    'success' => true,
    'message' => '註冊成功，請使用新帳號登入'
], JSON_UNESCAPED_UNICODE);
exit;
