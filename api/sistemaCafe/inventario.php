<?php

require_once __DIR__ . '/utilidades.php';

$datos = leerSolicitud(['GET']);
$conexion = require __DIR__ . '/conexion.php';

$rifDistribuidor = leerRif($datos, 'rif_dist');

$sql = 'SELECT rif_dist, nombre, saldo_bs FROM distribuidor WHERE rif_dist = ?';
$consulta = $conexion->prepare($sql);
$consulta->execute([$rifDistribuidor]);
$distribuidor = $consulta->fetch();
if (!$distribuidor) {
    responderError('Distribuidor no encontrado', 404, 'not_found');
}

$consulta = $conexion->prepare("
    SELECT i.id_inv, i.cantidad_kg, i.id_tipo, t.nombre AS tipo_cafe,
           (SELECT AVG(c.precio_kg_bs) FROM cafe c WHERE c.id_tipo = i.id_tipo) AS precio_kg_bs
    FROM inventario i
    JOIN tipo_cafe t ON i.id_tipo = t.id_tipo
    WHERE i.rif_dist = ?
    ORDER BY t.nombre
");
$consulta->execute([$rifDistribuidor]);
$inventario = $consulta->fetchAll();
responder($inventario);
