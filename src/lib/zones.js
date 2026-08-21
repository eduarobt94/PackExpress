/**
 * Zonas de tarifario y mapeo país → zona.
 * Fuente única — usado por Cotizacion.jsx y por el motor del chat (ChatAgent).
 */

export const ZONE_LABELS = {
  A: 'Zona A — Miami',
  B: 'Zona B — Centro América',
  C: 'Zona C — Caribe Sur / CUBA',
  D: 'Zona D — Caribe Sur / CUBA',
  E: 'Zona E — Sudamérica',
  F: 'Zona F — Caribe / Canadá',
  G: 'Zona G — Europa Occidental',
  H: 'Zona H — Europa Oriental / Asia',
  I: 'Zona I — Resto del Mundo',
}

export const COUNTRY_ZONE = {
  'Estados Unidos': 'A',
  'México': 'B', 'Guatemala': 'B', 'Belice': 'B', 'Honduras': 'B',
  'El Salvador': 'B', 'Nicaragua': 'B', 'Costa Rica': 'B', 'Panamá': 'B',
  'Colombia': 'C', 'República Dominicana': 'C', 'Puerto Rico': 'C', 'Venezuela': 'C',
  'Cuba': 'D', 'Jamaica': 'D', 'Haití': 'D', 'Trinidad y Tobago': 'D',
  'Aruba': 'D', 'Curazao': 'D', 'Barbados': 'D',
  'Ecuador': 'E', 'Perú': 'E', 'Bolivia': 'E', 'Argentina': 'E',
  'Chile': 'E', 'Brasil': 'E', 'Paraguay': 'E', 'Guyana': 'E', 'Surinam': 'E',
  'Canadá': 'F', 'Bahamas': 'F',
  'España': 'G', 'Portugal': 'G', 'Francia': 'G', 'Alemania': 'G',
  'Italia': 'G', 'Reino Unido': 'G', 'Países Bajos': 'G', 'Bélgica': 'G',
  'Suiza': 'G', 'Austria': 'G', 'Irlanda': 'G', 'Suecia': 'G',
  'Noruega': 'G', 'Dinamarca': 'G', 'Finlandia': 'G', 'Grecia': 'G',
  'Polonia': 'G', 'República Checa': 'G', 'Hungría': 'G', 'Rumanía': 'G', 'Croacia': 'G',
  'Ucrania': 'H', 'Turquía': 'H', 'Israel': 'H',
  'China': 'H', 'Japón': 'H', 'India': 'H', 'Corea del Sur': 'H',
  'Tailandia': 'H', 'Vietnam': 'H', 'Indonesia': 'H', 'Malasia': 'H',
  'Filipinas': 'H', 'Singapur': 'H', 'Taiwán': 'H',
  'Emiratos Árabes Unidos': 'H', 'Arabia Saudita': 'H', 'Qatar': 'H',
  'Australia': 'I', 'Nueva Zelanda': 'I',
  'Sudáfrica': 'I', 'Nigeria': 'I', 'Kenia': 'I', 'Egipto': 'I',
  'Marruecos': 'I', 'Tanzania': 'I', 'Ghana': 'I',
}
