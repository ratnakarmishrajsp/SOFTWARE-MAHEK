<?php
/**
 * Mahekh ERP - Simple Data API
 * Saves and serves all business data from the server.
 * No authentication needed (private business tool).
 */

// Allow cross-origin requests (same domain, but just in case)
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
header('Content-Type: application/json; charset=utf-8');

// Handle preflight
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

$dataFile = __DIR__ . '/mahekh_data.json';

// ── GET: Return all saved data ──────────────────────────────────────────────
if ($_SERVER['REQUEST_METHOD'] === 'GET') {

    // Debug mode: ?debug=1 returns server diagnostics
    if (isset($_GET['debug'])) {
        echo json_encode([
            'dataFile'    => $dataFile,
            'fileExists'  => file_exists($dataFile),
            'fileSize'    => file_exists($dataFile) ? filesize($dataFile) : 0,
            'dirWritable' => is_writable(__DIR__),
            'phpVersion'  => PHP_VERSION,
            'savedAt'     => file_exists($dataFile)
                ? (json_decode(file_get_contents($dataFile), true)['savedAt'] ?? 'unknown')
                : null,
        ]);
        exit();
    }

    if (file_exists($dataFile)) {
        $content = file_get_contents($dataFile);
        $decoded = json_decode($content, true);
        if ($decoded !== null) {
            echo $content;
        } else {
            echo json_encode(emptyData());
        }
    } else {
        // Try to create an empty file to check write permissions
        $testWrite = @file_put_contents($dataFile, json_encode(emptyData(), JSON_PRETTY_PRINT));
        if ($testWrite !== false) {
            echo json_encode(emptyData());
        } else {
            // Directory is not writable — return error with hint
            http_response_code(500);
            echo json_encode([
                'error'   => 'Server directory is not writable. Set chmod 755 on public/ folder in Hostinger File Manager.',
                'path'    => __DIR__,
                'writable'=> is_writable(__DIR__)
            ]);
        }
    }
    exit();
}

// ── POST: Save incoming data ────────────────────────────────────────────────
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $raw = file_get_contents('php://input');
    $data = json_decode($raw, true);

    if ($data === null || !is_array($data)) {
        http_response_code(400);
        echo json_encode(['error' => 'Invalid JSON payload']);
        exit();
    }

    // Check write permission first
    if (!is_writable(__DIR__)) {
        http_response_code(500);
        echo json_encode([
            'error'   => 'Directory not writable. Go to Hostinger File Manager → public/ → chmod 755.',
            'path'    => __DIR__,
            'writable'=> false
        ]);
        exit();
    }

    // Merge with existing to avoid data loss from partial saves
    $existing = [];
    if (file_exists($dataFile)) {
        $existingContent = file_get_contents($dataFile);
        $existing = json_decode($existingContent, true) ?? [];
    }

    $merged = array_merge($existing, $data, ['savedAt' => date('c')]);

    $written = file_put_contents(
        $dataFile,
        json_encode($merged, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE),
        LOCK_EX   // <-- prevents data corruption on concurrent saves
    );

    if ($written !== false) {
        echo json_encode([
            'success' => true,
            'savedAt' => $merged['savedAt'],
            'bytes'   => $written
        ]);
    } else {
        http_response_code(500);
        echo json_encode([
            'error'   => 'file_put_contents failed. Check Hostinger file permissions.',
            'path'    => $dataFile,
            'writable'=> is_writable(__DIR__)
        ]);
    }
    exit();
}

http_response_code(405);
echo json_encode(['error' => 'Method not allowed']);

function emptyData(): array {
    return [
        'plEntries'    => [],
        'expenses'     => [],
        'rawPurchases' => [],
        'products'     => [],
        'inventory'    => [],
        'orders'       => [],
        'settings'     => null,
        'savedAt'      => null
    ];
}

