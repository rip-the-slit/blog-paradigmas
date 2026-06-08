import Proveedor from "./Proveedor.js";

export default class PanelProveedor {
  #nodo;
  #repositorio;

  constructor(nodo, repositorio) {
    this.#nodo = nodo;
    this.#repositorio = repositorio;
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
}
