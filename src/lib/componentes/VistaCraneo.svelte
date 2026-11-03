<!--
  Una vista del cráneo 2D (frontal, lateral izquierda o lateral derecha).

  No guarda posiciones propias: lee y escribe estado.electrodos (u, v del músculo)
  y los convierte al dibujo con anatomia/vistas.ts. Por eso las tres vistas,
  el mapa HD y el motor siempre ven el mismo par.

  - Lateral derecha: se arrastra A, B o la línea entre ellos (mueve el par).
  - Frontal: solo lectura, para revisar altura y simetría.
  - Lateral izquierda: sin electrodos (el motor solo mueve el lado derecho).
-->
<script lang="ts">
  import { estado } from '../estado/estado.svelte';
  import {
    centro,
    moverElectrodo,
    moverPar,
    VIENTRE,
    type IdElectrodo,
    type Punto,
  } from '../anatomia/masetero';
  import { aMusculo, aSvg, contorno, CUADROS, type Cuadro, type VistaCraneo, type Xy } from '../anatomia/vistas';

  let {
    vista,
    mini = false,
    zona = true,
  }: { vista: VistaCraneo; mini?: boolean; zona?: boolean } = $props();

  const POLOS = ['a', 'b'] as const;
  const NOMBRES: Record<VistaCraneo, string> = {
    der: 'lateral derecha',
    izq: 'lateral izquierda',
    frontal: 'frontal',
  };

  let svg: SVGSVGElement;
  let cuadros = $derived(CUADROS[vista]);
  /** Solo la lateral derecha permite mover electrodos. */
  let editable = $derived(!mini && vista === 'der');

  /** Posición en el dibujo de A, B y su punto medio (en la vista que los muestre). */
  let puntos = $derived.by(() => {
    const c = cuadros.der;
    if (!c) return null;
    return {
      a: aSvg(c, estado.electrodos.a),
      b: aSvg(c, estado.electrodos.b),
      medio: aSvg(c, centro(estado.electrodos)),
    };
  });

  /** Contorno de la zona recomendada (elipse del vientre llevada al dibujo). */
  function zonaSvg(c: Cuadro): string {
    const pts: string[] = [];
    for (let k = 0; k < 36; k++) {
      const t = (k / 36) * 2 * Math.PI;
      const p = aSvg(c, { u: VIENTRE.u + VIENTRE.radioU * Math.cos(t), v: VIENTRE.v + VIENTRE.radioV * Math.sin(t) });
      pts.push(`${p.x.toFixed(1)},${p.y.toFixed(1)}`);
    }
    return pts.join(' ');
  }

  // ---- Arrastre (mouse, dedo o lápiz) ----
  let arrastre: { tipo: IdElectrodo | 'par'; desfase: Punto } | null = null;

  function puntoSvg(e: PointerEvent): Xy {
    const m = svg.getScreenCTM();
    if (!m) return { x: 0, y: 0 };
    const p = new DOMPoint(e.clientX, e.clientY).matrixTransform(m.inverse());
    return { x: p.x, y: p.y };
  }

  function iniciar(e: PointerEvent, tipo: IdElectrodo | 'par') {
    const c = cuadros.der;
    if (!editable || !c) return;
    e.preventDefault();
    e.stopPropagation();
    svg.setPointerCapture(e.pointerId);
    const q = aMusculo(c, puntoSvg(e));
    const m = centro(estado.electrodos);
    arrastre = { tipo, desfase: tipo === 'par' ? { u: m.u - q.u, v: m.v - q.v } : { u: 0, v: 0 } };
  }

  /** Tocar el músculo (fuera de A y B) lleva el par completo a ese punto. */
  function tocarMusculo(e: PointerEvent) {
    const c = cuadros.der;
    if (!editable || !c) return;
    svg.setPointerCapture(e.pointerId);
    moverPar(estado.electrodos, aMusculo(c, puntoSvg(e)));
    arrastre = { tipo: 'par', desfase: { u: 0, v: 0 } };
  }

  function mover(e: PointerEvent) {
    const c = cuadros.der;
    if (!arrastre || !c) return;
    const q = aMusculo(c, puntoSvg(e));
    if (arrastre.tipo === 'par') {
      moverPar(estado.electrodos, { u: q.u + arrastre.desfase.u, v: q.v + arrastre.desfase.v });
    } else {
      moverElectrodo(estado.electrodos, arrastre.tipo, q);
    }
  }

  function soltar() {
    arrastre = null;
  }

  // ---- Teclado: flechas mueven el elemento enfocado (Mayús = paso fino) ----
  function teclear(e: KeyboardEvent, tipo: IdElectrodo | 'par') {
    const d: Record<string, [number, number]> = {
      ArrowLeft: [-1, 0],
      ArrowRight: [1, 0],
      ArrowUp: [0, -1],
      ArrowDown: [0, 1],
    };
    const mov = d[e.key];
    if (!mov) return;
    e.preventDefault();
    const paso = e.shiftKey ? 0.01 : 0.04;
    // En la lateral derecha el borde anterior (u = 1) queda a la derecha del dibujo.
    const du = mov[0] * paso;
    const dv = mov[1] * paso;
    if (tipo === 'par') {
      const m = centro(estado.electrodos);
      moverPar(estado.electrodos, { u: m.u + du, v: m.v + dv });
    } else {
      const p = estado.electrodos[tipo];
      moverElectrodo(estado.electrodos, tipo, { u: p.u + du, v: p.v + dv });
    }
  }

  const fmt = (x: number) => x.toFixed(2);
