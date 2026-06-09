import Proveedor from "./Proveedor.js";
import FormularioProveedor from "./FormularioProveedor.js";

export default class PanelProveedor {
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
    const distribuidores = this.#repositorio.obtenerDistribuidores();
    const proveedores = this.#repositorio.obtenerProveedores();
    const ul = this.#nodo.querySelector("ul");

    ul.innerHTML = "";

    for (const proveedor of proveedores) {
      const clon = new Proveedor(proveedor, this.#repositorio).render();

      ul.appendChild(clon);
    }

    this.#nodo.querySelector(".cantidad").textContent = proveedores.length;
  }

  #crearBotonAgregar() {
    this.#botonAgregar = document.createElement("button");
    this.#botonAgregar.className = "boton-agregar-proveedor";
    this.#botonAgregar.type = "button";
    this.#botonAgregar.textContent = "+";
    this.#botonAgregar.ariaLabel = "Agregar proveedor";
    this.#botonAgregar.addEventListener("click", () => {
      new FormularioProveedor(this.#repositorio).abrir();
    });

    this.#nodo.appendChild(this.#botonAgregar);
  }
}
