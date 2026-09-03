<?php
/**
 * RUBBER DOLL THAILAND - Category Management API
 * Quad-Layer Persistence: MySQL Table + site_settings Table + Server Disk JSON Cache + Client Auto-Sync
 */
error_reporting(E_ALL);
ini_set('display_errors', 0);

require_once __DIR__ . '/config.php';

$method = $_SERVER['REQUEST_METHOD'];
$pdo = getDbConnection();
$jsonCacheFile = __DIR__ . '/categories_cache.json';

$defaultCategories = [
    ['id' => 'all', 'label_th' => 'สินค้าทั้งหมด', 'label_en' => 'All Masterpieces', 'order_index' => 1],
    ['id' => 'ready', 'label_th' => 'สินค้าพร้อมส่ง (ไทย)', 'label_en' => 'Ready to Ship (TH)', 'order_index' => 2],
    ['id' => 'toys', 'label_th' => 'ของเล่นสำหรับผู้ใหญ่', 'label_en' => 'Adult Toys', 'order_index' => 3],
    ['id' => 'anime', 'label_th' => 'ตุ๊กตาซิลิโคน สาวสวยและอนิเมะ การ์ตูน', 'label_en' => 'Anime & Fantasy', 'order_index' => 4],
    ['id' => 'western', 'label_th' => 'ตุ๊กตาซิลิโคน สาวสวยหน้าตาแนวฝรั่ง / ยุโรป', 'label_en' => 'Western / European', 'order_index' => 5],
    ['id' => 'asian', 'label_th' => 'ตุ๊กตาซิลิโคน สาวสวยหน้าตาแนวเอเชีย', 'label_en' => 'Asian Aesthetics', 'order_index' => 6],
    ['id' => 'torso', 'label_th' => 'ตุ๊กตายางครึ่งตัว TORSO', 'label_en' => 'Torso & Half Body', 'order_index' => 7],
    ['id' => 'reviews', 'label_th' => 'รีวิวตุ๊กตายางจากลูกค้า', 'label_en' => 'Customer Reviews', 'order_index' => 8],
];

// Helper: Ensure MySQL Table & Seed
function ensureCategoriesTable($pdo, $defaultCategories, $jsonCacheFile) {
    if (!$pdo) return false;
    try {
        $pdo->exec("CREATE TABLE IF NOT EXISTS categories (
            id VARCHAR(50) PRIMARY KEY,
            label_th VARCHAR(255) NOT NULL,
            label_en VARCHAR(255) NOT NULL,
            order_index INT DEFAULT 99,
            is_active TINYINT(1) DEFAULT 1
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;");

        $count = (int)$pdo->query("SELECT COUNT(*) FROM categories")->fetchColumn();
        if ($count === 0) {
            $source = $defaultCategories;
            if (file_exists($jsonCacheFile)) {
                $cached = json_decode(file_get_contents($jsonCacheFile), true);
                if (is_array($cached) && count($cached) > 0) {
                    $source = $cached;
                }
            }
            $stmt = $pdo->prepare("INSERT INTO categories (id, label_th, label_en, order_index, is_active) VALUES (:id, :label_th, :label_en, :order_index, 1)");
            foreach ($source as $c) {
                $stmt->execute([
                    'id' => $c['id'],
                    'label_th' => $c['label_th'] ?? $c['label'] ?? $c['id'],
                    'label_en' => $c['label_en'] ?? $c['label_th'] ?? $c['id'],
                    'order_index' => (int)($c['order_index'] ?? 99)
                ]);
            }
        }
        return true;
    } catch (Exception $e) {
        return false;
    }
}

// Helper: Sync Cache File from MySQL
function syncCategoriesCache($pdo, $jsonCacheFile) {
    if (!$pdo) return null;
    try {
        $stmt = $pdo->query("SELECT * FROM categories WHERE is_active = 1 ORDER BY order_index ASC, id ASC");
        $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);
        if (!empty($rows)) {
            file_put_contents($jsonCacheFile, json_encode($rows, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT));
            return $rows;
        }
    } catch (Exception $e) {}
    return null;
}

