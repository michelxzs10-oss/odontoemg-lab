<script lang="ts">
  import { onMount } from 'svelte';
  import { estado } from '../estado/estado.svelte';
  import { RenderOsciloscopio } from '../render/osciloscopio';
  import { VENTANA_S, type Puente } from '../worker/puente';

  let { puente }: { puente: Puente } = $props();

  let canvas: HTMLCanvasElement;
  let contenedor: HTMLDivElement;

  const escalas = [100, 200, 500, 1000];
  const msPorDiv = (VENTANA_S * 1000) / 10;

  onMount(() => {
    const css = getComputedStyle(document.documentElement);
    const token = (n: string) => css.getPropertyValue(n).trim();
    const render = new RenderOsciloscopio(canvas, [puente.buffers.der, puente.buffers.izq], {
      fondo: '#fafbfc',
      cuadricula: '#e3e8ed',
      ejes: '#c3cbd3',
      canales: [token('--canal-der'), token('--canal-izq')],
    });

    const observador = new ResizeObserver(([e]) => {
      render.redimensionar(e.contentRect.width, e.contentRect.height);
      render.dibujar();
    });
    observador.observe(contenedor);

    // Canal rápido: se dibuja en cada cuadro leyendo los buffers, sin pasar por Svelte.
    let id = 0;
    const cuadro = () => {
      render.uvPorDiv = estado.visualizacion.uvPorDiv;
      render.dibujar();
      id = requestAnimationFrame(cuadro);
    };
    id = requestAnimationFrame(cuadro);

    return () => {
      cancelAnimationFrame(id);
      observador.disconnect();
    };
  });

  function alternarCongelado() {
    estado.visualizacion.congelado = !estado.visualizacion.congelado;
    if (estado.visualizacion.congelado) puente.pausar();
    else puente.reanudar();
  }

  function exportarCaptura() {
    canvas.toBlob((blob) => {
      if (!blob) return;
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = `odontoemg-captura-${new Date().toISOString().slice(0, 19).replace(/:/g, '-')}.png`;
      a.click();
      URL.revokeObjectURL(a.href);
    });
  }
</script>

<section class="tarjeta" aria-labelledby="titulo-osc">
  <div class="barra">
    <h2 id="titulo-osc">Osciloscopio · 2 canales</h2>
    <div class="acciones">
      <label class="escala">
        <span class="sr-only">Escala vertical</span>
        <select bind:value={estado.visualizacion.uvPorDiv}>
          {#each escalas as e (e)}
            <option value={e}>{e} µV/div</option>
          {/each}
        </select>
      </label>
      <span class="mono tiempo">{msPorDiv} ms/div</span>
      <button type="button" class="boton" aria-pressed={estado.visualizacion.congelado} onclick={alternarCongelado}>
        {estado.visualizacion.congelado ? 'Reanudar' : 'Congelar'}
      </button>
      <button type="button" class="boton" onclick={exportarCaptura}>Exportar captura</button>
    </div>
  </div>

  <div class="trazos">
    <div class="etiquetas" aria-hidden="true">
      <span>Masetero der.</span>
      <span>Masetero izq.</span>
    </div>
    <div class="lienzo" bind:this={contenedor}>
      <canvas bind:this={canvas} role="img" aria-label="Señal sEMG del masetero derecho e izquierdo en tiempo real"></canvas>
    </div>
  </div>
</section>

<style>
  .barra {
    display: flex;
    flex-wrap: wrap;
    justify-content: space-between;
    align-items: center;
    gap: 10px;
    margin-bottom: 12px;
  }
  .acciones {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 8px;
  }
  .escala select {
    min-height: 44px;
    padding: 8px 10px;
    border: 1px solid var(--borde-fuerte);
    border-radius: var(--radio);
    background: var(--superficie);
    font-family: var(--mono);
    font-size: 13px;
  }
  .tiempo {
    font-size: 13px;
    color: var(--texto-2);
    padding: 0 4px;
  }
  .trazos {
    display: flex;
    gap: 12px;
  }
  .etiquetas {
    width: 92px;
    flex-shrink: 0;
    display: flex;
    flex-direction: column;
    font-size: 13px;
    color: var(--texto-2);
  }
  .etiquetas span {
    flex: 1;
    display: flex;
    align-items: center;
  }
  .lienzo {
    flex: 1;
    min-width: 0;
    height: 240px;
    border-radius: 8px;
    overflow: hidden;
  }
  canvas {
    display: block;
    width: 100%;
    height: 100%;
  }
</style>
