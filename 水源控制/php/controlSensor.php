<?php
// controlSensor.php
header('Content-Type: application/json');
ob_start(); // 防止意外輸出影響 JSON

function get_token($app_id, $app_key) {
    $url = "https://modooiot.com/api/v1/get_token.do?appid={$app_id}&appkey={$app_key}";
    $result = @file_get_contents($url); // 使用 @ 抑制警告
    if ($result === false) {
        file_put_contents('error_log.txt', date('Y-m-d H:i:s') . " - Failed to get token\n", FILE_APPEND);
        return null;
    }
    return json_decode($result, true);
}

function bind_device($token, $device_no, $device_name) {
    $device_name_encoded = urlencode($device_name);
    $url = "https://modooiot.com/api/v1/regedit_device.do?token={$token}&device_no={$device_no}&device_name={$device_name_encoded}";
    $result = @file_get_contents($url);
    if ($result === false) return null;
    return json_decode($result, true);
}

function control_device($token, $device_no, $service_name, $data_name, $monitor_data) {
    $url = "https://modooiot.com/api/v1/control_monitor.do?token={$token}&device_no={$device_no}&service_name={$service_name}&data_name={$data_name}&monitor_data={$monitor_data}";
    $result = @file_get_contents($url);
    if ($result === false) return null;
    return json_decode($result, true);
}

function get_device_status($token, $device_no, $expected_state, $max_retries = 3, $retry_interval = 2) {
    $url = "https://modooiot.com/api/v1/get_monitor_list.do?token={$token}&device_no={$device_no}";
    $attempt = 0;

    while ($attempt < $max_retries) {
        $result = @file_get_contents($url);
        if ($result === false) {
            $attempt++;
            sleep($retry_interval);
            continue;
        }
        $status_data = json_decode($result, true);
        file_put_contents('status_log.txt', date('Y-m-d H:i:s') . " - Attempt $attempt - " . print_r($status_data, true) . "\n", FILE_APPEND);

        if ($status_data["status"] === "200" && isset($status_data["data"]["list"])) {
            foreach ($status_data["data"]["list"] as $item) {
                if ($item["service_name"] === "DATA" && $item["data_name"] === "RELAY") {
                    $is_irrigating = $item["monitor_data"] === "1";
                    if ($is_irrigating === $expected_state) {
                        return $is_irrigating;
                    }
                    break;
                }
            }
        }
        $attempt++;
        if ($attempt < $max_retries) sleep($retry_interval);
    }
    // 最後一次查詢
    $result = @file_get_contents($url);
    if ($result !== false) {
        $status_data = json_decode($result, true);
        if ($status_data["status"] === "200" && isset($status_data["data"]["list"])) {
            foreach ($status_data["data"]["list"] as $item) {
                if ($item["service_name"] === "DATA" && $item["data_name"] === "RELAY") {
                    return $item["monitor_data"] === "1";
                }
            }
        }
    }
    return null;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    echo json_encode(['status' => 'error', 'message' => '僅支援 POST 請求']);
    exit;
}

$device_no = $_POST['deviceId'] ?? null;
$command = $_POST['command'] ?? 'stop';
if (!$device_no) {
    echo json_encode(['status' => 'error', 'message' => '缺少設備號']);
    exit;
}

$app_id = 1076;
$app_key = "hzH9N7UPiMjjJwdxPsDhJNonRxFeCypf";
$device_name = "Device_" . substr(md5(uniqid()), 0, 8);

$token_response = get_token($app_id, $app_key);
if (!$token_response || $token_response["status"] !== "200") {
    echo json_encode(['status' => 'error', 'message' => '無法取得 token', 'details' => $token_response]);
    exit;
}
$token = $token_response["data"]["token"];

$bind_result = bind_device($token, $device_no, $device_name);
if (!$bind_result || !in_array($bind_result["status"], ["200", "1011"])) {
    echo json_encode(['status' => 'error', 'message' => '設備綁定失敗', 'details' => $bind_result]);
    exit;
}

$monitor_data = ($command === 'start') ? 1 : 0;
$control_result = control_device($token, $device_no, "DATA", "RELAY", $monitor_data);
file_put_contents('control_log.txt', date('Y-m-d H:i:s') . " - " . print_r($control_result, true) . "\n", FILE_APPEND);

if ($control_result && $control_result["status"] === "200") {
    $expected_state = ($command === 'start');
    $is_irrigating = get_device_status($token, $device_no, $expected_state);
    // 如果無法獲取狀態，假設控制成功
    $is_irrigating = $is_irrigating ?? $expected_state;

    echo json_encode([
        'status' => 'success',
        'message' => "設備 {$device_no} 已" . ($command === 'start' ? '開始灌溉' : '停止灌溉'),
        'irrigating' => $is_irrigating
    ]);
} else {
    echo json_encode([
        'status' => 'error',
        'message' => '控制失敗',
        'details' => $control_result
    ]);
}

ob_end_flush();
?>