// Helper: Read Cache File
function readCategoriesCache($jsonCacheFile, $defaultCategories) {
    if (file_exists($jsonCacheFile)) {
        $cached = json_decode(file_get_contents($jsonCacheFile), true);
        if (is_array($cached) && count($cached) > 0) {
            return $cached;
        }
    }
    return $defaultCategories;
}

// Helper: Write Cache File Directly
function writeCategoriesCache($jsonCacheFile, $data) {
    file_put_contents($jsonCacheFile, json_encode($data, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT));
}

// Ensure table on start
ensureCategoriesTable($pdo, $defaultCategories, $jsonCacheFile);

// ==========================================
// 1. GET: List All Categories
// ==========================================
if ($method === 'GET') {
    if ($pdo) {
        try {
            $stmt = $pdo->query("SELECT * FROM categories WHERE is_active = 1 ORDER BY order_index ASC, id ASC");
            $cats = $stmt->fetchAll(PDO::FETCH_ASSOC);
            if (!empty($cats)) {
                writeCategoriesCache($jsonCacheFile, $cats);
                sendResponse(['success' => true, 'categories' => $cats, 'source' => 'mysql']);
            }
        } catch (Exception $e) {}
    }

    $cached = readCategoriesCache($jsonCacheFile, $defaultCategories);
    sendResponse(['success' => true, 'categories' => $cached, 'source' => 'cache']);
}

