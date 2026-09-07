<?php
/**
 * RUBBER DOLL THAILAND - Custom Doll Options API (CRUD + Media + Cache Sync)
 */
error_reporting(E_ALL);
ini_set('display_errors', 0);

require_once __DIR__ . '/config.php';

$method = $_SERVER['REQUEST_METHOD'];
$pdo = getDbConnection();
$jsonCacheFile = __DIR__ . '/options_cache.json';

// 1. Ensure Table Exists
function ensureOptionsTable($pdo, $jsonCacheFile) {
    if (!$pdo) return;
    try {
        $pdo->exec("CREATE TABLE IF NOT EXISTS custom_options (
            id VARCHAR(50) PRIMARY KEY,
            name VARCHAR(255) NOT NULL,
            price DECIMAL(10,2) NOT NULL DEFAULT 0.00,
            condition_text VARCHAR(255) DEFAULT '',
            details_text TEXT DEFAULT '',
            image VARCHAR(500) DEFAULT '',
            video_url VARCHAR(500) DEFAULT '',
            target_material VARCHAR(50) DEFAULT 'all',
            is_active TINYINT(1) DEFAULT 1,
            order_index INT DEFAULT 0,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;");

        // Check if empty, seed from cache
        $chk = $pdo->query("SELECT COUNT(*) FROM custom_options")->fetchColumn();
        if ($chk == 0 && file_exists($jsonCacheFile)) {
            $cached = json_decode(file_get_contents($jsonCacheFile), true);
            if (is_array($cached)) {
                $ins = $pdo->prepare("INSERT INTO custom_options (id, name, price, condition_text, details_text, image, video_url, target_material, is_active, order_index) VALUES (:id, :name, :price, :condition_text, :details_text, :image, :video_url, :target_material, :is_active, :order_index)");
                foreach ($cached as $item) {
                    $ins->execute([
                        'id' => $item['id'] ?? ('opt_' . uniqid()),
                        'name' => $item['name'] ?? '',
                        'price' => (float)($item['price'] ?? 0),
                        'condition_text' => $item['condition'] ?? ($item['condition_text'] ?? ''),
                        'details_text' => $item['details'] ?? ($item['details_text'] ?? ''),
                        'image' => $item['image'] ?? '',
                        'video_url' => $item['video_url'] ?? '',
                        'target_material' => $item['target_material'] ?? 'all',
                        'is_active' => isset($item['is_active']) ? (int)$item['is_active'] : 1,
                        'order_index' => (int)($item['order_index'] ?? 0)
                    ]);
                }
            }
        }
    } catch (Exception $e) {}
}

ensureOptionsTable($pdo, $jsonCacheFile);

function syncOptionsCache($pdo, $jsonCacheFile) {
    if (!$pdo) return null;
    try {
        $stmt = $pdo->query("SELECT * FROM custom_options ORDER BY order_index ASC, id ASC");
        $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);
        if ($rows !== false) {
            $formatted = array_map(function($r) {
                return [
                    'id' => $r['id'],
                    'name' => $r['name'],
                    'price' => (float)$r['price'],
                    'condition' => $r['condition_text'] ?? '',
                    'details' => $r['details_text'] ?? '',
                    'image' => $r['image'] ?? '',
                    'video_url' => $r['video_url'] ?? '',
                    'target_material' => $r['target_material'] ?? 'all',
                    'is_active' => (int)$r['is_active'],
                    'order_index' => (int)$r['order_index']
                ];
            }, $rows);

            file_put_contents($jsonCacheFile, json_encode($formatted, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT));
            return $formatted;
        }
    } catch (Exception $e) {}
    return null;
}

// GET: Fetch Options
if ($method === 'GET') {
    $includeAll = isset($_GET['all']) && $_GET['all'] === '1';

    if ($pdo) {
        try {
            $query = $includeAll 
                ? "SELECT * FROM custom_options ORDER BY order_index ASC, id ASC" 
                : "SELECT * FROM custom_options WHERE is_active = 1 ORDER BY order_index ASC, id ASC";
            $stmt = $pdo->query($query);
            $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);
            if (!empty($rows)) {
                $formatted = array_map(function($r) {
                    return [
                        'id' => $r['id'],
                        'name' => $r['name'],
                        'price' => (float)$r['price'],
                        'condition' => $r['condition_text'] ?? '',
                        'details' => $r['details_text'] ?? '',
                        'image' => $r['image'] ?? '',
                        'video_url' => $r['video_url'] ?? '',
                        'target_material' => $r['target_material'] ?? 'all',
                        'is_active' => (int)$r['is_active'],
                        'order_index' => (int)$r['order_index']
                    ];
                }, $rows);
                sendResponse(['success' => true, 'options' => $formatted, 'total' => count($formatted), 'source' => 'mysql']);
            }
        } catch (Exception $e) {}
    }

    if (file_exists($jsonCacheFile)) {
        $cached = json_decode(file_get_contents($jsonCacheFile), true) ?: [];
        if (!$includeAll) {
            $cached = array_values(array_filter($cached, function($c) {
                return !isset($c['is_active']) || $c['is_active'] == 1;
            }));
        }
        sendResponse(['success' => true, 'options' => $cached, 'total' => count($cached), 'source' => 'cache']);
    } else {
        sendError('No options available', 404);
    }
}

