<?php

require_once __DIR__ . '/utilidades.php';
require_once __DIR__ . '/registrar_abono.php';

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

$fecha = leerFecha($datos);

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $consulta = $conexion->prepare("
        SELECT p.id_pago, p.fecha_pago, p.monto,
               n.nombre AS nombre_negocio, t.nombre AS tipo_cafe
        FROM pago_venta p
        JOIN venta v ON p.id_venta = v.id_venta
        JOIN negocio n ON v.rif_negocio = n.rif_negocio
        JOIN inventario i ON v.id_inv = i.id_inv
        JOIN tipo_cafe t ON i.id_tipo = t.id_tipo
        WHERE v.rif_dist = ? AND p.fecha_pago = ?
        ORDER BY p.id_pago DESC
    ");
    $consulta->execute([$rifDistribuidor, $fecha]);
    $abonos = $consulta->fetchAll();
    responder($abonos);
}

if (leerTexto($datos, 'accion', 30) !== 'crear') {
    responderError('Operación no permitida', 405, 'operation_not_allowed');
}

$idVenta = leerNumero($datos, 'id_venta', 1, 2147483647, true);
$abono = registrarAbono($conexion, $rifDistribuidor, $idVenta, $fecha);

$consulta = $conexion->prepare("
    SELECT rif_dist, nombre, saldo_bs FROM distribuidor
    WHERE rif_dist = ?
");
$consulta->execute([$rifDistribuidor]);
$distribuidor = $consulta->fetch();
$conexion->commit();
responder($abono, $distribuidor);
