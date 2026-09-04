<?php
/**
 * RUBBER DOLL THAILAND - Products API (Full Specs + Multi-Video + Clean Update Persistence)
 */
error_reporting(E_ALL);
ini_set('display_errors', 0);

require_once __DIR__ . '/config.php';

header('Cache-Control: no-cache, no-store, must-revalidate');
header('Pragma: no-cache');
header('Expires: 0');

$method = $_SERVER['REQUEST_METHOD'];
$pdo = getDbConnection();
$jsonCacheFile = __DIR__ . '/products_cache.json';

function formatProductRow($r) {
    $gallery = json_decode($r['gallery_json'] ?? '[]', true) ?: [$r['image']];
    $baseDir = dirname(__DIR__); // public_html

    // Filter gallery images
    $validGallery = [];
    foreach ($gallery as $img) {
        if (!is_string($img) || empty($img)) continue;
        if (strpos($img, '/images/products/') === 0) {
            $fullPath = $baseDir . $img;
            if (file_exists($fullPath)) {
                $validGallery[] = $img;
            } else {
                $validGallery[] = $img; // Preserve path even if disk check is delayed
            }
        } elseif (strpos($img, 'http://') === 0 || strpos($img, 'https://') === 0) {
            $validGallery[] = $img;
        } else {
            $validGallery[] = $img;
        }
    }

    if (empty($validGallery)) {
        $validGallery = !empty($r['image']) ? [$r['image']] : [];
    }

    $r['gallery'] = array_values($validGallery);
    $r['image'] = $validGallery[0] ?? ($r['image'] ?? '');
    $r['secondary_image'] = $validGallery[1] ?? ($r['secondary_image'] ?? $r['image']);
    $r['secondaryImage'] = $r['secondary_image'];

    // Check primary video_url
    $videoUrl = trim($r['video_url'] ?? '');
    $r['video_url'] = $videoUrl;
    $r['videoUrl'] = $videoUrl;

    // Multi-video support: parse video_urls_json
    $videoUrls = json_decode($r['video_urls_json'] ?? '[]', true) ?: [];
    if (empty($videoUrls) && !empty($videoUrl)) {
        $videoUrls = [
            ['url' => $videoUrl, 'title' => 'วิดีโอตัวอย่างสินค้า']
        ];
    }
    $normalizedVideoUrls = [];
    foreach ($videoUrls as $idx => $v) {
        if (is_string($v)) {
            $normalizedVideoUrls[] = [
                'url' => trim($v),
                'title' => 'วิดีโอที่ ' . ($idx + 1)
            ];
        } elseif (is_array($v) && !empty($v['url'])) {
            $normalizedVideoUrls[] = [
                'url' => trim($v['url']),
                'title' => trim($v['title'] ?? ('วิดีโอที่ ' . ($idx + 1)))
            ];
        }
    }
    $r['video_urls'] = $normalizedVideoUrls;
    $r['videoUrls'] = $normalizedVideoUrls;

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
    
    // Multi-video handling
    $videoUrls = is_array($data['videoUrls'] ?? ($data['video_urls'] ?? null)) ? ($data['videoUrls'] ?? $data['video_urls']) : [];
    $videoUrl = trim($data['videoUrl'] ?? ($data['video_url'] ?? ''));

    // Normalize videoUrls
    $normalizedVideoUrls = [];
    foreach ($videoUrls as $idx => $v) {
        if (is_string($v) && trim($v) !== '') {
            $normalizedVideoUrls[] = [
                'url' => trim($v),
                'title' => 'วิดีโอที่ ' . ($idx + 1)
            ];
        } elseif (is_array($v) && !empty($v['url'])) {
            $normalizedVideoUrls[] = [
                'url' => trim($v['url']),
                'title' => trim($v['title'] ?? ('วิดีโอที่ ' . ($idx + 1)))
            ];
        }
    }

    if (empty($normalizedVideoUrls) && !empty($videoUrl)) {
        $normalizedVideoUrls[] = [
            'url' => $videoUrl,
            'title' => 'วิดีโอตัวอย่างสินค้า'
        ];
    } elseif (!empty($normalizedVideoUrls)) {
        $videoUrl = $normalizedVideoUrls[0]['url'] ?? $videoUrl;
    }

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
                "video_url VARCHAR(500) DEFAULT ''",
                "video_urls_json LONGTEXT DEFAULT NULL"
            ];
            foreach ($columnsToAdd as $colDef) {
                try {
                    $pdo->exec("ALTER TABLE products ADD COLUMN $colDef");
                } catch (Exception $e) {}
            }

            // Check if product exists in database
            $checkStmt = $pdo->prepare("SELECT id, code FROM products WHERE code = :code OR id = :id OR code = :origCode OR id = :origCode LIMIT 1");
            $checkStmt->execute([
                'code' => $code,
                'id' => $id,
                'origCode' => $originalCode ?: $code
            ]);
            $existing = $checkStmt->fetch();

            $params = [
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
                'video_urls_json' => json_encode($normalizedVideoUrls, JSON_UNESCAPED_UNICODE),
                'gifts' => $gifts,
                'is_ready_to_ship' => $isReadyToShip
            ];

            if ($existing) {
                // Direct UPDATE query - rock solid and avoids key conflicts
                $sql = "UPDATE products SET 
                            code = :code,
                            name = :name,
                            series = :series,
                            description = :description,
                            image = :image,
                            secondary_image = :secondary_image,
                            gallery_json = :gallery_json,
                            total_angles = :total_angles,
                            category = :category,
                            categories_json = :categories_json,
                            height = :height,
                            weight = :weight,
                            bust = :bust,
                            skin_tone = :skin_tone,
                            material = :material,
                            skeleton = :skeleton,
                            price = :price,
                            original_price = :original_price,
                            special_option = :special_option,
                            order_index = :order_index,
                            video_url = :video_url,
                            video_urls_json = :video_urls_json,
                            gifts = :gifts,
                            is_ready_to_ship = :is_ready_to_ship,
                            is_active = 1,
                            updated_at = NOW()
                        WHERE id = :existing_id OR code = :existing_code";
                $params['existing_id'] = $existing['id'];
                $params['existing_code'] = $existing['code'];
            } else {
                // Direct INSERT query
                $sql = "INSERT INTO products (id, code, name, series, description, image, secondary_image, gallery_json, total_angles, category, categories_json, height, weight, bust, skin_tone, material, skeleton, price, original_price, special_option, gifts, order_index, video_url, video_urls_json, is_ready_to_ship, is_active) 
                        VALUES (:id, :code, :name, :series, :description, :image, :secondary_image, :gallery_json, :total_angles, :category, :categories_json, :height, :weight, :bust, :skin_tone, :material, :skeleton, :price, :original_price, :special_option, :gifts, :order_index, :video_url, :video_urls_json, :is_ready_to_ship, 1)";
                $params['id'] = $id;
            }

            $stmt = $pdo->prepare($sql);
            $stmt->execute($params);

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
