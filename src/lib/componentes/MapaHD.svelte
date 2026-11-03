<script lang="ts">
  import { onMount } from 'svelte';
  import { estado } from '../estado/estado.svelte';
  import { centro, moverPar } from '../anatomia/masetero';
  import { RenderMapaHD, type Rampa } from '../render/mapa-hd';
  import type { Puente } from '../worker/puente';

  let { puente }: { puente: Puente } = $props();

  let canvas: HTMLCanvasElement;
  let area: HTMLDivElement;
  let arrastrando = false;
  /** Porcentaje de la amplitud máxima del mapa que capta el electrodo. */
  let captacion = $state<number | null>(null);
  /** Punto medio del par A–B: es lo que se arrastra en el mapa. */
  let medio = $derived(centro(estado.electrodos));
  const POLOS = ['a', 'b'] as const;

  /** Rampa de activación sobre fondo oscuro (de reposo a máxima). */
  const rampa: Rampa = ['#2a2226', '#4c2a27', '#79332a', '#a83c2c', '#d8492e'];

  onMount(() => {
    const render = new RenderMapaHD(canvas, rampa, '#0f1922');
    let ultimo: Float32Array = new Float32Array(64);

    puente.alRecibirMapa((valores) => {
      ultimo = valores;
      render.dibujar(valores);
      const c = centro(estado.electrodos);
      const col = Math.min(7, Math.floor(c.u * 8));
      const fila = Math.min(7, Math.floor(c.v * 8));
      const max = Math.max(...valores);
      captacion = max > 20 ? Math.round((100 * valores[fila * 8 + col]) / max) : null;
    });

    const observador = new ResizeObserver(([e]) => {
      render.redimensionar(e.contentRect.width);
      render.dibujar(ultimo);
    });
    observador.observe(area);

    return () => {
      observador.disconnect();
      puente.alRecibirMapa(() => {});
    };
  });

  function moverA(e: PointerEvent) {
    const r = area.getBoundingClientRect();
    moverPar(estado.electrodos, { u: (e.clientX - r.left) / r.width, v: (e.clientY - r.top) / r.height });
  }

  function alPresionar(e: PointerEvent) {
    arrastrando = true;
    area.setPointerCapture(e.pointerId);
    moverA(e);
  }

  function alMover(e: PointerEvent) {
    if (arrastrando) moverA(e);
  }

  function alSoltar() {
    arrastrando = false;
  }

  /** Flechas del teclado: mueve el electrodo media celda. */
  function alTeclear(e: KeyboardEvent) {
    const paso = 1 / 16;
    const d: Record<string, [number, number]> = {
      ArrowLeft: [-paso, 0],
      ArrowRight: [paso, 0],
      ArrowUp: [0, -paso],
      ArrowDown: [0, paso],
    };
    const mov = d[e.key];
    if (!mov) return;
    e.preventDefault();
    moverPar(estado.electrodos, { u: medio.u + mov[0], v: medio.v + mov[1] });
  }
</script>

<div class="mapa">
  <!-- El área recibe toques y arrastre; la alternativa con teclado es el botón del electrodo (flechas). -->
  <!-- svelte-ignore a11y_no_static_element_interactions -->
  <div
    class="area"
    bind:this={area}
    onpointerdown={alPresionar}
    onpointermove={alMover}
    onpointerup={alSoltar}
    onpointercancel={alSoltar}
  >
    <canvas bind:this={canvas} aria-hidden="true"></canvas>
    <div class="inervacion" aria-hidden="true"><span>zona de inervación (aprox.)</span></div>
    {#each POLOS as id (id)}
      <span
        class="polo"
        style:left="{estado.electrodos[id].u * 100}%"
        style:top="{estado.electrodos[id].v * 100}%"
        aria-hidden="true">{id.toUpperCase()}</span
      >
    {/each}
    <button
      type="button"
      class="electrodo"
      style:left="{medio.u * 100}%"
      style:top="{medio.v * 100}%"
      aria-label="Par de electrodos con centro en u {medio.u.toFixed(2)}, v {medio.v.toFixed(2)}. Usa las flechas para moverlo."
      onkeydown={alTeclear}
    ></button>
  </div>

  <div class="info">
    <p class="lectura">
      <span class="punto" class:bien={captacion !== null && captacion >= 70}></span>
      Centro del par en <span class="mono">u {medio.u.toFixed(2)} · v {medio.v.toFixed(2)}</span>
    </p>
    <p class="captacion">
      {#if captacion === null}
        Contrae el músculo para ver cuánta señal capta esta posición.
      {:else}
        Capta el <strong class="mono">{captacion} %</strong> de la señal máxima del músculo.
      {/if}
    </p>
    <div class="leyenda">
      <span>Activación</span>
      <div class="rampa" aria-hidden="true">
        {#each rampa as c (c)}<span style:background={c}></span>{/each}
      </div>
      <span>Reposo → máxima</span>
    </div>
    <p class="nota">Rejilla virtual de 8 × 8 electrodos sobre el masetero derecho.</p>
  </div>
</div>

<style>
  .mapa {
    display: flex;
    flex-wrap: wrap;
    gap: 24px;
    align-items: center;
    justify-content: center;
    flex: 1;
  }
  .area {
    position: relative;
    width: min(100%, 360px);
    aspect-ratio: 1;
    touch-action: none;
    cursor: crosshair;
    border-radius: 12px;
    outline: 1px solid rgba(255, 255, 255, 0.16);
  }
  canvas {
    display: block;
    width: 100%;
    height: 100%;
    border-radius: 12px;
  }
  .inervacion {
    position: absolute;
    left: 0;
    right: 0;
    top: 30%;
    border-top: 1.5px dashed rgba(231, 237, 242, 0.55);
    pointer-events: none;
  }
  .inervacion span {
    position: absolute;
    right: 6px;
    top: -20px;
    font-size: 11.5px;
    color: var(--escena-texto-2);
  }
  .electrodo {
    position: absolute;
    width: 30px;
    height: 30px;
    margin: -15px 0 0 -15px;
    border-radius: 50%;
    border: 4px solid #f08a3e;
    background: #f7f7f2;
    box-shadow: 0 0 0 2px var(--escena);
    padding: 0;
  }
  .polo {
    position: absolute;
    width: 20px;
    height: 20px;
    margin: -10px 0 0 -10px;
    border-radius: 50%;
    border: 3px solid #6fa8ec;
    background: #f7f7f2;
    color: #0f3d73;
    font-size: 10px;
    font-weight: 600;
    line-height: 14px;
    text-align: center;
    pointer-events: none;
  }
  .info {
    flex: 1 1 220px;
    display: flex;
    flex-direction: column;
    gap: 12px;
    font-size: 14px;
  }
  .info p {
    margin: 0;
  }
  .lectura {
    display: flex;
    align-items: center;
    gap: 8px;
  }
  .punto {
    width: 10px;
    height: 10px;
    border-radius: 50%;
    background: #9fb0be;
  }
  .punto.bien {
    background: #5bc28f;
  }
  .captacion {
    color: var(--escena-texto-2);
  }
  .captacion strong {
    color: var(--escena-texto);
    font-weight: 500;
  }
  .leyenda {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 12.5px;
    color: var(--escena-texto-2);
  }
  .rampa {
    display: flex;
    gap: 3px;
  }
  .rampa span {
    width: 20px;
    height: 10px;
    border-radius: 3px;
  }
  .nota {
    font-size: 12.5px;
    color: var(--escena-texto-2);
  }
</style>
