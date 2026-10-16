# Cómo funciona

El simulador tiene **dos partes que trabajan por separado**, como el equipo real y su pantalla.

```mermaid
flowchart LR
  A["El alumno mueve<br/>fuerza, fatiga, electrodo"] --> B["Músculo virtual<br/>produce la señal"]
  B --> C["Pantalla<br/>muestra la señal y los indicadores"]
  C --> A
```

1. **El músculo virtual** calcula la señal eléctrica que produciría el masetero según la fuerza, la fatiga y el lugar donde está el electrodo.
2. **La pantalla** solo muestra esa señal: el osciloscopio, el mapa del músculo y los indicadores.

## ¿Por qué separarlas?

- **El músculo virtual se puede mejorar sin rehacer la pantalla.** Hoy es una aproximación; después será un modelo fisiológico más fiel, y la pantalla seguirá igual.
- **La pantalla no se traba**, aunque el cálculo sea pesado o la tablet sea modesta.
- **Cada parte se puede revisar por su lado:** el equipo clínico valida la señal y los alumnos prueban la pantalla.

## ¿Qué es real y qué es provisional?

| | Hoy | Más adelante |
| --- | --- | --- |
| La señal | Una aproximación: crece con la fuerza y su frecuencia baja con la fatiga, como en un músculo real | Un modelo de las neuronas y fibras del masetero |
| El efecto de mover el electrodo | Capta más sobre el centro del músculo y menos en los bordes o sobre la zona de inervación | Un cálculo más detallado de cómo viaja la señal por los tejidos |
| Los escenarios clínicos | Valores estimados | Valores revisados por el equipo clínico |
| El parecido con el equipo | Escalas y barrido parecidos a un osciloscopio | Ajustado al equipo de captura del departamento |

## ¿Dónde funciona?

En cualquier navegador moderno: computadora, tablet o celular. No necesita servidor ni cuentas de usuario; se publica como una página web y todo ocurre en el dispositivo del alumno.
