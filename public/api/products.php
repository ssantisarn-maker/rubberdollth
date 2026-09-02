<?php
/**
 * RUBBER DOLL THAILAND - Products API (Full Specs + Dual Persistence)
 */
error_reporting(E_ALL);
ini_set('display_errors', 0);

require_once __DIR__ . '/config.php';

$method = $_SERVER['REQUEST_METHOD'];
$pdo = getDbConnection();
$jsonCacheFile = __DIR__ . '/products_cache.json';

function formatProductRow($r) {
    $gallery = json_decode($r['gallery_json'] ?? '[]', true) ?: [$r['image']];
    $baseDir = dirname(__DIR__); // public_html

    // Filter gallery images: must exist on disk if local, or valid external URL
    $validGallery = [];
    foreach ($gallery as $img) {
        if (!is_string($img) || empty($img)) continue;
        if (strpos($img, '/images/products/') === 0) {
            $fullPath = $baseDir . $img;
            if (file_exists($fullPath)) {
                $validGallery[] = $img;
            }
        } elseif (strpos($img, 'http://') === 0 || strpos($img, 'https://') === 0) {
            if (strpos($img, 'https://cdn.zyrosite.com/') !== 0) {
                $validGallery[] = $img;
            }
        }
    }

    if (empty($validGallery)) {
        $validGallery = !empty($r['image']) ? [$r['image']] : [];
    }

    $r['gallery'] = array_values($validGallery);
    $r['image'] = $validGallery[0] ?? ($r['image'] ?? '');
    $r['secondary_image'] = $validGallery[1] ?? ($r['secondary_image'] ?? $r['image']);
    $r['secondaryImage'] = $r['secondary_image'];

    // Check video_url: if local file, ensure it exists on disk
    $videoUrl = trim($r['video_url'] ?? '');
    if (strpos($videoUrl, '/images/videos/') === 0) {
        $videoFullPath = $baseDir . $videoUrl;
        if (!file_exists($videoFullPath)) {
            $videoUrl = '';
        }
    }
    $r['video_url'] = $videoUrl;
    $r['videoUrl'] = $videoUrl;

    $r['categories'] = json_decode($r['categories_json'] ?? '[]', true) ?: ['all'];
    $r['isReadyToShip'] = (bool)($r['is_ready_to_ship'] ?? 0);
    $r['totalAngles'] = count($r['gallery']);
    $r['skinTone'] = $r['skin_tone'] ?? '';
    $r['material'] = $r['material'] ?? '';
    $r['skeleton'] = $r['skeleton'] ?? '';
    $r['originalPrice'] = $r['original_price'] ?? '';
    $r['specialOption'] = $r['special_option'] ?? '';
    $r['gifts'] = $r['gifts'] ?? '';
    $r['order_index'] = (int)($r['order_index'] ?? 999);
    $r['orderIndex'] = (int)($r['order_index'] ?? 999);
    return $r;
}

function syncCacheFromDb($pdo, $jsonCacheFile) {
    try {
        $stmt = $pdo->query("SELECT * FROM products WHERE is_active = 1 ORDER BY id ASC");
        $rows = $stmt->fetchAll();
        if (!empty($rows)) {
            $products = array_map('formatProductRow', $rows);
            file_put_contents($jsonCacheFile, json_encode($products, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT));
            return $products;
        }
    } catch (Exception $e) {}
    return null;
}

// GET: Fetch products
if ($method === 'GET') {
    $code = $_GET['code'] ?? null;

    if ($pdo) {
        try {
            if ($code) {
                $stmt = $pdo->prepare("SELECT * FROM products WHERE code = :code OR id = :id LIMIT 1");
                $stmt->execute(['code' => $code, 'id' => $code]);
                $product = $stmt->fetch();
                if ($product) {
                    sendResponse(['success' => true, 'product' => formatProductRow($product)]);
                }
            } else {
                $stmt = $pdo->query("SELECT * FROM products WHERE is_active = 1 ORDER BY id ASC");
                $rows = $stmt->fetchAll();
                if (!empty($rows)) {
                    $products = array_map('formatProductRow', $rows);
                    sendResponse(['success' => true, 'products' => $products, 'total' => count($products), 'source' => 'mysql']);
                }
            }
        } catch (Exception $e) {}
    }

    if (file_exists($jsonCacheFile)) {
        $cached = json_decode(file_get_contents($jsonCacheFile), true);
        sendResponse(['success' => true, 'products' => $cached, 'total' => count($cached), 'source' => 'cache']);
    } else {
        sendError('No products available', 503);
    }
}

