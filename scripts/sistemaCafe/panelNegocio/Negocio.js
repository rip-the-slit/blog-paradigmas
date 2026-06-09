import MenuContactoProveedor from "../panelProveedor/MenuContactoProveedor.js";

export default class Negocio {
  #repositorio;

  constructor(data, repositorio) {
    this.data = data;
    this.#repositorio = repositorio;
  }

  render() {
    const negocio = this.data;
    const plantillaNegocio = document.getElementById("negocio").content;
    const clon = plantillaNegocio.cloneNode(true);

    clon.querySelector(".encabezado h3").textContent = negocio.nombre_negocio;
    clon.querySelector(".rif").textContent = negocio.rif_negocio;
    clon.querySelector(".direccion").textContent =
      negocio.direccion || "Sin direccion";
    clon.querySelector(".nombre-contacto").textContent =
      negocio.nombre_contacto || "Sin contacto";
    clon.querySelector(".telefono-contacto").textContent =
      negocio.numero_telf || "Sin telefono";
    clon.querySelector(".cedula-contacto").textContent =
      negocio.cedula_contacto || "Sin cedula";

    const contacto = clon.querySelector(".contacto");
    contacto.addEventListener("click", (evento) => {
      evento.stopPropagation();
      new MenuContactoProveedor(null, this.#repositorio, {
        onSeleccionar: (contactoSeleccionado) => {
          this.#repositorio.actualizarContactoNegocio(
            negocio.rif_negocio,
            contactoSeleccionado.cedula_contacto,
          );
        },
      }).abrir(contacto);
    });

    return clon;
  }
}
