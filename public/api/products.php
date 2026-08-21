<?php
require_once __DIR__ . '/config.php';

$method = $_SERVER['REQUEST_METHOD'];
$pdo = getDbConnection();

// If database is not connected, fallback to local products.json cache
$jsonCacheFile = __DIR__ . '/products_cache.json';

// GET: Fetch all products or single product by code/id
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
        } catch (Exception $e) {
            // Fallback to cache
        }
    }

    // Fallback to JSON cache if DB is offline
    if (file_exists($jsonCacheFile)) {
        $cached = json_decode(file_get_contents($jsonCacheFile), true);
        sendResponse(['success' => true, 'products' => $cached, 'total' => count($cached), 'source' => 'cache']);
    } else {
        sendError('No products found and database not configured yet.', 503);
    }
}

// POST: Add new product (Requires Auth)
if ($method === 'POST') {
    checkAdminAuth();
    $data = json_decode(file_get_contents('php://input'), true) ?: $_POST;

    if (empty($data['code']) || empty($data['name'])) {
        sendError('กรุณากรอกรหัสสินค้า (code) และชื่อสินค้า (name)');
    }

    $id = $data['id'] ?? ('prod_' . bin2hex(random_bytes(10)));
    $code = trim($data['code']);
    $name = trim($data['name']);
    $series = trim($data['series'] ?? 'ตุ๊กตายาง RBD Luxury');
    $description = trim($data['description'] ?? '');
    $image = $data['image'] ?? '/images/products/placeholder.webp';
    $secondaryImage = $data['secondaryImage'] ?? $image;
    $gallery = is_array($data['gallery'] ?? null) ? $data['gallery'] : [$image];
    $category = $data['category'] ?? 'ตุ๊กตายางซิลิโคน';
    $categories = is_array($data['categories'] ?? null) ? $data['categories'] : ['all'];
    $height = $data['height'] ?? '160 cm';
    $weight = $data['weight'] ?? '35 kg';
    $bust = $data['bust'] ?? 'คัพ C สรีระสมจริง';
    $price = $data['price'] ?? 'ติดต่อสอบถามทาง LINE';
    $isReadyToShip = !empty($data['isReadyToShip']) ? 1 : 0;

    if ($isReadyToShip && !in_array('ready', $categories)) {
        $categories[] = 'ready';
    }

    if ($pdo) {
        $sql = "INSERT INTO products (id, code, name, series, description, image, secondary_image, gallery_json, total_angles, category, categories_json, height, weight, bust, price, is_ready_to_ship, is_active, created_at, updated_at) 
                VALUES (:id, :code, :name, :series, :description, :image, :secondary_image, :gallery_json, :total_angles, :category, :categories_json, :height, :weight, :bust, :price, :is_ready_to_ship, 1, NOW(), NOW())";
        $stmt = $pdo->prepare($sql);
        $stmt->execute([
            'id' => $id,
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
        sendResponse(['success' => true, 'message' => 'เพิ่มสินค้าสำเร็จ', 'id' => $id, 'code' => $code]);
    } else {
        sendError('Database connection unavailable');
    }
}

// PUT: Update product or toggle stock (Requires Auth)
if ($method === 'PUT') {
    checkAdminAuth();
    $data = json_decode(file_get_contents('php://input'), true);

    if (empty($data['code']) && empty($data['id'])) {
        sendError('Missing product id or code');
    }

    $id = $data['id'] ?? $data['code'];

    if ($pdo) {
        $fields = [];
        $params = ['id' => $id];

        if (isset($data['name'])) { $fields[] = "name = :name"; $params['name'] = $data['name']; }
        if (isset($data['code'])) { $fields[] = "code = :code"; $params['code'] = $data['code']; }
        if (isset($data['series'])) { $fields[] = "series = :series"; $params['series'] = $data['series']; }
        if (isset($data['description'])) { $fields[] = "description = :description"; $params['description'] = $data['description']; }
        if (isset($data['image'])) { $fields[] = "image = :image"; $params['image'] = $data['image']; }
        if (isset($data['secondaryImage'])) { $fields[] = "secondary_image = :secondaryImage"; $params['secondaryImage'] = $data['secondaryImage']; }
        if (isset($data['gallery'])) { $fields[] = "gallery_json = :gallery"; $params['gallery'] = json_encode($data['gallery'], JSON_UNESCAPED_UNICODE); }
        if (isset($data['category'])) { $fields[] = "category = :category"; $params['category'] = $data['category']; }
        if (isset($data['categories'])) { $fields[] = "categories_json = :categories"; $params['categories'] = json_encode($data['categories'], JSON_UNESCAPED_UNICODE); }
        if (isset($data['height'])) { $fields[] = "height = :height"; $params['height'] = $data['height']; }
        if (isset($data['weight'])) { $fields[] = "weight = :weight"; $params['weight'] = $data['weight']; }
        if (isset($data['bust'])) { $fields[] = "bust = :bust"; $params['bust'] = $data['bust']; }
        if (isset($data['price'])) { $fields[] = "price = :price"; $params['price'] = $data['price']; }
        if (isset($data['isReadyToShip'])) { $fields[] = "is_ready_to_ship = :isReadyToShip"; $params['isReadyToShip'] = $data['isReadyToShip'] ? 1 : 0; }
        if (isset($data['isActive'])) { $fields[] = "is_active = :isActive"; $params['isActive'] = $data['isActive'] ? 1 : 0; }

        $fields[] = "updated_at = NOW()";

        $sql = "UPDATE products SET " . implode(', ', $fields) . " WHERE id = :id OR code = :id";
        $stmt = $pdo->prepare($sql);
        $stmt->execute($params);

        sendResponse(['success' => true, 'message' => 'อัปเดตข้อมูลสินค้าสำเร็จ']);
    } else {
        sendError('Database connection unavailable');
    }
}

// DELETE: Delete product (Requires Auth)
if ($method === 'DELETE') {
    checkAdminAuth();
    $id = $_GET['id'] ?? $_GET['code'] ?? null;

    if (!$id) {
        sendError('Missing product ID to delete');
    }

    if ($pdo) {
        $stmt = $pdo->prepare("DELETE FROM products WHERE id = :id OR code = :id");
        $stmt->execute(['id' => $id]);
        sendResponse(['success' => true, 'message' => 'ลบสินค้าเรียบร้อย']);
    } else {
        sendError('Database connection unavailable');
    }
}
