<script lang="ts">
  import { onMount } from 'svelte';
  import { estado, ESCENARIOS, aplicarEscenario, type Escenario, type Modo } from './lib/estado/estado.svelte';
  import { crearMotor, type Puente } from './lib/worker/puente';
  import Osciloscopio from './lib/componentes/Osciloscopio.svelte';
  import MapaHD from './lib/componentes/MapaHD.svelte';
  import Vista3D from './lib/componentes/Vista3D.svelte';
  import Controles from './lib/componentes/Controles.svelte';
  import Indicadores from './lib/componentes/Indicadores.svelte';

  let puente = $state<Puente | null>(null);

  const modos: { id: Modo; nombre: string }[] = [
    { id: 'libre', nombre: 'Exploración libre' },
    { id: 'caso', nombre: 'Caso guiado' },
    { id: 'pares', nombre: 'Práctica entre pares' },
  ];

  onMount(() => {
    const p = crearMotor();
    p.alRecibirIndices((i) => (estado.indices = i));
    puente = p;

    // Sin pestaña visible no se calcula ni se dibuja: ahorra batería en tablets.
    const alCambiarVisibilidad = () => {
      if (document.hidden) p.pausar();
      else if (!estado.visualizacion.congelado) p.reanudar();
    };
    document.addEventListener('visibilitychange', alCambiarVisibilidad);
    return () => {
      document.removeEventListener('visibilitychange', alCambiarVisibilidad);
      p.cerrar();
    };
  });

  // Canal lento: cada cambio de parámetros se envía al motor.
  $effect(() => {
    const c = estado.contraccion;
    const e = estado.electrodo;
    puente?.enviarParametros({
      fuerza: c.fuerza,
      fatiga: c.fatiga,
      contrayendo: c.contrayendo,
      electrodo: { u: e.u, v: e.v },
    });
  });
</script>

