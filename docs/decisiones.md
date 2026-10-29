# Decisiones

## Lo que ya se decidió

| Decisión | Por qué |
| --- | --- |
| Que sea una **página web** y no una aplicación que se instala | Funciona igual en computadora, tablet y celular, y no depende de tiendas de aplicaciones |
| Que **no necesite servidor** | Es más barato de mantener y aguanta a muchos alumnos al mismo tiempo |
| Separar el **músculo virtual** de la **pantalla** | Se puede mejorar el modelo del músculo sin rehacer la pantalla, y la pantalla no se traba |
| Empezar con una **señal aproximada** | Permite construir y probar la pantalla desde ya, sin esperar al modelo fisiológico |
| Que sea **código abierto** | Otras escuelas pueden usarlo y mejorarlo, como plantea el protocolo |
| Usar un **atlas anatómico libre** (Z-Anatomy) para el cráneo 3D | No hay que modelar la anatomía desde cero y su licencia permite usarlo |
| Representar la colocación como un **par de electrodos A–B** (octubre 2026) | En clínica se registra en bipolar: importa dónde queda cada electrodo, la distancia entre ellos y su orientación respecto a las fibras |
| Agregar una vista **Cráneo 2D** (frontal, lateral izq. y der.) (octubre 2026) | Funciona en cualquier tablet sin WebGL y enseña la colocación desde los ángulos que usa el clínico |

## Lo que falta decidir juntos

- [ ] **Valores de cada escenario**: qué fuerza y qué nivel de fatiga representan mejor la función normal, la fatiga y el bruxismo.
- [ ] **Parecido con el equipo del departamento**: escalas, colores y orden de los canales que usa el equipo real.
- [ ] **Terminología**: que los nombres en pantalla sean los que se usan en la materia.
- [ ] **Medidas del par**: tamaño del masetero en mm, distancia recomendada entre electrodos (hoy 20 mm, de 15 a 25) y desviación aceptable respecto a las fibras (hoy 15°).
- [ ] **Electrodos del lado izquierdo**: si el alumno también debe colocarlos o si ese canal queda fijo.
- [ ] **Casos clínicos**: qué casos usar en el modo guiado y cómo se evalúan.
- [ ] **Licencia del código**: MIT (cualquiera puede reutilizarlo) o GPL (las mejoras deben seguir siendo abiertas).
- [ ] **Dónde publicarlo al final**: GitHub Pages (gratuito) o un servidor de la universidad.

*Cuando se tome una decisión, se mueve de la segunda lista a la primera con la fecha.*
