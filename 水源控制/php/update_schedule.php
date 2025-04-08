<?php
header('Content-Type: application/json');
include 'db.php';

$deviceId = $_POST['deviceId'];
$scheduleId = $_POST['scheduleId'];
$active = $_POST['active'];

try {
  $stmt = $pdo->prepare("UPDATE schedules SET active = ? WHERE id = ? AND device_id = ?");
  $stmt->execute([$active, $scheduleId, $deviceId]);

  if ($stmt->rowCount() > 0) {
    echo json_encode(['status' => 'success', 'message' => '更新成功']);
  } else {
    echo json_encode(['status' => 'error', 'message' => '找不到該排程']);
  }
} catch (PDOException $e) {
  echo json_encode(['status' => 'error', 'message' => $e->getMessage()]);
}
?>