/**
 * Contrato entre la interfaz y el motor.
 *
 * Es la única frontera entre las dos capas: el motor simulado de hoy y el
 * motor fisiológico de mañana (pool LIF → espigas → rejilla HD → electrodo)
 * deben hablar exactamente estos mensajes. Si este archivo no cambia,
 * la interfaz no se entera del reemplazo.
 */

/** Frecuencia de muestreo de la señal, en Hz. */
export const FS = 2000;

/** Lado del masetero. */
export type Lado = 'der' | 'izq';

/** Parámetros que la interfaz envía al motor (canal lento). */
export interface Parametros {
  /** Fuerza de mordida, 0 a 1. */
  fuerza: number;
  /** Nivel de fatiga, 0 a 1. */
  fatiga: number;
  /** true mientras el alumno mantiene la contracción. */
  contrayendo: boolean;
  /** Posición del electrodo sobre el masetero, normalizada 0 a 1 (u = ancho, v = alto). */
  electrodo: { u: number; v: number };
}

/** Mensajes interfaz → motor. */
export type MensajeAlMotor =
  | { tipo: 'parametros'; parametros: Parametros }
  | { tipo: 'pausar' }
  | { tipo: 'reanudar' };

/** Índices calculados por el motor sobre la ventana reciente. */
export interface Indices {
  /** RMS en µV por lado. */
  rms: Record<Lado, number>;
  /** Frecuencia mediana del espectro (Hz), lado derecho. */
  mdf: number;
  /** Simetría izquierda/derecha en %. */
  simetria: number;
}

/** Mensajes motor → interfaz. */
export type MensajeDelMotor =
  /** Canal rápido: un bloque de muestras en µV por canal. */
  | { tipo: 'bloque'; der: Float32Array; izq: Float32Array }
  /** Índices recalculados (unas 4 veces por segundo). */
  | { tipo: 'indices'; indices: Indices }
  /** Amplitud RMS en cada electrodo de la rejilla 8×8 (64 valores, fila por fila). */
  | { tipo: 'mapa'; valores: Float32Array };
