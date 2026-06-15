import Negocio from "./Negocio.js";
import FormularioNegocio from "./FormularioNegocio.js";
import VentasNegocio from "./VentasNegocio.js";

export default class PanelNegocio {
  #nodo;
  #repositorio;
  #botonAgregar;
  #botonVentas;
  #ventas;

  constructor(nodo, repositorio) {
    this.#nodo = nodo;
    this.#repositorio = repositorio;
    this.#crearBotonAgregar();
    this.#crearBotonVentas();
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
    this.#ventas?.actualizar();
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

  #crearBotonVentas() {
    this.#botonVentas = document.createElement("button");
    this.#botonVentas.className = "boton-compras-panel boton-ventas-panel";
    this.#botonVentas.type = "button";
    this.#botonVentas.ariaLabel = "Ver ventas";
    this.#botonVentas.addEventListener("click", () => {
      const abierto = this.#nodo.querySelector(".ventas-negocio-reporte");

      abierto?.remove();
      if (!abierto) {
        this.#ventas = new VentasNegocio(this.#repositorio);
        this.#nodo.appendChild(this.#ventas.render());
      } else {
        this.#ventas = null;
      }
    });

    this.#nodo.appendChild(this.#botonVentas);
  }
}
