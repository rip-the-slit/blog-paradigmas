export default class MenuContactoProveedor {
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
    MenuContactoProveedor.cerrarActivo();

    this.#nodo = document.createElement("div");
    this.#nodo.className = "menu-contacto-proveedor";
    this.#nodo.appendChild(this.#crearListaContactos());
    this.#nodo.appendChild(this.#crearFormularioContacto());
    document.body.appendChild(this.#nodo);

    this.#posicionar(disparador);
    MenuContactoProveedor.activo = this;

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
  }

  cerrar() {
    this.#controlador.abort();
    this.#nodo?.remove();
    this.#nodo = null;

    if (MenuContactoProveedor.activo === this) {
      MenuContactoProveedor.activo = null;
    }
  }

  static cerrarActivo() {
    MenuContactoProveedor.activo?.cerrar();
  }

  #crearListaContactos() {
    const contactos = this.#repositorio.obtenerContactos();
    const contenedor = document.createElement("div");
    const titulo = document.createElement("h4");
    const lista = document.createElement("ul");

    titulo.textContent = "Contactos";
    contenedor.appendChild(titulo);
    contenedor.appendChild(lista);

    for (const contacto of contactos) {
      const item = document.createElement("li");
      const boton = document.createElement("button");
      const nombre = document.createElement("span");
      const detalle = document.createElement("small");

      nombre.textContent = contacto.nombre;
      detalle.textContent = `${contacto.cedula_contacto} - ${contacto.numero_telf || "Sin telefono"}`;
      boton.type = "button";
      boton.append(nombre, detalle);
      boton.addEventListener("click", () => {
        this.#repositorio.actualizarContactoProveedor(
          this.#proveedor.rif_proveedor,
          contacto.cedula_contacto,
        );
        this.cerrar();
      });

      item.appendChild(boton);
      lista.appendChild(item);
    }

    return contenedor;
  }

  #crearFormularioContacto() {
    const formulario = document.createElement("form");
    const titulo = document.createElement("h4");
    const cedula = this.#crearCampo("Cedula", "cedula_contacto");
    const nombre = this.#crearCampo("Nombre", "nombre");
    const telefono = this.#crearCampo("Telefono", "numero_telf");
    const boton = document.createElement("button");

    formulario.className = "formulario-contacto";
    titulo.textContent = "Agregar contacto";
    boton.type = "submit";
    boton.textContent = "Agregar y asignar";

    formulario.append(titulo, cedula, nombre, telefono, boton);
    formulario.addEventListener("submit", (evento) => {
      evento.preventDefault();

      const datos = new FormData(formulario);
      const contacto = {
        cedula_contacto: datos.get("cedula_contacto").trim(),
        nombre: datos.get("nombre").trim(),
        numero_telf: datos.get("numero_telf").trim(),
      };

      if (!contacto.cedula_contacto || !contacto.nombre) {
        return;
      }

      this.#repositorio.agregarContacto(contacto);
      this.#repositorio.actualizarContactoProveedor(
        this.#proveedor.rif_proveedor,
        contacto.cedula_contacto,
      );
      this.cerrar();
    });

    return formulario;
  }

  #crearCampo(placeholder, nombre) {
    const input = document.createElement("input");

    input.name = nombre;
    input.placeholder = placeholder;
    input.required = nombre !== "numero_telf";

    return input;
  }

  #posicionar(disparador) {
    const rect = disparador.getBoundingClientRect();

    this.#nodo.style.top = `${rect.top + window.scrollY}px`;
    this.#nodo.style.left = `${rect.left + window.scrollX}px`;
    this.#nodo.style.minWidth = `${Math.max(rect.width, 220)}px`;
  }
}

MenuContactoProveedor.activo = null;
