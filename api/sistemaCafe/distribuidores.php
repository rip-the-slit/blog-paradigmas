<?php

require_once __DIR__ . '/utilidades.php';

$datos = leerSolicitud(['GET']);
$conexion = require __DIR__ . '/conexion.php';

$consulta = $conexion->prepare("
    SELECT rif_dist, nombre, saldo_bs FROM distribuidor
    ORDER BY rif_dist
");
$consulta->execute();
$distribuidores = $consulta->fetchAll();
responder($distribuidores);
