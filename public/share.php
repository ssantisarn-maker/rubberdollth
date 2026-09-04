<?php
/**
 * RUBBER DOLL THAILAND - Dynamic Open Graph Product Share Router
 * Provides rich image, title, and spec cards for LINE, Facebook, Messenger, and Social Crawlers.
 * Seamlessly redirects human visitors directly to the interactive React SPA product modal.
 */

// Error handling - silent for production
error_reporting(0);
ini_set('display_errors', 0);

// Detect requested product code / id
$requestedCode = trim($_GET['p'] ?? $_GET['code'] ?? $_GET['product'] ?? '');
if (empty($requestedCode) && isset($_SERVER['REQUEST_URI'])) {
    if (preg_match('#^/p/([^/?#]+)#i', $_SERVER['REQUEST_URI'], $m)) {
        $requestedCode = urldecode($m[1]);
    }
}

// Default fallback metadata
$siteName = 'RUBBER DOLL THAILAND';
$domain = (isset($_SERVER['HTTPS']) && $_SERVER['HTTPS'] === 'on' ? "https" : "http") . "://" . ($_SERVER['HTTP_HOST'] ?? 'rubberdollth.com');
$targetUrl = $domain . '/';
$title = "ตุ๊กตายางแท้เกรดพรีเมียม | " . $siteName;
$description = "ตุ๊กตายางเกรดการแพทย์ สัดส่วนสมจริง สัมผัสเสมือนจริง จัดส่งด่วน กล่องทึบ ปลอดภัย 100%";
$imageUrl = $domain . '/images/hero/hero-bg.webp';
$productFound = false;
$productCode = '';

if (!empty($requestedCode)) {
    $cleanCode = strtolower(preg_replace('/\s+/', '', $requestedCode));
    $matchedProduct = null;

    // 1. Try reading from products_cache.json
    $cacheFile = __DIR__ . '/api/products_cache.json';
    if (file_exists($cacheFile)) {
        $cachedContent = @file_get_contents($cacheFile);
        if ($cachedContent) {
            $cacheData = @json_decode($cachedContent, true);
            if (is_array($cacheData)) {
                $items = isset($cacheData['data']) && is_array($cacheData['data']) ? $cacheData['data'] : (isset($cacheData[0]) ? $cacheData : []);
                foreach ($items as $p) {
                    $pCode = strtolower(preg_replace('/\s+/', '', $p['code'] ?? ''));
                    $pId = strtolower(preg_replace('/\s+/', '', $p['id'] ?? ''));
                    if ($pCode === $cleanCode || $pId === $cleanCode) {
                        $matchedProduct = $p;
                        break;
                    }
                }
            }
        }
    }

    // 2. If not found in cache, fallback to MySQL
    if (!$matchedProduct && file_exists(__DIR__ . '/api/config.php')) {
        try {
            require_once __DIR__ . '/api/config.php';
            if (function_exists('getDbConnection')) {
                $pdo = getDbConnection();
                if ($pdo) {
                    $stmt = $pdo->prepare("SELECT * FROM products WHERE LOWER(REPLACE(code, ' ', '')) = :code OR LOWER(REPLACE(id, ' ', '')) = :id LIMIT 1");
                    $stmt->execute(['code' => $cleanCode, 'id' => $cleanCode]);
                    $row = $stmt->fetch(PDO::FETCH_ASSOC);
                    if ($row) {
                        $matchedProduct = $row;
                    }
                }
            }
        } catch (Exception $e) {
            // Silently fall through
        }
    }

    // 3. Build rich metadata if product found
    if ($matchedProduct) {
        $productFound = true;
        $productCode = $matchedProduct['code'] ?? $requestedCode;
        $productName = $matchedProduct['name'] ?? '';
        $productPrice = $matchedProduct['price'] ?? '';
        $height = $matchedProduct['height'] ?? '';
        $weight = $matchedProduct['weight'] ?? '';
        $bust = $matchedProduct['bust'] ?? '';
        $waist = $matchedProduct['waist'] ?? '';
        $hips = $matchedProduct['hips'] ?? '';
        $isReady = !empty($matchedProduct['is_ready_to_ship']) || !empty($matchedProduct['isReadyToShip']);

        // Title
        $title = "ตุ๊กตายาง รุ่น {$productCode} - {$productName}" . ($isReady ? " (พร้อมส่งในไทย)" : "");

        // Description with specs
        $specs = [];
        if ($height) $specs[] = "สูง {$height} cm";
        if ($bust || $waist || $hips) $specs[] = "สัดส่วน {$bust}-{$waist}-{$hips}";
        if ($weight) $specs[] = "นน. {$weight} kg";
        if ($productPrice) $specs[] = "ราคา {$productPrice}";
        $specsText = implode(' | ', $specs);

        $description = $specsText ? "{$specsText} - ซิลิโคนแท้ระดับพรีเมียม สั่งซื้อ/สอบถามได้ที่ RUBBER DOLL THAILAND" : "ตุ๊กตายางเกรด Hi-End รุ่น {$productCode} พร้อมรูปถ่ายและวิดีโอตัวอย่างสินค้า";

        // Image determination
        $img = $matchedProduct['image'] ?? '';
        if (empty($img) && !empty($matchedProduct['gallery_json'])) {
            $gallery = @json_decode($matchedProduct['gallery_json'], true);
            if (is_array($gallery) && !empty($gallery[0])) {
                $img = $gallery[0];
            }
        }
        if (is_array($img) && !empty($img[0])) {
            $img = $img[0];
        }

        if (!empty($img)) {
            if (preg_match('#^https?://#i', $img)) {
                $imageUrl = $img;
            } else {
                $imageUrl = $domain . '/' . ltrim($img, '/');
            }
        }

        // Target URL for redirect
        $targetUrl = $domain . '/?p=' . rawurlencode($productCode);
    }
}

