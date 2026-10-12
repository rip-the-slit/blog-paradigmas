<?php

$configuracion = require __DIR__ . '/config.php';

return new PDO(
    "mysql:host={$configuracion['host']};port={$configuracion['port']};dbname={$configuracion['database']};charset=utf8mb4",
    $configuracion['user'],
    $configuracion['password'],
    [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        PDO::ATTR_EMULATE_PREPARES => false,
    ]
);
