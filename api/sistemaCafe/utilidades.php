<?php

function responder($datos, $distribuidor = null)
{
    $respuesta = ['data' => convertirNumeros($datos)];
    if ($distribuidor !== null) {
        $respuesta['distribuidor'] = convertirNumeros($distribuidor);
    }
    $json = json_encode($respuesta, JSON_UNESCAPED_UNICODE);
    if ($json === false) {
        responderError('No se pudo generar la respuesta JSON', 500, 'server_error');
    }
    echo $json;
    exit;
}

function responderError($mensaje, $estado = 422, $codigo = 'invalid_input')
{
    global $conexion;
    if ($conexion instanceof PDO && $conexion->inTransaction()) {
        $conexion->rollBack();
    }
    http_response_code($estado);
    echo json_encode(['error' => ['code' => $codigo, 'message' => $mensaje]], JSON_UNESCAPED_UNICODE);
    exit;
}

function convertirNumeros($datos)
{
    $enteros = ['id_tipo', 'id_cafe', 'id_inv', 'id_compra', 'id_venta', 'id_pago', 'cantidad_abonos', 'abonos_pagados'];
    $decimales = ['saldo_bs', 'cantidad_kg', 'precio_kg_bs', 'monto', 'monto_total', 'monto_pagado', 'monto_debe'];
    foreach ($datos as $campo => $valor) {
        if (is_array($valor)) {
            $datos[$campo] = convertirNumeros($valor);
        } elseif ($valor !== null && in_array($campo, $enteros, true)) {
            $datos[$campo] = (int) $valor;
        } elseif ($valor !== null && in_array($campo, $decimales, true)) {
            $datos[$campo] = (float) $valor;
        }
    }
    return $datos;
}

function leerSolicitud($metodos)
{
    header('Content-Type: application/json; charset=utf-8');
    header('Cache-Control: no-store');
    if (!in_array($_SERVER['REQUEST_METHOD'], $metodos, true)) {
        header('Allow: ' . implode(', ', $metodos));
        responderError('Método no permitido', 405, 'method_not_allowed');
    }
    if ($_SERVER['REQUEST_METHOD'] === 'GET') {
        return $_GET;
    }
    if (stripos($_SERVER['CONTENT_TYPE'] ?? '', 'application/json') !== 0) {
        responderError('Se requiere application/json', 415, 'invalid_content_type');
    }
    $datos = json_decode(file_get_contents('php://input'), true);
    if (json_last_error() !== JSON_ERROR_NONE) {
        responderError('JSON inválido', 400, 'invalid_json');
    }
    if (!is_array($datos)) {
        responderError('Se requiere un objeto JSON', 400, 'invalid_json');
    }
    return $datos;
}

function leerTexto($datos, $campo, $maximo = 100, $opcional = false)
{
    $valor = $datos[$campo] ?? '';
    if (!is_string($valor)) {
        responderError("Campo inválido: $campo");
    }
    $valor = trim($valor);
    if (($valor === '' && !$opcional) || !preg_match('//u', $valor) || preg_match_all('/./us', $valor) > $maximo) {
        responderError("Campo inválido: $campo");
    }
    return $valor;
}

function leerRif($datos, $campo)
{
    $rif = leerTexto($datos, $campo, 20);
    if (!preg_match('/^J-\d+-\d$/D', $rif)) {
        responderError("RIF inválido: $campo");
    }
    return $rif;
}

function leerNumero($datos, $campo, $minimo, $maximo, $entero = false)
{
    $valor = $datos[$campo] ?? null;
    if ((!is_int($valor) && !is_float($valor) && !is_string($valor)) || !is_numeric($valor)) {
        responderError("Número inválido: $campo");
    }
    $numero = (float) $valor;
    if (!is_finite($numero) || $numero < $minimo || $numero > $maximo || ($entero && floor($numero) !== $numero)) {
        responderError("Número fuera de rango: $campo");
    }
    if (!$entero && abs($numero * 100 - round($numero * 100)) > 0.00001) {
        responderError("Use hasta dos decimales: $campo");
    }
    return $entero ? (int) $numero : round($numero, 2);
}

function leerFecha($datos)
{
    $fecha = leerTexto($datos, 'fecha', 10);
    $fechaValidada = DateTimeImmutable::createFromFormat('!Y-m-d', $fecha);
    if (!$fechaValidada || $fechaValidada->format('Y-m-d') !== $fecha || $fecha < '1000-01-01') {
        responderError('Fecha inválida');
    }
    return $fecha;
}

function validarMonto($monto)
{
    if ($monto < 0 || $monto > 9999999999.99) {
        responderError('Monto fuera de rango', 422, 'invalid_amount');
    }
    return round($monto, 2);
}

set_exception_handler(function (Throwable $error) {
    if ($error instanceof PDOException && $error->getCode() === '23000') {
        responderError('El registro ya existe o una referencia es inválida', 409, 'conflict');
    }
    error_log((string) $error);
    responderError('No se pudo completar la operación. Revise la conexión y los registros de PHP.', 500, 'server_error');
});