// Detect bots / social media crawlers
$userAgent = strtolower($_SERVER['HTTP_USER_AGENT'] ?? '');
$isBot = preg_match('/(line-poker|facebookexternalhit|meta-externalagent|twitterbot|slackbot|whatsapp|telegrambot|discordbot|bingbot|googlebot|applebot)/i', $userAgent);

// If real user (not crawler bot), we redirect smoothly via HTTP 302 or instant JS/meta refresh
if (!$isBot && $productFound) {
    header("Location: {$targetUrl}", true, 302);
}
?>
<!DOCTYPE html>
<html lang="th">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title><?= htmlspecialchars($title, ENT_QUOTES, 'UTF-8') ?></title>
    <meta name="description" content="<?= htmlspecialchars($description, ENT_QUOTES, 'UTF-8') ?>">
    <link rel="canonical" href="<?= htmlspecialchars($targetUrl, ENT_QUOTES, 'UTF-8') ?>">

    <!-- Open Graph / LINE / Facebook / Messenger -->
    <meta property="og:type" content="product">
    <meta property="og:url" content="<?= htmlspecialchars($targetUrl, ENT_QUOTES, 'UTF-8') ?>">
    <meta property="og:title" content="<?= htmlspecialchars($title, ENT_QUOTES, 'UTF-8') ?>">
    <meta property="og:description" content="<?= htmlspecialchars($description, ENT_QUOTES, 'UTF-8') ?>">
    <meta property="og:image" content="<?= htmlspecialchars($imageUrl, ENT_QUOTES, 'UTF-8') ?>">
    <meta property="og:image:secure_url" content="<?= htmlspecialchars($imageUrl, ENT_QUOTES, 'UTF-8') ?>">
    <meta property="og:image:alt" content="<?= htmlspecialchars($title, ENT_QUOTES, 'UTF-8') ?>">
    <meta property="og:site_name" content="<?= htmlspecialchars($siteName, ENT_QUOTES, 'UTF-8') ?>">

    <!-- Twitter Card -->
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:url" content="<?= htmlspecialchars($targetUrl, ENT_QUOTES, 'UTF-8') ?>">
    <meta name="twitter:title" content="<?= htmlspecialchars($title, ENT_QUOTES, 'UTF-8') ?>">
    <meta name="twitter:description" content="<?= htmlspecialchars($description, ENT_QUOTES, 'UTF-8') ?>">
    <meta name="twitter:image" content="<?= htmlspecialchars($imageUrl, ENT_QUOTES, 'UTF-8') ?>">

    <!-- Instant Client-Side Redirection -->
    <meta http-equiv="refresh" content="0;url=<?= htmlspecialchars($targetUrl, ENT_QUOTES, 'UTF-8') ?>">
    <script>
        window.location.replace(<?= json_encode($targetUrl) ?>);
    </script>

    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
            background-color: #0b0f17;
            color: #f1f5f9;
            display: flex;
            align-items: center;
            justify-content: center;
            min-height: 100vh;
            margin: 0;
            padding: 20px;
            text-align: center;
        }
        .card {
            background: #1e293b;
            border: 1px solid #334155;
            padding: 24px;
            border-radius: 16px;
            max-width: 400px;
            box-shadow: 0 10px 25px rgba(0,0,0,0.5);
        }
        .img-preview {
            width: 100%;
            height: 240px;
            object-fit: cover;
            border-radius: 12px;
            margin-bottom: 16px;
        }
        h1 {
            font-size: 18px;
            margin: 0 0 8px;
            color: #d4af37;
        }
        p {
            font-size: 13px;
            color: #94a3b8;
            margin: 0 0 20px;
            line-height: 1.5;
        }
        a.btn {
            display: inline-block;
            background: #06C755;
            color: white;
            padding: 12px 24px;
            border-radius: 9999px;
            text-decoration: none;
            font-weight: bold;
            font-size: 14px;
        }
    </style>
</head>
<body>
    <div class="card">
        <?php if (!empty($imageUrl)): ?>
            <img src="<?= htmlspecialchars($imageUrl, ENT_QUOTES, 'UTF-8') ?>" alt="<?= htmlspecialchars($title, ENT_QUOTES, 'UTF-8') ?>" class="img-preview">
        <?php endif; ?>
        <h1><?= htmlspecialchars($title, ENT_QUOTES, 'UTF-8') ?></h1>
        <p><?= htmlspecialchars($description, ENT_QUOTES, 'UTF-8') ?></p>
        <a href="<?= htmlspecialchars($targetUrl, ENT_QUOTES, 'UTF-8') ?>" class="btn">
            กำลังนำท่านไปยังหน้ารายการสินค้า...
        </a>
    </div>
</body>
</html>