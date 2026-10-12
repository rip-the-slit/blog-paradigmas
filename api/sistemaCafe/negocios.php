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
        SELECT n.rif_negocio, n.nombre AS nombre_negocio, n.cedula_contacto,
        n.direccion, n.rif_dist, c.nombre AS nombre_contacto, c.numero_telf
        FROM negocio n
        LEFT JOIN contacto c ON n.cedula_contacto = c.cedula_contacto
        WHERE n.rif_dist = ?
        ORDER BY n.nombre
    ");
    $consulta->execute([$rifDistribuidor]);
    $negocios = $consulta->fetchAll();
    responder($negocios);
}

$accion = leerTexto($datos, 'accion', 30);
if (!in_array($accion, ['crear', 'contacto'], true)) {
    responderError('Operación no permitida', 405, 'operation_not_allowed');
}

$rifNegocio = leerRif($datos, 'rif_negocio');
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
        SELECT rif_negocio FROM negocio
        WHERE rif_negocio = ? AND rif_dist = ?
    ");
    $consulta->execute([$rifNegocio, $rifDistribuidor]);
    $negocio = $consulta->fetch();
    if (!$negocio) {
        responderError('Registro no encontrado para este distribuidor', 404, 'not_found');
    }
    $consulta = $conexion->prepare("
        UPDATE negocio SET cedula_contacto = ?
        WHERE rif_negocio = ? AND rif_dist = ?
    ");
    $consulta->execute([$cedulaContacto, $rifNegocio, $rifDistribuidor]);
} else {
    $nombre = leerTexto($datos, 'nombre');
    $direccion = leerTexto($datos, 'direccion', 255);
    $consulta = $conexion->prepare("
        INSERT INTO negocio (rif_negocio, nombre, cedula_contacto, direccion, rif_dist)
        VALUES (?, ?, ?, ?, ?)
    ");
    $consulta->execute([$rifNegocio, $nombre, $cedulaContacto, $direccion, $rifDistribuidor]);
}

$conexion->commit();
responder(['rif_negocio' => $rifNegocio], $distribuidor);
