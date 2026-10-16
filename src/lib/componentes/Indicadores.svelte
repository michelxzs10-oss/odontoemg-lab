<script lang="ts">
  import { untrack } from 'svelte';
  import { estado } from '../estado/estado.svelte';

  /** Últimos valores de frecuencia mediana (unos 15 s). */
  let historial = $state<number[]>([]);

  // Se ejecuta con cada índice nuevo. `untrack` evita que leer `historial` vuelva a disparar el efecto.
  $effect(() => {
    const i = estado.indices;
    if (!i || !estado.contraccion.contrayendo) return;
    const previo = untrack(() => historial);
    historial = [...previo.slice(-59), i.mdf];
  });

  const formato = (x: number | undefined) => (x === undefined ? '—' : Math.round(x).toString());

  let puntos = $derived.by(() => {
    if (historial.length < 2) return '';
    const max = 160;
    return historial.map((v, k) => `${(k * 300) / 59},${60 - (Math.min(v, max) / max) * 56}`).join(' ');
  });
</script>

<section class="tarjeta" aria-labelledby="titulo-ind">
  <div class="barra">
    <h2 id="titulo-ind">Indicadores</h2>
    <span class="nota">motor simulado</span>
  </div>

  <div class="rejilla">
    <div class="dato">
      <span>RMS derecho</span>
      <strong class="mono">{formato(estado.indices?.rms.der)} <small>µV</small></strong>
    </div>
    <div class="dato">
      <span>RMS izquierdo</span>
      <strong class="mono">{formato(estado.indices?.rms.izq)} <small>µV</small></strong>
    </div>
    <div class="dato">
      <span>Frecuencia mediana</span>
      <strong class="mono">{formato(estado.indices?.mdf)} <small>Hz</small></strong>
    </div>
    <div class="dato">
      <span>Simetría</span>
      <strong class="mono">{formato(estado.indices?.simetria)} <small>%</small></strong>
    </div>
  </div>

  <div class="tendencia">
    <span>Frecuencia mediana durante la contracción (baja con la fatiga)</span>
    <svg viewBox="0 0 300 60" preserveAspectRatio="none" role="img" aria-label="Tendencia de la frecuencia mediana">
      {#if puntos}
        <polyline points={puntos} fill="none" stroke="#0f6e56" stroke-width="2" vector-effect="non-scaling-stroke" />
      {/if}
    </svg>
  </div>
</section>

<style>
  section {
    display: flex;
    flex-direction: column;
    gap: 14px;
  }
  .barra {
    display: flex;
    justify-content: space-between;
    align-items: baseline;
  }
  .nota {
    font-size: 12px;
    color: var(--texto-2);
  }
  .rejilla {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 10px;
  }
  .dato {
    background: var(--superficie-2);
    border-radius: 12px;
    padding: 12px;
    display: flex;
    flex-direction: column;
    gap: 2px;
  }
  .dato span {
    font-size: 12.5px;
    color: var(--texto-2);
  }
  .dato strong {
    font-size: 22px;
    font-weight: 500;
  }
  small {
    font-size: 13px;
  }
  .tendencia {
    display: flex;
    flex-direction: column;
    gap: 4px;
    font-size: 12.5px;
    color: var(--texto-2);
  }
  svg {
    width: 100%;
    height: 60px;
    background: #fafbfc;
    border-radius: 8px;
  }
</style>
