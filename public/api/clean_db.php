<?php
error_reporting(E_ALL);
ini_set('display_errors', 0);
require_once __DIR__ . '/config.php';
checkAdminAuth();

 = getDbConnection();
if (!) {
    sendError('Database connection failed');
}

 = dirname(__DIR__);
 = ->query('SELECT id, code, image, secondary_image, gallery_json, video_url FROM products');
 = ->fetchAll();

 = 0;
foreach ( as ) {
     = json_decode(['gallery_json'] ?? '[]', true) ?: [['image']];
     = [];
    foreach ( as ) {
        if (!is_string() || empty()) continue;
        if (strpos(, '/images/products/') === 0) {
            if (file_exists( . )) {
                [] = ;
            }
        } elseif (strpos(, 'http') === 0 && strpos(, 'https://cdn.zyrosite.com/') !== 0) {
            [] = ;
        }
    }
    if (empty()) {
         = [['image']];
    }

     = trim(['video_url'] ?? '');
    if (strpos(, '/images/videos/') === 0 && !file_exists( . )) {
         = '';
    }

     = ->prepare('UPDATE products SET gallery_json = :g, total_angles = :t, video_url = :v WHERE id = :id');
    ->execute([
        'g' => json_encode(array_values(), JSON_UNESCAPED_UNICODE),
        't' => count(),
        'v' => ,
        'id' => ['id']
    ]);
    ++;
}

syncCacheFromDb(, __DIR__ . '/products_cache.json');

sendResponse([
    'success' => true,
    'message' => 'Cleaned up ' .  . ' products in database and cache successfully.'
]);
