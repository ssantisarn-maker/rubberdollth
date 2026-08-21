<?php
error_reporting(E_ALL);
ini_set('display_errors', 1);

header('Content-Type: text/plain; charset=utf-8');

require_once __DIR__ . '/config.php';

echo "=== DATABASE CONNECTION DIAGNOSTIC ===\n";
echo "DB_HOST: " . DB_HOST . "\n";
echo "DB_NAME: " . DB_NAME . "\n";
echo "DB_USER: " . DB_USER . "\n";
echo "DB_PASS: " . substr(DB_PASS, 0, 3) . "*** (Length: " . strlen(DB_PASS) . ")\n\n";

try {
    $dsn = "mysql:host=" . DB_HOST . ";dbname=" . DB_NAME . ";charset=utf8mb4";
    $pdo = new PDO($dsn, DB_USER, DB_PASS, [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION
    ]);
    echo "SUCCESS: Connected to database successfully!\n";
} catch (PDOException $e) {
    echo "ERROR CODE: " . $e->getCode() . "\n";
    echo "ERROR MESSAGE: " . $e->getMessage() . "\n";
}
