/**
 * MOTOR SIMULADO — solo para desarrollar la interfaz.
 *
 * No es un modelo fisiológico: genera ruido filtrado con la amplitud y el
 * espectro aproximados de una sEMG de superficie para que la interfaz tenga
 * algo realista que dibujar. Se reemplazará por el motor real
 * (pool LIF → espigas → rejilla HD → electrodo) sin cambiar el contrato.
 */
import { FS, type Indices, type Parametros } from '../worker/contrato';
import { frecuenciaMediana, rms } from './fft';

/** Centro del vientre muscular en coordenadas normalizadas del masetero. */
const VIENTRE = { u: 0.5, v: 0.55 };
/** Zona de inervación aproximada: la amplitud bipolar cae sobre ella. */
const INERVACION = { u: 0.5, v: 0.3 };

const RUIDO_BASE_UV = 4;
const AMPLITUD_MAX_UV = 520;

/** Generador pseudoaleatorio reproducible (mulberry32). */
function aleatorio(semilla: number): () => number {
  let a = semilla >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Normal estándar por Box–Muller. */
function normal(r: () => number): number {
  const u = Math.max(1e-12, r());
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * r());
}

/**
 * Qué tanto de la actividad capta un electrodo en (u, v):
 * máximo sobre el vientre, cae al alejarse y se atenúa sobre la zona de inervación.
 */
export function factorPosicion(u: number, v: number): number {
  const dv = (u - VIENTRE.u) ** 2 / 0.06 + (v - VIENTRE.v) ** 2 / 0.09;
  const vientre = Math.exp(-dv);
  const di = ((u - INERVACION.u) ** 2 + (v - INERVACION.v) ** 2) / 0.008;
  const inervacion = 1 - 0.65 * Math.exp(-di);
  return Math.max(0, vientre * inervacion);
}

/** Tamaño aproximado del masetero en mm (el mismo que usa la interfaz en anatomia/masetero.ts). */
const MASETERO_MM = { ancho: 40, alto: 55 };

type Electrodos = Parametros['electrodos'];

/**
 * Qué tanto de la actividad capta el par bipolar A–B:
 * - posición: la de su punto medio (vientre e inervación, como `factorPosicion`);
 * - distancia: muy juntos, A y B ven casi la misma señal y la resta la cancela;
 *   vale 1 a 20 mm y crece poco más allá;
 * - orientación: paralelo a las fibras capta más que perpendicular;
 * - inervación: si la zona de inervación queda entre A y B, los potenciales
 *   viajan en sentidos opuestos bajo cada electrodo y la resta se cancela en parte.
 */
export function factorPar(e: Electrodos): number {
  const u = (e.a.u + e.b.u) / 2;
  const v = (e.a.v + e.b.v) / 2;
  const du = (e.b.u - e.a.u) * MASETERO_MM.ancho;
  const dv = (e.b.v - e.a.v) * MASETERO_MM.alto;
  const d = Math.hypot(du, dv);
  const distancia = Math.min(1.15, (1 - Math.exp(-d / 8)) / (1 - Math.exp(-20 / 8)));
  const cos2 = d > 0 ? (dv * dv) / (d * d) : 1;
  const orientacion = 0.45 + 0.55 * cos2;
  const cruza = (e.a.v - INERVACION.v) * (e.b.v - INERVACION.v) < 0 ? 0.45 : 1;
  return factorPosicion(u, v) * distancia * orientacion * cruza;
}

/** Un canal: ruido blanco → paso-banda de primer orden con corte variable. */
class Canal {
  private r: () => number;
  private bajo = 0;
  private alto = 0;

  constructor(semilla: number) {
    this.r = aleatorio(semilla);
  }

  /**
   * @param amplitud amplitud objetivo en µV (aprox. RMS)
   * @param fatiga 0 a 1: desplaza el espectro hacia frecuencias bajas
   */
  muestra(amplitud: number, fatiga: number): number {
    // Corte superior: baja con la fatiga y arrastra la frecuencia mediana
    // de ~120 Hz (sin fatiga) a ~75 Hz (fatiga máxima), orden típico del masetero.
    const fc = 95 - 50 * fatiga;
    const aB = 1 - Math.exp((-2 * Math.PI * fc) / FS);
    // Corte inferior fijo en ~20 Hz (quita la deriva lenta).
    const aA = 1 - Math.exp((-2 * Math.PI * 20) / FS);
    const x = normal(this.r);
    this.bajo += aB * (x - this.bajo);
    this.alto += aA * (this.bajo - this.alto);
    const banda = this.bajo - this.alto;
    // Ganancia que compensa la energía perdida al filtrar.
    const ganancia = 3.4 + 2.2 * fatiga;
    return banda * amplitud * ganancia + normal(this.r) * RUIDO_BASE_UV * 0.5;
  }
}

/** Ventana de análisis: 512 muestras ≈ 256 ms a 2 kHz. */
const N_ANALISIS = 512;

export class MotorSimulado {
  private canales = { der: new Canal(7), izq: new Canal(19) };
  private envolvente = 0;
  private historial = { der: new Float32Array(N_ANALISIS), izq: new Float32Array(N_ANALISIS) };
  private pos = 0;

  parametros: Parametros = {
    fuerza: 0.6,
    fatiga: 0.35,
    contrayendo: false,
    electrodos: { a: { u: 0.5, v: 0.37 }, b: { u: 0.5, v: 0.73 } },
  };

  /** Genera `n` muestras por canal, en µV. */
  generar(n: number): { der: Float32Array; izq: Float32Array } {
    const der = new Float32Array(n);
    const izq = new Float32Array(n);
    const p = this.parametros;
    const objetivo = p.contrayendo ? p.fuerza : 0;
    const pos = factorPar(p.electrodos);
    // Rampa de ~80 ms al contraer o relajar.
    const paso = 1 - Math.exp(-1 / (0.08 * FS));
    for (let i = 0; i < n; i++) {
      this.envolvente += paso * (objetivo - this.envolvente);
      const a = RUIDO_BASE_UV + AMPLITUD_MAX_UV * this.envolvente;
      // El lado derecho lleva el par A–B que mueve el alumno; el izquierdo queda bien colocado.
      der[i] = this.canales.der.muestra(a * pos, p.fatiga);
      izq[i] = this.canales.izq.muestra(a * 0.88, p.fatiga);
      this.historial.der[this.pos] = der[i];
      this.historial.izq[this.pos] = izq[i];
      this.pos = (this.pos + 1) % N_ANALISIS;
    }
    return { der, izq };
  }

  /** RMS, frecuencia mediana y simetría sobre la ventana reciente. */
  indices(): Indices {
    const der = rms(this.historial.der);
    const izq = rms(this.historial.izq);
    return {
      rms: { der, izq },
      mdf: frecuenciaMediana(this.historial.der, FS),
      simetria: der > 0 ? (100 * Math.min(der, izq)) / Math.max(der, izq) : 100,
    };
  }

  /** Amplitud que captaría cada electrodo de una rejilla 8×8 sobre el masetero. */
  mapa(): Float32Array {
    const valores = new Float32Array(64);
    const a = RUIDO_BASE_UV + AMPLITUD_MAX_UV * this.envolvente;
    for (let fila = 0; fila < 8; fila++) {
      for (let col = 0; col < 8; col++) {
        const u = (col + 0.5) / 8;
        const v = (fila + 0.5) / 8;
        valores[fila * 8 + col] = a * factorPosicion(u, v);
      }
    }
    return valores;
  }
}
