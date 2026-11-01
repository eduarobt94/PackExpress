/**
 * Configuración de entorno centralizada.
 * Nunca hardcodear URLs/credenciales en tests — todo pasa por acá.
 */

function readEnv(name: string, fallback: string): string {
  return process.env[name] ?? fallback;
}

export const ENV = {
  /** URL base del frontend bajo prueba (Vite dev server por defecto). */
  BASE_URL: readEnv('BASE_URL', 'http://localhost:5173'),

  /**
   * Indica si el backend PHP (`pack-sistema`) está disponible en este
   * entorno de ejecución. Los escenarios @requires-backend usan esto para
   * skippearse limpiamente en vez de fallar en rojo por un motivo ajeno
   * al frontend (ver docs/QA_AUTOMATION_STRATEGY.md).
   */
  BACKEND_AVAILABLE: readEnv('BACKEND_AVAILABLE', 'auto'), // 'auto' | 'true' | 'false'

  CI: process.env.CI === 'true' || process.env.CI === '1',
};
