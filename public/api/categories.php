<?php
require_once __DIR__ . '/config.php';

$method = $_SERVER['REQUEST_METHOD'];
$pdo = getDbConnection();

if ($method === 'GET') {
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

    if ($pdo) {
        try {
            $stmt = $pdo->query("SELECT * FROM categories ORDER BY order_index ASC");
            $cats = $stmt->fetchAll();
            if (!empty($cats)) {
                sendResponse(['success' => true, 'categories' => $cats]);
            }
        } catch (Exception $e) {
            // fallback
        }
    }

    sendResponse(['success' => true, 'categories' => $defaultCategories]);
}

if ($method === 'POST' || $method === 'PUT') {
    checkAdminAuth();
    $data = json_decode(file_get_contents('php://input'), true) ?: $_POST;

    $id = trim($data['id'] ?? '');
    $label_th = trim($data['label_th'] ?? '');
    $label_en = trim($data['label_en'] ?? $label_th);
    $order_index = (int)($data['order_index'] ?? 99);

    if (empty($id) || empty($label_th)) {
        sendError('กรุณากรอกรหัสหมวดหมู่ (id) และชื่อภาษาไทย (label_th)');
    }

    if ($pdo) {
        try {
            $pdo->exec("CREATE TABLE IF NOT EXISTS categories (
                id VARCHAR(50) PRIMARY KEY,
                label_th VARCHAR(255) NOT NULL,
                label_en VARCHAR(255) NOT NULL,
                order_index INT DEFAULT 99,
                is_active TINYINT(1) DEFAULT 1
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;");

            $stmt = $pdo->prepare("INSERT INTO categories (id, label_th, label_en, order_index, is_active) VALUES (:id, :label_th, :label_en, :order_index, 1) ON DUPLICATE KEY UPDATE label_th = :label_th, label_en = :label_en, order_index = :order_index, is_active = 1");
            $stmt->execute([
                'id' => $id,
                'label_th' => $label_th,
                'label_en' => $label_en,
                'order_index' => $order_index
            ]);
            sendResponse(['success' => true, 'message' => 'บันทึกหมวดหมู่สำเร็จ', 'category' => ['id' => $id, 'label_th' => $label_th, 'label_en' => $label_en, 'order_index' => $order_index]]);
        } catch (PDOException $e) {
            sendError('Database error: ' . $e->getMessage(), 500);
        }
    } else {
        sendError('Database connection unavailable');
    }
}

if ($method === 'DELETE') {
    checkAdminAuth();
    $id = $_GET['id'] ?? null;
    if (!$id || in_array($id, ['all', 'ready'])) {
        sendError('ไม่สามารถลบหมวดหมู่หลักนี้ได้');
    }

    if ($pdo) {
        $stmt = $pdo->prepare("DELETE FROM categories WHERE id = :id");
        $stmt->execute(['id' => $id]);
        sendResponse(['success' => true, 'message' => 'ลบหมวดหมู่เรียบร้อย']);
    } else {
        sendError('Database connection unavailable');
    }
}
