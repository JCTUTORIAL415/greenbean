<?php
header('Content-Type: application/json');
ob_start();

$device_no = $_GET['deviceId'] ?? null;
if (!$device_no) {
    echo json_encode(['status' => 'error', 'message' => '缺少設備號']);
    exit;
}

$app_id = 1076;
$app_key = "hzH9N7UPiMjjJwdxPsDhJNonRxFeCypf";
$token_response = @file_get_contents("https://modooiot.com/api/v1/get_token.do?appid={$app_id}&appkey={$app_key}");
if ($token_response === false) {
    echo json_encode(['status' => 'error', 'message' => '無法取得 token']);
    exit;
}
$token_data = json_decode($token_response, true);
if ($token_data["status"] !== "200") {
    echo json_encode(['status' => 'error', 'message' => '無法取得 token', 'details' => $token_data]);
    exit;
}
$token = $token_data["data"]["token"];

$status_url = "https://modooiot.com/api/v1/get_monitor_list.do?token={$token}&device_no={$device_no}";
$max_retries = 3;
$retry_interval = 2;
$attempt = 0;
$is_irrigating = null;

while ($attempt < $max_retries) {
    $status_result = @file_get_contents($status_url);
    if ($status_result !== false) {
        $status_data = json_decode($status_result, true);
        if ($status_data["status"] === "200" && isset($status_data["data"]["list"])) {
            foreach ($status_data["data"]["list"] as $item) {
                if ($item["service_name"] === "DATA" && $item["data_name"] === "RELAY") {
                    $is_irrigating = $item["monitor_data"] === "1";
                    break 2; // 跳出 foreach 和 while
                }
            }
        }
    }
    $attempt++;
    if ($attempt < $max_retries) sleep($retry_interval);
}

if ($is_irrigating === null) {
    echo json_encode(['status' => 'error', 'message' => '無法獲取設備狀態']);
} else {
    echo json_encode([
        'status' => 'success',
        'irrigating' => $is_irrigating
    ]);
}

ob_end_flush();
?>