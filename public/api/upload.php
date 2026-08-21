<?php
/**
 * RUBBER DOLL THAILAND - Robust Image Upload API
 * Supports WebP conversion, Product photos, and Customer Review photos
 */
error_reporting(E_ALL);
ini_set('display_errors', 0);

require_once __DIR__ . '/config.php';

checkAdminAuth();

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    sendError('Method not allowed', 405);
}

if (empty($_FILES['image'])) {
    sendError('ไม่พบไฟล์รูปภาพที่อัปโหลด');
}

$file = $_FILES['image'];
$allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/jpg'];

// Fallback extension check
$ext = strtolower(pathinfo($file['name'], PATHINFO_EXTENSION));
$validExts = ['jpg', 'jpeg', 'png', 'webp', 'gif'];
if (!in_array($ext, $validExts)) {
    sendError('รองรับเฉพาะไฟล์รูปภาพ (JPG, PNG, WebP) เท่านั้น');
}

$type = $_POST['type'] ?? 'product'; // 'product', 'review', 'gallery'
$isReview = ($type === 'review' || !empty($_POST['is_review']));

// Target directories (inside public_html)
$baseImagesDir = dirname(__DIR__) . '/images/';
$subDir = $isReview ? 'reviews/' : 'products/';
$uploadDir = $baseImagesDir . $subDir;

if (!is_dir($uploadDir)) {
    @mkdir($uploadDir, 0777, true);
}

$prefix = $isReview ? 'REV' : preg_replace('/[^a-zA-Z0-9_-]/', '', $_POST['code'] ?? 'PROD');
$uniqueId = time() . '_' . bin2hex(random_bytes(3));
$filename = $prefix . '_' . $uniqueId . '.webp';
$targetPath = $uploadDir . $filename;

// WebP Conversion with fallback
$converted = false;
if (function_exists('imagewebp') && function_exists('imagecreatefromstring')) {
    $fileData = @file_get_contents($file['tmp_name']);
    if ($fileData) {
        $sourceImage = @imagecreatefromstring($fileData);
        if ($sourceImage) {
            imagepalettetotruecolor($sourceImage);
            imagealphablending($sourceImage, true);
            imagesavealpha($sourceImage, true);
            if (@imagewebp($sourceImage, $targetPath, 85)) {
                $converted = true;
            }
            @imagedestroy($sourceImage);
        }
    }
}

if (!$converted) {
    // If WebP conversion failed or not available, keep original extension
    $origFilename = $prefix . '_' . $uniqueId . '.' . $ext;
    $targetPath = $uploadDir . $origFilename;
    if (!@move_uploaded_file($file['tmp_name'], $targetPath)) {
        // Direct copy fallback
        @copy($file['tmp_name'], $targetPath);
    }
    $filename = $origFilename;
}

$publicUrl = '/images/' . $subDir . $filename;

sendResponse([
    'success' => true,
    'message' => 'อัปโหลดรูปภาพสำเร็จ',
    'url' => $publicUrl,
    'filename' => $filename
]);