</script>

{#snippet craneoLateral()}
  <path
    d="M 150 300 C 105 262 98 165 168 112 C 238 60 372 52 442 104 C 492 140 508 198 497 248 L 503 262 C 514 280 507 298 492 304 L 330 300 L 232 330 C 200 332 170 322 150 300 Z"
    class="hueso"
  />
  <path d="M 205 145 C 265 102 360 98 425 132" class="linea-temporal" />
  <ellipse cx="447" cy="205" rx="25" ry="29" class="hueco" />
  <path d="M 488 230 L 501 262 L 486 268 Z" class="hueco" />
  <circle cx="262" cy="292" r="9" class="hueco" />
  <path
    d="M 282 292 C 296 286 310 290 312 300 L 318 330 L 336 350 L 470 345 L 492 342 C 502 360 506 395 498 418 C 490 432 470 436 450 435 L 345 436 C 318 436 302 425 298 400 Z"
    class="hueso"
  />
  <g class="dientes">
    {#each [392, 407, 422, 437, 452, 467] as x (x)}
      <rect {x} y="303" width="13" height="16" rx="2" />
      <rect {x} y="330" width="13" height="15" rx="2" />
    {/each}
  </g>
  <path d="M 280 270 L 432 256 L 440 276 L 288 288 Z" class="hueso-2" />
{/snippet}

{#snippet musculo(c: Cuadro)}
  <polygon points={contorno(c)} class="masetero" />
  <g class="fibras">
    {#each [0.12, 0.31, 0.5, 0.69, 0.88] as u (u)}
      {@const p = aSvg(c, { u, v: 0.02 })}
      {@const q = aSvg(c, { u, v: 0.98 })}
      <line x1={p.x} y1={p.y} x2={q.x} y2={q.y} />
    {/each}
  </g>
  {#if zona}
    <polygon points={zonaSvg(c)} class="zona" />
  {/if}
{/snippet}

<!-- svelte-ignore a11y_no_static_element_interactions a11y_no_noninteractive_element_interactions -->
<svg
  bind:this={svg}
  viewBox="0 0 600 460"
  class:mini
  class:editable
  role="group"
  aria-hidden={mini ? 'true' : undefined}
  aria-label="Cráneo, vista {NOMBRES[vista]}"
  onpointermove={mover}
  onpointerup={soltar}
  onpointercancel={soltar}
>
  {#if vista === 'der'}
    {@render craneoLateral()}
  {:else if vista === 'izq'}
    <g transform="translate(600 0) scale(-1 1)">{@render craneoLateral()}</g>
  {:else}
    <path
      d="M 300 55 C 395 55 452 120 452 205 C 452 245 446 268 432 285 L 420 304 L 180 304 L 168 285 C 154 268 148 245 148 205 C 148 120 205 55 300 55 Z"
      class="hueso"
    />
    <path d="M 172 236 L 140 250 L 144 282 L 178 284 Z" class="hueso-2" />
    <path d="M 428 236 L 460 250 L 456 282 L 422 284 Z" class="hueso-2" />
    <ellipse cx="252" cy="198" rx="36" ry="31" class="hueco" />
    <ellipse cx="348" cy="198" rx="36" ry="31" class="hueco" />
    <path d="M 300 228 L 320 272 L 300 284 L 280 272 Z" class="hueco" />
    <path
      d="M 168 296 L 190 306 L 410 306 L 432 296 L 444 362 C 444 404 398 442 300 446 C 202 442 156 404 156 362 Z"
      class="hueso"
    />
    <g class="dientes">
      {#each [245, 259, 273, 287, 301, 315, 329, 343] as x (x)}
        <rect {x} y="290" width="12" height="15" rx="2" />
      {/each}
      {#each [252, 266, 280, 294, 308, 322, 336] as x (x)}
        <rect {x} y="308" width="12" height="14" rx="2" />
      {/each}
    </g>
  {/if}

  {#if cuadros.der}
    <!-- svelte-ignore a11y_no_static_element_interactions -->
    <g onpointerdown={tocarMusculo}>{@render musculo(cuadros.der)}</g>
  {/if}
  {#if cuadros.izq}
    {@render musculo(cuadros.izq)}
  {/if}

  {#if puntos}
    {#if vista === 'frontal' && !mini}
      <!-- Líneas de nivel: comparar la altura con el lado izquierdo. -->
      <line x1={puntos.a.x + 12} y1={puntos.a.y} x2="452" y2={puntos.a.y} class="nivel" />
      <line x1={puntos.b.x + 12} y1={puntos.b.y} x2="452" y2={puntos.b.y} class="nivel" />
    {/if}
    {#if vista === 'der'}
      <path d="M {puntos.a.x} {puntos.a.y} C {puntos.a.x + 60} {puntos.a.y - 70} 500 160 600 112" class="cable" />
      <path d="M {puntos.b.x} {puntos.b.y} C {puntos.b.x + 70} {puntos.b.y - 80} 510 182 600 134" class="cable" />
    {/if}

    <!-- Línea A–B: arrastrarla mueve el par completo. -->
    <line x1={puntos.a.x} y1={puntos.a.y} x2={puntos.b.x} y2={puntos.b.y} class="union" />
    {#if editable}
      <!-- svelte-ignore a11y_no_static_element_interactions -->
      <line
        x1={puntos.a.x}
        y1={puntos.a.y}
        x2={puntos.b.x}
        y2={puntos.b.y}
        class="union-toque"
        onpointerdown={(e) => iniciar(e, 'par')}
      />
      <g
        class="asa"
        role="button"
        tabindex="0"
        aria-label="Par completo, centro en u {fmt(centro(estado.electrodos).u)}, v {fmt(centro(estado.electrodos).v)}. Flechas para mover el par."
        onpointerdown={(e) => iniciar(e, 'par')}
        onkeydown={(e) => teclear(e, 'par')}
      >
        <rect x={puntos.medio.x - 7} y={puntos.medio.y - 7} width="14" height="14" rx="3" transform="rotate(45 {puntos.medio.x} {puntos.medio.y})" />
      </g>
    {/if}

    {#each POLOS as id (id)}
      {@const p = puntos[id]}
      {#if editable}
        <g
          class="electrodo"
          role="button"
          tabindex="0"
          aria-label="Electrodo {id.toUpperCase()} en u {fmt(estado.electrodos[id].u)}, v {fmt(estado.electrodos[id].v)}. Flechas para moverlo; con Mayús, paso fino."
          onpointerdown={(e) => iniciar(e, id)}
          onkeydown={(e) => teclear(e, id)}
        >
          <circle cx={p.x} cy={p.y} r="26" class="toque" />
          <circle cx={p.x} cy={p.y} r="13" class="anillo" />
          <circle cx={p.x} cy={p.y} r="4.5" class="centro" />
        </g>
      {:else}
        <g class="electrodo solo-lectura" aria-hidden="true">
          <circle cx={p.x} cy={p.y} r={vista === 'frontal' ? 9 : 13} class="anillo" />
          <circle cx={p.x} cy={p.y} r="3.5" class="centro" />
        </g>
      {/if}
      {#if !mini}
        <text x={p.x - (vista === 'frontal' ? 16 : 24)} y={p.y + 5} class="letra" text-anchor="end">{id.toUpperCase()}</text>
      {/if}
    {/each}
  {/if}

  {#if !mini}
    <g class="etiquetas">
      {#if vista === 'der'}
        <text x="560" y="446" text-anchor="end">ANTERIOR →</text>
        <text x="40" y="446">← POSTERIOR</text>
      {:else if vista === 'izq'}
        <text x="300" y="40" text-anchor="middle">Sin electrodos en este lado: el registro de este canal es fijo</text>
        <text x="40" y="446">← ANTERIOR</text>
        <text x="560" y="446" text-anchor="end">POSTERIOR →</text>
      {:else}
        <text x="120" y="60">DER. del paciente</text>
        <text x="480" y="60" text-anchor="end">IZQ. del paciente</text>
      {/if}
    </g>
  {/if}
</svg>

<style>
  svg {
    display: block;
    width: 100%;
    height: auto;
    aspect-ratio: 600 / 460;
    background: var(--escena);
    touch-action: none;
    user-select: none;
  }
  svg.mini {
    pointer-events: none;
  }
  .hueso {
    fill: #e8e1d3;
    stroke: #b9ad96;
    stroke-width: 2;
  }
  .hueso-2 {
    fill: #d9d0bf;
    stroke: #b9ad96;
    stroke-width: 2;
  }
  .hueco {
    fill: var(--escena);
  }
  .linea-temporal {
    fill: none;
    stroke: #c9bea8;
    stroke-width: 2;
    stroke-dasharray: 4 6;
  }
  .dientes {
    fill: #f6f2ea;
    stroke: #b9ad96;
    stroke-width: 1;
  }
  .masetero {
    fill: var(--activacion);
    fill-opacity: 0.85;
    stroke: #ef8a72;
    stroke-width: 1.5;
  }
  .editable .masetero {
    cursor: crosshair;
  }
  .fibras line {
    stroke: #f6b3a3;
    stroke-opacity: 0.55;
    stroke-width: 1.5;
    pointer-events: none;
  }
  .zona {
    fill: #7fd1a0;
    fill-opacity: 0.1;
    stroke: #7fd1a0;
    stroke-width: 2;
    stroke-dasharray: 6 5;
    pointer-events: none;
  }
  .nivel {
    stroke: #6fa8ec;
    stroke-opacity: 0.45;
    stroke-width: 1.5;
    stroke-dasharray: 3 6;
  }
  .cable {
    fill: none;
    stroke: #8fa3b4;
    stroke-width: 1.5;
    pointer-events: none;
  }
  .union {
    stroke: #ffffff;
    stroke-width: 1.5;
    stroke-dasharray: 3 4;
    pointer-events: none;
  }
  .union-toque {
    stroke: transparent;
    stroke-width: 22;
    cursor: move;
  }
  .asa rect {
    fill: #ffffff;
    stroke: #6fa8ec;
    stroke-width: 3;
    cursor: move;
  }
  .electrodo {
    cursor: grab;
  }
  .electrodo .toque {
    fill: transparent;
  }
  .electrodo .anillo {
    fill: #ffffff;
    stroke: #6fa8ec;
    stroke-width: 4;
  }
  .solo-lectura .anillo {
    stroke: #9fb0be;
    stroke-width: 3;
  }
  .electrodo .centro {
    fill: var(--acento);
  }
  .electrodo:focus-visible,
  .asa:focus-visible {
    outline: none;
  }
  .electrodo:focus-visible .anillo,
  .asa:focus-visible rect {
    stroke: #ffffff;
    stroke-width: 5;
  }
  .letra {
    font-family: var(--mono);
    font-size: 16px;
    font-weight: 500;
    fill: #ffffff;
    pointer-events: none;
  }
  .etiquetas text {
    font-family: var(--mono);
    font-size: 13px;
    fill: var(--escena-texto-2);
    pointer-events: none;
  }
</style>
