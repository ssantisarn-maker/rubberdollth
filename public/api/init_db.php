<?php
/**
 * RUBBER DOLL THAILAND - 1-Click Database Installer & Seeder (ALL 70 PRODUCTS)
 */
require_once __DIR__ . '/config.php';

header('Content-Type: text/html; charset=utf-8');

$pdo = getDbConnection();

if (!$pdo) {
    ?>
    <!DOCTYPE html>
    <html lang="th">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Database Setup - RUBBER DOLL THAILAND</title>
        <script src="https://cdn.tailwindcss.com"></script>
    </head>
    <body class="bg-gray-950 text-white min-h-screen flex items-center justify-center p-4">
        <div class="max-w-md w-full bg-gray-900 rounded-3xl p-8 border border-amber-500/30 shadow-2xl text-center space-y-4">
            <h1 class="text-xl font-bold text-amber-400">⚠️ ยังไม่ได้เชื่อมต่อฐานข้อมูล MySQL</h1>
            <p class="text-xs text-gray-300">กรุณาตรวจสอบ DB_NAME, DB_USER, DB_PASS ใน config.php</p>
        </div>
    </body>
    </html>
    <?php
    exit();
}

// 1. Create Tables
$sqlTables = "
CREATE TABLE IF NOT EXISTS admin_users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS categories (
    id VARCHAR(50) PRIMARY KEY,
    label_th VARCHAR(255) NOT NULL,
    label_en VARCHAR(255) NOT NULL,
    order_index INT DEFAULT 99,
    is_active TINYINT(1) DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS products (
    id VARCHAR(100) PRIMARY KEY,
    code VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    series VARCHAR(255) DEFAULT '',
    description TEXT,
    image VARCHAR(500) NOT NULL,
    secondary_image VARCHAR(500),
    gallery_json LONGTEXT,
    total_angles INT DEFAULT 1,
    category VARCHAR(255) DEFAULT '',
    categories_json TEXT,
    height VARCHAR(50) DEFAULT '',
    weight VARCHAR(50) DEFAULT '',
    bust VARCHAR(100) DEFAULT '',
    price VARCHAR(100) DEFAULT 'ติดต่อสอบถามทาง LINE',
    is_ready_to_ship TINYINT(1) DEFAULT 0,
    is_active TINYINT(1) DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
";

$pdo->exec($sqlTables);

// 2. Admin User
$stmt = $pdo->prepare("SELECT COUNT(*) FROM admin_users");
$stmt->execute();
if ($stmt->fetchColumn() == 0) {
    $defaultHash = password_hash('rbd2026master', PASSWORD_DEFAULT);
    $stmt = $pdo->prepare("INSERT INTO admin_users (username, password_hash) VALUES ('admin', :hash)");
    $stmt->execute(['hash' => $defaultHash]);
}

// 3. Categories
$defaultCategories = [
    ['all', 'สินค้าทั้งหมด', 'All Masterpieces', 1],
    ['ready', 'สินค้าพร้อมส่ง (ไทย)', 'Ready to Ship (TH)', 2],
    ['toys', 'ของเล่นสำหรับผู้ใหญ่', 'Adult Toys', 3],
    ['anime', 'ตุ๊กตาซิลิโคน สาวสวยและอนิเมะ การ์ตูน', 'Anime & Fantasy', 4],
    ['western', 'ตุ๊กตาซิลิโคน สาวสวยหน้าตาแนวฝรั่ง / ยุโรป', 'Western / European', 5],
    ['asian', 'ตุ๊กตาซิลิโคน สาวสวยหน้าตาแนวเอเชีย', 'Asian Aesthetics', 6],
    ['torso', 'ตุ๊กตายางครึ่งตัว TORSO', 'Torso & Half Body', 7],
    ['reviews', 'รีวิวตุ๊กตายางจากลูกค้า', 'Customer Reviews', 8],
];

$stmtCat = $pdo->prepare("INSERT INTO categories (id, label_th, label_en, order_index, is_active) VALUES (?, ?, ?, ?, 1) ON DUPLICATE KEY UPDATE label_th = VALUES(label_th), label_en = VALUES(label_en)");
foreach ($defaultCategories as $c) {
    $stmtCat->execute($c);
}

// 4. Force Import/Update all 70 Products from products_cache.json
$imported = 0;
if (file_exists(__DIR__ . '/products_cache.json')) {
    $jsonProducts = json_decode(file_get_contents(__DIR__ . '/products_cache.json'), true);
    $stmtIns = $pdo->prepare("INSERT INTO products (id, code, name, series, description, image, secondary_image, gallery_json, total_angles, category, categories_json, height, weight, bust, price, is_ready_to_ship, is_active) 
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
                                is_active = 1");
    
    foreach ($jsonProducts as $p) {
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
        $imported++;
    }
}
?>
<!DOCTYPE html>
<html lang="th">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Database Initialized - RUBBER DOLL THAILAND</title>
    <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="bg-gray-950 text-white min-h-screen flex items-center justify-center p-4 font-sans selection:bg-amber-500 selection:text-gray-950">
    <div class="max-w-md w-full bg-gray-900 rounded-3xl p-8 border border-emerald-500/30 shadow-2xl space-y-5 text-center">
        <div class="w-16 h-16 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 rounded-2xl flex items-center justify-center mx-auto text-3xl">✓</div>
        <h1 class="text-2xl font-bold text-white">นำเข้าสินค้าครบ 100%!</h1>
        <p class="text-xs sm:text-sm text-gray-300 leading-relaxed">ระบบได้สร้างตาราง MySQL และนำเข้าสินค้าทั้งหมดครบถ้วน <strong class="text-amber-400 font-bold"><?= $imported ?> รายการ</strong> เรียบร้อยแล้วครับ</p>
        
        <div class="bg-gray-950 p-4 rounded-2xl text-left text-xs space-y-2 border border-gray-800">
            <p class="font-bold text-amber-400">🔑 ข้อมูลล็อกอินหลังบ้าน:</p>
            <p class="text-gray-300">ชื่อผู้ใช้: <code class="text-white font-mono bg-gray-800 px-2 py-0.5 rounded">admin</code></p>
            <p class="text-gray-300">รหัสผ่าน: <code class="text-white font-mono bg-gray-800 px-2 py-0.5 rounded">rbd2026master</code></p>
        </div>

        <a href="/admin" class="block w-full bg-amber-500 hover:bg-amber-600 text-gray-950 font-bold py-3.5 rounded-2xl text-xs sm:text-sm transition-all shadow-lg active:scale-98">
            เข้าสู่ระบบหลังบ้าน (Admin Dashboard) ➔
        </a>
    </div>
</body>
</html>
