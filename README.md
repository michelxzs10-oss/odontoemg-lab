# OdontoEMG Lab

Laboratorio virtual de **electromiografía de superficie (sEMG) del músculo masetero** para la enseñanza de Rehabilitación Oral II. Proyecto PAPIME 2027 (UNAM · IPN).

> **Estado: v0.1, solo interfaz.** La señal viene de un **motor simulado** (ruido filtrado con amplitud y espectro aproximados), no de un modelo fisiológico. El motor real se conectará después sin cambiar la interfaz.

![Diseño propuesto de la pantalla principal](docs/img/mockup-vista3d.jpg)

## Qué funciona hoy

| Función | Estado |
| --- | --- |
| Osciloscopio de 2 canales (masetero der./izq.) con barrido, escalas, congelar y exportar captura | ✅ |
| Mapa HD 8 × 8 con electrodo arrastrable (dedo, ratón o flechas del teclado) | ✅ |
| Controles de fuerza de mordida, fatiga y contraer/relajar | ✅ |
| Indicadores: RMS por lado, frecuencia mediana, simetría y su tendencia | ✅ |
| Escenarios clínicos (normal, fatiga, bruxismo) | ✅ valores provisionales |
| Vista 3D del cráneo y los músculos | ⏳ T3–T4 |
| Modos caso guiado y práctica entre pares | ⏳ T4 |
| Motor fisiológico (motoneuronas LIF) | ⏳ fuera del alcance de este repositorio por ahora |

## Probarlo

**Sin instalar nada:** abre la versión publicada en GitHub Pages: `https://<usuario>.github.io/odontoemg-lab/` *(se activa al configurar Pages; ver [CONTRIBUTING.md](CONTRIBUTING.md))*.

**En tu computadora** (requiere [Node.js](https://nodejs.org) 20.19 o más reciente):

```bash
npm install
npm run dev      # abre http://localhost:5173
```

| Comando | Para qué |
| --- | --- |
| `npm run dev` | Servidor de desarrollo con recarga automática |
| `npm run check` | Revisa tipos y errores de Svelte |
| `npm run build` | Genera la versión publicable en `dist/` |

## Cómo está organizado

```text
src/
├── App.svelte                 pantalla principal y conexión con el motor
├── app.css                    tokens de diseño (colores, tipografía, radios)
└── lib/
    ├── componentes/           Osciloscopio, MapaHD, Vista3D, Controles, Indicadores
    ├── estado/                estado único de la interfaz (Svelte 5, runas)
    ├── render/                dibujo en Canvas: osciloscopio y mapa HD
    ├── worker/                contrato con el motor, puente y buffer circular
    └── motor-simulado/        generador de señal provisional (Web Worker)
docs/
├── arquitectura.md            cómo encajan las piezas (1 diagrama)
├── interfaz.md                componentes, estado y diseño
└── decisiones.md              registro de decisiones técnicas
```

## Documentación

- [Arquitectura](docs/arquitectura.md): las dos capas, los dos canales de datos y el contrato con el motor.
- [Interfaz](docs/interfaz.md): componentes, estado, diseño, accesibilidad y plan de la vista 3D.
- [Decisiones](docs/decisiones.md): qué se decidió, por qué y qué falta decidir.
- [Cómo colaborar](CONTRIBUTING.md): con o sin programar.

## Hoja de ruta de la interfaz

| Trimestre | Entregable |
| --- | --- |
| T2 | ✅ Esta base: osciloscopio, mapa HD, controles e indicadores con motor simulado |
| T3 | Modelo 3D preparado en Blender; vista 3D conectada al estado del electrodo |
| T4 | Modos caso guiado y entre pares; PWA instalable; pruebas con alumnos |
| T5 | Ajustes tras la validación contra el equipo real; versión beta |

## Créditos y licencia

- Código: licencia MIT (ver [LICENSE](LICENSE)). *Pendiente de confirmar con el equipo del proyecto.*
- Modelo anatómico previsto: [Z-Anatomy](https://github.com/Z-Anatomy/The-blend) (CC BY-SA 4.0), basado en BodyParts3D © The Database Center for Life Science (CC BY-SA 2.1 Japón).
