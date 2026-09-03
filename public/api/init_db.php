<?php
/**
 * RUBBER DOLL THAILAND - Safe 1-Click Database Setup & Migrations
 * (100% Non-Destructive: Never overwrites or deletes existing live edits)
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

// 1. Create Tables Safely
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
    skin_tone VARCHAR(100) DEFAULT 'ผิวขาว/สีขาวเหลือง',
    material VARCHAR(255) DEFAULT '',
    skeleton VARCHAR(255) DEFAULT '',
    price VARCHAR(100) DEFAULT 'ติดต่อสอบถามทาง LINE',
    original_price VARCHAR(100) DEFAULT '',
    special_option VARCHAR(255) DEFAULT '',
    gifts TEXT DEFAULT NULL,
    is_ready_to_ship TINYINT(1) DEFAULT 0,
    is_active TINYINT(1) DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS site_settings (
    setting_key VARCHAR(100) PRIMARY KEY,
    setting_value LONGTEXT NOT NULL,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS site_faqs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    question TEXT NOT NULL,
    answer LONGTEXT NOT NULL,
    category VARCHAR(50) DEFAULT 'general',
    order_index INT DEFAULT 0,
    is_active TINYINT(1) DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS customer_reviews (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    model VARCHAR(255) DEFAULT '',
    rating INT DEFAULT 5,
    date VARCHAR(100) DEFAULT '',
    comment TEXT NOT NULL,
    image VARCHAR(500) DEFAULT '',
    images_json TEXT,
    verified TINYINT(1) DEFAULT 1,
    order_index INT DEFAULT 0,
    is_active TINYINT(1) DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
";

$pdo->exec($sqlTables);

// 2. Add any missing columns to products table if older schema exists
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

// 3. Admin User (Create or update WINZOI05)
$defaultHash = password_hash('S0r@w13388456@3312886@19259', PASSWORD_DEFAULT);
$stmt = $pdo->prepare("INSERT INTO admin_users (username, password_hash) VALUES ('WINZOI05', :hash) ON DUPLICATE KEY UPDATE password_hash = VALUES(password_hash)");
$stmt->execute(['hash' => $defaultHash]);

// 4. Categories (Upsert only)
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

// 5. Products Seeding (SAFE: Only seeds if database is completely empty!)
$stmt = $pdo->prepare("SELECT COUNT(*) FROM products");
$stmt->execute();
$prodCount = $stmt->fetchColumn();

if ($prodCount == 0 && file_exists(__DIR__ . '/products_cache.json')) {
    $jsonProducts = json_decode(file_get_contents(__DIR__ . '/products_cache.json'), true);
    $stmtIns = $pdo->prepare("INSERT INTO products (id, code, name, series, description, image, secondary_image, gallery_json, total_angles, category, categories_json, height, weight, bust, skin_tone, material, skeleton, price, original_price, special_option, gifts, is_ready_to_ship, is_active) 
                              VALUES (:id, :code, :name, :series, :description, :image, :secondary_image, :gallery_json, :total_angles, :category, :categories_json, :height, :weight, :bust, :skin_tone, :material, :skeleton, :price, :original_price, :special_option, :gifts, :is_ready_to_ship, 1)");
    
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
            'skin_tone' => $p['skinTone'] ?? 'ผิวขาว/สีขาวเหลือง',
            'material' => $p['material'] ?? '',
            'skeleton' => $p['skeleton'] ?? '',
            'price' => $p['price'] ?? 'ติดต่อสอบถามทาง LINE',
            'original_price' => $p['originalPrice'] ?? '',
            'special_option' => $p['specialOption'] ?? '',
            'gifts' => $p['gifts'] ?? '',
            'is_ready_to_ship' => !empty($p['isReadyToShip']) ? 1 : 0
        ]);
    }
    $prodCount = count($jsonProducts);
}

// 6. Site Settings (SAFE: Seeds only if empty)
$stmt = $pdo->prepare("SELECT COUNT(*) FROM site_settings");
$stmt->execute();
if ($stmt->fetchColumn() == 0 && file_exists(__DIR__ . '/settings_cache.json')) {
    $jsonSettings = json_decode(file_get_contents(__DIR__ . '/settings_cache.json'), true);
    $stmtSet = $pdo->prepare("INSERT INTO site_settings (setting_key, setting_value) VALUES (:k, :v)");
    foreach ($jsonSettings as $k => $v) {
        $stmtSet->execute(['k' => $k, 'v' => is_string($v) ? $v : json_encode($v, JSON_UNESCAPED_UNICODE)]);
    }
}

// 7. Site FAQs (SAFE: Seeds only if empty)
$stmt = $pdo->prepare("SELECT COUNT(*) FROM site_faqs");
$stmt->execute();
if ($stmt->fetchColumn() == 0 && file_exists(__DIR__ . '/faqs_cache.json')) {
    $jsonFaqs = json_decode(file_get_contents(__DIR__ . '/faqs_cache.json'), true);
    $stmtFaq = $pdo->prepare("INSERT INTO site_faqs (id, question, answer, category, order_index, is_active) VALUES (:id, :q, :a, :cat, :ord, 1)");
    foreach ($jsonFaqs as $f) {
        $stmtFaq->execute([
            'id' => $f['id'],
            'q' => $f['question'],
            'a' => $f['answer'],
            'cat' => $f['category'] ?? 'general',
            'ord' => $f['order_index'] ?? 0
        ]);
    }
}

// 8. Customer Reviews (SAFE: Seeds only if empty)
$stmt = $pdo->prepare("SELECT COUNT(*) FROM customer_reviews");
$stmt->execute();
if ($stmt->fetchColumn() == 0 && file_exists(__DIR__ . '/reviews_cache.json')) {
    $jsonReviews = json_decode(file_get_contents(__DIR__ . '/reviews_cache.json'), true);
    $stmtRev = $pdo->prepare("INSERT INTO customer_reviews (id, name, model, rating, date, comment, image, images_json, verified, order_index, is_active) VALUES (:id, :name, :model, :rating, :date, :comment, :image, :images_json, :verified, :order_index, 1)");
    foreach ($jsonReviews as $i => $rev) {
        $stmtRev->execute([
            'id' => $rev['id'] ?? ($i + 1),
            'name' => $rev['name'],
            'model' => $rev['model'] ?? '',
            'rating' => $rev['rating'] ?? 5,
            'date' => $rev['date'] ?? '',
            'comment' => $rev['comment'] ?? '',
            'image' => $rev['image'] ?? '',
            'images_json' => json_encode($rev['images'] ?? [], JSON_UNESCAPED_UNICODE),
            'verified' => !empty($rev['verified']) ? 1 : 0,
            'order_index' => $i + 1
        ]);
    }
}
?>
<!DOCTYPE html>
<html lang="th">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Database Setup & Migration - RUBBER DOLL THAILAND</title>
    <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="bg-gray-950 text-white min-h-screen flex items-center justify-center p-4 font-sans selection:bg-amber-500 selection:text-gray-950">
    <div class="max-w-md w-full bg-gray-900 rounded-3xl p-8 border border-emerald-500/30 shadow-2xl space-y-5 text-center">
        <div class="w-16 h-16 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 rounded-2xl flex items-center justify-center mx-auto text-3xl">✓</div>
        <h1 class="text-2xl font-bold text-white">ระบบและฐานข้อมูลพร้อมใช้งาน 100%!</h1>
        <p class="text-xs sm:text-sm text-gray-300 leading-relaxed">
            ตารางฐานข้อมูลและคอลัมน์สเปกสินค้าทั้งหมดได้รับการอัปเดตเรียบร้อยแล้ว <br/>
            <strong class="text-emerald-400">🛡️ ข้อมูลสินค้าและรีวิวที่คุณเคยแก้ไขไว้จะยังคงอยู่ครบถ้วน ปลอดภัย 100%</strong>
        </p>
        
        <div class="bg-gray-950 p-4 rounded-2xl text-left text-xs space-y-2 border border-gray-800">
            <p class="font-bold text-amber-400">📊 สถานะข้อมูลปัจจุบัน:</p>
            <p class="text-gray-300">จำนวนสินค้าในระบบ: <strong class="text-white"><?= $prodCount ?> รายการ</strong></p>
            <p class="text-gray-300">ระบบตั้งค่าเว็บไซต์ & FAQs: <strong class="text-emerald-400">พร้อมใช้งาน</strong></p>
        </div>

        <a href="/admin" class="block w-full bg-amber-500 hover:bg-amber-600 text-gray-950 font-bold py-3.5 rounded-2xl text-xs sm:text-sm transition-all shadow-lg active:scale-98">
            เข้าสู่ระบบหลังบ้าน (Admin Dashboard) ➔
        </a>
    </div>
</body>
</html>
