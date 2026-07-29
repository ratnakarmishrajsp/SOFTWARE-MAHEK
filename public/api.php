<?php
/**
 * Mahekh ERP - Data API
 * Saves and serves business data on hostinger/apache server.
 */

ini_set('display_errors', 0);
error_reporting(E_ALL);

// Allow cross-origin requests
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With, Cache-Control, Pragma');
header('Content-Type: application/json; charset=utf-8');

// Handle preflight
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

$dataFile = __DIR__ . '/mahekh_data.json';

// ── GET: Return all saved data ──────────────────────────────────────────────
if ($_SERVER['REQUEST_METHOD'] === 'GET') {

    // Debug mode: ?debug=1
    if (isset($_GET['debug'])) {
        echo json_encode([
            'dataFile'    => $dataFile,
            'fileExists'  => file_exists($dataFile),
            'fileSize'    => file_exists($dataFile) ? filesize($dataFile) : 0,
            'fileReadable'=> file_exists($dataFile) ? is_readable($dataFile) : false,
            'fileWritable'=> file_exists($dataFile) ? is_writable($dataFile) : false,
            'dirWritable' => is_writable(__DIR__),
            'phpVersion'  => PHP_VERSION,
        ]);
        exit();
    }

    if (file_exists($dataFile)) {
        $content = @file_get_contents($dataFile);
        if ($content !== false && !empty(trim($content))) {
            echo $content;
            exit();
        }
    }

    // Return empty data structure default
    echo json_encode(emptyData());
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

    // Merge with existing data if present
    $existing = [];
    if (file_exists($dataFile)) {
        $existingContent = @file_get_contents($dataFile);
        if ($existingContent) {
            $existing = json_decode($existingContent, true) ?? [];
        }
    }

    $merged = array_merge($existing, $data, ['savedAt' => date('c')]);

    $written = @file_put_contents(
        $dataFile,
        json_encode($merged, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE),
        LOCK_EX
    );

    if ($written !== false) {
        @chmod($dataFile, 0644);
        echo json_encode([
            'success' => true,
            'savedAt' => $merged['savedAt'],
            'bytes'   => $written
        ]);
    } else {
        http_response_code(500);
        echo json_encode([
            'error'   => 'Cannot write file. Set public/ folder permission chmod 755 in Hostinger File Manager.',
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
