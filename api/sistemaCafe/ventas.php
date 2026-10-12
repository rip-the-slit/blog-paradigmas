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

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $parametros = [$rifDistribuidor];
    $filtroNegocio = '';
    if (isset($datos['rif_negocio'])) {
        $rifNegocio = leerRif($datos, 'rif_negocio');
        $fecha = leerFecha($datos);
        $consulta = $conexion->prepare('SELECT rif_negocio FROM negocio WHERE rif_negocio = ? AND rif_dist = ?');
        $consulta->execute([$rifNegocio, $rifDistribuidor]);
        $negocio = $consulta->fetch();
        if (!$negocio) {
            responderError('Negocio no encontrado para este distribuidor', 404, 'not_found');
        }
        $filtroNegocio = 'AND v.rif_negocio = ? AND (v.fecha_venta = ? OR COALESCE(p.abonos_pagados, 0) < v.cantidad_abonos)';
        $parametros[] = $rifNegocio;
        $parametros[] = $fecha;
    }

    $consulta = $conexion->prepare("
        SELECT v.id_venta, v.fecha_venta, v.cantidad_kg, v.cantidad_abonos,
               v.rif_negocio, i.id_tipo, t.nombre AS tipo_cafe, n.nombre AS nombre_negocio,
               v.precio_kg_bs, v.monto_total AS monto,
               COALESCE(p.abonos_pagados, 0) AS abonos_pagados,
               COALESCE(p.monto_pagado, 0) AS monto_pagado,
               v.monto_total - COALESCE(p.monto_pagado, 0) AS monto_debe
        FROM venta v
        JOIN inventario i ON v.id_inv = i.id_inv
        JOIN tipo_cafe t ON i.id_tipo = t.id_tipo
        JOIN negocio n ON v.rif_negocio = n.rif_negocio
        LEFT JOIN (
            SELECT id_venta, COUNT(*) AS abonos_pagados, SUM(monto) AS monto_pagado
            FROM pago_venta
            GROUP BY id_venta
        ) p ON v.id_venta = p.id_venta
        WHERE v.rif_dist = ? $filtroNegocio
        ORDER BY v.fecha_venta DESC, v.id_venta DESC
    ");
    $consulta->execute($parametros);
    $ventas = $consulta->fetchAll();
    responder($ventas);
}

if (leerTexto($datos, 'accion', 30) !== 'crear') {
    responderError('Operación no permitida', 405, 'operation_not_allowed');
}

$fecha = leerFecha($datos);
$rifNegocio = leerRif($datos, 'rif_negocio');
$idInventario = leerNumero($datos, 'id_inv', 1, 2147483647, true);
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
    SELECT * FROM inventario
    WHERE id_inv = ? AND rif_dist = ? FOR UPDATE
");
$consulta->execute([$idInventario, $rifDistribuidor]);
$inventario = $consulta->fetch();
if (!$inventario) {
    responderError('Registro no encontrado para este distribuidor', 404, 'not_found');
}
$cantidadKg = leerNumero($datos, 'cantidad_kg', 0.01, 99999999.99);
$precioKg = leerNumero($datos, 'precio_kg_bs', 0, 99999999.99);
$cantidadAbonos = leerNumero($datos, 'cantidad_abonos', 1, 2147483647, true);
if ($cantidadKg > (float) $inventario['cantidad_kg']) {
    responderError('Inventario insuficiente para la venta', 409, 'insufficient_stock');
}
$monto = validarMonto($cantidadKg * $precioKg);
$consulta = $conexion->prepare("
    SELECT * FROM venta
    WHERE rif_dist = ? AND rif_negocio = ? AND id_inv = ? AND fecha_venta = ? FOR UPDATE
");
$consulta->execute([$rifDistribuidor, $rifNegocio, $inventario['id_inv'], $fecha]);
$ventaExistente = $consulta->fetch();
if ($ventaExistente) {
    $idVenta = (int) $ventaExistente['id_venta'];
    $cantidadTotal = round((float) $ventaExistente['cantidad_kg'] + $cantidadKg, 2);
    $montoTotal = validarMonto((float) $ventaExistente['monto_total'] + $monto);
    $abonosTotales = (int) $ventaExistente['cantidad_abonos'] + $cantidadAbonos;
    if ($cantidadTotal > 99999999.99 || $abonosTotales > 2147483647) {
        responderError('Venta acumulada fuera de rango', 422, 'invalid_input');
    }
    $consulta = $conexion->prepare("
        UPDATE venta SET cantidad_kg = ?, cantidad_abonos = ?, precio_kg_bs = ?, monto_total = ?
        WHERE id_venta = ?
    ");
    $consulta->execute([$cantidadTotal, $abonosTotales, $montoTotal / $cantidadTotal, $montoTotal, $idVenta]);
} else {
    $consulta = $conexion->prepare("
        INSERT INTO venta (fecha_venta, cantidad_kg, cantidad_abonos, precio_kg_bs, monto_total, rif_negocio, rif_dist, id_inv)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    ");
    $consulta->execute([
        $fecha,
        $cantidadKg,
        $cantidadAbonos,
        $precioKg,
        $monto,
        $rifNegocio,
        $rifDistribuidor,
        $inventario['id_inv'],
    ]);
    $idVenta = (int) $conexion->lastInsertId();
}
$consulta = $conexion->prepare("
    UPDATE inventario SET cantidad_kg = cantidad_kg - ?
    WHERE id_inv = ?
");
$consulta->execute([$cantidadKg, $inventario['id_inv']]);
registrarAbono($conexion, $rifDistribuidor, $idVenta, $fecha);

$consulta = $conexion->prepare("
    SELECT rif_dist, nombre, saldo_bs FROM distribuidor
    WHERE rif_dist = ?
");
$consulta->execute([$rifDistribuidor]);
$distribuidor = $consulta->fetch();
$conexion->commit();
responder(['id_venta' => $idVenta, 'monto' => $monto], $distribuidor);
