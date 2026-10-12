<?php

function registrarAbono($conexion, $rifDistribuidor, $idVenta, $fecha)
{
    $consulta = $conexion->prepare('SELECT * FROM venta WHERE id_venta = ? AND rif_dist = ? FOR UPDATE');
    $consulta->execute([$idVenta, $rifDistribuidor]);
    $venta = $consulta->fetch();
    if (!$venta) {
        responderError('Venta no encontrada para este distribuidor', 404, 'not_found');
    }

    $consulta = $conexion->prepare('SELECT COUNT(*) AS cantidad, COALESCE(SUM(monto), 0) AS pagado FROM pago_venta WHERE id_venta = ?');
    $consulta->execute([$idVenta]);
    $pagos = $consulta->fetch();

    $abonosPendientes = (int) $venta['cantidad_abonos'] - (int) $pagos['cantidad'];
    if ($abonosPendientes <= 0) {
        responderError('Todos los abonos ya fueron registrados', 409, 'sale_paid');
    }
    if ($fecha < $venta['fecha_venta']) {
        responderError('El abono no puede ser anterior a la venta', 422, 'invalid_date');
    }

    $centimosPendientes = max(0, (int) round(((float) $venta['monto_total'] - (float) $pagos['pagado']) * 100));
    $centimosAbono = $abonosPendientes === 1
        ? $centimosPendientes
        : min($centimosPendientes, (int) round($centimosPendientes / $abonosPendientes));
    $monto = $centimosAbono / 100;

    $consulta = $conexion->prepare('SELECT saldo_bs FROM distribuidor WHERE rif_dist = ?');
    $consulta->execute([$rifDistribuidor]);
    $distribuidor = $consulta->fetch();
    validarMonto((float) $distribuidor['saldo_bs'] + $monto);

    $consulta = $conexion->prepare('INSERT INTO pago_venta (fecha_pago, monto, id_venta) VALUES (?, ?, ?)');
    $consulta->execute([$fecha, $monto, $idVenta]);

    $consulta = $conexion->prepare('UPDATE distribuidor SET saldo_bs = saldo_bs + ? WHERE rif_dist = ?');
    $consulta->execute([$monto, $rifDistribuidor]);

    return ['id_venta' => $idVenta, 'monto' => $monto];
}
