<?php
/**
 * RUBBER DOLL THAILAND - Backend API Database Configuration
 */

error_reporting(E_ALL);
ini_set('display_errors', 0);

header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With');
header('Content-Type: application/json; charset=utf-8');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Database Credentials (Update these with your Hostinger MySQL details)
define('DB_HOST', 'localhost');
define('DB_NAME', getenv('RBD_DB_NAME') ?: 'u629748826_rbd');
define('DB_USER', getenv('RBD_DB_USER') ?: 'u629748826_admin');
define('DB_PASS', getenv('RBD_DB_PASS') ?: '');

function getDbConnection() {
    static $pdo = null;
    if ($pdo !== null) {
        return $pdo;
    }

    try {
        $dsn = "mysql:host=" . DB_HOST . ";dbname=" . DB_NAME . ";charset=utf8mb4";
        $options = [
            PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            PDO::ATTR_EMULATE_PREPARES   => false,
        ];
        $pdo = new PDO($dsn, DB_USER, DB_PASS, $options);
        return $pdo;
    } catch (PDOException $e) {
        return null;
    }
}

function sendResponse($data, $status = 200) {
    http_response_code($status);
    echo json_encode($data, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);
    exit();
}

function sendError($message, $status = 400) {
    http_response_code($status);
    echo json_encode(['success' => false, 'error' => $message], JSON_UNESCAPED_UNICODE);
    exit();
}

// Session Auth helper
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

function checkAdminAuth() {
    $headers = getallheaders();
    $authHeader = $headers['Authorization'] ?? $headers['authorization'] ?? '';
    
    if (!empty($_SESSION['admin_logged_in']) && $_SESSION['admin_logged_in'] === true) {
        return true;
    }
    
    if (!empty($authHeader) && strpos($authHeader, 'Bearer ') === 0) {
        $token = substr($authHeader, 7);
        if (!empty($_SESSION['auth_token']) && $token === $_SESSION['auth_token']) {
            return true;
        }
        // Master fallback token for API calls
        if ($token === 'RBD_ADMIN_SECRET_KEY_2026') {
            return true;
        }
    }
    
    sendError('Unauthorized: กรุณาเข้าสู่ระบบก่อนใช้งาน', 401);
}
