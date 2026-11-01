<?php
/**
 * Envoltorio para `ErrorDocument 404`.
 *
 * ErrorDocument no admite pasar variables de entorno (a diferencia de
 * RewriteRule con [E=...]), así que el modo se fija acá y se delega toda la
 * lógica de negociación en negotiate.php — una sola implementación.
 */
putenv('PE_MODE=404');
require __DIR__ . '/negotiate.php';
