export interface ContactFormData {
  nombre: string;
  email: string;
  telefono: string;
  asunto: string;
  mensaje: string;
}

export interface ContactFormErrors {
  nombre?: string;
  email?: string;
  telefono?: string;
  asunto?: string;
  mensaje?: string;
}

export enum LegalModalType {
  Courier = 'courier',
  Equipaje = 'equipaje',
  Prohibidos = 'prohibidos',
  Terminos = 'terminos',
  Privacidad = 'privacidad',
}

export enum TrackPhase {
  Idle = 'idle',
  Searching = 'searching',
  Syncing = 'syncing',
  Complete = 'complete',
  Error = 'error',
}

export enum Theme {
  Light = 'light',
  Dark = 'dark',
}

export type Viewport = 'desktop' | 'mobile' | 'tablet';
