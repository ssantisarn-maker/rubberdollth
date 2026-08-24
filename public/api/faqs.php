<?php
/**
 * RUBBER DOLL THAILAND - FAQs API (CRUD + Live Sync)
 */
error_reporting(E_ALL);
ini_set('display_errors', 0);

require_once __DIR__ . '/config.php';

$method = $_SERVER['REQUEST_METHOD'];
$pdo = getDbConnection();
$jsonCacheFile = __DIR__ . '/faqs_cache.json';

function syncFaqsCache($pdo, $jsonCacheFile) {
    try {
        $stmt = $pdo->query("SELECT * FROM site_faqs WHERE is_active = 1 ORDER BY order_index ASC, id ASC");
        $rows = $stmt->fetchAll();
        if (!empty($rows)) {
            file_put_contents($jsonCacheFile, json_encode($rows, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT));
            return $rows;
        }
    } catch (Exception $e) {}
    return null;
}

// GET: Fetch FAQs
if ($method === 'GET') {
    if ($pdo) {
        try {
            $stmt = $pdo->query("SELECT * FROM site_faqs WHERE is_active = 1 ORDER BY order_index ASC, id ASC");
            $rows = $stmt->fetchAll();
            if (!empty($rows)) {
                sendResponse(['success' => true, 'faqs' => $rows, 'total' => count($rows), 'source' => 'mysql']);
            }
        } catch (Exception $e) {}
    }

    if (file_exists($jsonCacheFile)) {
        $cached = json_decode(file_get_contents($jsonCacheFile), true);
        sendResponse(['success' => true, 'faqs' => $cached, 'total' => count($cached), 'source' => 'cache']);
    } else {
        sendError('No FAQs available', 404);
    }
}

// POST or PUT: Create or Edit FAQ
if ($method === 'POST' || $method === 'PUT') {
    checkAdminAuth();
    $rawInput = file_get_contents('php://input');
    $data = json_decode($rawInput, true) ?: $_POST;

    if (empty($data['question']) || empty($data['answer'])) {
        sendError('กรุณากรอกทั้งคำถามและคำตอบ');
    }

    $id = !empty($data['id']) ? (int)$data['id'] : null;
    $question = trim($data['question']);
    $answer = trim($data['answer']);
    $category = trim($data['category'] ?? 'general');
    $orderIndex = (int)($data['order_index'] ?? 0);

    if ($pdo) {
        try {
            $pdo->exec("CREATE TABLE IF NOT EXISTS site_faqs (
                id INT AUTO_INCREMENT PRIMARY KEY,
                question TEXT NOT NULL,
                answer LONGTEXT NOT NULL,
                category VARCHAR(50) DEFAULT 'general',
                order_index INT DEFAULT 0,
                is_active TINYINT(1) DEFAULT 1,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;");

            if ($id) {
                $stmt = $pdo->prepare("UPDATE site_faqs SET question = :q, answer = :a, category = :cat, order_index = :ord WHERE id = :id");
                $stmt->execute(['id' => $id, 'q' => $question, 'a' => $answer, 'cat' => $category, 'ord' => $orderIndex]);
            } else {
                $stmt = $pdo->prepare("INSERT INTO site_faqs (question, answer, category, order_index, is_active) VALUES (:q, :a, :cat, :ord, 1)");
                $stmt->execute(['q' => $question, 'a' => $answer, 'cat' => $category, 'ord' => $orderIndex]);
                $id = (int)$pdo->lastInsertId();
            }

            syncFaqsCache($pdo, $jsonCacheFile);
            sendResponse(['success' => true, 'message' => 'บันทึกคำถาม-คำตอบสำเร็จ', 'id' => $id]);
        } catch (PDOException $e) {
            sendError('Database error: ' . $e->getMessage(), 500);
        }
    } else {
        sendError('Database connection unavailable', 503);
    }
}

// DELETE: Delete FAQ
if ($method === 'DELETE') {
    checkAdminAuth();
    $id = (int)($_GET['id'] ?? 0);
    if (!$id) sendError('Missing FAQ ID');

    if ($pdo) {
        try {
            $stmt = $pdo->prepare("DELETE FROM site_faqs WHERE id = :id");
            $stmt->execute(['id' => $id]);
            syncFaqsCache($pdo, $jsonCacheFile);
            sendResponse(['success' => true, 'message' => 'ลบคำถามเรียบร้อย']);
        } catch (PDOException $e) {
            sendError('Database error: ' . $e->getMessage(), 500);
        }
    } else {
        sendError('Database connection unavailable', 503);
    }
}
