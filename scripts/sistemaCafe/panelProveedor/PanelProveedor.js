import Proveedor from "./Proveedor.js";
import FormularioProveedor from "./FormularioProveedor.js";
import ComprasProveedor from "./ComprasProveedor.js";

export default class PanelProveedor {
  #nodo;
  #repositorio;
  #botonAgregar;
  #botonCompras;
  #compras;

  constructor(nodo, repositorio) {
    this.#nodo = nodo;
    this.#repositorio = repositorio;
    this.#crearBotonAgregar();
    this.#crearBotonCompras();
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
    this.#compras?.actualizar();
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

  #crearBotonCompras() {
    this.#botonCompras = document.createElement("button");
    this.#botonCompras.className = "boton-compras-panel";
    this.#botonCompras.type = "button";
    this.#botonCompras.ariaLabel = "Ver compras";
    this.#botonCompras.addEventListener("click", () => {
      const abierto = this.#nodo.querySelector(".compras-proveedor");

      abierto?.remove();
      if (!abierto) {
        this.#compras = new ComprasProveedor(this.#repositorio);
        this.#nodo.appendChild(this.#compras.render());
      } else {
        this.#compras = null;
      }
    });

    this.#nodo.appendChild(this.#botonCompras);
  }
}
