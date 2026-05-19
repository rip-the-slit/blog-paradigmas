export default class Resumen {
  constructor(hoja, contenedorDestino) {
    this.hoja = hoja;
    this.contenedor = contenedorDestino;
  }

  obtenerDefinitiva(estudiante) {
    return ((estudiante.notas.reduce((total, nota) => total + (Number(nota) || 0), 0) / estudiante.notas.length) || 0).toFixed(1);
  }

  clasificarEstudiantes() {
    const clasificacion = { aprobados: [], per: [], reprobados: [] };

    this.hoja.estudiantes.forEach((est) => {
      if (!est.cedula && !est.nombre) return;

      const definitiva = this.obtenerDefinitiva(est);

      if (definitiva >= 60) {
        clasificacion.aprobados.push({ est, definitiva });
      } else if (definitiva >= 50) {
        clasificacion.per.push({ est, definitiva });
      } else {
        clasificacion.reprobados.push({ est, definitiva });
      }
    });

    return clasificacion;
  }

  render() {
    this.contenedor.innerHTML = "";

    const grupos = this.clasificarEstudiantes();

    const contenedorPestanas = document.createElement("div");
    contenedorPestanas.className = "resumen-pestanas";

    const barraBotones = document.createElement("div");
    barraBotones.className = "barra-botones";

    const areasContenido = document.createElement("div");
    areasContenido.className = "areas-contenido";

    const crearPestana = (id, titulo, datos, activoInicial = false) => {
      const boton = document.createElement("button");
      boton.type = "button";
      boton.textContent = `${titulo} (${datos.length})`;
      boton.className = activoInicial ? "activo" : "";

      const panel = document.createElement("div");
      panel.id = id;
      panel.className = "panel-resumen";
      panel.style.display = activoInicial ? "block" : "none";

      if (datos.length === 0) {
        panel.innerHTML = `<p>No hay estudiantes en esta categoría.</p>`;
      } else {
        const lista = document.createElement("ul");
        datos.forEach(({ est, definitiva }) => {
          const item = document.createElement("li");
          const leftSpan = document.createElement("span");
          const rightSpan = document.createElement("span");
          leftSpan.textContent = `${est.nombre} (C.I:${est.cedula})`;
          rightSpan.textContent = `Definitiva: ${definitiva}/100`;
          item.appendChild(leftSpan);
          item.appendChild(rightSpan);
          lista.appendChild(item);
        });
        panel.appendChild(lista);
      }

      boton.addEventListener("click", () => {
        barraBotones.querySelectorAll("button").forEach(b => b.classList.remove("activo"));
        areasContenido.querySelectorAll(".panel-resumen").forEach(p => p.style.display = "none");

        boton.classList.add("activo");
        panel.style.display = "block";
      });

      barraBotones.appendChild(boton);
      areasContenido.appendChild(panel);
    };

    crearPestana("tab-aprobados", "Aprobados", grupos.aprobados, true);
    crearPestana("tab-per", "Aplican a PER", grupos.per, false);
    crearPestana("tab-reprobados", "Reprobados", grupos.reprobados, false);

    contenedorPestanas.appendChild(barraBotones);
    contenedorPestanas.appendChild(areasContenido);
    this.contenedor.appendChild(contenedorPestanas);
  }
}
