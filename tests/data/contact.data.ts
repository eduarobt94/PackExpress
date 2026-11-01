import type { ContactFormData } from '../utils/types';

export const VALID_CONTACT: ContactFormData = {
  nombre: 'Juan Pérez QA',
  email: 'juan.qa@example.com',
  telefono: '+598 99 123 456',
  asunto: 'Consulta general',
  mensaje: 'Este es un mensaje de prueba generado por la suite E2E automatizada.',
};

export const INVALID_EMAILS = ['no-es-email', 'falta-arroba.com', '@sin-usuario.com', 'espacio malo@x.com'];

/** Mensaje de 9 caracteres — 1 por debajo del mínimo (10) definido en Docs.jsx validate(). */
export const MENSAJE_BOUNDARY_INVALID = '123456789';
/** Mensaje de exactamente 10 caracteres — boundary válido. */
export const MENSAJE_BOUNDARY_VALID = '1234567890';
