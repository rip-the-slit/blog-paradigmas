import Negocio from "./Negocio.js";
import FormularioNegocio from "./FormularioNegocio.js";

export default class PanelNegocio {
  #nodo;
  #repositorio;
  #botonAgregar;

  constructor(nodo, repositorio) {
    this.#nodo = nodo;
    this.#repositorio = repositorio;
    this.#crearBotonAgregar();
    this.render();
  }

  render() {
    const negocios = this.#repositorio.obtenerNegocios();
    const ul = this.#nodo.querySelector("ul");

    ul.innerHTML = "";

    for (const negocio of negocios) {
      const clon = new Negocio(negocio, this.#repositorio).render();

      ul.appendChild(clon);
    }

    this.#nodo.querySelector(".cantidad").textContent = negocios.length;
  }

  #crearBotonAgregar() {
    this.#botonAgregar = document.createElement("button");
    this.#botonAgregar.className = "boton-agregar-proveedor boton-agregar-negocio";
    this.#botonAgregar.type = "button";
    this.#botonAgregar.textContent = "+";
    this.#botonAgregar.ariaLabel = "Agregar negocio";
    this.#botonAgregar.addEventListener("click", () => {
      new FormularioNegocio(this.#repositorio).abrir();
    });

    this.#nodo.appendChild(this.#botonAgregar);
  }
}