// ==========================================
// 2. POST or PUT: Add, Edit, or Save Bulk Categories
// ==========================================
if ($method === 'POST' || $method === 'PUT') {
    checkAdminAuth();
    $rawInput = file_get_contents('php://input');
    $data = json_decode($rawInput, true) ?: $_POST;

    $allCats = [];

    // CASE A: Bulk array of categories provided
    if (isset($data['categories']) && is_array($data['categories']) && count($data['categories']) > 0) {
        $incoming = $data['categories'];
        
        if ($pdo) {
            try {
                $pdo->exec("CREATE TABLE IF NOT EXISTS categories (
                    id VARCHAR(50) PRIMARY KEY,
                    label_th VARCHAR(255) NOT NULL,
                    label_en VARCHAR(255) NOT NULL,
                    order_index INT DEFAULT 99,
                    is_active TINYINT(1) DEFAULT 1
                ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;");

                $pdo->exec("DELETE FROM categories");
                $stmt = $pdo->prepare("INSERT INTO categories (id, label_th, label_en, order_index, is_active) VALUES (:id, :label_th, :label_en, :order_index, 1)");
                $idx = 1;
                foreach ($incoming as $cat) {
                    $cId = trim($cat['id'] ?? '');
                    $cTh = trim($cat['label_th'] ?? $cat['label'] ?? '');
                    $cEn = trim($cat['label_en'] ?? $cTh);
                    if (empty($cId) || empty($cTh)) continue;
                    $stmt->execute([
                        'id' => $cId,
                        'label_th' => $cTh,
                        'label_en' => $cEn,
                        'order_index' => (int)($cat['order_index'] ?? $idx)
                    ]);
                    $idx++;
                }

                // Also backup in site_settings table
                try {
                    $pdo->exec("CREATE TABLE IF NOT EXISTS site_settings (setting_key VARCHAR(100) PRIMARY KEY, setting_value LONGTEXT NOT NULL) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;");
                    $setStmt = $pdo->prepare("INSERT INTO site_settings (setting_key, setting_value) VALUES ('custom_categories', :v) ON DUPLICATE KEY UPDATE setting_value = VALUES(setting_value)");
                    $setStmt->execute(['v' => json_encode($incoming, JSON_UNESCAPED_UNICODE)]);
                } catch (Exception $e) {}

                $synced = syncCategoriesCache($pdo, $jsonCacheFile);
                if ($synced) $allCats = $synced;
            } catch (Exception $e) {}
        }

        if (empty($allCats)) {
            writeCategoriesCache($jsonCacheFile, $incoming);
            $allCats = $incoming;
        }

        sendResponse([
            'success' => true,
            'message' => 'บันทึกรายการหมวดหมู่ทั้งหมดสำเร็จ',
            'categories' => $allCats
        ]);
    }

    // CASE B: Single category add / edit
    $id = trim($data['id'] ?? '');
    $label_th = trim($data['label_th'] ?? '');
    $label_en = trim($data['label_en'] ?? $label_th);
    $order_index = isset($data['order_index']) ? (int)$data['order_index'] : null;

    if (empty($id) || empty($label_th)) {
        sendError('กรุณากรอกรหัสหมวดหมู่ (id) และชื่อภาษาไทย (label_th)');
    }

    $id = strtolower(preg_replace('/[^a-zA-Z0-9_-]/', '-', $id));

    if ($pdo) {
        try {
            if ($order_index === null) {
                $checkStmt = $pdo->prepare("SELECT order_index FROM categories WHERE id = :id");
                $checkStmt->execute(['id' => $id]);
                $existingOrder = $checkStmt->fetchColumn();
                if ($existingOrder !== false) {
                    $order_index = (int)$existingOrder;
                } else {
                    $maxOrder = (int)$pdo->query("SELECT MAX(order_index) FROM categories")->fetchColumn();
                    $order_index = $maxOrder + 1;
                }
            }

            $stmt = $pdo->prepare("INSERT INTO categories (id, label_th, label_en, order_index, is_active) 
                                   VALUES (:id, :label_th, :label_en, :order_index, 1) 
                                   ON DUPLICATE KEY UPDATE label_th = :label_th, label_en = :label_en, order_index = :order_index, is_active = 1");
            $stmt->execute([
                'id' => $id,
                'label_th' => $label_th,
                'label_en' => $label_en,
                'order_index' => $order_index
            ]);

            $synced = syncCategoriesCache($pdo, $jsonCacheFile);
            if ($synced) $allCats = $synced;
        } catch (Exception $e) {}
    }

    if (empty($allCats)) {
        $current = readCategoriesCache($jsonCacheFile, $defaultCategories);
        $found = false;
        foreach ($current as &$item) {
            if ($item['id'] === $id) {
                $item['label_th'] = $label_th;
                $item['label_en'] = $label_en;
                if ($order_index !== null) $item['order_index'] = $order_index;
                $found = true;
                break;
            }
        }
        if (!$found) {
            $current[] = [
                'id' => $id,
                'label_th' => $label_th,
                'label_en' => $label_en,
                'order_index' => $order_index ?? (count($current) + 1)
            ];
        }
        writeCategoriesCache($jsonCacheFile, $current);
        $allCats = $current;
    }

    sendResponse([
        'success' => true,
        'message' => 'บันทึกหมวดหมู่เรียบร้อยแล้ว',
        'categories' => $allCats,
        'category' => ['id' => $id, 'label_th' => $label_th, 'label_en' => $label_en, 'order_index' => $order_index]
    ]);
}

// ==========================================
// 3. DELETE: Remove Category
// ==========================================
if ($method === 'DELETE') {
    checkAdminAuth();
    $id = trim($_GET['id'] ?? '');
    if (!$id) {
        sendError('กรุณาระบุรหัสหมวดหมู่ที่ต้องการลบ');
    }

    if ($id === 'all') {
        sendError('ไม่สามารถลบหมวดหมู่หลัก "สินค้าทั้งหมด" ได้');
    }

    $allCats = [];

    if ($pdo) {
        try {
            $stmt = $pdo->prepare("DELETE FROM categories WHERE id = :id");
            $stmt->execute(['id' => $id]);
            $synced = syncCategoriesCache($pdo, $jsonCacheFile);
            if ($synced) $allCats = $synced;
        } catch (Exception $e) {}
    }

    if (empty($allCats)) {
        $current = readCategoriesCache($jsonCacheFile, $defaultCategories);
        $filtered = array_values(array_filter($current, function($c) use ($id) {
            return $c['id'] !== $id;
        }));
        writeCategoriesCache($jsonCacheFile, $filtered);
        $allCats = $filtered;
    }

    sendResponse([
        'success' => true,
        'message' => "ลบหมวดหมู่ {$id} สำเร็จแล้ว",
        'categories' => $allCats
    ]);
}
