<?php
/**
 * RUBBER DOLL THAILAND - Global Site Settings API
 */
error_reporting(E_ALL);
ini_set('display_errors', 0);

require_once __DIR__ . '/config.php';

$method = $_SERVER['REQUEST_METHOD'];
$pdo = getDbConnection();
$jsonCacheFile = __DIR__ . '/settings_cache.json';

// GET: Return site settings
if ($method === 'GET') {
    if ($pdo) {
        try {
            $stmt = $pdo->query("SELECT setting_key, setting_value FROM site_settings");
            $rows = $stmt->fetchAll(PDO::FETCH_KEY_PAIR);
            if (!empty($rows)) {
                $settings = [];
                foreach ($rows as $k => $v) {
                    $decoded = json_decode($v, true);
                    $settings[$k] = (json_last_error() === JSON_ERROR_NONE) ? $decoded : $v;
                }
                sendResponse(['success' => true, 'settings' => $settings, 'source' => 'mysql']);
            }
        } catch (Exception $e) {}
    }

    if (file_exists($jsonCacheFile)) {
        $cached = json_decode(file_get_contents($jsonCacheFile), true);
        sendResponse(['success' => true, 'settings' => $cached, 'source' => 'cache']);
    } else {
        sendError('Settings unavailable', 404);
    }
}

// POST or PUT: Update site settings
if ($method === 'POST' || $method === 'PUT') {
    checkAdminAuth();
    $rawInput = file_get_contents('php://input');
    $data = json_decode($rawInput, true) ?: $_POST;

    if (empty($data) || !is_array($data)) {
        sendError('No settings data provided');
    }

    if ($pdo) {
        try {
            $pdo->exec("CREATE TABLE IF NOT EXISTS site_settings (
                setting_key VARCHAR(100) PRIMARY KEY,
                setting_value LONGTEXT NOT NULL,
                updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;");

            $stmt = $pdo->prepare("INSERT INTO site_settings (setting_key, setting_value) VALUES (:k, :v) ON DUPLICATE KEY UPDATE setting_value = VALUES(setting_value), updated_at = NOW()");

            foreach ($data as $k => $v) {
                $valStr = is_string($v) ? $v : json_encode($v, JSON_UNESCAPED_UNICODE);
                $stmt->execute(['k' => $k, 'v' => $valStr]);
            }

            // Sync cache
            file_put_contents($jsonCacheFile, json_encode($data, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT));
            sendResponse(['success' => true, 'message' => 'บันทึกการตั้งค่าเว็บไซต์สำเร็จ', 'settings' => $data]);
        } catch (PDOException $e) {
            sendError('Database error: ' . $e->getMessage(), 500);
        }
    } else {
        // Cache fallback update
        file_put_contents($jsonCacheFile, json_encode($data, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT));
        sendResponse(['success' => true, 'message' => 'บันทึกลง Cache สำเร็จ', 'settings' => $data]);
    }
}
