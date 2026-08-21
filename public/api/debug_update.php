<?php
error_reporting(E_ALL);
ini_set('display_errors', 1);

header('Content-Type: text/plain; charset=utf-8');

require_once __DIR__ . '/config.php';

$pdo = getDbConnection();
if (!$pdo) {
    echo "DB Connection failed\n";
    exit();
}

$code = 'HALF-27';
$name = 'น้องยูกิ (Yuki) - Test Direct Update';
$isReadyToShip = 1;

try {
    $stmt = $pdo->prepare("UPDATE products SET name = :name, is_ready_to_ship = :is_ready_to_ship WHERE code = :code");
    $stmt->execute([
        'name' => $name,
        'is_ready_to_ship' => $isReadyToShip,
        'code' => $code
    ]);
    echo "SUCCESS: Updated $code directly in MySQL! Affected rows: " . $stmt->rowCount() . "\n";
} catch (PDOException $e) {
    echo "PDO Error: " . $e->getMessage() . "\n";
}
