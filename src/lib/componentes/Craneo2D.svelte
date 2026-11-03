<!--
  Sección "Cráneo 2D": vista grande + miniaturas para cambiar de vista,
  estado de la colocación y lista de revisión.
  Todas las vistas leen el mismo estado.electrodos (ver VistaCraneo.svelte).
-->
<script lang="ts">
  import { estado, restablecerElectrodos } from '../estado/estado.svelte';
  import { revisarPar } from '../anatomia/masetero';
  import type { VistaCraneo as Vista } from '../anatomia/vistas';
  import VistaCraneo from './VistaCraneo.svelte';

  const VISTAS: { id: Vista; nombre: string; nota: string; titulo: string }[] = [
    { id: 'frontal', nombre: 'Frontal', nota: 'Revisión de simetría', titulo: 'Vista frontal · solo revisión' },
    { id: 'izq', nombre: 'Lateral izquierda', nota: 'Sin electrodos', titulo: 'Lateral izquierda · masetero izquierdo' },
    { id: 'der', nombre: 'Lateral derecha', nota: 'Electrodos A y B', titulo: 'Lateral derecha · arrastra A, B o la línea' },
  ];

  let activa = $derived(VISTAS.find((v) => v.id === estado.visualizacion.vistaCraneo) ?? VISTAS[2]);
  let revision = $derived(revisarPar(estado.electrodos));
  let todoBien = $derived(revision.every((r) => r.ok));
</script>

