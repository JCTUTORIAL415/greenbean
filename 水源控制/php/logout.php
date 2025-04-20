<?php
session_start();
session_destroy();

// 使用 HTTP 重定向到 login.html
header('Location: /login.html'); // 假設 login.html 在根目錄
exit;
?>