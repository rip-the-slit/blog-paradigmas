import MenuContactoProveedor from "./MenuContactoProveedor.js";

export default class FormularioProveedor {
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
    FormularioProveedor.cerrarActivo();

    this.#nodo = document.createElement("form");
    this.#nodo.className = "formulario-proveedor";
    this.#nodo.append(
      this.#crearEncabezado(),
      this.#crearCampo("RIF", "rif_proveedor"),
      this.#crearCampo("Nombre", "nombre"),
      this.#crearSelectorContacto(),
      this.#crearAcciones(),
    );

    document.querySelector("#panel-proveedor").appendChild(this.#nodo);
    FormularioProveedor.activo = this;

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

    if (FormularioProveedor.activo === this) {
      FormularioProveedor.activo = null;
    }
  }

  static cerrarActivo() {
    FormularioProveedor.activo?.cerrar();
  }

  #crearEncabezado() {
    const encabezado = document.createElement("div");
    const titulo = document.createElement("h3");
    const cerrar = document.createElement("button");

    encabezado.className = "formulario-proveedor__encabezado";
    titulo.textContent = "Agregar proveedor";
    cerrar.type = "button";
    cerrar.textContent = "x";
    cerrar.ariaLabel = "Cerrar formulario";
    cerrar.addEventListener("click", () => this.cerrar());

    encabezado.append(titulo, cerrar);
    return encabezado;
  }

  #crearCampo(placeholder, nombre) {
    const input = document.createElement("input");

    input.name = nombre;
    input.placeholder = placeholder;
    input.required = true;

    return input;
  }

  #crearSelectorContacto() {
    this.#botonContacto = document.createElement("button");
    this.#botonContacto.className = "selector-contacto-proveedor";
    this.#botonContacto.type = "button";
    this.#botonContacto.textContent = "Sin contacto asignado";
    this.#botonContacto.addEventListener("click", (evento) => {
      evento.stopPropagation();
      new MenuContactoProveedor(null, this.#repositorio, {
        onSeleccionar: (contacto) => this.#asignarContacto(contacto),
      }).abrir(this.#botonContacto);
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
    const proveedor = {
      rif_proveedor: datos.get("rif_proveedor").trim(),
      nombre: datos.get("nombre").trim(),
      cedula_contacto: this.#cedulaContacto,
    };

    if (!proveedor.rif_proveedor || !proveedor.nombre) {
      return;
    }

    this.#repositorio.agregarProveedor(proveedor);
    this.cerrar();
  }

  #asignarContacto(contacto) {
    this.#cedulaContacto = contacto.cedula_contacto;
    this.#botonContacto.textContent =
      `${contacto.nombre} (${contacto.cedula_contacto})`;
  }
}

FormularioProveedor.activo = null;
