import { iniciar } from "../asyncUI.js";
import Negocio from "./Negocio.js";
import FormularioNegocio from "./FormularioNegocio.js";
import VentasNegocio from "./VentasNegocio.js";

export default class PanelNegocio {
  #nodo;
  #renderId = 0;
  #repositorio;
  #botonAgregar;
  #botonVentas;
  #ventas;

  constructor(nodo, repositorio) {
    this.#nodo = nodo;
    this.#repositorio = repositorio;
    this.#crearBotonAgregar();
    this.#crearBotonVentas();
    iniciar(() => this.render());
  }

  async render() {
    const renderId = ++this.#renderId;
    const version = this.#repositorio.version;
    const negocios = await this.#repositorio.obtenerNegocios();
    const ul = this.#nodo.querySelector("ul");

    const fragmento = document.createDocumentFragment();

    for (const negocio of negocios) {
      const clon = await new Negocio(
        negocio,
        this.#repositorio,
        () => iniciar(() => this.render()),
      ).render(Negocio.rifExpandido === negocio.rif_negocio);

      fragmento.appendChild(clon);
    }

    if (renderId !== this.#renderId || version !== this.#repositorio.version) return;
    ul.replaceChildren(fragmento);
    this.#nodo.querySelector(".cantidad").textContent = negocios.length;
    if (this.#ventas) await this.#ventas.actualizar();
  }

  cerrarReporte() {
    this.#nodo.querySelector(".compras-proveedor")?.remove();
    this.#ventas = null;
  }

  #crearBotonAgregar() {
    this.#botonAgregar = document.createElement("button");
    this.#botonAgregar.className =
      "boton-agregar-proveedor boton-agregar-negocio";
    this.#botonAgregar.type = "button";
    this.#botonAgregar.textContent = "+";
    this.#botonAgregar.ariaLabel = "Agregar negocio";
    this.#botonAgregar.addEventListener("click", () => {
      if (!FormularioNegocio.activo) {
        iniciar(() => new FormularioNegocio(this.#repositorio).abrir());
        return;
      }
      FormularioNegocio.cerrarActivo();
    });

    this.#nodo.appendChild(this.#botonAgregar);
  }

  #crearBotonVentas() {
    this.#botonVentas = document.createElement("button");
    this.#botonVentas.className = "boton-compras-panel boton-ventas-panel";
    this.#botonVentas.type = "button";
    this.#botonVentas.ariaLabel = "Ver ventas";
    this.#botonVentas.addEventListener("click", () => {
      if (this.#ventas) {
        this.cerrarReporte();
        return;
      }
      const reporte = new VentasNegocio(this.#repositorio);
      this.#ventas = reporte;
      iniciar(async () => {
        const nodo = await reporte.render();
        if (reporte === this.#ventas) this.#nodo.appendChild(nodo);
      });
    });

    this.#nodo.appendChild(this.#botonVentas);
  }
}
