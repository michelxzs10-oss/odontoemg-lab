/**
 * Conversión entre coordenadas del músculo (u, v) y coordenadas del dibujo SVG
 * de cada vista del cráneo 2D (viewBox 0 0 600 460).
 *
 * Cada vista describe el masetero como un cuadrilátero con 4 esquinas.
 * Dentro de él se interpola en forma bilineal; así un punto (u, v) es el
 * mismo sitio del músculo en todas las vistas.
 */
import type { Punto } from './masetero';

export type VistaCraneo = 'frontal' | 'izq' | 'der';

export interface Xy {
  x: number;
  y: number;
}

/** Esquinas del masetero: sup./inf. × posterior/anterior. */
export interface Cuadro {
  supPost: Xy;
  supAnt: Xy;
  infAnt: Xy;
  infPost: Xy;
}

export const ANCHO_SVG = 600;
export const ALTO_SVG = 460;

const espejo = (c: Cuadro): Cuadro => {
  const m = (p: Xy): Xy => ({ x: ANCHO_SVG - p.x, y: p.y });
  return { supPost: m(c.supPost), supAnt: m(c.supAnt), infAnt: m(c.infAnt), infPost: m(c.infPost) };
};

/** Masetero derecho visto de lado (la cara mira a la derecha del dibujo). */
const LATERAL_DER: Cuadro = {
  supPost: { x: 330, y: 282 },
  supAnt: { x: 425, y: 272 },
  infAnt: { x: 398, y: 428 },
  infPost: { x: 316, y: 420 },
};

/** Masetero derecho del paciente en la vista frontal (a la izquierda del dibujo, muy escorzado). */
const FRONTAL_DER: Cuadro = {
  supPost: { x: 136, y: 262 },
  supAnt: { x: 172, y: 268 },
  infAnt: { x: 178, y: 400 },
  infPost: { x: 152, y: 392 },
};

/** Cuadro del masetero de cada lado en cada vista (null = ese lado no se ve). */
export const CUADROS: Record<VistaCraneo, { der: Cuadro | null; izq: Cuadro | null }> = {
  der: { der: LATERAL_DER, izq: null },
  izq: { der: null, izq: espejo(LATERAL_DER) },
  frontal: { der: FRONTAL_DER, izq: espejo(FRONTAL_DER) },
};

/** (u, v) del músculo → punto del dibujo. */
export function aSvg(c: Cuadro, p: Punto): Xy {
  const { u, v } = p;
  return {
    x: (1 - u) * (1 - v) * c.supPost.x + u * (1 - v) * c.supAnt.x + u * v * c.infAnt.x + (1 - u) * v * c.infPost.x,
    y: (1 - u) * (1 - v) * c.supPost.y + u * (1 - v) * c.supAnt.y + u * v * c.infAnt.y + (1 - u) * v * c.infPost.y,
  };
}

/** Punto del dibujo → (u, v) del músculo (inversa bilineal por Newton; sin limitar a 0–1). */
export function aMusculo(c: Cuadro, q: Xy): Punto {
  let u = 0.5;
  let v = 0.5;
  for (let k = 0; k < 8; k++) {
    const p = aSvg(c, { u, v });
    const ex = p.x - q.x;
    const ey = p.y - q.y;
    // Derivadas parciales de la interpolación bilineal.
    const dxu = (1 - v) * (c.supAnt.x - c.supPost.x) + v * (c.infAnt.x - c.infPost.x);
    const dyu = (1 - v) * (c.supAnt.y - c.supPost.y) + v * (c.infAnt.y - c.infPost.y);
    const dxv = (1 - u) * (c.infPost.x - c.supPost.x) + u * (c.infAnt.x - c.supAnt.x);
    const dyv = (1 - u) * (c.infPost.y - c.supPost.y) + u * (c.infAnt.y - c.supAnt.y);
    const det = dxu * dyv - dxv * dyu;
    if (Math.abs(det) < 1e-9) break;
    u -= (ex * dyv - ey * dxv) / det;
    v -= (ey * dxu - ex * dyu) / det;
  }
  return { u, v };
}

/** Contorno del masetero como atributo `points` de un <polygon>. */
export function contorno(c: Cuadro): string {
  return [c.supPost, c.supAnt, c.infAnt, c.infPost].map((p) => `${p.x},${p.y}`).join(' ');
}
