export default class FormularioProducto {
  #proveedor;
  #repositorio;
  #nodo;
  #controlador;

  constructor(proveedor, repositorio) {
    this.#proveedor = proveedor;
    this.#repositorio = repositorio;
    this.#controlador = new AbortController();
  }

  abrir(disparador) {
    FormularioProducto.cerrarActivo();

    this.#nodo = document.createElement("form");
    this.#nodo.className = "formulario-producto";
    this.#nodo.append(
      this.#crearEncabezado(),
      this.#crearCampo("Nombre del cafe", "nombre"),
      this.#crearCampo("Precio Bs/kg", "precio_kg_bs", "number"),
      this.#crearSelectorTipos(),
      this.#crearAcciones(),
    );

    document.body.appendChild(this.#nodo);
    this.#posicionar(disparador);
    FormularioProducto.activo = this;

    this.#nodo.addEventListener(
      "submit",
      (evento) => this.#guardar(evento),
      { signal: this.#controlador.signal },
    );

    document.addEventListener(
      "click",
      (evento) => {
        if (
          !this.#nodo.contains(evento.target) &&
          !disparador.contains(evento.target)
        ) {
          this.cerrar();
        }
      },
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

    if (FormularioProducto.activo === this) {
      FormularioProducto.activo = null;
    }
  }

  static cerrarActivo() {
    FormularioProducto.activo?.cerrar();
  }

  #crearEncabezado() {
    const encabezado = document.createElement("div");
    const titulo = document.createElement("h3");
    const cerrar = document.createElement("button");

    encabezado.className = "formulario-producto__encabezado";
    titulo.textContent = "Agregar cafe";
    cerrar.type = "button";
    cerrar.textContent = "x";
    cerrar.ariaLabel = "Cerrar formulario";
    cerrar.addEventListener("click", () => this.cerrar());

    encabezado.append(titulo, cerrar);
    return encabezado;
  }

  #crearCampo(placeholder, nombre, tipo = "text") {
    const input = document.createElement("input");

    input.name = nombre;
    input.placeholder = placeholder;
    input.required = true;
    input.type = tipo;

    if (tipo === "number") {
      input.min = "0";
      input.step = "0.01";
    }

    return input;
  }

  #crearSelectorTipos() {
    const select = document.createElement("select");
    const tipos = this.#repositorio.obtenerTiposCafe();

    select.name = "id_tipo";
    select.required = true;

    for (const tipo of tipos) {
      const option = document.createElement("option");

      option.value = tipo.id_tipo;
      option.textContent = tipo.nombre;
      select.appendChild(option);
    }

    return select;
  }

  #crearAcciones() {
    const acciones = document.createElement("div");
    const cancelar = document.createElement("button");
    const guardar = document.createElement("button");

    acciones.className = "formulario-producto__acciones";
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
    const producto = {
      nombre: datos.get("nombre").trim(),
      precio_kg_bs: Number(datos.get("precio_kg_bs")),
      id_tipo: Number(datos.get("id_tipo")),
      rif_proveedor: this.#proveedor.rif_proveedor,
    };

    if (!producto.nombre || producto.precio_kg_bs < 0 || !producto.id_tipo) {
      return;
    }

    this.#repositorio.agregarProductoCafe(producto);
    this.cerrar();
  }

  #posicionar(disparador) {
    const rect = disparador.getBoundingClientRect();

    this.#nodo.style.top = `${rect.top + window.scrollY}px`;
    this.#nodo.style.left = `${rect.left + window.scrollX}px`;
  }
}

FormularioProducto.activo = null;
