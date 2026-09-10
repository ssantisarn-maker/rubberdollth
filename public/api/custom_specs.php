<?php
/**
 * RUBBER DOLL THAILAND - Custom Doll Specifications API (Groups + Items + Media + Cache Sync)
 */
error_reporting(E_ALL);
ini_set('display_errors', 0);

require_once __DIR__ . '/config.php';

$method = $_SERVER['REQUEST_METHOD'];
$pdo = getDbConnection();
$jsonCacheFile = __DIR__ . '/custom_specs_cache.json';

// Default initial seed data (5 groups + choices)
$defaultSpecs = [
    'groups' => [
        ['id' => 'wig', 'name' => 'วิกผม', 'icon' => '💇‍♀️', 'order_index' => 1, 'is_active' => 1],
        ['id' => 'eyes', 'name' => 'สีตา', 'icon' => '👁️', 'order_index' => 2, 'is_active' => 1],
        ['id' => 'breast', 'name' => 'ขนาดหน้าอก', 'icon' => '🍈', 'order_index' => 3, 'is_active' => 1],
        ['id' => 'nails', 'name' => 'สีเล็บ', 'icon' => '💅', 'order_index' => 4, 'is_active' => 1],
        ['id' => 'skin', 'name' => 'สีผิว', 'icon' => '🧴', 'order_index' => 5, 'is_active' => 1]
    ],
    'items' => [
        // วิกผม
        ['id' => 'wig_1', 'group_id' => 'wig', 'name' => 'ผมยาวลอน สีดำธรรมชาติ', 'price' => 0, 'image' => '', 'description' => 'วิกผมสัมผัสนุ่มลื่น สไตล์หวานละมุน', 'is_default' => 1, 'is_active' => 1, 'order_index' => 1],
        ['id' => 'wig_2', 'group_id' => 'wig', 'name' => 'ผมยาวตรง สีน้ำตาลคาราเมล', 'price' => 0, 'image' => '', 'description' => 'ทรงตรงสลวย เรียบหรูดูแพง', 'is_default' => 0, 'is_active' => 1, 'order_index' => 2],
        ['id' => 'wig_3', 'group_id' => 'wig', 'name' => 'ผมสั้นบ๊อบ สีบลอนด์ทองสว่าง', 'price' => 0, 'image' => '', 'description' => 'ลุคคิวท์ สดใสน่ารักสไตล์อนิเมะ', 'is_default' => 0, 'is_active' => 1, 'order_index' => 3],
        ['id' => 'wig_4', 'group_id' => 'wig', 'name' => 'วิกผมเกรดพรีเมียมทนความร้อนสูงพิเศษ', 'price' => 800, 'image' => '', 'description' => 'ใยสังเคราะห์พิเศษ หนีบไดร์ดัดลอนได้อิสระ', 'is_default' => 0, 'is_active' => 1, 'order_index' => 4],

        // สีตา
        ['id' => 'eyes_1', 'group_id' => 'eyes', 'name' => 'น้ำตาลธรรมชาติ (Natural Brown)', 'price' => 0, 'image' => '', 'description' => 'แววตาอบอุ่น มีมิติเสมือนจริง', 'is_default' => 1, 'is_active' => 1, 'order_index' => 1],
        ['id' => 'eyes_2', 'group_id' => 'eyes', 'name' => 'ฟ้าคริสตัล (Ocean Crystal Blue)', 'price' => 0, 'image' => '', 'description' => 'ตาสีฟ้าประกาย สไตล์สาวลูกครึ่งยุโรป', 'is_default' => 0, 'is_active' => 1, 'order_index' => 2],
        ['id' => 'eyes_3', 'group_id' => 'eyes', 'name' => 'เขียวมรกต (Emerald Green)', 'price' => 0, 'image' => '', 'description' => 'แววตาเซ็กซี่ มีเสน่ห์น่าค้นหา', 'is_default' => 0, 'is_active' => 1, 'order_index' => 3],
        ['id' => 'eyes_4', 'group_id' => 'eyes', 'name' => 'ม่วงอนิเมะ (Anime Violet Purple)', 'price' => 0, 'image' => '', 'description' => 'สีตาโทนพิเศษสำหรับสายคอสเพลย์/อนิเมะ', 'is_default' => 0, 'is_active' => 1, 'order_index' => 4],
        ['id' => 'eyes_5', 'group_id' => 'eyes', 'name' => 'ตาแก้วอะคริลิกขยับมุมมอง 3D', 'price' => 1500, 'image' => '', 'description' => 'ดวงตาเสมือนมองตามผู้ใช้ มีชีวิตชีวาขั้นสูงสุด', 'is_default' => 0, 'is_active' => 1, 'order_index' => 5],

        // ขนาดหน้าอก
        ['id' => 'breast_1', 'group_id' => 'breast', 'name' => 'คัพ C มาตรฐาน สัมผัสธรรมชาติ', 'price' => 0, 'image' => '', 'description' => 'ขนาดสมส่วน เหมาะกับทุกสรีระ', 'is_default' => 1, 'is_active' => 1, 'order_index' => 1],
        ['id' => 'breast_2', 'group_id' => 'breast', 'name' => 'คัพ D สัมผัสนุ่มยืดหยุ่นพิเศษ', 'price' => 1200, 'image' => '', 'description' => 'ขนาดกำลังดี นุ่มเด้งเป็นธรรมชาติ', 'is_default' => 0, 'is_active' => 1, 'order_index' => 2],
        ['id' => 'breast_3', 'group_id' => 'breast', 'name' => 'คัพ E เสริมซิลิโคนเหลวสัมผัสเด้ง', 'price' => 2500, 'image' => '', 'description' => 'หน้าอกไซส์ใหญ่ นุ่มยวบเหมือนคนจริง 100%', 'is_default' => 0, 'is_active' => 1, 'order_index' => 3],
        ['id' => 'breast_4', 'group_id' => 'breast', 'name' => 'คัพ G บิ๊กไซส์ อกตูมพรีเมียม', 'price' => 3500, 'image' => '', 'description' => 'อกใหญ่พิเศษ สวยเด่นตระการตา', 'is_default' => 0, 'is_active' => 1, 'order_index' => 4],

        // สีเล็บ
        ['id' => 'nails_1', 'group_id' => 'nails', 'name' => 'เล็บใสธรรมชาติ (French Natural)', 'price' => 0, 'image' => '', 'description' => 'เคลือบเงาสุขภาพดี ดูสะอาดสะอ้าน', 'is_default' => 1, 'is_active' => 1, 'order_index' => 1],
        ['id' => 'nails_2', 'group_id' => 'nails', 'name' => 'แดงไวน์เชอร์รี่ (Cherry Wine Red)', 'price' => 0, 'image' => '', 'description' => 'เฉดสีแดงลักชัวรี เพิ่มเสน่ห์เย้ายวน', 'is_default' => 0, 'is_active' => 1, 'order_index' => 2],
        ['id' => 'nails_3', 'group_id' => 'nails', 'name' => 'ชมพูนู้ดพาสเทล (Soft Pink Nude)', 'price' => 0, 'image' => '', 'description' => 'สไตล์คุณหนู หวานน่ารัก', 'is_default' => 0, 'is_active' => 1, 'order_index' => 3],
        ['id' => 'nails_4', 'group_id' => 'nails', 'name' => 'เพ้นท์เล็บเจล 3D สไตล์ญี่ปุ่น', 'price' => 500, 'image' => '', 'description' => 'ติดลวดลายสวยงาม ทนทานไม่หลุดลอก', 'is_default' => 0, 'is_active' => 1, 'order_index' => 4],

        // สีผิว
        ['id' => 'skin_1', 'group_id' => 'skin', 'name' => 'ผิวขาวเหลืองธรรมชาติ (Natural Asian)', 'price' => 0, 'image' => '', 'description' => 'โทนยอดนิยม สัมผัสเนียนละมุน', 'is_default' => 1, 'is_active' => 1, 'order_index' => 1],
        ['id' => 'skin_2', 'group_id' => 'skin', 'name' => 'ผิวขาวโอโม่ (Snow Pale White)', 'price' => 0, 'image' => '', 'description' => 'ผิวขาวใสออร่า ดุจหิมะบริสุทธิ์', 'is_default' => 0, 'is_active' => 1, 'order_index' => 2],
        ['id' => 'skin_3', 'group_id' => 'skin', 'name' => 'ผิวสีน้ำผึ้ง/สองสี (Warm Honey Tan)', 'price' => 0, 'image' => '', 'description' => 'โทนสุขภาพดี ผิวเนียนคมเข้ม', 'is_default' => 0, 'is_active' => 1, 'order_index' => 3],
        ['id' => 'skin_4', 'group_id' => 'skin', 'name' => 'ผิวสีแทนเข้ม (Golden Bronze Tan)', 'price' => 0, 'image' => '', 'description' => 'สไตล์สายฝอ สวยคมเซ็กซี่', 'is_default' => 0, 'is_active' => 1, 'order_index' => 4]
    ]
];

