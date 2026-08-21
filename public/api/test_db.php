<?php
error_reporting(E_ALL);
ini_set('display_errors', 1);

header('Content-Type: text/plain; charset=utf-8');

require_once __DIR__ . '/config.php';

$pdo = getDbConnection();
if (!$pdo) {
    echo "DB Connection failed\n";
    exit();
}

$jsonProducts = json_decode(file_get_contents(__DIR__ . '/products_cache.json'), true);
echo "Total products in JSON cache: " . count($jsonProducts) . "\n";

$pdo->exec("TRUNCATE TABLE products");

$stmtIns = $pdo->prepare("INSERT INTO products (id, code, name, series, description, image, secondary_image, gallery_json, total_angles, category, categories_json, height, weight, bust, price, is_ready_to_ship, is_active) 
                          VALUES (:id, :code, :name, :series, :description, :image, :secondary_image, :gallery_json, :total_angles, :category, :categories_json, :height, :weight, :bust, :price, :is_ready_to_ship, 1)");

$success = 0;
foreach ($jsonProducts as $i => $p) {
    try {
        $stmtIns->execute([
            'id' => $p['id'] ?? ('prod_' . bin2hex(random_bytes(8))),
            'code' => $p['code'],
            'name' => $p['name'],
            'series' => $p['series'] ?? 'ตุ๊กตายาง RBD Luxury',
            'description' => $p['description'] ?? '',
            'image' => $p['image'],
            'secondary_image' => $p['secondaryImage'] ?? $p['image'],
            'gallery_json' => json_encode($p['gallery'] ?? [$p['image']], JSON_UNESCAPED_UNICODE),
            'total_angles' => (int)($p['totalAngles'] ?? 4),
            'category' => $p['category'] ?? 'ตุ๊กตายางซิลิโคน',
            'categories_json' => json_encode($p['categories'] ?? ['all'], JSON_UNESCAPED_UNICODE),
            'height' => $p['height'] ?? '',
            'weight' => $p['weight'] ?? '',
            'bust' => $p['bust'] ?? '',
            'price' => $p['price'] ?? 'ติดต่อสอบถามทาง LINE',
            'is_ready_to_ship' => !empty($p['isReadyToShip']) ? 1 : 0
        ]);
        $success++;
    } catch (PDOException $e) {
        echo "Error at index $i (Code: {$p['code']}): " . $e->getMessage() . "\n";
    }
}

echo "Successfully inserted: $success / " . count($jsonProducts) . "\n";
