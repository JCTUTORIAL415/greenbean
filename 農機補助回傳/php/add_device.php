<?php
session_start();
header('Content-Type: application/json; charset=utf-8');
require __DIR__ . '/db.php';  // 載入 PDO 連線

// 僅接受 POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success'=>false, 'message'=>'Method Not Allowed']);
    exit;
}

// 假設 session 中有 user_id 或 company/user_name 等
if (!isset($_SESSION['user_id'])) {
    http_response_code(401);
    echo json_encode(['success'=>false, 'message'=>'請先登入']);
    exit;
}

// 從 POST 取兩個必要欄位：device_name、machine_id、company
$deviceName = trim($_POST['device_name'] ?? '');
$machineId  = trim($_POST['machine_id']  ?? '');
$company    = trim($_POST['company']     ?? '');

if ($deviceName === '' || $machineId === '' || $company === '') {
    echo json_encode(['success'=>false, 'message'=>'參數不完整']);
    exit;
}

// 先檢查同一家公司底下的機器碼是否重複
$stmtChk = $pdo->prepare('SELECT COUNT(*) FROM devices WHERE company = ? AND machine_id = ?');
$stmtChk->execute([$company, $machineId]);
if ($stmtChk->fetchColumn() > 0) {
    echo json_encode(['success'=>false, 'message'=>'此「農機識別碼」已被使用']);
    exit;
}

// 產生不重複的 satellite_id
function generateSatelliteId(PDO $pdo) {
    do {
        $randSix = sprintf('%06d', mt_rand(0, 999999));
        $satId   = 'GAIYASOPS' . $randSix;
        $stmt    = $pdo->prepare('SELECT COUNT(*) FROM devices WHERE satellite_id = ?');
        $stmt->execute([$satId]);
        $count = $stmt->fetchColumn();
    } while ($count > 0);
    return $satId;
}

try {
    $pdo->beginTransaction();

    $satelliteId = generateSatelliteId($pdo);

    // 寫入資料表
    $sql = "INSERT INTO devices 
              (device_name, company, machine_id, satellite_id, status, created_at)
            VALUES
              (?,           ?,       ?,          ?,            'online', NOW())";
    $stmt = $pdo->prepare($sql);
    $ok   = $stmt->execute([
        $deviceName,
        $company,
        $machineId,
        $satelliteId
    ]);

    if (!$ok) {
        $pdo->rollBack();
        echo json_encode(['success'=>false, 'message'=>'資料庫寫入失敗']);
        exit;
    }

    $pdo->commit();

    echo json_encode([
        'success'      => true,
        'satellite_id' => $satelliteId,
        'message'      => '新增成功'
    ], JSON_UNESCAPED_UNICODE);

} catch (Exception $e) {
    $pdo->rollBack();
    error_log('add_device 錯誤: ' . $e->getMessage());
    echo json_encode([
        'success' => false,
        'message' => '伺服器錯誤，請稍後重試'
    ]);
}
