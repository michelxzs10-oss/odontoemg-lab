<!--
  Vista 3D del cráneo y los músculos masticatorios — PENDIENTE (plan: T3–T4).

  Plan (ver docs/para-desarrolladores.md, sección "Vista 3D"):
  1. Cargar /modelos/craneo-musculos.glb con GLTFLoader + DRACOLoader (Three.js).
  2. Raycaster sobre el objeto "masetero_der": la coordenada UV del punto tocado
     se escribe en estado.electrodo (la misma que usa el mapa HD).
  3. Colorear el masetero con estado.indices.rms (brillo emisivo).
  4. Importar este componente con import() dinámico para no retrasar el arranque.
-->
<div class="pendiente">
  <p class="titulo">Vista 3D en construcción</p>
  <p>
    Aquí irá el cráneo con masetero, temporal y pterigoideos (modelo Z-Anatomy, Three.js). El alumno tocará el
    músculo para colocar el electrodo, igual que hoy en el mapa HD.
  </p>
  <p>Mientras tanto, usa la pestaña <strong>Mapa HD</strong>. El diseño propuesto está en <code>docs/img/mockup-vista3d.jpg</code>.</p>
</div>

<style>
  .pendiente {
    flex: 1;
    display: flex;
    flex-direction: column;
    justify-content: center;
    gap: 10px;
    max-width: 560px;
    margin: 0 auto;
    padding: 24px;
    text-align: center;
    color: var(--escena-texto-2);
  }
  .pendiente p {
    margin: 0;
  }
  .titulo {
    font-size: 18px;
    font-weight: 600;
    color: var(--escena-texto);
  }
  strong {
    color: var(--escena-texto);
  }
  code {
    font-family: var(--mono);
    font-size: 13px;
  }
</style>
