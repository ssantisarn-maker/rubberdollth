<?php
require_once __DIR__ . '/config.php';

checkAdminAuth();

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    sendError('Method not allowed', 405);
}

if (empty($_FILES['image'])) {
    sendError('ไม่พบไฟล์รูปภาพที่อัปโหลด');
}

$file = $_FILES['image'];
$allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

if (!in_array($file['type'], $allowedTypes)) {
    sendError('รองรับเฉพาะไฟล์รูปภาพ (JPG, PNG, WebP) เท่านั้น');
}

$uploadDir = __DIR__ . '/../../images/products/';
if (!is_dir($uploadDir)) {
    mkdir($uploadDir, 0755, true);
}

$productCode = preg_replace('/[^a-zA-Z0-9_-]/', '', $_POST['code'] ?? 'IMG');
$suffix = $_POST['type'] ?? 'gallery'; // main, hover, g1, etc.
$filename = $productCode . '_' . time() . '_' . $suffix . '.webp';
$targetPath = $uploadDir . $filename;

// If GD extension is available, convert to WebP automatically for high speed
if (function_exists('imagewebp')) {
    $sourceImage = null;
    if ($file['type'] === 'image/jpeg') {
        $sourceImage = imagecreatefromjpeg($file['tmp_name']);
    } elseif ($file['type'] === 'image/png') {
        $sourceImage = imagecreatefrompng($file['tmp_name']);
        imagepalettetotruecolor($sourceImage);
        imagealphablending($sourceImage, true);
        imagesavealpha($sourceImage, true);
    } elseif ($file['type'] === 'image/webp') {
        $sourceImage = imagecreatefromwebp($file['tmp_name']);
    }

    if ($sourceImage) {
        imagewebp($sourceImage, $targetPath, 85);
        imagedestroy($sourceImage);
    } else {
        move_uploaded_file($file['tmp_name'], $targetPath);
    }
} else {
    move_uploaded_file($file['tmp_name'], $targetPath);
}

$publicUrl = '/images/products/' . $filename;

sendResponse([
    'success' => true,
    'message' => 'อัปโหลดรูปภาพสำเร็จ',
    'url' => $publicUrl,
    'filename' => $filename
]);
