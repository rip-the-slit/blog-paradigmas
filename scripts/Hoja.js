import Estudiante from "./Estudiante.js";

export default class Hoja {
  constructor(formulario, estudiantes) {
    this.formulario = formulario;
    this.estudiantes = estudiantes;

    this.formulario.addEventListener("submit", (evento) => {
      evento.preventDefault();

      const datosFormulario = new FormData(this.formulario);

      this.estudiantes.forEach((estudiante, indice) => {
        estudiante.cedula = datosFormulario.get(`cedula_${indice}`) || "";
        estudiante.nombre = datosFormulario.get(`nombre_${indice}`) || "";

        estudiante.notas = estudiante.notas.map((_, i) => {
          return Number(datosFormulario.get(`nota_${indice}_${i}`)) || 0;
        });
      });

      const botonPresionado = evento.submitter;

      if (botonPresionado) {
        const accion = botonPresionado.dataset.accion;

        if (accion === "eliminar") {
          const indiceEliminar = Number(botonPresionado.dataset.indice);
          this.estudiantes.splice(indiceEliminar, 1);
        } else if (accion === "agregar") {
          this.estudiantes.push(new Estudiante("", ""));
        }
      }

      this.render();
    });
  }

  limpiarTabla() {
    const tabla = this.formulario.querySelector("table");

    const filas = tabla.querySelectorAll("tr:not(:first-child)");
    filas.forEach((fila) => fila.remove());

    const filaAgregar = tabla.querySelector(".fila-agregar");
    if (filaAgregar) filaAgregar.remove();
  }

  render() {
    this.limpiarTabla();
    const tabla = this.formulario.querySelector("table");
    const contenedorDestino = tabla.querySelector("tbody") || tabla;

    this.estudiantes.forEach((estudiante, indice) => {
      contenedorDestino.appendChild(estudiante.render(indice));
    });

    if (this.estudiantes.length < 10) {
      const filaAgregar = document.createElement("tr");
      filaAgregar.className = "fila-agregar";

      const celdaAgregar = document.createElement("td");
      const columnasTotales =
        this.estudiantes.length > 0 ? this.estudiantes[0].notas.length + 3 : 7;
      celdaAgregar.colSpan = columnasTotales;

      const botonAgregar = document.createElement("button");
      botonAgregar.type = "submit";
      botonAgregar.textContent = "Agregar Estudiante +";
      botonAgregar.dataset.accion = "agregar";

      celdaAgregar.appendChild(botonAgregar);
      filaAgregar.appendChild(celdaAgregar);
      contenedorDestino.appendChild(filaAgregar);
    }
  }
}
