# Registro de decisiones

Una fila por decisión técnica. Si una decisión cambia, se agrega una fila nueva; no se borra la anterior.

| # | Fecha | Decisión | Por qué | Alternativas descartadas |
| --- | --- | --- | --- | --- |
| 1 | 2026-10-15 | Aplicación web estática, sin servidor | Funciona en laptop, tablet y celular sin instalar; hosting barato; aguanta muchos alumnos a la vez | App nativa; servidor que calcule la señal |
| 2 | 2026-10-15 | Motor en un Web Worker, separado de la interfaz | La interfaz no se traba aunque el cálculo sea pesado | Calcular en el hilo principal |
| 3 | 2026-10-15 | Señal por un canal rápido (buffer + Canvas), fuera de Svelte | 2 000 muestras/s por canal trabarían el framework | Pasar las muestras por el estado reactivo |
| 4 | 2026-10-15 | Svelte 5 + TypeScript + Vite | Ligero, buen rendimiento en tablets, estado integrado | React (más pesado), Preact (alternativa válida) |
| 5 | 2026-10-15 | Canvas 2D para osciloscopio y mapa | Suficiente para 2 canales y 64 celdas; simple | WebGL desde el inicio |
| 6 | 2026-10-15 | `postMessage` con transferencia en lugar de `SharedArrayBuffer` | GitHub Pages no permite las cabeceras COOP/COEP | `SharedArrayBuffer` (se puede retomar con otro hosting) |
| 7 | 2026-10-15 | Motor simulado mientras se desarrolla el fisiológico | Permite construir y probar la interfaz desde ya | Esperar al motor real |

## Pendientes de decidir

- [ ] Licencia del código: MIT (máxima reutilización) o GPL (las mejoras deben seguir abiertas).
- [ ] Valores de fuerza y fatiga de cada escenario clínico (validar con el equipo clínico).
- [ ] Escalas y colores del equipo de captura del departamento, para imitarlo.
- [ ] Threlte o Three.js directo para la vista 3D.
- [ ] Hosting final: GitHub Pages o el servidor institucional.
