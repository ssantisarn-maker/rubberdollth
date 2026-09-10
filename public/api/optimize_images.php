<?php
/**
 * RUBBER DOLL THAILAND - Batch Image Optimizer for Core Web Vitals
 * Automatically downscales and compresses oversized images on server
 */
error_reporting(E_ALL);
ini_set('display_errors', 1);
set_time_limit(300);
ini_set('memory_limit', '512M');

$baseDir = dirname(__DIR__) . '/images/';
$dirsToScan = [
    $baseDir . 'products/',
    $baseDir . 'reviews/',
    $baseDir
];

$maxW = 1200;
$maxH = 1600;
$quality = 82;

$results = [];
$totalSavedBytes = 0;

foreach ($dirsToScan as $dir) {
    if (!is_dir($dir)) continue;

    $files = scandir($dir);
    foreach ($files as $f) {
        if ($f === '.' || $f === '..' || is_dir($dir . $f)) continue;

        $ext = strtolower(pathinfo($f, PATHINFO_EXTENSION));
        if (!in_array($ext, ['webp', 'jpg', 'jpeg', 'png'])) continue;

        $filePath = $dir . $f;
        $fileSizeBefore = filesize($filePath);

        if ($fileSizeBefore < 80 * 1024) continue;

        $fileData = @file_get_contents($filePath);
        if (!$fileData) continue;

        $srcImg = @imagecreatefromstring($fileData);
        if (!$srcImg) continue;

        $w = imagesx($srcImg);
        $h = imagesy($srcImg);
        $needsResize = ($w > $maxW || $h > $maxH);

        if ($needsResize || $fileSizeBefore > 200 * 1024) {
            $ratio = 1;
            if ($needsResize) {
                $ratio = min($maxW / $w, $maxH / $h);
            }
            $newW = (int)round($w * $ratio);
            $newH = (int)round($h * $ratio);

            $resized = imagecreatetruecolor($newW, $newH);
            imagealphablending($resized, false);
            imagesavealpha($resized, true);
            imagecopyresampled($resized, $srcImg, 0, 0, 0, 0, $newW, $newH, $w, $h);

            $tmpTarget = $filePath . '.tmp.webp';
            imagepalettetotruecolor($resized);
            imagealphablending($resized, true);
            imagesavealpha($resized, true);

            if (@imagewebp($resized, $tmpTarget, $quality)) {
                $fileSizeAfter = filesize($tmpTarget);
                if ($fileSizeAfter > 0 && $fileSizeAfter < $fileSizeBefore) {
                    rename($tmpTarget, $filePath);
                    $saved = $fileSizeBefore - $fileSizeAfter;
                    $totalSavedBytes += $saved;
                    $results[] = [
                        'file' => $f,
                        'dir' => basename($dir),
                        'orig_dims' => "{$w}x{$h}",
                        'new_dims' => "{$newW}x{$newH}",
                        'size_before' => round($fileSizeBefore / 1024, 1) . ' KB',
                        'size_after' => round($fileSizeAfter / 1024, 1) . ' KB',
                        'saved' => round($saved / 1024, 1) . ' KB (' . round(($saved / $fileSizeBefore) * 100) . '%)'
                    ];
                } else {
                    @unlink($tmpTarget);
                }
            }
            @imagedestroy($resized);
        }
        @imagedestroy($srcImg);
    }
}

header('Content-Type: text/html; charset=utf-8');
?>
<!DOCTYPE html>
<html lang="th">
<head>
    <meta charset="UTF-8">
    <title>RUBBER DOLL THAILAND - Image Optimization Report</title>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; padding: 24px; background: #FAF8F5; color: #19181B; }
        .card { background: #fff; border-radius: 16px; padding: 24px; box-shadow: 0 4px 20px rgba(0,0,0,0.06); max-width: 1000px; margin: 0 auto; }
        h1 { color: #845625; margin-top: 0; }
        .summary { background: #ECFDF5; border: 1px solid #A7F3D0; color: #065F46; padding: 16px; border-radius: 12px; margin-bottom: 20px; font-weight: bold; }
        table { width: 100%; border-collapse: collapse; margin-top: 16px; font-size: 13px; }
        th, td { padding: 10px; border-bottom: 1px solid #EAE4D8; text-align: left; }
        th { background: #F4F0E8; font-weight: bold; }
        .success { color: #047835; font-weight: bold; }
        .btn { display: inline-block; background: #845625; color: #fff; padding: 10px 20px; border-radius: 10px; text-decoration: none; font-weight: bold; margin-top: 16px; }
    </style>
</head>
<body>
    <div class="card">
        <h1>⚡ รายงานผลการบีบอัดรูปภาพเพื่อเร่งความเร็วเว็บ (Core Web Vitals)</h1>
        <div class="summary">
            🎉 ดำเนินการเสร็จสิ้น! บีบอัดรูปภาพสำเร็จทั้งหมด <?= count($results) ?> ไฟล์ | ประหยัดแบนด์วิดท์ได้รวม <?= round($totalSavedBytes / (1024 * 1024), 2) ?> MB!
        </div>

        <?php if (!empty($results)): ?>
        <table>
            <thead>
                <tr>
                    <th>โฟลเดอร์</th>
                    <th>ชื่อไฟล์</th>
                    <th>ขนาดเดิม</th>
                    <th>ขนาดใหม่</th>
                    <th>ขนาดไฟล์เดิม</th>
                    <th>ขนาดไฟล์ใหม่</th>
                    <th>ประหยัดได้</th>
                </tr>
            </thead>
            <tbody>
                <?php foreach ($results as $r): ?>
                <tr>
                    <td><code><?= htmlspecialchars($r['dir']) ?></code></td>
                    <td><b><?= htmlspecialchars($r['file']) ?></b></td>
                    <td><?= $r['orig_dims'] ?></td>
                    <td><?= $r['new_dims'] ?></td>
                    <td><?= $r['size_before'] ?></td>
                    <td><?= $r['size_after'] ?></td>
                    <td class="success"><?= $r['saved'] ?></td>
                </tr>
                <?php endforeach; ?>
            </tbody>
        </table>
        <?php else: ?>
        <p>รูปภาพทั้งหมดได้รับการปรับแต่งให้เหมาะสมแล้ว (ไม่มีไฟล์ที่ขนาดเกินกำหนด)</p>
        <?php endif; ?>

        <div style="margin-top: 24px;"><a href="/" class="btn">← กลับสู่หน้าร้านค้า</a></div>
    </div>
</body>
</html>