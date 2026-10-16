#!/usr/bin/env bash
# Crea las etiquetas y los issues iniciales del proyecto.
# Requiere GitHub CLI (https://cli.github.com) con sesión iniciada: gh auth login
# Uso: desde la carpeta del repositorio, bash scripts/crear-issues.sh
set -euo pipefail

etiqueta() { gh label create "$1" --color "$2" --description "$3" --force >/dev/null; }

etiqueta "revisión clínica" "0F6E56" "Revisión por el equipo clínico o docente"
etiqueta "error"            "D73A4A" "Algo no funciona"
etiqueta "propuesta"        "1F5FAE" "Función nueva o cambio de diseño"
etiqueta "interfaz"         "7F77DD" "Componentes y diseño de la pantalla"
etiqueta "vista 3D"         "D85A30" "Modelo anatómico y escena Three.js"
etiqueta "decisión"         "BA7517" "Hay que decidir algo antes de avanzar"
etiqueta "T3"               "C5DEF5" "Trimestre 3"
etiqueta "T4"               "C5DEF5" "Trimestre 4"

issue() { gh issue create --title "$1" --label "$2" --body "$3" >/dev/null && echo "✓ $1"; }

issue "Definir fuerza y fatiga de cada escenario clínico" "revisión clínica,decisión" \
"Los valores de \`src/lib/estado/estado.svelte.ts\` (ESCENARIOS) son provisionales. Hace falta que el equipo clínico indique qué fuerza y qué nivel de fatiga representan mejor la función normal, la fatiga muscular y el bruxismo."

issue "Comparar escalas y colores con el equipo de captura del departamento" "revisión clínica,interfaz" \
"Tomar fotos o capturas del equipo real (escalas µV/div y ms/div, colores de canal, orden der./izq.) para que el osciloscopio se parezca lo más posible."

issue "Probar rendimiento en las tablets de los alumnos" "interfaz,T3" \
"Abrir la versión publicada en las tablets más modestas que se usarán y verificar que el osciloscopio se ve fluido. Anotar modelo, navegador y si se traba."

issue "Preparar el modelo 3D del cráneo y los músculos en Blender" "vista 3D,T3" \
"A partir de Z-Anatomy (CC BY-SA 4.0): cráneo, mandíbula con pivote en la ATM, masetero, temporal y pterigoideos como objetos con nombre; reducir polígonos; mapa UV del masetero alineado con la rejilla 8×8; exportar a public/modelos/craneo-musculos.glb con Draco. Ver docs/para-desarrolladores.md."

issue "Implementar la vista 3D con Three.js" "vista 3D,interfaz,T3" \
"Sustituir el componente pendiente Vista3D.svelte: cargar el .glb, colocar el electrodo con Raycaster usando la coordenada UV, colorear el masetero con el RMS. Depende del modelo de Blender."

issue "Modo caso guiado (PBL/CBL)" "interfaz,propuesta,T4" \
"Panel con el enunciado del caso, preguntas y escenario fijo. Definir con el equipo docente el formato de los casos (JSON) y un primer caso de hipomovilidad mandibular muscular."

issue "Modo práctica entre pares" "interfaz,propuesta,T4" \
"Un alumno configura una condición oculta y otro la diagnostica a partir de la señal."

issue "Hacer la app instalable y que funcione sin internet (PWA)" "interfaz,T4" \
"Agregar manifest y service worker para instalarla en iPad y usarla en clínica sin conexión."

issue "Exportar captura con escalas, fecha y escenario" "interfaz,propuesta" \
"Hoy se exporta solo el trazo. Agregar escalas, fecha y escenario para adjuntarla al formato de exploración."

issue "Decidir la licencia del código (MIT o GPL)" "decisión" \
"Por ahora el repositorio usa MIT. GPL obligaría a que las mejoras sigan abiertas. Decidirlo antes de publicar la beta."

echo "Listo."
