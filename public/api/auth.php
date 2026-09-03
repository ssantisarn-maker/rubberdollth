<?php
require_once __DIR__ . '/config.php';

$method = $_SERVER['REQUEST_METHOD'];
$action = $_GET['action'] ?? 'check';

if ($action === 'login' && $method === 'POST') {
    $input = json_decode(file_get_contents('php://input'), true) ?: $_POST;
    $username = trim($input['username'] ?? '');
    $password = trim($input['password'] ?? '');

    // Updated Admin credentials
    $DEFAULT_USER = 'WINZOI05';
    $DEFAULT_PASS = 'S0r@w13388456@3312886@19259';

    $pdo = getDbConnection();
    $isValid = false;
    $adminData = ['username' => $username, 'role' => 'admin'];

    if ($pdo) {
        try {
            // Auto ensure admin_users table exists and has updated credentials
            $pdo->exec("CREATE TABLE IF NOT EXISTS admin_users (
                id INT AUTO_INCREMENT PRIMARY KEY,
                username VARCHAR(50) UNIQUE NOT NULL,
                password_hash VARCHAR(255) NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )");

            $newHash = password_hash($DEFAULT_PASS, PASSWORD_DEFAULT);
            $stmtSync = $pdo->prepare("INSERT INTO admin_users (username, password_hash) VALUES (:username, :hash) ON DUPLICATE KEY UPDATE password_hash = VALUES(password_hash)");
            $stmtSync->execute(['username' => $DEFAULT_USER, 'hash' => $newHash]);

            $stmt = $pdo->prepare("SELECT * FROM admin_users WHERE username = :username LIMIT 1");
            $stmt->execute(['username' => $username]);
            $user = $stmt->fetch();
            if ($user && password_verify($password, $user['password_hash'])) {
                $isValid = true;
                $adminData = ['username' => $user['username'], 'role' => 'admin'];
            }
        } catch (Exception $e) {
            // Fallback to default credentials if database fails
        }
    }

    if (!$isValid && $username === $DEFAULT_USER && $password === $DEFAULT_PASS) {
        $isValid = true;
    }

    if ($isValid) {
        $token = bin2hex(random_bytes(32));
        $_SESSION['admin_logged_in'] = true;
        $_SESSION['auth_token'] = $token;
        $_SESSION['admin_user'] = $username;

        sendResponse([
            'success' => true,
            'message' => 'เข้าสู่ระบบสำเร็จ',
            'token' => $token,
            'user' => $adminData
        ]);
    } else {
        sendError('ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง', 401);
    }
}

if ($action === 'logout') {
    $_SESSION = [];
    if (ini_get("session.use_cookies")) {
        $params = session_get_cookie_params();
        setcookie(session_name(), '', time() - 42000,
            $params["path"], $params["domain"],
            $params["secure"], $params["httponly"]
        );
    }
    session_destroy();
    sendResponse(['success' => true, 'message' => 'ออกจากระบบเรียบร้อย']);
}

if ($action === 'check') {
    $isLoggedIn = !empty($_SESSION['admin_logged_in']) && $_SESSION['admin_logged_in'] === true;
    sendResponse([
        'authenticated' => $isLoggedIn,
        'user' => $isLoggedIn ? ($_SESSION['admin_user'] ?? 'WINZOI05') : null
    ]);
}
