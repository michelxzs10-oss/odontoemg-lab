/** FFT radix-2 en sitio. `re` e `im` deben medir una potencia de 2. */
export function fft(re: Float64Array, im: Float64Array): void {
  const n = re.length;
  for (let i = 1, j = 0; i < n; i++) {
    let bit = n >> 1;
    for (; j & bit; bit >>= 1) j ^= bit;
    j ^= bit;
    if (i < j) {
      [re[i], re[j]] = [re[j], re[i]];
      [im[i], im[j]] = [im[j], im[i]];
    }
  }
  for (let len = 2; len <= n; len <<= 1) {
    const ang = (-2 * Math.PI) / len;
    const wr = Math.cos(ang);
    const wi = Math.sin(ang);
    for (let i = 0; i < n; i += len) {
      let cr = 1;
      let ci = 0;
      for (let k = 0; k < len / 2; k++) {
        const a = i + k;
        const b = a + len / 2;
        const tr = re[b] * cr - im[b] * ci;
        const ti = re[b] * ci + im[b] * cr;
        re[b] = re[a] - tr;
        im[b] = im[a] - ti;
        re[a] += tr;
        im[a] += ti;
        const nr = cr * wr - ci * wi;
        ci = cr * wi + ci * wr;
        cr = nr;
      }
    }
  }
}

/**
 * Frecuencia mediana (Hz): la frecuencia que divide en dos mitades iguales
 * la potencia del espectro. Es el índice clásico de fatiga muscular.
 */
export function frecuenciaMediana(muestras: Float32Array, fs: number): number {
  const n = muestras.length;
  const re = new Float64Array(n);
  const im = new Float64Array(n);
  let media = 0;
  for (let i = 0; i < n; i++) media += muestras[i];
  media /= n;
  for (let i = 0; i < n; i++) {
    const hann = 0.5 - 0.5 * Math.cos((2 * Math.PI * i) / (n - 1));
    re[i] = (muestras[i] - media) * hann;
  }
  fft(re, im);
  const mitad = n / 2;
  const potencia = new Float64Array(mitad);
  let total = 0;
  for (let k = 1; k < mitad; k++) {
    potencia[k] = re[k] * re[k] + im[k] * im[k];
    total += potencia[k];
  }
  if (total === 0) return 0;
  let acumulado = 0;
  for (let k = 1; k < mitad; k++) {
    acumulado += potencia[k];
    if (acumulado >= total / 2) return (k * fs) / n;
  }
  return 0;
}

/** Raíz cuadrática media. */
export function rms(muestras: Float32Array): number {
  let s = 0;
  for (let i = 0; i < muestras.length; i++) s += muestras[i] * muestras[i];
  return Math.sqrt(s / Math.max(1, muestras.length));
}
