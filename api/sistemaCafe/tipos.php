<?php

require_once __DIR__ . '/utilidades.php';

$datos = leerSolicitud(['GET']);
$conexion = require __DIR__ . '/conexion.php';

$consulta = $conexion->prepare("
    SELECT id_tipo, nombre FROM tipo_cafe
    ORDER BY nombre
");
$consulta->execute();
$tipos = $consulta->fetchAll();
responder($tipos);
