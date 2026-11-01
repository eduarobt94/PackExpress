import type { APIRequestContext } from '@playwright/test';

/**
 * Verifica si el backend PHP externo (`pack-sistema`) responde.
 * Se usa para skippear limpiamente los escenarios @requires-backend
 * cuando el backend no está corriendo en este entorno de ejecución
 * (ver docs/QA_AUTOMATION_STRATEGY.md — este repo no incluye el backend).
 */
export async function isBackendAvailable(request: APIRequestContext, baseURL: string): Promise<boolean> {
  try {
    const res = await request.get(`${baseURL}/pack-sistema/api/v1/tarifario.php?action=tipos`, {
      timeout: 3000,
    });
    // BUG-TEST-007 (ver docs/QA_BUGS.md): res.ok() no basta. Esta es una
    // SPA con fallback de history — cualquier ruta no reconocida por
    // Vite/el hosting responde 200 con el HTML de index.html, no un 404.
    // Sin backend real, "pack-sistema/api/v1/tarifario.php" devolvía 200
    // con HTML, y el check original lo tomaba como "backend disponible",
    // corriendo escenarios @requires-backend contra un backend inexistente.
    if (!res.ok()) return false;
    const contentType = res.headers()['content-type'] ?? '';
    if (!contentType.includes('application/json')) return false;
    const body = await res.json().catch(() => null);
    return body !== null && typeof body === 'object' && 'ok' in body;
  } catch {
    return false;
  }
}
