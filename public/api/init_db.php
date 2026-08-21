<?php
/**
 * RUBBER DOLL THAILAND - 1-Click Database Installer & Seeder
 */
require_once __DIR__ . '/config.php';

$pdo = getDbConnection();

if (!$pdo) {
    ?>
    <!DOCTYPE html>
    <html lang="th">
    <head>
        <meta charset="UTF-8">
        <title>Database Setup - RUBBER DOLL THAILAND</title>
        <script src="https://cdn.tailwindcss.com"></script>
    </head>
    <body class="bg-gray-900 text-white min-h-screen flex items-center justify-center p-4">
        <div class="max-w-md w-full bg-gray-800 rounded-2xl p-6 border border-gray-700 space-y-4">
            <h1 class="text-xl font-bold text-amber-400">⚠️ ยังไม่ได้เชื่อมต่อฐานข้อมูล MySQL</h1>
            <p class="text-sm text-gray-300">กรุณาสร้างฐานข้อมูล MySQL ใน Hostinger hPanel แล้วนำข้อมูลมากรอกในไฟล์ <code class="bg-gray-900 px-2 py-1 rounded text-amber-300">public/api/config.php</code> ครับ</p>
            <div class="bg-gray-900 p-4 rounded-xl text-xs space-y-1 font-mono text-gray-400">
                <p>DB_HOST: localhost</p>
                <p>DB_NAME: ชื่อฐานข้อมูลใน Hostinger</p>
                <p>DB_USER: ชื่อผู้ใช้ฐานข้อมูล</p>
                <p>DB_PASS: รหัสผ่านฐานข้อมูล</p>
            </div>
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

// 2. Create Default Admin if not exists
$stmt = $pdo->prepare("SELECT COUNT(*) FROM admin_users");
$stmt->execute();
if ($stmt->fetchColumn() == 0) {
    $defaultHash = password_hash('rbd2026master', PASSWORD_DEFAULT);
    $stmt = $pdo->prepare("INSERT INTO admin_users (username, password_hash) VALUES ('admin', :hash)");
    $stmt->execute(['hash' => $defaultHash]);
}

// 3. Seed Default Categories
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

$stmtCat = $pdo->prepare("INSERT IGNORE INTO categories (id, label_th, label_en, order_index, is_active) VALUES (?, ?, ?, ?, 1)");
foreach ($defaultCategories as $c) {
    $stmtCat->execute($c);
}

// 4. Seed Products from cache if products table is empty
$stmt = $pdo->prepare("SELECT COUNT(*) FROM products");
$stmt->execute();
$count = $stmt->fetchColumn();

$imported = 0;
if ($count == 0 && file_exists(__DIR__ . '/products_cache.json')) {
    $jsonProducts = json_decode(file_get_contents(__DIR__ . '/products_cache.json'), true);
    $stmtIns = $pdo->prepare("INSERT INTO products (id, code, name, series, description, image, secondary_image, gallery_json, total_angles, category, categories_json, height, weight, bust, price, is_ready_to_ship, is_active) 
                              VALUES (:id, :code, :name, :series, :description, :image, :secondary_image, :gallery_json, :total_angles, :category, :categories_json, :height, :weight, :bust, :price, :is_ready_to_ship, 1)");
    
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
    <title>Database Initialized - RUBBER DOLL THAILAND</title>
    <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="bg-gray-900 text-white min-h-screen flex items-center justify-center p-4">
    <div class="max-w-md w-full bg-gray-800 rounded-2xl p-6 border border-emerald-500/30 shadow-2xl space-y-4 text-center">
        <div class="w-16 h-16 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mx-auto text-3xl">✓</div>
        <h1 class="text-2xl font-bold text-white">ติดตั้งฐานข้อมูลสำเร็จ 100%!</h1>
        <p class="text-sm text-gray-300">ระบบได้สร้างตาราง MySQL และนำเข้าสินค้าทั้งหมด <strong><?= $imported ?: $count ?> รายการ</strong> เรียบร้อยแล้วครับ</p>
        
        <div class="bg-gray-900 p-4 rounded-xl text-left text-xs space-y-2 border border-gray-700">
            <p class="font-bold text-amber-400">🔑 ข้อมูลล็อกอินหลังบ้านเริ่มต้น:</p>
            <p>ชื่อผู้ใช้: <code class="text-white font-mono bg-gray-800 px-2 py-0.5 rounded">admin</code></p>
            <p>รหัสผ่าน: <code class="text-white font-mono bg-gray-800 px-2 py-0.5 rounded">rbd2026master</code></p>
        </div>

        <a href="/admin" class="block w-full bg-amber-500 hover:bg-amber-600 text-gray-900 font-bold py-3 rounded-xl transition-all">
            เข้าสู่ระบบหลังบ้าน (Admin Dashboard) ➔
        </a>
    </div>
</body>
</html>
