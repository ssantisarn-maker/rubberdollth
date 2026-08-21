<?php
/**
 * RUBBER DOLL THAILAND - Customer Reviews API (CRUD + Live Sync)
 */
error_reporting(E_ALL);
ini_set('display_errors', 0);

require_once __DIR__ . '/config.php';

$method = $_SERVER['REQUEST_METHOD'];
$pdo = getDbConnection();
$jsonCacheFile = __DIR__ . '/reviews_cache.json';

function syncReviewsCache($pdo, $jsonCacheFile) {
    try {
        $stmt = $pdo->query("SELECT * FROM customer_reviews WHERE is_active = 1 ORDER BY order_index ASC, id DESC");
        $rows = $stmt->fetchAll();
        if (!empty($rows)) {
            $reviews = [];
            foreach ($rows as $r) {
                $r['images'] = json_decode($r['images_json'] ?? '[]', true);
                $r['verified'] = (bool)$r['verified'];
                $r['rating'] = (int)$r['rating'];
                $reviews[] = $r;
            }
            file_put_contents($jsonCacheFile, json_encode($reviews, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT));
            return $reviews;
        }
    } catch (Exception $e) {}
    return null;
}

// GET: Fetch reviews
if ($method === 'GET') {
    if ($pdo) {
        try {
            $stmt = $pdo->query("SELECT * FROM customer_reviews WHERE is_active = 1 ORDER BY order_index ASC, id DESC");
            $rows = $stmt->fetchAll();
            if (!empty($rows)) {
                $reviews = [];
                foreach ($rows as $r) {
                    $r['images'] = json_decode($r['images_json'] ?? '[]', true);
                    $r['verified'] = (bool)$r['verified'];
                    $r['rating'] = (int)$r['rating'];
                    $reviews[] = $r;
                }
                sendResponse(['success' => true, 'reviews' => $reviews, 'total' => count($reviews), 'source' => 'mysql']);
            }
        } catch (Exception $e) {}
    }

    if (file_exists($jsonCacheFile)) {
        $cached = json_decode(file_get_contents($jsonCacheFile), true);
        sendResponse(['success' => true, 'reviews' => $cached, 'total' => count($cached), 'source' => 'cache']);
    } else {
        sendError('No reviews available', 404);
    }
}

// POST or PUT: Create or Update review
if ($method === 'POST' || $method === 'PUT') {
    checkAdminAuth();
    $rawInput = file_get_contents('php://input');
    $data = json_decode($rawInput, true) ?: $_POST;

    if (empty($data['name']) || empty($data['comment'])) {
        sendError('กรุณากรอกชื่อลูกค้าและข้อความรีวิว');
    }

    $id = !empty($data['id']) ? (int)$data['id'] : null;
    $name = trim($data['name']);
    $model = trim($data['model'] ?? '');
    $rating = max(1, min(5, (int)($data['rating'] ?? 5)));
    $date = trim($data['date'] ?? date('j F Y'));
    $comment = trim($data['comment']);
    $image = trim($data['image'] ?? '');
    $images = is_array($data['images'] ?? null) ? $data['images'] : ($image ? [$image] : []);
    $verified = !empty($data['verified']) ? 1 : 0;
    $orderIndex = (int)($data['order_index'] ?? 0);

    if ($pdo) {
        try {
            if ($id) {
                // Update
                $stmt = $pdo->prepare("UPDATE customer_reviews SET name = :name, model = :model, rating = :rating, date = :date, comment = :comment, image = :image, images_json = :images_json, verified = :verified, order_index = :order_index WHERE id = :id");
                $stmt->execute([
                    'id' => $id,
                    'name' => $name,
                    'model' => $model,
                    'rating' => $rating,
                    'date' => $date,
                    'comment' => $comment,
                    'image' => $image,
                    'images_json' => json_encode($images, JSON_UNESCAPED_UNICODE),
                    'verified' => $verified,
                    'order_index' => $orderIndex
                ]);
            } else {
                // Insert
                $stmt = $pdo->prepare("INSERT INTO customer_reviews (name, model, rating, date, comment, image, images_json, verified, order_index, is_active) VALUES (:name, :model, :rating, :date, :comment, :image, :images_json, :verified, :order_index, 1)");
                $stmt->execute([
                    'name' => $name,
                    'model' => $model,
                    'rating' => $rating,
                    'date' => $date,
                    'comment' => $comment,
                    'image' => $image,
                    'images_json' => json_encode($images, JSON_UNESCAPED_UNICODE),
                    'verified' => $verified,
                    'order_index' => $orderIndex
                ]);
                $id = (int)$pdo->lastInsertId();
            }

            syncReviewsCache($pdo, $jsonCacheFile);
            sendResponse(['success' => true, 'message' => 'บันทึกรีวิวสำเร็จ', 'id' => $id]);
        } catch (PDOException $e) {
            sendError('Database error: ' . $e->getMessage(), 500);
        }
    } else {
        sendError('Database connection unavailable', 503);
    }
}

// DELETE: Delete review
if ($method === 'DELETE') {
    checkAdminAuth();
    $id = (int)($_GET['id'] ?? 0);
    if (!$id) {
        sendError('Missing review ID');
    }

    if ($pdo) {
        try {
            $stmt = $pdo->prepare("DELETE FROM customer_reviews WHERE id = :id");
            $stmt->execute(['id' => $id]);
            syncReviewsCache($pdo, $jsonCacheFile);
            sendResponse(['success' => true, 'message' => 'ลบรีวิวเรียบร้อย']);
        } catch (PDOException $e) {
            sendError('Database error: ' . $e->getMessage(), 500);
        }
    } else {
        sendError('Database connection unavailable', 503);
    }
}
