/**
 * Puente entre la interfaz y el Web Worker del motor.
 *
 * - Canal lento: `enviarParametros()` manda el estado que cambia el alumno.
 * - Canal rápido: las muestras se escriben directo en los buffers circulares,
 *   que el osciloscopio lee en cada cuadro. Nunca pasan por Svelte.
 */
import { BufferCircular } from './buffer-circular';
import { FS, type Indices, type MensajeAlMotor, type MensajeDelMotor, type Parametros } from './contrato';

/** Segundos de señal que caben en pantalla. */
export const VENTANA_S = 2.5;

export interface Puente {
  buffers: { der: BufferCircular; izq: BufferCircular };
  enviarParametros(p: Parametros): void;
  pausar(): void;
  reanudar(): void;
  alRecibirIndices(fn: (i: Indices) => void): void;
  alRecibirMapa(fn: (valores: Float32Array) => void): void;
  cerrar(): void;
}

export function crearPuente(worker: Worker): Puente {
  const capacidad = Math.round(FS * VENTANA_S);
  const buffers = { der: new BufferCircular(capacidad), izq: new BufferCircular(capacidad) };
  let fnIndices: (i: Indices) => void = () => {};
  let fnMapa: (v: Float32Array) => void = () => {};
  let congelado = false;

  worker.onmessage = (e: MessageEvent<MensajeDelMotor>) => {
    const m = e.data;
    if (m.tipo === 'bloque') {
      if (congelado) return;
      buffers.der.escribir(m.der);
      buffers.izq.escribir(m.izq);
    } else if (m.tipo === 'indices') fnIndices(m.indices);
    else if (m.tipo === 'mapa') fnMapa(m.valores);
  };

  const enviar = (m: MensajeAlMotor) => worker.postMessage(m);

  return {
    buffers,
    enviarParametros: (parametros) => enviar({ tipo: 'parametros', parametros }),
    pausar: () => {
      congelado = true;
      enviar({ tipo: 'pausar' });
    },
    reanudar: () => {
      congelado = false;
      enviar({ tipo: 'reanudar' });
    },
    alRecibirIndices: (fn) => (fnIndices = fn),
    alRecibirMapa: (fn) => (fnMapa = fn),
    cerrar: () => worker.terminate(),
  };
}

/** Crea el worker del motor simulado. Cuando exista el motor real, solo cambia esta función. */
export function crearMotor(): Puente {
  const worker = new Worker(new URL('../motor-simulado/sim.worker.ts', import.meta.url), { type: 'module' });
  return crearPuente(worker);
}
