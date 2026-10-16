# Cómo colaborar

Hay dos formas de participar. No hace falta programar para la primera.

## 1. Sin programar: revisar y comentar

1. **Probar la versión publicada** en GitHub Pages (enlace en el [README](README.md)).
2. **Abrir un issue** desde la pestaña *Issues → New issue* y elegir la plantilla:
   - *Revisión clínica o docente*: algo que no se ve como en clínica o en el equipo real.
   - *Error*: algo que no funciona.
   - *Propuesta*: una función o un cambio de diseño.
3. **Revisar un pull request**: en la pestaña *Pull requests*, abrir el PR, ir a *Files changed* y comentar sobre cualquier línea, o usar *Review changes → Approve / Request changes*.

Las capturas de pantalla ayudan mucho: se pueden pegar directamente en el comentario.

## 2. Con código

```bash
git clone https://github.com/<usuario>/odontoemg-lab.git
cd odontoemg-lab
npm install
npm run dev
```

### Flujo de trabajo

1. Toma o crea un issue y asígnatelo.
2. Crea una rama desde `main`: `git switch -c tipo/descripcion-corta` (por ejemplo, `interfaz/vista-3d` o `arreglo/escala-osciloscopio`).
3. Haz commits pequeños con mensajes en español que digan *qué* cambia: `Agrega escala de 1000 µV/div al osciloscopio`.
4. Antes de subir, corre `npm run check` y `npm run build`: ambos deben terminar sin errores.
5. Sube la rama y abre un pull request hacia `main` que cierre el issue (`Cierra #12`).
6. Otra persona revisa y aprueba. Nadie integra su propio PR sin revisión.

### Reglas del código

- La interfaz no calcula fisiología: eso va en el motor ([arquitectura](docs/arquitectura.md)).
- La señal nunca pasa por el estado de Svelte.
- Nombres de archivos, variables y comentarios en español; código en TypeScript estricto.
- Colores y tamaños desde los tokens de `src/app.css`, no valores sueltos.
- Si tomas una decisión técnica, agrégala a [`docs/decisiones.md`](docs/decisiones.md).

## Configuración del repositorio (una sola vez, la hace quien lo crea)

1. **Invitar colaboradores**: *Settings → Collaborators → Add people*.
2. **Proteger `main`**: *Settings → Branches → Add branch ruleset*; exigir pull request con 1 aprobación y que pase el flujo *Verificar*.
3. **Publicar en GitHub Pages**: *Settings → Pages → Source: GitHub Actions*. Cada cambio en `main` se publica solo.
4. **Crear los issues iniciales**: `bash scripts/crear-issues.sh` (requiere la herramienta [GitHub CLI](https://cli.github.com) con sesión iniciada).
