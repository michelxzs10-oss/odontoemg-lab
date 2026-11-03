/**
 * Geometría del par de electrodos sobre el masetero.
 *
 * Solo geometría (distancias, ángulos, zonas): la amplitud de la señal la
 * calcula el motor. Coordenadas normalizadas del músculo:
 *   u = ancho (0 = borde posterior, 1 = borde anterior)
 *   v = alto, a lo largo de las fibras (0 = arco cigomático, 1 = mandíbula)
 * Como v sigue la dirección de las fibras, un par "paralelo a las fibras"
 * es un par alineado con el eje v.
 */

export interface Punto {
  u: number;
  v: number;
}

export type IdElectrodo = 'a' | 'b';

export interface Par {
  a: Punto;
  b: Punto;
}

/** Tamaño aproximado del masetero superficial de un adulto, en mm (provisional, por validar con el equipo clínico). */
export const MASETERO_MM = { ancho: 40, alto: 55 };

/** Vientre muscular: dónde se recomienda colocar el par (elipse en u, v). */
export const VIENTRE = { u: 0.5, v: 0.55, radioU: 0.24, radioV: 0.3 };

/** Altura aproximada de la zona de inervación (franja horizontal en v). */
export const INERVACION_V = 0.3;

/** Distancia entre electrodos recomendada, en mm. */
export const DISTANCIA_RECOMENDADA_MM = { min: 15, ideal: 20, max: 25 };

/** Desviación máxima aceptable respecto a las fibras, en grados. */
export const ANGULO_MAX_GRADOS = 15;

/** Posición inicial: par vertical de 20 mm centrado en el vientre. */
export const PAR_INICIAL: Par = {
  a: { u: 0.5, v: 0.37 },
  b: { u: 0.5, v: 0.73 },
};

const limitar = (x: number) => Math.min(1, Math.max(0, x));

export function centro(par: Par): Punto {
  return { u: (par.a.u + par.b.u) / 2, v: (par.a.v + par.b.v) / 2 };
}

/** Distancia entre A y B en mm. */
export function distanciaMm(par: Par): number {
  const du = (par.b.u - par.a.u) * MASETERO_MM.ancho;
  const dv = (par.b.v - par.a.v) * MASETERO_MM.alto;
  return Math.hypot(du, dv);
}

/** Ángulo entre la línea A–B y las fibras, en grados (0 = paralelo, 90 = perpendicular). */
export function anguloConFibras(par: Par): number {
  const du = (par.b.u - par.a.u) * MASETERO_MM.ancho;
  const dv = (par.b.v - par.a.v) * MASETERO_MM.alto;
  if (du === 0 && dv === 0) return 0;
  return (Math.atan2(Math.abs(du), Math.abs(dv)) * 180) / Math.PI;
}

export function dentroDelVientre(p: Punto): boolean {
  return ((p.u - VIENTRE.u) / VIENTRE.radioU) ** 2 + ((p.v - VIENTRE.v) / VIENTRE.radioV) ** 2 <= 1;
}

/** true si la zona de inervación queda entre A y B (o casi encima de alguno). */
export function cruzaInervacion(par: Par): boolean {
  const margen = 0.04;
  const arriba = (p: Punto) => p.v < INERVACION_V - margen;
  const abajo = (p: Punto) => p.v > INERVACION_V + margen;
  return !((arriba(par.a) && arriba(par.b)) || (abajo(par.a) && abajo(par.b)));
}

export interface Revision {
  id: 'vientre' | 'distancia' | 'fibras' | 'inervacion';
  ok: boolean;
  titulo: string;
  detalle: string;
}

/** Lista de comprobación de la colocación, para mostrar al alumno. */
export function revisarPar(par: Par): Revision[] {
  const d = distanciaMm(par);
  const ang = anguloConFibras(par);
  const R = DISTANCIA_RECOMENDADA_MM;
  const vientre = dentroDelVientre(par.a) && dentroDelVientre(par.b);
  return [
    {
      id: 'vientre',
      ok: vientre,
      titulo: 'Sobre el vientre del músculo',
      detalle: vientre ? 'Ambos electrodos dentro de la zona recomendada' : 'Algún electrodo quedó cerca del borde',
    },
    {
      id: 'distancia',
      ok: d >= R.min && d <= R.max,
      titulo: `Distancia entre electrodos: ${Math.round(d)} mm`,
      detalle: `Recomendado: ${R.ideal} mm (de ${R.min} a ${R.max})`,
    },
    {
      id: 'fibras',
      ok: ang <= ANGULO_MAX_GRADOS,
      titulo: `Paralelo a las fibras: ${Math.round(ang)}°`,
      detalle: `Desviación aceptable: menos de ${ANGULO_MAX_GRADOS}°`,
    },
    {
      id: 'inervacion',
      ok: !cruzaInervacion(par),
      titulo: 'Fuera de la zona de inervación',
      detalle: cruzaInervacion(par)
        ? 'La zona de inervación queda entre los electrodos: la señal se cancela'
        : 'Ambos electrodos del mismo lado de la zona de inervación',
    },
  ];
}

/** Mueve un solo electrodo. */
export function moverElectrodo(par: Par, id: IdElectrodo, p: Punto): void {
  par[id].u = limitar(p.u);
  par[id].v = limitar(p.v);
}

/** Mueve el par completo para que su centro quede en `p`, sin que ningún electrodo salga del músculo. */
export function moverPar(par: Par, p: Punto): void {
  const c = centro(par);
  const minU = Math.min(par.a.u, par.b.u);
  const maxU = Math.max(par.a.u, par.b.u);
  const minV = Math.min(par.a.v, par.b.v);
  const maxV = Math.max(par.a.v, par.b.v);
  const du = Math.min(1 - maxU, Math.max(-minU, p.u - c.u));
  const dv = Math.min(1 - maxV, Math.max(-minV, p.v - c.v));
  par.a.u += du;
  par.b.u += du;
  par.a.v += dv;
  par.b.v += dv;
}
