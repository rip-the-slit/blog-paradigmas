export default class BarraInfo {
  #nodo;
  #repositorio;

  constructor(nodo, repositorio) {
    this.#nodo = nodo;
    this.#repositorio = repositorio;
    this.#configurarFecha();
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

  #configurarFecha() {
    const nodoFecha = this.#nodo.querySelector("#fecha");

    nodoFecha.addEventListener("click", () => {
      if (nodoFecha.querySelector("input")) {
        return;
      }

      const input = document.createElement("input");
      const fechaMinima = new Date(this.#repositorio.fecha);

      fechaMinima.setDate(fechaMinima.getDate() + 1);
      input.type = "date";
      input.min = this.#formatearFechaInput(fechaMinima);
      input.value = input.min;

      nodoFecha.querySelector("p").replaceChildren(input);
      input.focus();
      input.showPicker?.();

      input.addEventListener("change", () => {
        this.#repositorio.fecha = new Date(`${input.value}T00:00:00`);
      });
    });
  }

  #formatearFechaInput(fecha) {
    return fecha.toISOString().slice(0, 10);
  }
}
