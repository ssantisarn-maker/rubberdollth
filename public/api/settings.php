<?php
/**
 * RUBBER DOLL THAILAND - Global Site Settings API
 */
error_reporting(E_ALL);
ini_set('display_errors', 0);

require_once __DIR__ . '/config.php';

$method = $_SERVER['REQUEST_METHOD'];
$pdo = getDbConnection();
$jsonCacheFile = __DIR__ . '/settings_cache.json';

// GET: Return site settings
if ($method === 'GET') {
    if ($pdo) {
        try {
            $stmt = $pdo->query("SELECT setting_key, setting_value FROM site_settings");
            $rows = $stmt->fetchAll(PDO::FETCH_KEY_PAIR);
            if (!empty($rows)) {
                $settings = [];
                foreach ($rows as $k => $v) {
                    $decoded = json_decode($v, true);
                    $settings[$k] = (json_last_error() === JSON_ERROR_NONE) ? $decoded : $v;
                }
                sendResponse(['success' => true, 'settings' => $settings, 'source' => 'mysql']);
            }
        } catch (Exception $e) {}
    }

    if (file_exists($jsonCacheFile)) {
        $cached = json_decode(file_get_contents($jsonCacheFile), true);
        sendResponse(['success' => true, 'settings' => $cached, 'source' => 'cache']);
    } else {
        sendError('Settings unavailable', 404);
    }
}

function syncOpenGraphToIndexHtml($settings) {
    if (empty($settings) || !is_array($settings)) return false;

    // Check possible locations of index.html (public_html/index.html or dev/dist)
    $candidatePaths = [
        dirname(__DIR__) . '/index.html',
        dirname(dirname(__DIR__)) . '/index.html',
        dirname(dirname(__DIR__)) . '/dist/index.html'
    ];

    $updatedAny = false;
    $ogTitle = !empty($settings['seo_og_title']) ? $settings['seo_og_title'] : '';
    $ogDesc = !empty($settings['seo_og_desc']) ? $settings['seo_og_desc'] : '';
    $ogImg = !empty($settings['seo_og_image']) ? $settings['seo_og_image'] : '';

    foreach ($candidatePaths as $path) {
        if (!file_exists($path) || !is_writable($path)) continue;

        $html = @file_get_contents($path);
        if (empty($html)) continue;

        if (!empty($ogTitle)) {
            $escaped = htmlspecialchars($ogTitle, ENT_QUOTES, 'UTF-8');
            $html = preg_replace('/<title>.*?<\/title>/is', '<title>' . $escaped . '</title>', $html);
            $html = preg_replace('/<meta\s+name=["\']title["\']\s+content=["\'].*?["\']/is', '<meta name="title" content="' . $escaped . '"', $html);
            $html = preg_replace('/<meta\s+property=["\']og:title["\']\s+content=["\'].*?["\']/is', '<meta property="og:title" content="' . $escaped . '"', $html);
            $html = preg_replace('/<meta\s+name=["\']twitter:title["\']\s+content=["\'].*?["\']/is', '<meta name="twitter:title" content="' . $escaped . '"', $html);
        }

        if (!empty($ogDesc)) {
            $escaped = htmlspecialchars($ogDesc, ENT_QUOTES, 'UTF-8');
            $html = preg_replace('/<meta\s+name=["\']description["\']\s+content=["\'].*?["\']/is', '<meta name="description" content="' . $escaped . '"', $html);
            $html = preg_replace('/<meta\s+property=["\']og:description["\']\s+content=["\'].*?["\']/is', '<meta property="og:description" content="' . $escaped . '"', $html);
            $html = preg_replace('/<meta\s+name=["\']twitter:description["\']\s+content=["\'].*?["\']/is', '<meta name="twitter:description" content="' . $escaped . '"', $html);
        }

        if (!empty($ogImg)) {
            $escaped = htmlspecialchars($ogImg, ENT_QUOTES, 'UTF-8');
            $html = preg_replace('/<meta\s+property=["\']og:image["\']\s+content=["\'].*?["\']/is', '<meta property="og:image" content="' . $escaped . '"', $html);
            $html = preg_replace('/<meta\s+name=["\']twitter:image["\']\s+content=["\'].*?["\']/is', '<meta name="twitter:image" content="' . $escaped . '"', $html);
        }

        // 4. Sync LCP Hero Image Preload to eliminate discovery delay
        $heroBg = !empty($settings['hero_bg_image']) ? $settings['hero_bg_image'] : '/images/hero-model.webp';
        if (!empty($heroBg)) {
            $escapedHero = htmlspecialchars($heroBg, ENT_QUOTES, 'UTF-8');
            $html = preg_replace('/<link\s+id=["\']lcp-hero-preload["\'].*?>/is', '<link id="lcp-hero-preload" rel="preload" as="image" fetchpriority="high" href="' . $escapedHero . '" />', $html);
        }

        // 5. Sync window.__INITIAL_SETTINGS__ into index.html to eliminate CLS (Layout Shift)
        $cleanSettings = [
            'site_title' => $settings['site_title'] ?? '',
            'hero_tag' => $settings['hero_tag'] ?? '',
            'hero_title' => $settings['hero_title'] ?? '',
            'hero_subtitle' => $settings['hero_subtitle'] ?? '',
            'hero_bg_image' => $settings['hero_bg_image'] ?? '',
            'line_url' => $settings['line_url'] ?? '',
            'announcement_enabled' => $settings['announcement_enabled'] ?? true,
            'announcement_text' => $settings['announcement_text'] ?? '',
            'announcement_badge' => $settings['announcement_badge'] ?? ''
        ];
        $jsonStr = json_encode($cleanSettings, JSON_UNESCAPED_UNICODE);
        $scriptTag = '<script id="rbd-init-settings">window.__INITIAL_SETTINGS__ = ' . $jsonStr . ';</script>';
        if (strpos($html, 'id="rbd-init-settings"') !== false) {
            $html = preg_replace('/<script\s+id=["\']rbd-init-settings["\']>.*?<\/script>/is', $scriptTag, $html);
        }

        @file_put_contents($path, $html);
        $updatedAny = true;
    }

    return $updatedAny;
}

