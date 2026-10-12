<?php

require_once __DIR__ . '/utilidades.php';

$datos = leerSolicitud(['GET', 'POST']);
$conexion = require __DIR__ . '/conexion.php';

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $consulta = $conexion->prepare("
        SELECT cedula_contacto, nombre, numero_telf FROM contacto
        ORDER BY nombre
    ");
    $consulta->execute();
    $contactos = $consulta->fetchAll();
    responder($contactos);
}

if (leerTexto($datos, 'accion', 30) !== 'crear') {
    responderError('Operación no permitida', 405, 'operation_not_allowed');
}

$cedula = leerTexto($datos, 'cedula_contacto', 20);
$nombre = leerTexto($datos, 'nombre');
$telefono = leerTexto($datos, 'numero_telf', 20, true);
if (!preg_match('/^[VE]-\d+$/D', $cedula) || ($telefono !== '' && !preg_match('/^\d{11}$/D', $telefono))) {
    responderError('Cédula o teléfono inválido');
}

$consulta = $conexion->prepare("
    INSERT INTO contacto (cedula_contacto, nombre, numero_telf)
    VALUES (?, ?, ?)
");
$consulta->execute([$cedula, $nombre, $telefono ?: null]);
responder(['cedula_contacto' => $cedula]);