<header class="encabezado">
  <div class="marca">
    <svg width="34" height="34" viewBox="0 0 34 34" aria-hidden="true">
      <rect width="34" height="34" rx="9" fill="#14212B" />
      <path
        d="M5 18 H10 L12.5 11 L15.5 24 L18.5 8 L21.5 22 L23.5 15 L25 18 H29"
        fill="none"
        stroke="#F08A3E"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
    </svg>
    <div>
      <h1>OdontoEMG Lab</h1>
      <p>Rehabilitación Oral II · Hipomovilidad mandibular muscular</p>
    </div>
  </div>

  <nav aria-label="Modo de trabajo" class="modos">
    {#each modos as m (m.id)}
      <button
        type="button"
        aria-pressed={estado.sesion.modo === m.id}
        onclick={() => (estado.sesion.modo = m.id)}>{m.nombre}</button
      >
    {/each}
  </nav>

  <div class="escenario">
    <label for="escenario">Escenario</label>
    <select
      id="escenario"
      value={estado.sesion.escenario}
      onchange={(e) => aplicarEscenario(e.currentTarget.value as Escenario)}
    >
      {#each Object.entries(ESCENARIOS) as [id, esc] (id)}
        <option value={id}>{esc.nombre}</option>
      {/each}
    </select>
  </div>
</header>

{#if estado.sesion.modo !== 'libre'}
  <p class="aviso" role="status">
    Este modo todavía no está construido (se planea para T4). Por ahora funciona igual que la exploración libre.
  </p>
{/if}

<main class="contenido">
  <div class="columna-principal">
    <section class="escena" aria-labelledby="titulo-escena">
      <div class="escena-barra">
        <div>
          <h2 id="titulo-escena">Colocación del electrodo</h2>
          <p>Toca o arrastra sobre el masetero para mover el electrodo</p>
        </div>
        <div role="group" aria-label="Vista" class="pestanas">
          <button
            type="button"
            aria-pressed={estado.visualizacion.vista === 'mapa'}
            onclick={() => (estado.visualizacion.vista = 'mapa')}>Mapa HD</button
          >
          <button
            type="button"
            aria-pressed={estado.visualizacion.vista === '3d'}
            onclick={() => (estado.visualizacion.vista = '3d')}>Vista 3D</button
          >
        </div>
      </div>
      {#if puente && estado.visualizacion.vista === 'mapa'}
        <MapaHD {puente} />
      {:else if estado.visualizacion.vista === '3d'}
        <Vista3D />
      {/if}
    </section>

    {#if puente}
      <Osciloscopio {puente} />
    {/if}
  </div>

  <aside class="columna-lateral">
    <Controles />
    <Indicadores />
  </aside>
</main>

<footer class="pie">
  Versión 0.1 · solo interfaz. La señal proviene de un motor simulado, no de un modelo fisiológico.
</footer>

<style>
  .encabezado {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 16px 28px;
    padding: 14px 28px;
    background: var(--superficie);
    border-bottom: 1px solid var(--borde);
  }
  .marca {
    display: flex;
    align-items: center;
    gap: 12px;
  }
  h1 {
    margin: 0;
    font-size: 17px;
    font-weight: 600;
  }
  .marca p {
    margin: 0;
    font-size: 12.5px;
    color: var(--texto-2);
  }
  .modos {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
    padding: 4px;
    background: var(--fondo);
    border-radius: 12px;
  }
  .modos button {
    min-height: 40px;
    padding: 8px 14px;
    border: 0;
    border-radius: 9px;
    background: transparent;
    color: #33414d;
  }
  .modos button[aria-pressed='true'] {
    background: var(--superficie);
    color: var(--acento-texto);
    font-weight: 600;
    box-shadow: 0 1px 2px rgba(20, 33, 43, 0.12);
  }
  .escenario {
    margin-left: auto;
    display: flex;
    align-items: center;
    gap: 10px;
  }
  .escenario label {
    font-size: 13px;
    color: var(--texto-2);
  }
  .escenario select {
    min-height: 44px;
    padding: 8px 12px;
    border: 1px solid var(--borde-fuerte);
    border-radius: var(--radio);
    background: var(--superficie);
    color: var(--texto);
  }
  .aviso {
    max-width: 1400px;
    margin: 16px auto 0;
    padding: 10px 16px;
    border-radius: var(--radio);
    background: var(--acento-suave);
    color: var(--acento-texto);
  }
  .contenido {
    max-width: 1400px;
    margin: 0 auto;
    padding: 24px;
    display: flex;
    flex-wrap: wrap;
    gap: 24px;
  }
  .columna-principal {
    flex: 999 1 640px;
    min-width: 0;
    display: flex;
    flex-direction: column;
    gap: 20px;
  }
  .columna-lateral {
    flex: 1 1 320px;
    min-width: 0;
    display: flex;
    flex-direction: column;
    gap: 20px;
  }
  .escena {
    background: var(--escena);
    color: var(--escena-texto);
    border-radius: var(--radio-tarjeta);
    padding: 18px 20px;
    display: flex;
    flex-direction: column;
    gap: 14px;
    min-height: 460px;
  }
  .escena-barra {
    display: flex;
    flex-wrap: wrap;
    justify-content: space-between;
    gap: 12px;
  }
  .escena-barra p {
    margin: 2px 0 0;
    font-size: 13px;
    color: var(--escena-texto-2);
  }
  .pestanas {
    display: flex;
    gap: 4px;
    padding: 4px;
    align-self: flex-start;
    background: rgba(255, 255, 255, 0.06);
    border: 1px solid rgba(255, 255, 255, 0.14);
    border-radius: 12px;
  }
  .pestanas button {
    min-height: 40px;
    padding: 8px 14px;
    border: 0;
    border-radius: 9px;
    background: transparent;
    color: var(--escena-texto);
  }
  .pestanas button[aria-pressed='true'] {
    background: var(--acento-suave);
    color: var(--acento-texto);
    font-weight: 600;
  }
  .pie {
    max-width: 1400px;
    margin: 0 auto;
    padding: 0 24px 24px;
    font-size: 12.5px;
    color: var(--texto-2);
  }
</style>
