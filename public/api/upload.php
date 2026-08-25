<?php
/**
 * RUBBER DOLL THAILAND - Robust Media Upload API (Photos & Videos)
 * Supports WebP images, MP4/WebM videos, and Customer Review media
 */
error_reporting(E_ALL);
ini_set('display_errors', 0);
ini_set('upload_max_filesize', '100M');
ini_set('post_max_size', '100M');

require_once __DIR__ . '/config.php';

checkAdminAuth();

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    sendError('Method not allowed', 405);
}

$fileKey = !empty($_FILES['video']) ? 'video' : (!empty($_FILES['image']) ? 'image' : null);
if (!$fileKey || empty($_FILES[$fileKey])) {
    sendError('ไม่พบไฟล์ที่อัปโหลด');
}

$file = $_FILES[$fileKey];
$ext = strtolower(pathinfo($file['name'], PATHINFO_EXTENSION));

$validImgExts = ['jpg', 'jpeg', 'png', 'webp', 'gif'];
$validVideoExts = ['mp4', 'webm', 'mov', 'm4v'];

$isVideo = in_array($ext, $validVideoExts) || $fileKey === 'video';
$type = $_POST['type'] ?? ($isVideo ? 'video' : 'product');
$isReview = ($type === 'review' || !empty($_POST['is_review']));

// Base directories
$baseDir = dirname(__DIR__) . '/images/';
if ($isVideo) {
    $subDir = 'videos/';
} elseif ($isReview) {
    $subDir = 'reviews/';
} else {
    $subDir = 'products/';
}

$uploadDir = $baseDir . $subDir;
if (!is_dir($uploadDir)) {
    @mkdir($uploadDir, 0777, true);
}

$prefix = $isVideo ? 'VID' : ($isReview ? 'REV' : preg_replace('/[^a-zA-Z0-9_-]/', '', $_POST['code'] ?? 'PROD'));
$uniqueId = time() . '_' . bin2hex(random_bytes(3));

if ($isVideo) {
    // Handle video save
    $filename = $prefix . '_' . $uniqueId . '.' . $ext;
    $targetPath = $uploadDir . $filename;
    if (!@move_uploaded_file($file['tmp_name'], $targetPath)) {
        @copy($file['tmp_name'], $targetPath);
    }
} else {
    // Handle image save (WebP conversion if available)
    $filename = $prefix . '_' . $uniqueId . '.webp';
    $targetPath = $uploadDir . $filename;
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
        $filename = $prefix . '_' . $uniqueId . '.' . $ext;
        $targetPath = $uploadDir . $filename;
        if (!@move_uploaded_file($file['tmp_name'], $targetPath)) {
            @copy($file['tmp_name'], $targetPath);
        }
    }
}

// Verify that file was physically written to disk
if (!file_exists($targetPath) || filesize($targetPath) === 0) {
    sendError('ไม่สามารถบันทึกไฟล์ลงเซิร์ฟเวอร์ได้ กรุณาตรวจสอบสิทธิ์การเขียนโฟลเดอร์ images/');
}

$publicUrl = '/images/' . $subDir . $filename;

sendResponse([
    'success' => true,
    'message' => $isVideo ? 'อัปโหลดวิดีโอสำเร็จ' : 'อัปโหลดรูปภาพสำเร็จ',
    'url' => $publicUrl,
    'filename' => $filename,
    'is_video' => $isVideo
]);

