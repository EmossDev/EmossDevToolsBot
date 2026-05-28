<?php
// Route all requests to index.php regardless of path prefix
// This allows the bot to work behind a /bot/ path prefix

$uri = $_SERVER['REQUEST_URI'];

// Strip /bot prefix if present
if (strpos($uri, '/bot') === 0) {
    $_SERVER['REQUEST_URI'] = substr($uri, 4) ?: '/';
}

// Serve static files if they exist
$filePath = __DIR__ . parse_url($uri, PHP_URL_PATH);
if ($filePath !== __DIR__ . '/' && file_exists($filePath) && !is_dir($filePath)) {
    return false;
}

// Route everything to index.php
require __DIR__ . '/index.php';