// POST or PUT: Update site settings
if ($method === 'POST' || $method === 'PUT') {
    checkAdminAuth();
    $rawInput = file_get_contents('php://input');
    $data = json_decode($rawInput, true) ?: $_POST;

    if (empty($data) || !is_array($data)) {
        sendError('No settings data provided');
    }

    if ($pdo) {
        try {
            $pdo->exec("CREATE TABLE IF NOT EXISTS site_settings (
                setting_key VARCHAR(100) PRIMARY KEY,
                setting_value LONGTEXT NOT NULL,
                updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;");

            $stmt = $pdo->prepare("INSERT INTO site_settings (setting_key, setting_value) VALUES (:k, :v) ON DUPLICATE KEY UPDATE setting_value = VALUES(setting_value), updated_at = NOW()");

            foreach ($data as $k => $v) {
                $valStr = is_string($v) ? $v : json_encode($v, JSON_UNESCAPED_UNICODE);
                $stmt->execute(['k' => $k, 'v' => $valStr]);
            }

            // Sync cache
            file_put_contents($jsonCacheFile, json_encode($data, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT));
            // Sync index.html physical meta tags
            syncOpenGraphToIndexHtml($data);
            sendResponse(['success' => true, 'message' => 'บันทึกการตั้งค่าเว็บไซต์สำเร็จ', 'settings' => $data]);
        } catch (PDOException $e) {
            sendError('Database error: ' . $e->getMessage(), 500);
        }
    } else {
        // Cache fallback update
        file_put_contents($jsonCacheFile, json_encode($data, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT));
        syncOpenGraphToIndexHtml($data);
        sendResponse(['success' => true, 'message' => 'บันทึกลง Cache สำเร็จ', 'settings' => $data]);
    }
}
