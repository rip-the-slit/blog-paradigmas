import Repositorio from "./Repositorio.js";

export default class BarraInfo {
  #nodo;
  #cambiarFecha;

  constructor(nodo, cambiarFecha = null, data = {}) {
    this.#nodo = nodo;
    this.#cambiarFecha = cambiarFecha;
    this.render(data);
  }

  render({ fecha, saldo } = {}) {
    const nodoFecha = this.#nodo.querySelector("#fecha p");
    const nodoSaldo = this.#nodo.querySelector("#saldo p");
    if (fecha) {
      const opcionesFecha = { day: "numeric", month: "long", year: "numeric" };
      nodoFecha.textContent =
        fecha?.toLocaleDateString("es-VE", opcionesFecha) || "";
    }

    if (saldo) {
      nodoSaldo.textContent = `$${saldo?.toFixed(2) || "0.00"}`;
    }
  }
}
