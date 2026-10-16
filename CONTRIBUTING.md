# Cómo colaborar

No hace falta programar. Lo más valioso es la mirada clínica y docente: decir qué no se parece a la realidad o qué no ayuda al alumno.

## Para revisar y opinar (sin programar)

Necesitas una cuenta gratuita de GitHub y que te agreguen como colaborador del proyecto.

**1. Probar el simulador.** Abre el enlace de la versión publicada que está en la [página principal](README.md).

**2. Dejar un comentario o una tarea.** En GitHub, entra a la pestaña **Issues** y presiona **New issue**. Elige una de las tres opciones:

| Opción | Úsala cuando... |
| --- | --- |
| **Revisión clínica o docente** | algo no se ve o no se comporta como en clínica o en el equipo real |
| **Error** | algo no funciona |
| **Propuesta** | quieres sugerir algo nuevo o un cambio en el diseño |

Cada opción trae unas preguntas cortas para llenar. Puedes pegar capturas de pantalla directamente en el texto.

**3. Aprobar cambios.** Cuando alguien termina una mejora, aparece en la pestaña **Pull requests**. Ahí se ve qué cambió y se puede comentar, aprobar (**Approve**) o pedir ajustes (**Request changes**). Ningún cambio se integra sin que otra persona lo revise.

**4. Seguir el avance.** En la pestaña **Issues** se ven todas las tareas: abiertas, en curso y terminadas.

## Para programar

Los pasos para instalarlo, cómo está organizado el código y las reglas de trabajo están en **[Para desarrolladores](docs/para-desarrolladores.md)**.

## Configuración inicial (la hace una sola vez quien crea el repositorio)

1. **Invitar colaboradores:** Settings → Collaborators → Add people.
2. **Proteger la versión principal:** Settings → Branches → Add branch ruleset. Exigir revisión antes de integrar cambios.
3. **Publicar la página:** Settings → Pages → Source: *GitHub Actions*. Cada cambio aprobado se publica solo.
4. **Crear las tareas iniciales:** `bash scripts/crear-issues.sh` (requiere [GitHub CLI](https://cli.github.com) con sesión iniciada).
