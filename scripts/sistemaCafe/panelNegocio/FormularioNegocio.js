import MenuContacto from "../MenuContacto.js";

const RIF_NEGOCIO_REGEX = /^J-\d+-\d$/;
const CEDULA_CONTACTO_REGEX = /^[VE]-\d+$/;

export default class FormularioNegocio {
  #repositorio;
  #nodo;
  #controlador;
  #cedulaContacto = "";
  #botonContacto;

  constructor(repositorio) {
    this.#repositorio = repositorio;
    this.#controlador = new AbortController();
  }

  abrir() {
    FormularioNegocio.cerrarActivo();

    this.#nodo = document.createElement("form");
    this.#nodo.className = "formulario-proveedor formulario-negocio";
    this.#nodo.append(
      this.#crearEncabezado(),
      this.#crearCampo("RIF", "rif_negocio", {
        pattern: RIF_NEGOCIO_REGEX,
        title: "Formato esperado: J-<numero>-<digito>",
      }),
      this.#crearCampo("Nombre", "nombre"),
      this.#crearCampo("Direccion", "direccion"),
      this.#crearSelectorContacto(),
      this.#crearAcciones(),
    );

    document.querySelector("#panel-negocio").appendChild(this.#nodo);
    FormularioNegocio.activo = this;

    this.#nodo.addEventListener(
      "submit",
      (evento) => this.#guardar(evento),
      { signal: this.#controlador.signal },
    );

    document.addEventListener(
      "keydown",
      (evento) => {
        if (evento.key === "Escape") {
          this.cerrar();
        }
      },
      { signal: this.#controlador.signal },
    );
  }

  cerrar() {
    this.#controlador.abort();
    this.#nodo?.remove();
    this.#nodo = null;

    if (FormularioNegocio.activo === this) {
      FormularioNegocio.activo = null;
    }
  }

  static cerrarActivo() {
    FormularioNegocio.activo?.cerrar();
  }

  #crearEncabezado() {
    const encabezado = document.createElement("div");
    const titulo = document.createElement("h3");
    const cerrar = document.createElement("button");

    encabezado.className = "formulario-proveedor__encabezado";
    titulo.textContent = "Agregar negocio";
    cerrar.type = "button";
    cerrar.textContent = "x";
    cerrar.ariaLabel = "Cerrar formulario";
    cerrar.addEventListener("click", () => this.cerrar());

    encabezado.append(titulo, cerrar);
    return encabezado;
  }

  #crearCampo(placeholder, nombre, opciones = {}) {
    const input = document.createElement("input");

    input.name = nombre;
    input.placeholder = placeholder;
    input.required = true;
    input.autocomplete = "off";

    if (opciones.pattern) {
      input.pattern = opciones.pattern.source;
      input.title = opciones.title || "Formato inválido";
      input.addEventListener("input", () => {
        input.value = input.value.toUpperCase();
      });
    }

    return input;
  }

  #crearSelectorContacto() {
    this.#botonContacto = document.createElement("button");
    this.#botonContacto.className = "selector-contacto-proveedor";
    this.#botonContacto.type = "button";
    this.#botonContacto.textContent = "Sin contacto asignado";
    this.#botonContacto.addEventListener("click", (evento) => {
      evento.stopPropagation();
      new MenuContacto(this.#repositorio, {
        onSeleccionar: (contacto) => this.#asignarContacto(contacto),
      }).abrir(this.#botonContacto, this.#nodo);
    });

    return this.#botonContacto;
  }

  #crearAcciones() {
    const acciones = document.createElement("div");
    const cancelar = document.createElement("button");
    const guardar = document.createElement("button");

    acciones.className = "formulario-proveedor__acciones";
    cancelar.type = "button";
    cancelar.textContent = "Cancelar";
    cancelar.addEventListener("click", () => this.cerrar());
    guardar.type = "submit";
    guardar.textContent = "Guardar";

    acciones.append(cancelar, guardar);
    return acciones;
  }

  #guardar(evento) {
    evento.preventDefault();

    const datos = new FormData(this.#nodo);
    const negocio = {
      rif_negocio: datos.get("rif_negocio").trim(),
      nombre: datos.get("nombre").trim(),
      direccion: datos.get("direccion").trim(),
      cedula_contacto: this.#cedulaContacto,
    };

    if (!negocio.rif_negocio || !negocio.nombre || !negocio.direccion) {
      return;
    }

    this.#repositorio.agregarNegocio(negocio);
    this.cerrar();
  }

  #asignarContacto(contacto) {
    if (!CEDULA_CONTACTO_REGEX.test(contacto.cedula_contacto)) {
      return;
    }

    this.#cedulaContacto = contacto.cedula_contacto;
    this.#botonContacto.textContent =
      `${contacto.nombre} (${contacto.cedula_contacto})`;
  }
}

FormularioNegocio.activo = null;
