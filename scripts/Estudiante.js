export default class Estudiante {
  constructor(cedula, nombre, notas = [0, 0, 0, 0]) {
    this.cedula = cedula;
    this.nombre = nombre;
    this.notas = notas;
  }

  render(indiceFila) {
    const fila = document.createElement("tr");

    const crearCelda = (valor, campo, placeholder, indiceNota = null) => {
      const celda = document.createElement("td");
      const entrada = document.createElement("input");

      entrada.value = valor;
      entrada.name = campo === "notas" ? `nota_${indiceFila}_${indiceNota}` : `${campo}_${indiceFila}`;
      entrada.type = campo === "notas" || campo === "cedula" ? "number" : "text";
      entrada.min = campo === "notas" ? "0" : undefined;
      entrada.max = campo === "notas" ? "100" : undefined;
      entrada.placeholder = placeholder || "";

      celda.appendChild(entrada);
      return celda;
    };

    fila.appendChild(crearCelda(this.cedula, "cedula", "Ingrese la cédula"));
    fila.appendChild(crearCelda(this.nombre, "nombre", "Ingrese el nombre"));

    this.notas.forEach((nota, i) => {
      fila.appendChild(crearCelda(nota, "notas", `Nota ${i + 1}`, i));
    });

    const celdaBoton = document.createElement("td");
    const botonEliminar = document.createElement("button");
    botonEliminar.type = "submit";
    botonEliminar.textContent = "Eliminar";
    botonEliminar.dataset.accion = "eliminar";
    botonEliminar.dataset.indice = indiceFila;

    celdaBoton.appendChild(botonEliminar);
    fila.appendChild(celdaBoton);

    return fila;
  }
}
