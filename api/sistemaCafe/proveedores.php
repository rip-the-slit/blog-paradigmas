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

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $consulta = $conexion->prepare("
        SELECT p.rif_proveedor, p.nombre AS nombre_proveedor, p.cedula_contacto,
        p.rif_dist, c.nombre AS nombre_contacto, c.numero_telf
        FROM proveedor p
        LEFT JOIN contacto c ON p.cedula_contacto = c.cedula_contacto
        WHERE p.rif_dist = ?
        ORDER BY p.nombre
    ");
    $consulta->execute([$rifDistribuidor]);
    $proveedores = $consulta->fetchAll();
    responder($proveedores);
}

$accion = leerTexto($datos, 'accion', 30);
if (!in_array($accion, ['crear', 'contacto'], true)) {
    responderError('Operación no permitida', 405, 'operation_not_allowed');
}

$rifProveedor = leerRif($datos, 'rif_proveedor');
$cedulaContacto = leerTexto($datos, 'cedula_contacto', 20, true) ?: null;

if ($cedulaContacto !== null) {
    $consulta = $conexion->prepare("
        SELECT cedula_contacto FROM contacto
        WHERE cedula_contacto = ?
    ");
    $consulta->execute([$cedulaContacto]);
    $contacto = $consulta->fetch();
    if (!$contacto) {
        responderError('Contacto no encontrado', 404, 'not_found');
    }
}

if ($accion === 'contacto') {
    $consulta = $conexion->prepare("
        SELECT rif_proveedor FROM proveedor
        WHERE rif_proveedor = ? AND rif_dist = ?
    ");
    $consulta->execute([$rifProveedor, $rifDistribuidor]);
    $proveedor = $consulta->fetch();
    if (!$proveedor) {
        responderError('Registro no encontrado para este distribuidor', 404, 'not_found');
    }
    $consulta = $conexion->prepare("
        UPDATE proveedor SET cedula_contacto = ?
        WHERE rif_proveedor = ? AND rif_dist = ?
    ");
    $consulta->execute([$cedulaContacto, $rifProveedor, $rifDistribuidor]);
} else {
    $nombre = leerTexto($datos, 'nombre');
    $consulta = $conexion->prepare("
        INSERT INTO proveedor (rif_proveedor, nombre, cedula_contacto, rif_dist)
        VALUES (?, ?, ?, ?)
    ");
    $consulta->execute([$rifProveedor, $nombre, $cedulaContacto, $rifDistribuidor]);
}

$conexion->commit();
responder(['rif_proveedor' => $rifProveedor], $distribuidor);
