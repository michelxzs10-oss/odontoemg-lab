/**
 * Web Worker del motor. Corre fuera del hilo principal: la interfaz nunca se
 * traba aunque el cálculo sea pesado. Hoy usa el motor simulado.
 */
import { FS, type MensajeAlMotor, type MensajeDelMotor } from '../worker/contrato';
import { MotorSimulado } from './generador';

// Tipo mínimo del ámbito del worker (evita mezclar las librerías DOM y WebWorker en tsconfig).
const ctx = self as unknown as {
  postMessage(mensaje: unknown, transferir: Transferable[]): void;
  onmessage: ((e: MessageEvent<MensajeAlMotor>) => void) | null;
};
const motor = new MotorSimulado();

/** Un bloque cada 50 ms (≈ 100 muestras por canal a 2 kHz). */
const PERIODO_MS = 50;

let activo = true;
let ciclos = 0;
let ultimo = performance.now();
let pendiente = 0;

function enviar(m: MensajeDelMotor, transferir: Transferable[] = []): void {
  ctx.postMessage(m, transferir);
}

function tic() {
  if (!activo) return;
  // Genera las muestras que correspondan al tiempo real transcurrido,
  // aunque el temporizador se retrase.
  const ahora = performance.now();
  pendiente += ((ahora - ultimo) * FS) / 1000;
  ultimo = ahora;
  const n = Math.min(Math.floor(pendiente), FS);
  pendiente -= n;
  if (n > 0) {
    const { der, izq } = motor.generar(n);
    enviar({ tipo: 'bloque', der, izq }, [der.buffer, izq.buffer]);
  }
  ciclos++;
  if (ciclos % 5 === 0) {
    enviar({ tipo: 'indices', indices: motor.indices() });
    const valores = motor.mapa();
    enviar({ tipo: 'mapa', valores }, [valores.buffer]);
  }
}

setInterval(tic, PERIODO_MS);

ctx.onmessage = (e: MessageEvent<MensajeAlMotor>) => {
  const m = e.data;
  if (m.tipo === 'parametros') motor.parametros = m.parametros;
  else if (m.tipo === 'pausar') activo = false;
  else if (m.tipo === 'reanudar') {
    activo = true;
    ultimo = performance.now();
    pendiente = 0;
  }
};