// POST or PUT: Save product
if ($method === 'POST' || $method === 'PUT') {
    checkAdminAuth();
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
    $skinTone = $data['skinTone'] ?? ($data['skin_tone'] ?? 'ผิวขาว/สีขาวเหลือง');
    $material = $data['material'] ?? 'Pure Silicone + ปลูกผมและคิ้วเสมือนจริง';
    $skeleton = $data['skeleton'] ?? 'EVO Stainless-Steel 360° Articulated Frame';
    $price = $data['price'] ?? 'ติดต่อสอบถามทาง LINE';
    $originalPrice = $data['originalPrice'] ?? ($data['original_price'] ?? '');
    $specialOption = $data['specialOption'] ?? ($data['special_option'] ?? '');
    $orderIndex = (int)($data['orderIndex'] ?? ($data['order_index'] ?? 999));
    $videoUrl = trim($data['videoUrl'] ?? ($data['video_url'] ?? ''));
    $gifts = $data['gifts'] ?? 'ชุดแฟชั่นสั่งตัด, วิกผมพรีเมียม, แป้งฝุ่นบำรุงผิว Silky Smooth, เซ็ตอุปกรณ์ทำความสะอาด';
    $isReadyToShip = !empty($data['isReadyToShip']) ? 1 : 0;

    $originalCode = trim($data['originalCode'] ?? ($data['original_code'] ?? ($data['old_code'] ?? '')));
    $id = trim($data['id'] ?? $code);

    if ($isReadyToShip && !in_array('ready', $categories)) {
        $categories[] = 'ready';
    }

    if ($pdo) {
        try {
            // Auto add new columns if not exists
            $columnsToAdd = [
                "skin_tone VARCHAR(100) DEFAULT 'ผิวขาว/สีขาวเหลือง'",
                "material VARCHAR(255) DEFAULT ''",
                "skeleton VARCHAR(255) DEFAULT ''",
                "original_price VARCHAR(100) DEFAULT ''",
                "special_option VARCHAR(255) DEFAULT ''",
                "gifts TEXT DEFAULT NULL",
                "order_index INT DEFAULT 999",
                "video_url VARCHAR(500) DEFAULT ''"
            ];
            foreach ($columnsToAdd as $colDef) {
                try {
                    $pdo->exec("ALTER TABLE products ADD COLUMN $colDef");
                } catch (Exception $e) {}
            }

            // If renaming code from an existing product
            if (!empty($originalCode) && $originalCode !== $code) {
                $checkStmt = $pdo->prepare("SELECT id FROM products WHERE code = :origCode OR id = :origCode LIMIT 1");
                $checkStmt->execute(['origCode' => $originalCode]);
                $existing = $checkStmt->fetch();
                if ($existing) {
                    $id = $existing['id'];
                }
            }

            $sql = "INSERT INTO products (id, code, name, series, description, image, secondary_image, gallery_json, total_angles, category, categories_json, height, weight, bust, skin_tone, material, skeleton, price, original_price, special_option, gifts, order_index, video_url, is_ready_to_ship, is_active) 
                    VALUES (:id, :code, :name, :series, :description, :image, :secondary_image, :gallery_json, :total_angles, :category, :categories_json, :height, :weight, :bust, :skin_tone, :material, :skeleton, :price, :original_price, :special_option, :gifts, :order_index, :video_url, :is_ready_to_ship, 1)
                    ON DUPLICATE KEY UPDATE 
                        code = VALUES(code),
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
                        skin_tone = VALUES(skin_tone),
                        material = VALUES(material),
                        skeleton = VALUES(skeleton),
                        price = VALUES(price),
                        original_price = VALUES(original_price),
                        special_option = VALUES(special_option),
                        order_index = VALUES(order_index),
                        video_url = VALUES(video_url),
                        gifts = VALUES(gifts),
                        is_ready_to_ship = VALUES(is_ready_to_ship),
                        is_active = 1,
                        updated_at = NOW()";
            
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
                'skin_tone' => $skinTone,
                'material' => $material,
                'skeleton' => $skeleton,
                'price' => $price,
                'original_price' => $originalPrice,
                'special_option' => $specialOption,
                'order_index' => $orderIndex,
                'video_url' => $videoUrl,
                'gifts' => $gifts,
                'is_ready_to_ship' => $isReadyToShip
            ]);

            syncCacheFromDb($pdo, $jsonCacheFile);

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
    checkAdminAuth();
    $code = $_GET['code'] ?? $_GET['id'] ?? null;
    $id = $_GET['id'] ?? $code;
    if (!$code) {
        sendError('Missing product code');
    }

    if ($pdo) {
        try {
            $stmt = $pdo->prepare("DELETE FROM products WHERE code = :code OR id = :code OR code = :id OR id = :id");
            $stmt->execute(['code' => $code, 'id' => $id]);
            syncCacheFromDb($pdo, $jsonCacheFile);
            sendResponse(['success' => true, 'message' => 'ลบสินค้าสำเร็จ', 'code' => $code]);
        } catch (PDOException $e) {
            sendError('Database error: ' . $e->getMessage(), 500);
        }
    } else {
        sendError('Database connection unavailable', 503);
    }
}
