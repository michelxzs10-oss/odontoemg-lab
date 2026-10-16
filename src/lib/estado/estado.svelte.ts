/**
 * Estado único de la interfaz (canal lento).
 *
 * Cada sección la modifica un solo componente y la leen los que la necesitan.
 * Las muestras de señal NO viven aquí: van por el canal rápido (buffers circulares).
 */
import type { Indices } from '../worker/contrato';

export type Modo = 'libre' | 'caso' | 'pares';
export type Escenario = 'normal' | 'fatiga' | 'bruxismo';
export type VistaAnatomica = 'mapa' | '3d';

export const estado = $state({
  /** Modo de trabajo y escenario clínico. */
  sesion: { modo: 'libre' as Modo, escenario: 'fatiga' as Escenario },
  /** Lo que el alumno controla. */
  contraccion: { fuerza: 0.6, fatiga: 0.6, contrayendo: false },
  /** Posición del electrodo sobre el masetero (0 a 1). */
  electrodo: { u: 0.5, v: 0.55 },
  /** Cómo se muestra la señal. */
  visualizacion: { uvPorDiv: 500, congelado: false, vista: 'mapa' as VistaAnatomica },
  /** Lo último que calculó el motor. */
  indices: null as Indices | null,
});

/** Valores predeterminados de cada escenario clínico (provisionales, por validar con el equipo clínico). */
export const ESCENARIOS: Record<Escenario, { nombre: string; fuerza: number; fatiga: number }> = {
  normal: { nombre: 'Función normal', fuerza: 0.5, fatiga: 0 },
  fatiga: { nombre: 'Fatiga muscular', fuerza: 0.6, fatiga: 0.6 },
  bruxismo: { nombre: 'Bruxismo (apretamiento)', fuerza: 0.9, fatiga: 0.3 },
};

export function aplicarEscenario(e: Escenario): void {
  estado.sesion.escenario = e;
  estado.contraccion.fuerza = ESCENARIOS[e].fuerza;
  estado.contraccion.fatiga = ESCENARIOS[e].fatiga;
}
