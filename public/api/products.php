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

// DELETE: Delete product (Supports both DELETE method and POST with action=delete)
if ($method === 'DELETE' || ($method === 'POST' && ($_GET['action'] ?? '') === 'delete')) {
    checkAdminAuth();
    $rawInput = file_get_contents('php://input');
    $body = json_decode($rawInput, true) ?: $_POST;
    $code = trim($_GET['code'] ?? ($body['code'] ?? ''));
    $id = trim($_GET['id'] ?? ($body['id'] ?? $code));
    if (!$code && !$id) {
        sendError('Missing product code or id');
    }

    if ($pdo) {
        try {
            $stmt = $pdo->prepare("DELETE FROM products WHERE code = ? OR id = ?");
            $stmt->execute([$code, $id]);
        } catch (Exception $e) {}
    }

    // Always ensure removed from json cache file
    if (file_exists($jsonCacheFile)) {
        $cached = json_decode(file_get_contents($jsonCacheFile), true) ?: [];
        $filtered = array_values(array_filter($cached, function($p) use ($code, $id) {
            return ($p['code'] ?? '') !== $code && ($p['id'] ?? '') !== $id;
        }));
        file_put_contents($jsonCacheFile, json_encode($filtered, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT));
    }

    if ($pdo) {
        syncCacheFromDb($pdo, $jsonCacheFile);
    }

    sendResponse(['success' => true, 'message' => 'ลบสินค้าสำเร็จ', 'code' => $code]);
}

// POST or PUT: Save product (Create or Edit)
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
    $secondaryImage = $data['secondaryImage'] ?? ($data['secondary_image'] ?? $image);
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
    $isReadyToShip = (!empty($data['isReadyToShip']) || !empty($data['is_ready_to_ship'])) ? 1 : 0;

    $originalCode = trim($data['originalCode'] ?? ($data['original_code'] ?? ($data['old_code'] ?? '')));
    $id = trim($data['id'] ?? $code);

    if ($isReadyToShip && !in_array('ready', $categories)) {
        $categories[] = 'ready';
    }

    // Always maintain json cache backup immediately
    $formattedProd = [
        'id' => $id,
        'code' => $code,
        'name' => $name,
        'series' => $series,
        'description' => $description,
        'image' => $image,
        'secondary_image' => $secondaryImage,
        'secondaryImage' => $secondaryImage,
        'gallery' => $gallery,
        'totalAngles' => count($gallery),
        'category' => $category,
        'categories' => $categories,
        'height' => $height,
        'weight' => $weight,
        'bust' => $bust,
        'skinTone' => $skinTone,
        'skin_tone' => $skinTone,
        'material' => $material,
        'skeleton' => $skeleton,
        'price' => $price,
        'originalPrice' => $originalPrice,
        'original_price' => $originalPrice,
        'specialOption' => $specialOption,
        'special_option' => $specialOption,
        'gifts' => $gifts,
        'orderIndex' => $orderIndex,
        'order_index' => $orderIndex,
        'videoUrl' => $videoUrl,
        'video_url' => $videoUrl,
        'videoUrls' => $normalizedVideoUrls,
        'video_urls' => $normalizedVideoUrls,
        'isReadyToShip' => (bool)$isReadyToShip,
        'is_ready_to_ship' => $isReadyToShip
    ];

    if (file_exists($jsonCacheFile)) {
        $cached = json_decode(file_get_contents($jsonCacheFile), true) ?: [];
        $foundIdx = -1;
        foreach ($cached as $idx => $item) {
            if (($item['code'] ?? '') === $code || 
                ($item['id'] ?? '') === $id || 
                ($originalCode && ($item['code'] ?? '') === $originalCode) ||
                ($originalCode && ($item['id'] ?? '') === $originalCode)) {
                $foundIdx = $idx;
                break;
            }
        }
        if ($foundIdx >= 0) {
            $cached[$foundIdx] = array_merge($cached[$foundIdx], $formattedProd);
        } else {
            array_unshift($cached, $formattedProd);
        }
        file_put_contents($jsonCacheFile, json_encode($cached, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT));
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

            // Check if product exists in database using clean positional params
            $searchCode1 = $code;
            $searchCode2 = $originalCode ?: $code;
            $searchId1 = $id;
            $searchId2 = $originalCode ?: $id;
            $checkStmt = $pdo->prepare("SELECT id, code FROM products WHERE code = ? OR code = ? OR id = ? OR id = ? LIMIT 1");
            $checkStmt->execute([$searchCode1, $searchCode2, $searchId1, $searchId2]);
            $existing = $checkStmt->fetch();

            $baseParams = [
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
                // Direct UPDATE query by primary key ID
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
                        WHERE id = :existing_id";
                $updateParams = array_merge($baseParams, [
                    'existing_id' => $existing['id']
                ]);
                $stmt = $pdo->prepare($sql);
                $stmt->execute($updateParams);
            } else {
                // Direct INSERT query
                $sql = "INSERT INTO products (id, code, name, series, description, image, secondary_image, gallery_json, total_angles, category, categories_json, height, weight, bust, skin_tone, material, skeleton, price, original_price, special_option, gifts, order_index, video_url, video_urls_json, is_ready_to_ship, is_active) 
                        VALUES (:id, :code, :name, :series, :description, :image, :secondary_image, :gallery_json, :total_angles, :category, :categories_json, :height, :weight, :bust, :skin_tone, :material, :skeleton, :price, :original_price, :special_option, :gifts, :order_index, :video_url, :video_urls_json, :is_ready_to_ship, 1)";
                $insertParams = array_merge($baseParams, [
                    'id' => $id
                ]);
                $stmt = $pdo->prepare($sql);
                $stmt->execute($insertParams);
            }

            syncCacheFromDb($pdo, $jsonCacheFile);

            sendResponse(['success' => true, 'message' => 'บันทึกข้อมูลสินค้าสำเร็จ', 'code' => $code]);
        } catch (PDOException $e) {
            error_log('Database error in products.php: ' . $e->getMessage());
            sendError('เกิดข้อผิดพลาดในการบันทึกฐานข้อมูล: ' . $e->getMessage(), 500);
        }
    } else {
        sendResponse(['success' => true, 'message' => 'บันทึกข้อมูลสินค้าสำเร็จ (อัปเดตไฟล์แคช)', 'code' => $code]);
    }
}
