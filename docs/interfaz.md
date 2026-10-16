# Interfaz

## Componentes

| Componente | Archivo | Qué hace | Lee del estado | Escribe en el estado |
| --- | --- | --- | --- | --- |
| Pantalla principal | `src/App.svelte` | Diseño general, modos, escenario, conexión con el motor | todo | `sesion` |
| Osciloscopio | `componentes/Osciloscopio.svelte` | Señal de ambos maseteros en barrido; escala, congelar, exportar PNG | `visualizacion` | `visualizacion` |
| Mapa HD | `componentes/MapaHD.svelte` | Rejilla 8 × 8 de activación y electrodo arrastrable | `electrodo` | `electrodo` |
| Vista 3D | `componentes/Vista3D.svelte` | *Pendiente.* Cráneo y músculos en Three.js | `electrodo`, `indices` | `electrodo` |
| Controles | `componentes/Controles.svelte` | Fuerza, fatiga, contraer/relajar | `contraccion` | `contraccion` |
| Indicadores | `componentes/Indicadores.svelte` | RMS, frecuencia mediana, simetría y su tendencia | `indices` | — |

Los componentes que dibujan señal (osciloscopio y mapa) usan un renderizador aparte en `src/lib/render/`, que dibuja directo en Canvas.

## Estado

Un solo objeto en [`src/lib/estado/estado.svelte.ts`](../src/lib/estado/estado.svelte.ts):

| Sección | Contenido |
| --- | --- |
| `sesion` | modo (libre, caso, pares) y escenario clínico |
| `contraccion` | fuerza, fatiga, contrayendo |
| `electrodo` | posición u, v (0 a 1) sobre el masetero |
| `visualizacion` | µV/div, congelado, vista (mapa o 3D) |
| `indices` | lo último que calculó el motor |

Cada sección la modifica un solo componente. La señal no está aquí: va por el canal rápido.

## Diseño

- **Colores** (tokens en [`src/app.css`](../src/app.css)): azul `--acento` solo para controles; coral `--activacion` solo para activación muscular. Ningún otro elemento usa esos dos colores.
- **Tipografía**: IBM Plex Sans para texto, IBM Plex Mono para cifras, para que no "bailen" al cambiar.
- **Escena anatómica** en fondo oscuro para que la anatomía resalte; el resto, claro.
- **Distribución**: dos columnas en laptop o tablet horizontal; en pantallas angostas los controles bajan debajo de la escena.
- **Como el equipo clínico**: escalas en µV/div y ms/div, barrido de izquierda a derecha, congelar y exportar captura.

## Accesibilidad (mínimos)

- Botones de al menos 44 px de alto.
- Todo se puede usar con teclado; el electrodo se mueve con las flechas.
- El mapa no depende solo del color: se muestra el porcentaje de señal captada.
- Unidades siempre visibles (µV, ms, Hz).

## Vista 3D (plan)

1. Preparar el modelo en Blender a partir de Z-Anatomy: cráneo, mandíbula (pivote en la ATM), masetero, temporal y pterigoideos, cada uno como objeto con nombre. Reducir polígonos y alinear el mapa UV del masetero con la rejilla 8 × 8.
2. Exportar a `public/modelos/craneo-musculos.glb` con compresión Draco.
3. En `Vista3D.svelte`: Three.js con `GLTFLoader`; `Raycaster` sobre `masetero_der` → la coordenada UV del toque se escribe en `estado.electrodo` (la misma que usa el mapa HD).
4. Colorear el masetero según `estado.indices.rms`; importar el componente con `import()` dinámico.
5. Si el dispositivo no soporta WebGL2, mostrar el mapa HD.

Referencias: [Three.js](https://threejs.org/docs/) · [Threlte](https://threlte.xyz/docs/learn/getting-started/introduction) · [glTF-Transform](https://gltf-transform.dev/) · [Exportar glTF desde Blender](https://docs.blender.org/manual/en/latest/addons/import_export/scene_gltf2.html)