<div class="craneo">
  <div class="cuerpo">
    <div class="principal">
      <VistaCraneo vista={activa.id} zona={estado.visualizacion.zonaRecomendada} />
      <p class="titulo-vista">{activa.titulo}</p>
      {#if activa.id === 'frontal'}
        <p class="aviso">Estás frente al paciente: su lado derecho aparece a tu izquierda.</p>
      {/if}
    </div>

    <div class="miniaturas" role="group" aria-label="Elegir vista del cráneo">
      {#each VISTAS as v (v.id)}
        <button
          type="button"
          aria-pressed={v.id === activa.id}
          onclick={() => (estado.visualizacion.vistaCraneo = v.id)}
        >
          <VistaCraneo vista={v.id} mini zona={false} />
          <span class="nombre">{v.nombre}</span>
          <span class="nota">{v.nota}</span>
        </button>
      {/each}
    </div>
  </div>

  <div class="pie">
    <p class="estado" role="status">
      <span class="punto" class:bien={todoBien}></span>
      {#if todoBien}
        Par A–B bien colocado sobre el masetero derecho
      {:else}
        Revisa la colocación: {revision.filter((r) => !r.ok).length} punto(s) por corregir
      {/if}
    </p>
    <div class="acciones">
      <button
        type="button"
        class="interruptor"
        aria-pressed={estado.visualizacion.zonaRecomendada}
        onclick={() => (estado.visualizacion.zonaRecomendada = !estado.visualizacion.zonaRecomendada)}
      >
        <span class="pista" aria-hidden="true"><span class="perilla"></span></span>
        Zona recomendada
      </button>
      <button type="button" class="secundario" onclick={restablecerElectrodos}>Restablecer</button>
    </div>
  </div>

  <ul class="revision" aria-label="Revisión de la colocación">
    {#each revision as r (r.id)}
      <li class:ok={r.ok}>
        <svg width="20" height="20" viewBox="0 0 20 20" aria-hidden="true">
          <circle cx="10" cy="10" r="9" />
          {#if r.ok}
            <path d="M6 10.5 L9 13 L14 7.5" />
          {:else}
            <path d="M10 5.5 V11 M10 14.2 V14.3" />
          {/if}
        </svg>
        <span>
          <strong>{r.titulo}</strong>
          <small>{r.detalle}</small>
        </span>
        <span class="sr">{r.ok ? 'correcto' : 'por corregir'}</span>
      </li>
    {/each}
  </ul>
</div>

<style>
  .craneo {
    display: flex;
    flex-direction: column;
    gap: 14px;
  }
  .cuerpo {
    display: grid;
    grid-template-columns: minmax(0, 1fr) 170px;
    gap: 14px;
  }
  .principal {
    position: relative;
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 12px;
    overflow: hidden;
  }
  .titulo-vista,
  .aviso {
    position: absolute;
    margin: 0;
    padding: 6px 10px;
    border-radius: 8px;
    background: rgba(15, 25, 34, 0.85);
    border: 1px solid rgba(255, 255, 255, 0.14);
    font-size: 13px;
    pointer-events: none;
  }
  .titulo-vista {
    left: 12px;
    top: 12px;
  }
  .aviso {
    right: 12px;
    bottom: 12px;
    max-width: 260px;
    color: var(--escena-texto-2);
  }
  .miniaturas {
    display: flex;
    flex-direction: column;
    gap: 10px;
  }
  .miniaturas button {
    display: flex;
    flex-direction: column;
    gap: 4px;
    padding: 6px;
    border-radius: 12px;
    border: 2px solid rgba(255, 255, 255, 0.1);
    background: transparent;
    color: var(--escena-texto);
    text-align: left;
  }
  .miniaturas button[aria-pressed='true'] {
    border-color: #6fa8ec;
    background: rgba(111, 168, 236, 0.12);
  }
  .miniaturas :global(svg) {
    border-radius: 8px;
  }
  .nombre {
    padding: 0 4px;
    font-size: 13px;
    font-weight: 600;
  }
  .nota {
    padding: 0 4px 2px;
    font-size: 12px;
    color: var(--escena-texto-2);
  }
  .pie {
    display: flex;
    flex-wrap: wrap;
    justify-content: space-between;
    align-items: center;
    gap: 10px;
  }
  .estado {
    margin: 0;
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 9px 14px;
    border-radius: 10px;
    border: 1px solid rgba(255, 255, 255, 0.14);
    background: rgba(255, 255, 255, 0.04);
    font-size: 13.5px;
  }
  .punto {
    width: 9px;
    height: 9px;
    border-radius: 50%;
    background: #e3a15a;
  }
  .punto.bien {
    background: #5cc98a;
  }
  .acciones {
    display: flex;
    gap: 8px;
  }
  .interruptor,
  .secundario {
    min-height: 44px;
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 6px 12px;
    border-radius: 10px;
    border: 1px solid rgba(255, 255, 255, 0.14);
    background: transparent;
    color: var(--escena-texto);
    font-size: 13.5px;
  }
  .pista {
    position: relative;
    width: 36px;
    height: 20px;
    border-radius: 10px;
    background: #4a5a68;
  }
  .perilla {
    position: absolute;
    top: 2px;
    left: 2px;
    width: 16px;
    height: 16px;
    border-radius: 50%;
    background: #fff;
    transition: left 0.15s;
  }
  .interruptor[aria-pressed='true'] .pista {
    background: var(--acento);
  }
  .interruptor[aria-pressed='true'] .perilla {
    left: 18px;
  }
  .revision {
    margin: 0;
    padding: 0;
    list-style: none;
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
    gap: 8px 16px;
    font-size: 13.5px;
  }
  .revision li {
    display: flex;
    gap: 10px;
    align-items: flex-start;
  }
  .revision svg {
    flex: none;
    margin-top: 1px;
  }
  .revision circle {
    fill: #4a3524;
  }
  .revision path {
    fill: none;
    stroke: #f0b27a;
    stroke-width: 2;
    stroke-linecap: round;
    stroke-linejoin: round;
  }
  .revision li.ok circle {
    fill: #1f3d2c;
  }
  .revision li.ok path {
    stroke: #7fd1a0;
  }
  .revision strong {
    display: block;
    font-weight: 600;
  }
  .revision small {
    font-size: 12.5px;
    color: var(--escena-texto-2);
  }
  .sr {
    position: absolute;
    width: 1px;
    height: 1px;
    overflow: hidden;
    clip-path: inset(50%);
  }
  @media (max-width: 720px) {
    .cuerpo {
      grid-template-columns: minmax(0, 1fr);
    }
    .miniaturas {
      flex-direction: row;
    }
    .miniaturas button {
      flex: 1 1 0;
      min-width: 0;
    }
    .nota {
      display: none;
    }
  }
</style>
