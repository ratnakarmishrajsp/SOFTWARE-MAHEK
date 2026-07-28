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
    if (file_exists($dataFile)) {
        $content = file_get_contents($dataFile);
        $decoded = json_decode($content, true);
        if ($decoded !== null) {
            echo $content;
        } else {
            echo json_encode(emptyData());
        }
    } else {
        echo json_encode(emptyData());
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

    // Merge with existing to avoid data loss from partial saves
    $existing = [];
    if (file_exists($dataFile)) {
        $existing = json_decode(file_get_contents($dataFile), true) ?? [];
    }

    $merged = array_merge($existing, $data, ['savedAt' => date('c')]);

    $written = file_put_contents($dataFile, json_encode($merged, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));

    if ($written !== false) {
        echo json_encode(['success' => true, 'savedAt' => $merged['savedAt']]);
    } else {
        http_response_code(500);
        echo json_encode(['error' => 'Failed to write data file. Check server permissions.']);
    }
    exit();
}

http_response_code(405);
echo json_encode(['error' => 'Method not allowed']);

function emptyData() {
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
