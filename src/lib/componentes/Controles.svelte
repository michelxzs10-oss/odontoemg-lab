<script lang="ts">
  import { estado } from '../estado/estado.svelte';

  const pct = (x: number) => Math.round(x * 100);
</script>

<section class="tarjeta" aria-labelledby="titulo-controles">
  <h2 id="titulo-controles">Controles</h2>

  <div class="control">
    <div class="fila">
      <label for="fuerza">Fuerza de mordida</label>
      <span class="mono">{pct(estado.contraccion.fuerza)} %</span>
    </div>
    <input
      id="fuerza"
      type="range"
      min="0"
      max="100"
      value={pct(estado.contraccion.fuerza)}
      oninput={(e) => (estado.contraccion.fuerza = Number(e.currentTarget.value) / 100)}
    />
  </div>

  <div class="control">
    <div class="fila">
      <label for="fatiga">Nivel de fatiga</label>
      <span class="mono">{pct(estado.contraccion.fatiga)} %</span>
    </div>
    <input
      id="fatiga"
      type="range"
      min="0"
      max="100"
      value={pct(estado.contraccion.fatiga)}
      oninput={(e) => (estado.contraccion.fatiga = Number(e.currentTarget.value) / 100)}
    />
  </div>

  <button
    type="button"
    class="boton primario"
    aria-pressed={estado.contraccion.contrayendo}
    onclick={() => (estado.contraccion.contrayendo = !estado.contraccion.contrayendo)}
  >
    {estado.contraccion.contrayendo ? 'Relajar' : 'Contraer'}
  </button>
</section>

<style>
  section {
    display: flex;
    flex-direction: column;
    gap: 18px;
  }
  .control {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }
  .fila {
    display: flex;
    justify-content: space-between;
    font-size: 14px;
  }
  .fila .mono {
    font-size: 13px;
    color: var(--texto-2);
  }
  input[type='range'] {
    width: 100%;
    height: 28px;
    accent-color: var(--acento);
  }
</style>
