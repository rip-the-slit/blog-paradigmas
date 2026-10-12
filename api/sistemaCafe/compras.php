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
        SELECT c.id_compra, c.fecha_compra, c.cantidad_kg, c.precio_kg_bs,
        p.nombre AS nombre_proveedor, f.nombre AS nombre_cafe, t.nombre AS tipo_cafe,
        pc.monto
        FROM compra c
        JOIN proveedor p ON c.rif_proveedor = p.rif_proveedor
        JOIN cafe f ON c.id_cafe = f.id_cafe
        JOIN tipo_cafe t ON f.id_tipo = t.id_tipo
        JOIN pago_compra pc ON pc.id_compra = c.id_compra
        WHERE c.rif_dist = ?
        ORDER BY c.fecha_compra DESC, c.id_compra DESC
    ");
    $consulta->execute([$rifDistribuidor]);
    $compras = $consulta->fetchAll();
    responder($compras);
}

if (leerTexto($datos, 'accion', 30) !== 'crear') {
    responderError('Operación no permitida', 405, 'operation_not_allowed');
}

$fecha = leerFecha($datos);
$cantidadKg = leerNumero($datos, 'cantidad_kg', 0.01, 99999999.99);
$idCafe = leerNumero($datos, 'id_cafe', 1, 2147483647, true);
$consulta = $conexion->prepare("
    SELECT c.*
    FROM cafe c
    JOIN proveedor p ON c.rif_proveedor = p.rif_proveedor
    WHERE c.id_cafe = ? AND p.rif_dist = ? FOR UPDATE
");
$consulta->execute([$idCafe, $rifDistribuidor]);
$producto = $consulta->fetch();
if (!$producto) {
    responderError('Registro no encontrado para este distribuidor', 404, 'not_found');
}
$monto = validarMonto($cantidadKg * (float) $producto['precio_kg_bs']);
if ($monto > (float) $distribuidor['saldo_bs']) {
    responderError('Saldo insuficiente para la compra', 409, 'insufficient_balance');
}
$consulta = $conexion->prepare("
    SELECT id_inv, cantidad_kg FROM inventario
    WHERE rif_dist = ? AND id_tipo = ? FOR UPDATE
");
$consulta->execute([$rifDistribuidor, $producto['id_tipo']]);
$inventario = $consulta->fetch();
if ($inventario) {
    if ((float) $inventario['cantidad_kg'] + $cantidadKg > 99999999.99) {
        responderError('Inventario fuera de rango', 422, 'invalid_quantity');
    }
    $consulta = $conexion->prepare("
        UPDATE inventario SET cantidad_kg = cantidad_kg + ?
        WHERE id_inv = ?
    ");
    $consulta->execute([$cantidadKg, $inventario['id_inv']]);
} else {
    $consulta = $conexion->prepare("
        INSERT INTO inventario (cantidad_kg, rif_dist, id_tipo)
        VALUES (?, ?, ?)
    ");
    $consulta->execute([$cantidadKg, $rifDistribuidor, $producto['id_tipo']]);
}
$consulta = $conexion->prepare("
    INSERT INTO compra (fecha_compra, precio_kg_bs, cantidad_kg, cantidad_abonos, rif_proveedor, rif_dist, id_cafe)
    VALUES (?, ?, ?, 1, ?, ?, ?)
");
$consulta->execute([
    $fecha,
    $producto['precio_kg_bs'],
    $cantidadKg,
    $producto['rif_proveedor'],
    $rifDistribuidor,
    $producto['id_cafe'],
]);
$idCompra = (int) $conexion->lastInsertId();
$consulta = $conexion->prepare("
    INSERT INTO pago_compra (fecha_pago, monto, id_compra)
    VALUES (?, ?, ?)
");
$consulta->execute([$fecha, $monto, $idCompra]);
$consulta = $conexion->prepare("
    UPDATE distribuidor SET saldo_bs = saldo_bs - ?
    WHERE rif_dist = ?
");
$consulta->execute([$monto, $rifDistribuidor]);

$consulta = $conexion->prepare("
    SELECT rif_dist, nombre, saldo_bs FROM distribuidor
    WHERE rif_dist = ?
");
$consulta->execute([$rifDistribuidor]);
$distribuidor = $consulta->fetch();
$conexion->commit();
responder(['id_compra' => $idCompra, 'monto' => $monto], $distribuidor);