// Ensure tables exist
function ensureSpecTables($pdo, $defaultSpecs, $jsonCacheFile) {
    if (!$pdo) return;
    try {
        $pdo->exec("CREATE TABLE IF NOT EXISTS custom_spec_groups (
            id VARCHAR(50) PRIMARY KEY,
            name VARCHAR(255) NOT NULL,
            icon VARCHAR(50) DEFAULT '',
            order_index INT DEFAULT 0,
            is_active TINYINT(1) DEFAULT 1,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;");

        $pdo->exec("CREATE TABLE IF NOT EXISTS custom_spec_items (
            id VARCHAR(50) PRIMARY KEY,
            group_id VARCHAR(50) NOT NULL,
            name VARCHAR(255) NOT NULL,
            price DECIMAL(10,2) NOT NULL DEFAULT 0.00,
            image VARCHAR(500) DEFAULT '',
            description VARCHAR(500) DEFAULT '',
            is_default TINYINT(1) DEFAULT 0,
            is_active TINYINT(1) DEFAULT 1,
            order_index INT DEFAULT 0,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            INDEX idx_group (group_id)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;");

        // Seed if empty
        $chk = $pdo->query("SELECT COUNT(*) FROM custom_spec_groups")->fetchColumn();
        if ($chk == 0) {
            $data = $defaultSpecs;
            if (file_exists($jsonCacheFile)) {
                $cached = json_decode(file_get_contents($jsonCacheFile), true);
                if (!empty($cached['groups'])) {
                    $data = $cached;
                }
            }

            // Insert groups
            $stmtG = $pdo->prepare("INSERT INTO custom_spec_groups (id, name, icon, order_index, is_active) VALUES (:id, :name, :icon, :order_index, :is_active)");
            foreach ($data['groups'] as $g) {
                $stmtG->execute([
                    'id' => $g['id'],
                    'name' => $g['name'],
                    'icon' => $g['icon'] ?? '',
                    'order_index' => (int)($g['order_index'] ?? 0),
                    'is_active' => isset($g['is_active']) ? (int)$g['is_active'] : 1
                ]);
            }

            // Insert items
            $stmtI = $pdo->prepare("INSERT INTO custom_spec_items (id, group_id, name, price, image, description, is_default, is_active, order_index) VALUES (:id, :group_id, :name, :price, :image, :description, :is_default, :is_active, :order_index)");
            foreach ($data['items'] as $item) {
                $stmtI->execute([
                    'id' => $item['id'],
                    'group_id' => $item['group_id'],
                    'name' => $item['name'],
                    'price' => (float)($item['price'] ?? 0),
                    'image' => $item['image'] ?? '',
                    'description' => $item['description'] ?? '',
                    'is_default' => isset($item['is_default']) ? (int)$item['is_default'] : 0,
                    'is_active' => isset($item['is_active']) ? (int)$item['is_active'] : 1,
                    'order_index' => (int)($item['order_index'] ?? 0)
                ]);
            }
        }
    } catch (Exception $e) {}
}

ensureSpecTables($pdo, $defaultSpecs, $jsonCacheFile);

function syncSpecsCache($pdo, $jsonCacheFile) {
    if (!$pdo) return null;
    try {
        $groups = $pdo->query("SELECT * FROM custom_spec_groups ORDER BY order_index ASC, id ASC")->fetchAll(PDO::FETCH_ASSOC);
        $items = $pdo->query("SELECT * FROM custom_spec_items ORDER BY order_index ASC, id ASC")->fetchAll(PDO::FETCH_ASSOC);

        $data = [
            'groups' => array_map(function($g) {
                return [
                    'id' => $g['id'],
                    'name' => $g['name'],
                    'icon' => $g['icon'] ?? '',
                    'order_index' => (int)$g['order_index'],
                    'is_active' => (int)$g['is_active']
                ];
            }, $groups),
            'items' => array_map(function($i) {
                return [
                    'id' => $i['id'],
                    'group_id' => $i['group_id'],
                    'name' => $i['name'],
                    'price' => (float)$i['price'],
                    'image' => $i['image'] ?? '',
                    'description' => $i['description'] ?? '',
                    'is_default' => (int)$i['is_default'],
                    'is_active' => (int)$i['is_active'],
                    'order_index' => (int)$i['order_index']
                ];
            }, $items)
        ];

        file_put_contents($jsonCacheFile, json_encode($data, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT));
        return $data;
    } catch (Exception $e) {}
    return null;
}

// GET: Return groups and items
if ($method === 'GET') {
    $includeAll = isset($_GET['all']) && $_GET['all'] === '1';

    if ($pdo) {
        try {
            $gQuery = $includeAll 
                ? "SELECT * FROM custom_spec_groups ORDER BY order_index ASC, id ASC" 
                : "SELECT * FROM custom_spec_groups WHERE is_active = 1 ORDER BY order_index ASC, id ASC";
            $groups = $pdo->query($gQuery)->fetchAll(PDO::FETCH_ASSOC);

            $iQuery = $includeAll 
                ? "SELECT * FROM custom_spec_items ORDER BY order_index ASC, id ASC" 
                : "SELECT * FROM custom_spec_items WHERE is_active = 1 ORDER BY order_index ASC, id ASC";
            $items = $pdo->query($iQuery)->fetchAll(PDO::FETCH_ASSOC);

            $res = [
                'groups' => array_map(function($g) {
                    return [
                        'id' => $g['id'],
                        'name' => $g['name'],
                        'icon' => $g['icon'] ?? '',
                        'order_index' => (int)$g['order_index'],
                        'is_active' => (int)$g['is_active']
                    ];
                }, $groups),
                'items' => array_map(function($i) {
                    return [
                        'id' => $i['id'],
                        'group_id' => $i['group_id'],
                        'name' => $i['name'],
                        'price' => (float)$i['price'],
                        'image' => $i['image'] ?? '',
                        'description' => $i['description'] ?? '',
                        'is_default' => (int)$i['is_default'],
                        'is_active' => (int)$i['is_active'],
                        'order_index' => (int)$i['order_index']
                    ];
                }, $items)
            ];

            sendResponse(['success' => true, 'data' => $res, 'source' => 'mysql']);
        } catch (Exception $e) {}
    }

    if (file_exists($jsonCacheFile)) {
        $cached = json_decode(file_get_contents($jsonCacheFile), true) ?: $defaultSpecs;
        if (!$includeAll) {
            $activeGIds = [];
            $cached['groups'] = array_values(array_filter($cached['groups'] ?? [], function($g) use (&$activeGIds) {
                $act = !isset($g['is_active']) || $g['is_active'] == 1;
                if ($act) $activeGIds[] = $g['id'];
                return $act;
            }));
            $cached['items'] = array_values(array_filter($cached['items'] ?? [], function($i) use ($activeGIds) {
                return in_array($i['group_id'], $activeGIds) && (!isset($i['is_active']) || $i['is_active'] == 1);
            }));
        }
        sendResponse(['success' => true, 'data' => $cached, 'source' => 'cache']);
    } else {
        // Fallback default
        sendResponse(['success' => true, 'data' => $defaultSpecs, 'source' => 'default']);
    }
}

// POST or PUT: Save Group or Item
if ($method === 'POST' || $method === 'PUT') {
    checkAdminAuth();
    $rawInput = file_get_contents('php://input');
    $data = json_decode($rawInput, true) ?: $_POST;

    $action = $data['action'] ?? 'save_item';

    // 1. Action: Save Group
    if ($action === 'save_group') {
        $group = $data['group'] ?? $data;
        if (empty($group['name'])) sendError('กรุณาระบุชื่อหัวข้อสเปก');

        $id = !empty($group['id']) ? trim($group['id']) : ('group_' . time());
        $name = trim($group['name']);
        $icon = trim($group['icon'] ?? '');
        $orderIndex = (int)($group['order_index'] ?? 0);
        $isActive = isset($group['is_active']) ? (int)$group['is_active'] : 1;

        if ($pdo) {
            try {
                $stmt = $pdo->prepare("INSERT INTO custom_spec_groups (id, name, icon, order_index, is_active)
                    VALUES (:id, :name, :icon, :order_index, :is_active)
                    ON DUPLICATE KEY UPDATE name = VALUES(name), icon = VALUES(icon), order_index = VALUES(order_index), is_active = VALUES(is_active), updated_at = NOW()");
                $stmt->execute(['id' => $id, 'name' => $name, 'icon' => $icon, 'order_index' => $orderIndex, 'is_active' => $isActive]);
                $synced = syncSpecsCache($pdo, $jsonCacheFile);
                sendResponse(['success' => true, 'message' => 'บันทึกหัวข้อสเปกสำเร็จ', 'data' => $synced]);
            } catch (PDOException $e) {
                sendError('Database error: ' . $e->getMessage(), 500);
            }
        } else {
            // File cache fallback
            $cached = file_exists($jsonCacheFile) ? (json_decode(file_get_contents($jsonCacheFile), true) ?: $defaultSpecs) : $defaultSpecs;
            $found = false;
            foreach ($cached['groups'] as &$g) {
                if ($g['id'] === $id) {
                    $g['name'] = $name;
                    $g['icon'] = $icon;
                    $g['order_index'] = $orderIndex;
                    $g['is_active'] = $isActive;
                    $found = true;
                    break;
                }
            }
            if (!$found) {
                $cached['groups'][] = ['id' => $id, 'name' => $name, 'icon' => $icon, 'order_index' => $orderIndex, 'is_active' => $isActive];
            }
            file_put_contents($jsonCacheFile, json_encode($cached, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT));
            sendResponse(['success' => true, 'message' => 'บันทึกลง Cache สำเร็จ', 'data' => $cached]);
        }
    }

    // 2. Action: Delete Group
    if ($action === 'delete_group') {
        $id = trim($data['id'] ?? '');
        if (empty($id)) sendError('กรุณาระบุ ID หัวข้อที่ต้องการลบ');

        if ($pdo) {
            try {
                $stmt = $pdo->prepare("DELETE FROM custom_spec_groups WHERE id = :id");
                $stmt->execute(['id' => $id]);
                // Delete associated items as well
                $stmt2 = $pdo->prepare("DELETE FROM custom_spec_items WHERE group_id = :id");
                $stmt2->execute(['id' => $id]);

                $synced = syncSpecsCache($pdo, $jsonCacheFile);
                sendResponse(['success' => true, 'message' => 'ลบหัวข้อสเปกสำเร็จ', 'data' => $synced]);
            } catch (PDOException $e) {
                sendError('Database error: ' . $e->getMessage(), 500);
            }
        } else {
            $cached = file_exists($jsonCacheFile) ? (json_decode(file_get_contents($jsonCacheFile), true) ?: $defaultSpecs) : $defaultSpecs;
            $cached['groups'] = array_values(array_filter($cached['groups'] ?? [], function($g) use ($id) { return $g['id'] !== $id; }));
            $cached['items'] = array_values(array_filter($cached['items'] ?? [], function($i) use ($id) { return $i['group_id'] !== $id; }));
            file_put_contents($jsonCacheFile, json_encode($cached, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT));
            sendResponse(['success' => true, 'message' => 'ลบจาก Cache สำเร็จ', 'data' => $cached]);
        }
    }

    // 3. Action: Save Item
    if ($action === 'save_item') {
        $item = $data['item'] ?? $data;
        if (empty($item['name'])) sendError('กรุณาระบุชื่อตัวเลือก');
        if (empty($item['group_id'])) sendError('กรุณาระบุหัวข้อสเปก');

        $id = !empty($item['id']) ? trim($item['id']) : ('spec_' . time() . '_' . bin2hex(random_bytes(2)));
        $groupId = trim($item['group_id']);
        $name = trim($item['name']);
        $price = (float)($item['price'] ?? 0);
        $image = trim($item['image'] ?? '');
        $description = trim($item['description'] ?? '');
        $isDefault = isset($item['is_default']) ? (int)$item['is_default'] : 0;
        $isActive = isset($item['is_active']) ? (int)$item['is_active'] : 1;
        $orderIndex = (int)($item['order_index'] ?? 0);

        if ($pdo) {
            try {
                // If setting as default, clear other defaults in the same group
                if ($isDefault === 1) {
                    $pdo->prepare("UPDATE custom_spec_items SET is_default = 0 WHERE group_id = :gid")->execute(['gid' => $groupId]);
                }

                $stmt = $pdo->prepare("INSERT INTO custom_spec_items (id, group_id, name, price, image, description, is_default, is_active, order_index)
                    VALUES (:id, :group_id, :name, :price, :image, :description, :is_default, :is_active, :order_index)
                    ON DUPLICATE KEY UPDATE group_id = VALUES(group_id), name = VALUES(name), price = VALUES(price), image = VALUES(image), description = VALUES(description), is_default = VALUES(is_default), is_active = VALUES(is_active), order_index = VALUES(order_index), updated_at = NOW()");
                $stmt->execute([
                    'id' => $id, 'group_id' => $groupId, 'name' => $name, 'price' => $price,
                    'image' => $image, 'description' => $description, 'is_default' => $isDefault,
                    'is_active' => $isActive, 'order_index' => $orderIndex
                ]);

                $synced = syncSpecsCache($pdo, $jsonCacheFile);
                sendResponse(['success' => true, 'message' => 'บันทึกตัวเลือกสเปกสำเร็จ', 'data' => $synced]);
            } catch (PDOException $e) {
                sendError('Database error: ' . $e->getMessage(), 500);
            }
        } else {
            $cached = file_exists($jsonCacheFile) ? (json_decode(file_get_contents($jsonCacheFile), true) ?: $defaultSpecs) : $defaultSpecs;
            if ($isDefault === 1) {
                foreach ($cached['items'] as &$ci) {
                    if ($ci['group_id'] === $groupId) $ci['is_default'] = 0;
                }
            }
            $found = false;
            foreach ($cached['items'] as &$ci) {
                if ($ci['id'] === $id) {
                    $ci['group_id'] = $groupId;
                    $ci['name'] = $name;
                    $ci['price'] = $price;
                    $ci['image'] = $image;
                    $ci['description'] = $description;
                    $ci['is_default'] = $isDefault;
                    $ci['is_active'] = $isActive;
                    $ci['order_index'] = $orderIndex;
                    $found = true;
                    break;
                }
            }
            if (!$found) {
                $cached['items'][] = [
                    'id' => $id, 'group_id' => $groupId, 'name' => $name, 'price' => $price,
                    'image' => $image, 'description' => $description, 'is_default' => $isDefault,
                    'is_active' => $isActive, 'order_index' => $orderIndex
                ];
            }
            file_put_contents($jsonCacheFile, json_encode($cached, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT));
            sendResponse(['success' => true, 'message' => 'บันทึกลง Cache สำเร็จ', 'data' => $cached]);
        }
    }

    // 4. Action: Delete Item
    if ($action === 'delete_item') {
        $id = trim($data['id'] ?? '');
        if (empty($id)) sendError('กรุณาระบุ ID ตัวเลือกที่ต้องการลบ');

        if ($pdo) {
            try {
                $stmt = $pdo->prepare("DELETE FROM custom_spec_items WHERE id = :id");
                $stmt->execute(['id' => $id]);
                $synced = syncSpecsCache($pdo, $jsonCacheFile);
                sendResponse(['success' => true, 'message' => 'ลบตัวเลือกสเปกสำเร็จ', 'data' => $synced]);
            } catch (PDOException $e) {
                sendError('Database error: ' . $e->getMessage(), 500);
            }
        } else {
            $cached = file_exists($jsonCacheFile) ? (json_decode(file_get_contents($jsonCacheFile), true) ?: $defaultSpecs) : $defaultSpecs;
            $cached['items'] = array_values(array_filter($cached['items'] ?? [], function($i) use ($id) { return $i['id'] !== $id; }));
            file_put_contents($jsonCacheFile, json_encode($cached, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT));
            sendResponse(['success' => true, 'message' => 'ลบจาก Cache สำเร็จ', 'data' => $cached]);
        }
    }

    // 5. Action: Reorder Items
    if ($action === 'reorder_items') {
        $itemIds = $data['item_ids'] ?? [];
        if (!is_array($itemIds) || empty($itemIds)) {
            sendError('กรุณาระบุรายการที่ต้องการจัดลำดับ');
        }

        if ($pdo) {
            try {
                $stmt = $pdo->prepare("UPDATE custom_spec_items SET order_index = :idx, updated_at = NOW() WHERE id = :id");
                foreach ($itemIds as $idx => $itemId) {
                    $stmt->execute(['idx' => $idx + 1, 'id' => $itemId]);
                }
                $synced = syncSpecsCache($pdo, $jsonCacheFile);
                sendResponse(['success' => true, 'message' => 'บันทึกลำดับเรียบร้อยแล้ว', 'data' => $synced]);
            } catch (PDOException $e) {
                sendError('Database error: ' . $e->getMessage(), 500);
            }
        } else {
            $cached = file_exists($jsonCacheFile) ? (json_decode(file_get_contents($jsonCacheFile), true) ?: $defaultSpecs) : $defaultSpecs;
            $orderMap = array_flip($itemIds);
            foreach ($cached['items'] as &$ci) {
                if (isset($orderMap[$ci['id']])) {
                    $ci['order_index'] = $orderMap[$ci['id']] + 1;
                }
            }
            file_put_contents($jsonCacheFile, json_encode($cached, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT));
            sendResponse(['success' => true, 'message' => 'บันทึกลำดับลง Cache สำเร็จ', 'data' => $cached]);
        }
    }

    // 6. Action: Reorder Groups
    if ($action === 'reorder_groups') {
        $groupIds = $data['group_ids'] ?? [];
        if (!is_array($groupIds) || empty($groupIds)) {
            sendError('กรุณาระบุหัวข้อที่ต้องการจัดลำดับ');
        }

        if ($pdo) {
            try {
                $stmt = $pdo->prepare("UPDATE custom_spec_groups SET order_index = :idx, updated_at = NOW() WHERE id = :id");
                foreach ($groupIds as $idx => $gid) {
                    $stmt->execute(['idx' => $idx + 1, 'id' => $gid]);
                }
                $synced = syncSpecsCache($pdo, $jsonCacheFile);
                sendResponse(['success' => true, 'message' => 'บันทึกลำดับหัวข้อเรียบร้อยแล้ว', 'data' => $synced]);
            } catch (PDOException $e) {
                sendError('Database error: ' . $e->getMessage(), 500);
            }
        } else {
            $cached = file_exists($jsonCacheFile) ? (json_decode(file_get_contents($jsonCacheFile), true) ?: $defaultSpecs) : $defaultSpecs;
            $orderMap = array_flip($groupIds);
            foreach ($cached['groups'] as &$cg) {
                if (isset($orderMap[$cg['id']])) {
                    $cg['order_index'] = $orderMap[$cg['id']] + 1;
                }
            }
            file_put_contents($jsonCacheFile, json_encode($cached, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT));
            sendResponse(['success' => true, 'message' => 'บันทึกลำดับหัวข้อลง Cache สำเร็จ', 'data' => $cached]);
        }
    }
}

// DELETE: Delete Item or Group
if ($method === 'DELETE') {
    checkAdminAuth();
    $rawInput = file_get_contents('php://input');
    $data = json_decode($rawInput, true) ?: $_GET;

    $type = $data['type'] ?? 'item';
    $id = trim($data['id'] ?? '');

    if (empty($id)) sendError('กรุณาระบุ ID');

    if ($type === 'group') {
        if ($pdo) {
            try {
                $pdo->prepare("DELETE FROM custom_spec_groups WHERE id = :id")->execute(['id' => $id]);
                $pdo->prepare("DELETE FROM custom_spec_items WHERE group_id = :id")->execute(['id' => $id]);
                $synced = syncSpecsCache($pdo, $jsonCacheFile);
                sendResponse(['success' => true, 'message' => 'ลบหัวข้อสเปกสำเร็จ', 'data' => $synced]);
            } catch (PDOException $e) { sendError($e->getMessage(), 500); }
        }
    } else {
        if ($pdo) {
            try {
                $pdo->prepare("DELETE FROM custom_spec_items WHERE id = :id")->execute(['id' => $id]);
                $synced = syncSpecsCache($pdo, $jsonCacheFile);
                sendResponse(['success' => true, 'message' => 'ลบตัวเลือกสเปกสำเร็จ', 'data' => $synced]);
            } catch (PDOException $e) { sendError($e->getMessage(), 500); }
        }
    }
}
