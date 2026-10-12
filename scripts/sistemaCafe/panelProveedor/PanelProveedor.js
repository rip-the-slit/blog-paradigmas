import { iniciar } from "../asyncUI.js";
import Proveedor from "./Proveedor.js";
import FormularioProveedor from "./FormularioProveedor.js";
import ComprasProveedor from "./ComprasProveedor.js";

export default class PanelProveedor {
  #nodo;
  #renderId = 0;
  #repositorio;
  #botonAgregar;
  #botonCompras;
  #compras;

  constructor(nodo, repositorio) {
    this.#nodo = nodo;
    this.#repositorio = repositorio;
    this.#crearBotonAgregar();
    this.#crearBotonCompras();
    iniciar(() => this.render());
  }

  async render() {
    const renderId = ++this.#renderId;
    const version = this.#repositorio.version;
    const proveedores = await this.#repositorio.obtenerProveedores();
    const ul = this.#nodo.querySelector("ul");

    const fragmento = document.createDocumentFragment();

    for (const proveedor of proveedores) {
      const clon = await new Proveedor(
        proveedor,
        this.#repositorio,
        () => iniciar(() => this.render()),
      ).render(Proveedor.rifExpandido === proveedor.rif_proveedor);

      fragmento.appendChild(clon);
    }

    if (renderId !== this.#renderId || version !== this.#repositorio.version) return;
    ul.replaceChildren(fragmento);
    this.#nodo.querySelector(".cantidad").textContent = proveedores.length;
    if (this.#compras) await this.#compras.actualizar();
  }

  cerrarReporte() {
    this.#nodo.querySelector(".compras-proveedor")?.remove();
    this.#compras = null;
  }

  #crearBotonAgregar() {
    this.#botonAgregar = document.createElement("button");
    this.#botonAgregar.className = "boton-agregar-proveedor";
    this.#botonAgregar.type = "button";
    this.#botonAgregar.textContent = "+";
    this.#botonAgregar.ariaLabel = "Agregar proveedor";
    this.#botonAgregar.addEventListener("click", () => {
      if (!FormularioProveedor.activo) {
        iniciar(() => new FormularioProveedor(this.#repositorio).abrir());
        return;
      }
      FormularioProveedor.cerrarActivo();
    });

    this.#nodo.appendChild(this.#botonAgregar);
  }

  #crearBotonCompras() {
    this.#botonCompras = document.createElement("button");
    this.#botonCompras.className = "boton-compras-panel";
    this.#botonCompras.type = "button";
    this.#botonCompras.ariaLabel = "Ver compras";
    this.#botonCompras.addEventListener("click", () => {
      if (this.#compras) {
        this.cerrarReporte();
        return;
      }
      const reporte = new ComprasProveedor(this.#repositorio);
      this.#compras = reporte;
      iniciar(async () => {
        const nodo = await reporte.render();
        if (reporte === this.#compras) this.#nodo.appendChild(nodo);
      });
    });

    this.#nodo.appendChild(this.#botonCompras);
  }
}
