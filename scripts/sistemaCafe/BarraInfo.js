export default class BarraInfo {
  #nodo;
  #repositorio;

  constructor(nodo, repositorio) {
    this.#nodo = nodo;
    this.#repositorio = repositorio;
    this.render();
  }

  render() {
    const fecha = this.#repositorio.fecha;
    const saldo = this.#repositorio.obtenerDistribuidores()[0]?.saldo_bs;
    const nodoFecha = this.#nodo.querySelector("#fecha p");
    const nodoSaldo = this.#nodo.querySelector("#saldo p");
    if (fecha) {
      const opcionesFecha = { day: "numeric", month: "long", year: "numeric" };
      nodoFecha.textContent =
        fecha?.toLocaleDateString("es-VE", opcionesFecha) || "";
    }

    if (saldo !== undefined) {
      nodoSaldo.textContent = `$${saldo?.toFixed(2) || "0.00"}`;
    }
  }
}
