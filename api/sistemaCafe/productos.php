<?php

require_once __DIR__ . '/utilidades.php';

$datos = leerSolicitud(['GET', 'POST']);
$conexion = require __DIR__ . '/conexion.php';

$rifDistribuidor = leerRif($datos, 'rif_dist');

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $conexion->beginTransaction();
}

$sql = 'SELECT rif_dist, nombre, saldo_bs FROM distribuidor WHERE rif_dist = ?';
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $sql .= ' FOR UPDATE';
}
$consulta = $conexion->prepare($sql);
$consulta->execute([$rifDistribuidor]);
$distribuidor = $consulta->fetch();
if (!$distribuidor) {
    responderError('Distribuidor no encontrado', 404, 'not_found');
}

$rifProveedor = leerRif($datos, 'rif_proveedor');
$consulta = $conexion->prepare("
    SELECT rif_proveedor FROM proveedor
    WHERE rif_proveedor = ? AND rif_dist = ?
");
$consulta->execute([$rifProveedor, $rifDistribuidor]);
$proveedor = $consulta->fetch();
if (!$proveedor) {
    responderError('Proveedor no encontrado para este distribuidor', 404, 'not_found');
}

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $consulta = $conexion->prepare("
        SELECT c.id_cafe, c.nombre AS nombre_cafe, c.precio_kg_bs, c.id_tipo,
        c.rif_proveedor, t.nombre AS tipo_cafe
        FROM cafe c
        JOIN tipo_cafe t ON c.id_tipo = t.id_tipo
        WHERE c.rif_proveedor = ?
        ORDER BY c.id_cafe
    ");
    $consulta->execute([$rifProveedor]);
    $productos = $consulta->fetchAll();
    responder($productos);
}

if (leerTexto($datos, 'accion', 30) !== 'crear') {
    responderError('Operación no permitida', 405, 'operation_not_allowed');
}

$nombre = leerTexto($datos, 'nombre');
$precioKg = leerNumero($datos, 'precio_kg_bs', 0, 99999999.99);
$idTipo = leerNumero($datos, 'id_tipo', 1, 2147483647, true);
$consulta = $conexion->prepare("
    SELECT id_tipo FROM tipo_cafe
    WHERE id_tipo = ?
");
$consulta->execute([$idTipo]);
$tipo = $consulta->fetch();
if (!$tipo) {
    responderError('Tipo de café no encontrado', 404, 'not_found');
}

$consulta = $conexion->prepare("
    INSERT INTO cafe (nombre, precio_kg_bs, id_tipo, rif_proveedor)
    VALUES (?, ?, ?, ?)
");
$consulta->execute([$nombre, $precioKg, $idTipo, $rifProveedor]);
$idCafe = (int) $conexion->lastInsertId();

$conexion->commit();
responder(['id_cafe' => $idCafe], $distribuidor);
