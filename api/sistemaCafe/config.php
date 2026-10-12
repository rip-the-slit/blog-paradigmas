<?php
$configuracion = [
    'host' => getenv('CAFE_DB_HOST') ?: '127.0.0.1',
    'port' => getenv('CAFE_DB_PORT') ?: '3306',
    'database' => getenv('CAFE_DB_NAME') ?: 'sistema_cafe',
    'user' => getenv('CAFE_DB_USER') ?: 'root',
    'password' => getenv('CAFE_DB_PASSWORD') !== false ? getenv('CAFE_DB_PASSWORD') : '',
];
$archivoLocal = __DIR__ . '/config.local.php';
if (is_file($archivoLocal)) {
    $configuracion = array_replace($configuracion, require $archivoLocal);
}
return $configuracion;
