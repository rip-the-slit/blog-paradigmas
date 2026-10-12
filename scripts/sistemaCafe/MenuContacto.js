import { ejecutar, iniciar } from "./asyncUI.js";
export default class MenuContacto {
  #repositorio;
  #onSeleccionar;
  #nodo;
  #controlador;

  constructor(repositorio, opciones = {}) {
    this.#repositorio = repositorio;
    this.#onSeleccionar = opciones.onSeleccionar;
    this.#controlador = new AbortController();
  }

  async abrir(disparador, contenedor) {
    const contactos = await this.#repositorio.obtenerContactos();
    if (!contenedor.isConnected) return;
    MenuContacto.cerrarActivo();

    this.#nodo = document.createElement("div");
    this.#nodo.className = "menu-contacto";
    this.#nodo.appendChild(this.#crearListaContactos(contactos));
    this.#nodo.appendChild(this.#crearFormularioContacto());
    contenedor.appendChild(this.#nodo);

    MenuContacto.activo = this;

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
      { signal: this.#controlador.signal }
    );
  }

  cerrar() {
    this.#controlador.abort();
    this.#nodo?.remove();
    this.#nodo = null;

    if (MenuContacto.activo === this) {
      MenuContacto.activo = null;
    }
  }

  static cerrarActivo() {
    MenuContacto.activo?.cerrar();
  }

  #crearListaContactos(contactos) {
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
      detalle.textContent = `${contacto.cedula_contacto} - ${
        contacto.numero_telf || "Sin telefono"
      }`;
      boton.type = "button";
      boton.append(nombre, detalle);
      boton.addEventListener("click", () => {
        iniciar(async () => {
          if (await ejecutar(this.#nodo, () => this.#onSeleccionar(contacto))) this.cerrar();
        });
      });

      item.appendChild(boton);
      lista.appendChild(item);
    }

    return contenedor;
  }

  #crearFormularioContacto() {
    const formulario = document.createElement("form");
    const titulo = document.createElement("h4");
    const cedula = this.#crearCampo("Cedula", "cedula_contacto", {
      pattern: /^[VE]-\d+$/,
      title: "Formato esperado: V-<numero> o E-<numero>",
    });
    const nombre = this.#crearCampo("Nombre", "nombre");
    const telefono = this.#crearCampo("Telefono", "numero_telf", {
      pattern: /^\d{11}$/,
      title: "Formato esperado: 11 digitos numericos",
      numericOnly: true,
      maxLength: 11,
    });
    telefono.type = "tel";
    const boton = document.createElement("button");

    formulario.className = "formulario-contacto";
    titulo.textContent = "Agregar contacto";
    boton.type = "submit";
    boton.textContent = "Agregar y asignar";

    formulario.append(titulo, cedula, nombre, telefono, boton);
    let contactoCreado = null;
    formulario.addEventListener("submit", async (evento) => {
      evento.preventDefault();

      const datos = new FormData(formulario);
      const contacto = {
        cedula_contacto: datos.get("cedula_contacto").trim().toUpperCase(),
        nombre: datos.get("nombre").trim(),
        numero_telf: datos.get("numero_telf").trim(),
      };

      if (!contacto.cedula_contacto || !contacto.nombre) {
        return;
      }

      if (!/^[VE]-\d+$/.test(contacto.cedula_contacto)) {
        cedula.setCustomValidity("Formato esperado: V-<numero> o E-<numero>");
        cedula.reportValidity();
        return;
      }

      cedula.setCustomValidity("");

      if (await ejecutar(this.#nodo, async () => {
        if (contactoCreado !== contacto.cedula_contacto) {
          await this.#repositorio.agregarContacto(contacto);
          contactoCreado = contacto.cedula_contacto;
        }
        return this.#onSeleccionar(contacto);
      })) this.cerrar();
    });

    return formulario;
  }

  #crearCampo(placeholder, nombre, opciones = {}) {
    const input = document.createElement("input");

    input.name = nombre;
    input.placeholder = placeholder;
    input.required = nombre !== "numero_telf";
    input.autocomplete = "off";

    if (opciones.pattern) {
      input.pattern = opciones.pattern.source;
      input.title = opciones.title || "Formato inválido";
      input.addEventListener("input", () => {
        input.value = input.value.toUpperCase();
        input.setCustomValidity("");
      });
    }

    if (opciones.numericOnly) {
      input.inputMode = "numeric";
      input.addEventListener("input", () => {
        input.value = input.value.replace(/\D+/g, "").slice(0, opciones.maxLength || Infinity);
        input.setCustomValidity("");
      });
      if (opciones.maxLength) {
        input.maxLength = opciones.maxLength;
      }
    }

    return input;
  }
}

MenuContacto.activo = null;