// POST or PUT: Create or Edit Option
if ($method === 'POST' || $method === 'PUT') {
    checkAdminAuth();
    $rawInput = file_get_contents('php://input');
    $data = json_decode($rawInput, true) ?: $_POST;

    if (empty($data['name'])) {
        sendError('กรุณาระบุชื่อออฟชั่น');
    }

    $id = !empty($data['id']) ? trim($data['id']) : ('opt_' . time() . '_' . bin2hex(random_bytes(2)));
    $name = trim($data['name']);
    $price = (float)($data['price'] ?? 0);
    $condition = trim($data['condition'] ?? ($data['condition_text'] ?? ''));
    $details = trim($data['details'] ?? ($data['details_text'] ?? ''));
    $image = trim($data['image'] ?? '');
    $videoUrl = trim($data['video_url'] ?? '');
    $targetMaterial = trim($data['target_material'] ?? 'all');
    $isActive = isset($data['is_active']) ? (int)$data['is_active'] : 1;
    $orderIndex = (int)($data['order_index'] ?? 0);

    if ($pdo) {
        try {
            $stmt = $pdo->prepare("INSERT INTO custom_options (id, name, price, condition_text, details_text, image, video_url, target_material, is_active, order_index)
                VALUES (:id, :name, :price, :condition_text, :details_text, :image, :video_url, :target_material, :is_active, :order_index)
                ON DUPLICATE KEY UPDATE
                    name = VALUES(name),
                    price = VALUES(price),
                    condition_text = VALUES(condition_text),
                    details_text = VALUES(details_text),
                    image = VALUES(image),
                    video_url = VALUES(video_url),
                    target_material = VALUES(target_material),
                    is_active = VALUES(is_active),
                    order_index = VALUES(order_index),
                    updated_at = NOW()");

            $stmt->execute([
                'id' => $id,
                'name' => $name,
                'price' => $price,
                'condition_text' => $condition,
                'details_text' => $details,
                'image' => $image,
                'video_url' => $videoUrl,
                'target_material' => $targetMaterial,
                'is_active' => $isActive,
                'order_index' => $orderIndex
            ]);

            $synced = syncOptionsCache($pdo, $jsonCacheFile);
            sendResponse(['success' => true, 'message' => 'บันทึกออฟชั่นสำเร็จ', 'id' => $id, 'options' => $synced]);
        } catch (PDOException $e) {
            sendError('Database error: ' . $e->getMessage(), 500);
        }
    } else {
        // Fallback file cache update
        $cached = file_exists($jsonCacheFile) ? (json_decode(file_get_contents($jsonCacheFile), true) ?: []) : [];
        $found = false;
        foreach ($cached as &$item) {
            if ($item['id'] === $id) {
                $item['name'] = $name;
                $item['price'] = $price;
                $item['condition'] = $condition;
                $item['details'] = $details;
                $item['image'] = $image;
                $item['video_url'] = $videoUrl;
                $item['target_material'] = $targetMaterial;
                $item['is_active'] = $isActive;
                $item['order_index'] = $orderIndex;
                $found = true;
                break;
            }
        }
        if (!$found) {
            $cached[] = [
                'id' => $id,
                'name' => $name,
                'price' => $price,
                'condition' => $condition,
                'details' => $details,
                'image' => $image,
                'video_url' => $videoUrl,
                'target_material' => $targetMaterial,
                'is_active' => $isActive,
                'order_index' => $orderIndex
            ];
        }
        file_put_contents($jsonCacheFile, json_encode($cached, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT));
        sendResponse(['success' => true, 'message' => 'บันทึกลง Cache สำเร็จ', 'id' => $id, 'options' => $cached]);
    }
}

// DELETE: Remove Option
if ($method === 'DELETE') {
    checkAdminAuth();
    $rawInput = file_get_contents('php://input');
    $data = json_decode($rawInput, true) ?: $_GET;
    $id = trim($data['id'] ?? '');

    if (empty($id)) {
        sendError('กรุณาระบุ ID ออฟชั่นที่ต้องการลบ');
    }

    if ($pdo) {
        try {
            $stmt = $pdo->prepare("DELETE FROM custom_options WHERE id = :id");
            $stmt->execute(['id' => $id]);
            $synced = syncOptionsCache($pdo, $jsonCacheFile);
            sendResponse(['success' => true, 'message' => 'ลบออฟชั่นเรียบร้อยแล้ว', 'options' => $synced]);
        } catch (PDOException $e) {
            sendError('Database error: ' . $e->getMessage(), 500);
        }
    } else {
        $cached = file_exists($jsonCacheFile) ? (json_decode(file_get_contents($jsonCacheFile), true) ?: []) : [];
        $cached = array_values(array_filter($cached, function($c) use ($id) {
            return $c['id'] !== $id;
        }));
        file_put_contents($jsonCacheFile, json_encode($cached, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT));
        sendResponse(['success' => true, 'message' => 'ลบจาก Cache สำเร็จ', 'options' => $cached]);
    }
}
