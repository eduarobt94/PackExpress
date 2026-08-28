<?php
/**
 * Negociación de contenido por `Accept` para la home y para el 404.
 * Implementa https://acceptmarkdown.com — RFC 9110 §12.5.1 (Accept, q-values).
 *
 *   Accept: text/markdown        -> 200 index.md   (text/markdown; charset=utf-8)
 *   Accept: text/html            -> 200 index.html (text/html; charset=utf-8)
 *   Accept: application/xml      -> 406 (ningún tipo servible es aceptable)
 *
 * Siempre emite `Vary: Accept` para que un CDN no le sirva la variante HTML
 * cacheada a un agente que pidió markdown (ni al revés).
 *
 * Se invoca desde .htaccess. El modo lo define la variable de entorno PE_MODE:
 *   home  -> 200, la home
 *   404   -> 404, cuerpo de recuperación para agentes
 *
 * Diseño a prueba de fallos: si por lo que sea no puede leer un archivo, cae al
 * HTML. La home es lo más crítico del sitio; nunca debe quedar en blanco.
 */

declare(strict_types=1);

$modo   = getenv('PE_MODE') ?: 'home';
$es404  = $modo === '404';
$raiz   = __DIR__ . '/..';

$rutaHtml = $raiz . '/index.html';
$rutaMd   = $es404 ? __DIR__ . '/404.md' : $raiz . '/index.md';

/**
 * Parsea el header Accept a [tipo => q], honrando q-values (RFC 9110 §12.5.1).
 * Un tipo sin q explícito vale 1.0. Los q=0 significan "no aceptable".
 */
function parsearAccept(string $accept): array {
    $tipos = [];
    foreach (explode(',', $accept) as $parte) {
        $segmentos = explode(';', trim($parte));
        $tipo = strtolower(trim(array_shift($segmentos)));
        if ($tipo === '') continue;
        $q = 1.0;
        foreach ($segmentos as $param) {
            $param = trim($param);
            if (stripos($param, 'q=') === 0) {
                $q = (float) substr($param, 2);
            }
        }
        $tipos[$tipo] = $q;
    }
    return $tipos;
}

/**
 * Calidad con la que el cliente acepta $tipo, mirando también los comodines
 * `tipo/*` y `*​/*` como exige RFC 9110. Devuelve 0.0 si no lo acepta.
 */
function calidadPara(array $aceptados, string $tipo): float {
    [$grupo] = explode('/', $tipo);
    foreach ([$tipo, $grupo . '/*', '*/*'] as $clave) {
        if (array_key_exists($clave, $aceptados)) {
            return $aceptados[$clave];
        }
    }
    return 0.0;
}

/**
 * Como calidadPara pero SIN comodines: solo cuenta si el cliente nombró el tipo
 * exacto. Hace falta para la home: con `Accept: *​/*` (curl y la mayoría de los
 * bots) el comodín daría markdown y cambiaría el comportamiento observable del
 * sitio para todo el mundo. La home solo debe servir markdown a quien lo pide
 * por su nombre.
 */
function calidadExplicita(array $aceptados, string $tipo): float {
    return $aceptados[$tipo] ?? 0.0;
}

$accept = $_SERVER['HTTP_ACCEPT'] ?? '';

// Sin header Accept, RFC 9110 dice que se asume que todo es aceptable.
$aceptados = $accept === '' ? ['*/*' => 1.0] : parsearAccept($accept);

$qMarkdown = max(
    calidadPara($aceptados, 'text/markdown'),
    calidadPara($aceptados, 'text/x-markdown'),
);
$qHtml = calidadPara($aceptados, 'text/html');

// Solo cuenta si el cliente nombró markdown explícitamente (sin comodines).
$qMarkdownExplicito = max(
    calidadExplicita($aceptados, 'text/markdown'),
    calidadExplicita($aceptados, 'text/x-markdown'),
);

header('Vary: Accept');

/**
 * Regla de desempate, distinta según el recurso y a propósito:
 *
 * - home: markdown solo si el cliente lo pide EXPLÍCITAMENTE y con al menos
 *   tanta prioridad como HTML. Un `Accept: *​/*` (curl, muchos bots) sigue
 *   recibiendo la home HTML de siempre — no se cambia el comportamiento
 *   observable del sitio para nadie que no lo pida.
 *
 * - 404: markdown salvo que el cliente prefiera HTML explícitamente. Un
 *   navegador (que manda `text/html` con prioridad alta) sigue viendo la app;
 *   un agente con `*​/*` recibe el cuerpo de recuperación en markdown, que es
 *   justamente lo que necesita para reorientarse.
 */
$serviceMarkdown = $es404
    ? ($qMarkdown >= $qHtml)
    : ($qMarkdownExplicito > 0.0 && $qMarkdownExplicito >= $qHtml);

// Ningún tipo servible es aceptable para el cliente -> 406 (RFC 9110 §15.5.7).
if ($qMarkdown <= 0.0 && $qHtml <= 0.0) {
    http_response_code(406);
    header('Content-Type: text/plain; charset=utf-8');
    echo "406 Not Acceptable\n\n";
    echo "Esta URL puede servirse como text/html o text/markdown.\n";
    echo "Probá con: Accept: text/markdown\n";
    exit;
}

if ($es404) {
    http_response_code(404);
}

// El HTML nunca se cachea (misma política que el .htaccess para *.html).
header('Cache-Control: no-cache, no-store, must-revalidate');

if ($serviceMarkdown && is_readable($rutaMd)) {
    header('Content-Type: text/markdown; charset=utf-8');
    readfile($rutaMd);
    exit;
}

// Fallback: HTML. También es el camino si el .md faltara por un deploy parcial.
header('Content-Type: text/html; charset=utf-8');
if (is_readable($rutaHtml)) {
    readfile($rutaHtml);
} else {
    // Último recurso: no dejar la home en blanco jamás.
    echo '<!doctype html><meta charset="utf-8"><title>Pack Express Uruguay</title>';
    echo '<h1>Pack Express Uruguay</h1><p>Courier y logística. ';
    echo 'Contacto: <a href="https://wa.me/59893594297">+598 93 594 297</a></p>';
}
