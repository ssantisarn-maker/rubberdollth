<?php
/**
 * RUBBER DOLL THAILAND - Products API (CRUD + Live Fetch)
 */
error_reporting(E_ALL);
ini_set('display_errors', 0);

require_once __DIR__ . '/config.php';

$method = $_SERVER['REQUEST_METHOD'];
$pdo = getDbConnection();
$jsonCacheFile = __DIR__ . '/products_cache.json';

// GET: Fetch all or single product
if ($method === 'GET') {
    $code = $_GET['code'] ?? null;

    if ($pdo) {
        try {
            if ($code) {
                $stmt = $pdo->prepare("SELECT * FROM products WHERE code = :code OR id = :id LIMIT 1");
                $stmt->execute(['code' => $code, 'id' => $code]);
                $product = $stmt->fetch();
                if (!$product) {
                    sendError('Product not found', 404);
                }
                $product['gallery'] = json_decode($product['gallery_json'] ?? '[]', true);
                $product['categories'] = json_decode($product['categories_json'] ?? '[]', true);
                $product['isReadyToShip'] = (bool)$product['is_ready_to_ship'];
                sendResponse(['success' => true, 'product' => $product]);
            } else {
                $stmt = $pdo->query("SELECT * FROM products WHERE is_active = 1 ORDER BY id ASC");
                $rows = $stmt->fetchAll();
                if (!empty($rows)) {
                    $products = [];
                    foreach ($rows as $r) {
                        $r['gallery'] = json_decode($r['gallery_json'] ?? '[]', true);
                        $r['categories'] = json_decode($r['categories_json'] ?? '[]', true);
                        $r['isReadyToShip'] = (bool)$r['is_ready_to_ship'];
                        $r['totalAngles'] = (int)($r['total_angles'] ?? count($r['gallery']));
                        $products[] = $r;
                    }
                    sendResponse(['success' => true, 'products' => $products, 'total' => count($products)]);
                }
            }
        } catch (Exception $e) {
            // fallback to cache
        }
    }

    if (file_exists($jsonCacheFile)) {
        $cached = json_decode(file_get_contents($jsonCacheFile), true);
        sendResponse(['success' => true, 'products' => $cached, 'total' => count($cached), 'source' => 'cache']);
    } else {
        sendError('No products available', 503);
    }
}

// POST or PUT: Update or Create product
if ($method === 'POST' || $method === 'PUT') {
    $rawInput = file_get_contents('php://input');
    $data = json_decode($rawInput, true) ?: $_POST;

    if (empty($data['code']) && empty($data['id'])) {
        sendError('Missing product code or id');
    }

    $code = trim($data['code'] ?? $data['id']);
    $name = trim($data['name'] ?? $code);
    $series = trim($data['series'] ?? 'ตุ๊กตายาง RBD Luxury');
    $description = trim($data['description'] ?? '');
    $image = $data['image'] ?? '/images/products/placeholder.webp';
    $secondaryImage = $data['secondaryImage'] ?? $image;
    $gallery = is_array($data['gallery'] ?? null) ? $data['gallery'] : [$image];
    $category = $data['category'] ?? 'ตุ๊กตายางซิลิโคน';
    $categories = is_array($data['categories'] ?? null) ? $data['categories'] : ['all'];
    $height = $data['height'] ?? '';
    $weight = $data['weight'] ?? '';
    $bust = $data['bust'] ?? '';
    $price = $data['price'] ?? 'ติดต่อสอบถามทาง LINE';
    $isReadyToShip = !empty($data['isReadyToShip']) ? 1 : 0;

    if ($pdo) {
        try {
            $sql = "INSERT INTO products (id, code, name, series, description, image, secondary_image, gallery_json, total_angles, category, categories_json, height, weight, bust, price, is_ready_to_ship, is_active) 
                    VALUES (:id, :code, :name, :series, :description, :image, :secondary_image, :gallery_json, :total_angles, :category, :categories_json, :height, :weight, :bust, :price, :is_ready_to_ship, 1)
                    ON DUPLICATE KEY UPDATE 
                        name = VALUES(name),
                        series = VALUES(series),
                        description = VALUES(description),
                        image = VALUES(image),
                        secondary_image = VALUES(secondary_image),
                        gallery_json = VALUES(gallery_json),
                        total_angles = VALUES(total_angles),
                        category = VALUES(category),
                        categories_json = VALUES(categories_json),
                        height = VALUES(height),
                        weight = VALUES(weight),
                        bust = VALUES(bust),
                        price = VALUES(price),
                        is_ready_to_ship = VALUES(is_ready_to_ship),
                        is_active = 1,
                        updated_at = NOW()";
            
            $stmt = $pdo->prepare($sql);
            $stmt->execute([
                'id' => $data['id'] ?? $code,
                'code' => $code,
                'name' => $name,
                'series' => $series,
                'description' => $description,
                'image' => $image,
                'secondary_image' => $secondaryImage,
                'gallery_json' => json_encode($gallery, JSON_UNESCAPED_UNICODE),
                'total_angles' => count($gallery),
                'category' => $category,
                'categories_json' => json_encode($categories, JSON_UNESCAPED_UNICODE),
                'height' => $height,
                'weight' => $weight,
                'bust' => $bust,
                'price' => $price,
                'is_ready_to_ship' => $isReadyToShip
            ]);

            sendResponse(['success' => true, 'message' => 'บันทึกข้อมูลสินค้าสำเร็จ', 'code' => $code]);
        } catch (PDOException $e) {
            sendError('Database error: ' . $e->getMessage(), 500);
        }
    } else {
        sendError('Database connection unavailable', 503);
    }
}

// DELETE: Delete product
if ($method === 'DELETE') {
    $code = $_GET['code'] ?? $_GET['id'] ?? null;
    if (!$code) {
        sendError('Missing product code');
    }

    if ($pdo) {
        try {
            $stmt = $pdo->prepare("DELETE FROM products WHERE code = :code OR id = :code");
            $stmt->execute(['code' => $code]);
            sendResponse(['success' => true, 'message' => 'ลบสินค้าสำเร็จ']);
        } catch (PDOException $e) {
            sendError('Database error: ' . $e->getMessage(), 500);
        }
    } else {
        sendError('Database connection unavailable', 503);
    }
}
