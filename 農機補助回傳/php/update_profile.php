<?php
session_start();
header('Content-Type: application/json; charset=utf-8');
require 'db.php';  // PDO 連線

// 假設 session 裡面有 user_id
if (!isset($_SESSION['user_id'])) {
  http_response_code(401);
  echo json_encode(['success'=>false,'message'=>'未登入']);
  exit;
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
  $user_id = $_SESSION['user_id'];
  $company = trim($_POST['company'] ?? '');
  if ($company === '') {
    echo json_encode(['success'=>false,'message'=>'名稱不可為空']);
    exit;
  }

  // 更新 users table 的 company 欄位
  $stmt = $pdo->prepare('UPDATE users SET company = ? WHERE id = ?');
  $ok = $stmt->execute([$company, $user_id]);
  if ($ok) {
    // 同步更新 session
    $_SESSION['company'] = $company;
    echo json_encode(['success'=>true,'message'=>'已更新']);
  } else {
    echo json_encode(['success'=>false,'message'=>'資料庫更新失敗']);
  }
  exit;
}

http_response_code(405);
echo json_encode(['success'=>false,'message'=>'Method Not Allowed']);
exit;
?>
